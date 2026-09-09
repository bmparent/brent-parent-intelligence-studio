import preset from './preset.json';
import { clamp, smoothstep, surfacePoint } from './math';

function canvas2d(w: number, h: number) {
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  return { canvas, ctx, pixels: ctx.createImageData(w, h) };
}
export function createLensMaps(w: number, h: number, radius: number) {
  const map = canvas2d(w, h), mask = canvas2d(w, h);
  const { edgeBend: amount, magnification: mag } = preset.lens;
  const scale = Math.max(64, (95 * (1 - 1 / mag) + amount + 5) * 2.05);
  const rimWidth = Math.min(preset.lens.rimWidthPx, h * preset.lens.rimHeightRatio);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const { depth, nx, ny } = surfacePoint(x + .5, y + .5, w, h, radius);
    const rim = Math.pow(1 - clamp(Math.max(0, depth) / rimWidth), 2);
    const bulge = rimWidth * .62 * (1 - Math.exp(-amount / 22)) * rim;
    const dx = -95 * Math.tanh((x + .5 - w / 2) / 95) * (1 - 1 / mag) - nx * bulge;
    const dy = -(y + .5 - h / 2) * (1 - 1 / mag) - ny * bulge;
    const i = (y * w + x) * 4;
    map.pixels.data.set([Math.round(255 * (.5 + dx / scale)), Math.round(255 * (.5 + dy / scale)), 128, 255], i);
    const edge = 1 - smoothstep((Math.max(0, depth) - preset.contact.fullDepthPx) / (preset.contact.zeroDepthPx - preset.contact.fullDepthPx));
    mask.pixels.data.set([255, 255, 255, Math.round(255 * edge)], i);
  }
  map.ctx.putImageData(map.pixels, 0, 0); mask.ctx.putImageData(mask.pixels, 0, 0);
  return { lens: map.canvas.toDataURL(), mask: mask.canvas.toDataURL(), scale };
}
export function createContactMap() {
  const size = preset.contact.textureSize, { canvas, ctx, pixels } = canvas2d(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const nx = (x + .5 - size / 2) / (size / 2), ny = (y + .5 - size / 2) / (size / 2);
    const falloff = Math.exp(-(nx * nx + ny * ny) * 4) * 1.65 * Math.pow(Math.max(0, 1 - Math.max(nx * nx, ny * ny)), 2);
    pixels.data.set([clamp(Math.round(128 + 255 * nx * falloff), 0, 255), clamp(Math.round(128 + 255 * ny * falloff), 0, 255), 128, 255], (y * size + x) * 4);
  }
  ctx.putImageData(pixels, 0, 0); return canvas.toDataURL();
}
export function createRimRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const p = preset.light;
  let pixels: ImageData;
  let samples: { i: number; x: number; y: number; nx: number; ny: number; white: number; colour: number }[] = [];
  return {
    resize(w: number, h: number, radius: number) {
      const ratio = Math.min(devicePixelRatio || 1, p.pixelRatioCap);
      canvas.width = Math.ceil(w * ratio); canvas.height = Math.ceil(h * ratio);
      pixels = ctx.createImageData(canvas.width, canvas.height); samples = [];
      for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
        const px = (x + .5) / ratio, py = (y + .5) / ratio;
        const { depth, nx, ny } = surfacePoint(px, py, w, h, radius);
        if (depth < 0 || depth > p.bevelPx) continue;
        const aa = clamp(depth * ratio);
        samples.push({ i: (y * canvas.width + x) * 4, x: px, y: py, nx, ny,
          white: Math.exp(-Math.pow((depth - p.whiteDepthPx) / p.whiteWidthPx, 2)) * p.whitePeak * aa,
          colour: Math.exp(-Math.pow((depth - p.colourDepthPx) / p.colourWidthPx, 2)) * p.colourPeak * aa });
      }
    },
    render(lx: number, ly: number, strength: number, pressure: number, dark: number) {
      canvas.style.opacity = strength.toFixed(4);
      if (!pixels || strength < .001) return;
      for (const s of samples) {
        const dx = lx - s.x, dy = ly - s.y;
        const normal = dx * s.nx + dy * s.ny, tangent = -dx * s.ny + dy * s.nx;
        const facing = .4 + .6 * clamp(.5 + normal / 110);
        const distance = Math.exp(-(dx * dx + dy * dy) / (2 * p.falloffPx * p.falloffPx));
        const intensity = facing * distance * (1 + pressure * p.pressBoost) * (1 - dark * p.darkDimming);
        const spread = p.spectralSpreadPx + Math.min(45, Math.abs(normal) * .25);
        const separation = p.spectralSeparationPx + clamp(Math.abs(normal) / 90) * 12;
        const red = Math.exp(-Math.pow((tangent - separation) / spread, 2) * .5);
        const green = Math.exp(-Math.pow(tangent / spread, 2) * .5) * p.greenBalance;
        const blue = Math.exp(-Math.pow((tangent + separation) / spread, 2) * .5);
        const white = s.white * intensity, chroma = s.colour * intensity;
        const r = white + chroma * red, g = white + chroma * green, b = white + chroma * blue;
        const alpha = Math.max(r, g, b);
        pixels.data[s.i] = alpha ? Math.round(255 * r / alpha) : 0;
        pixels.data[s.i + 1] = alpha ? Math.round(255 * g / alpha) : 0;
        pixels.data[s.i + 2] = alpha ? Math.round(255 * b / alpha) : 0;
        pixels.data[s.i + 3] = Math.round(255 * clamp(alpha));
      }
      ctx.putImageData(pixels, 0, 0);
    },
  };
}
