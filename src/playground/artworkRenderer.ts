import { artworkColor, validateArtwork, type ArtworkDocument, type ArtworkObject } from './artworkSchema';
import { STUDIO_FONT_FAMILY, studioFontBytes, studioFontCss, studioFontLicense, studioEscape } from './studioFont';
import type { ExportFile } from './export';
const n = (v: number) => Number(v.toFixed(3));
export function artworkTextLayout(o: ArtworkObject, width: number, height = width) {
  const objectScale = o.size * width / 10000 * o.scale;
  const lines = o.text.replace(/\r/g, '').split('\n');
  const fit = Math.min(1, height * .9 / objectScale / (lines.length * 112));
  const maximum = width * .9 / objectScale / fit;
  return { fit, lines: lines.map((text, i) => ({ text, y: n((i - (lines.length - 1) / 2) * 112 + 35), ...(text.length * 54 > maximum ? { width: n(maximum) } : {}) })) };
}
function artworkWrapOffsets(a: ArtworkDocument, o: ArtworkObject, wrap: boolean) {
  const scale = o.size * a.width / 100 / 100 * o.scale;
  const extent = o.kind === 'text' ? (a.width + a.height) * .45 : scale * 75;
  const axis = (side: number) => { const count = Math.ceil(extent / side) + 1; return wrap ? Array.from({ length: count * 2 + 1 }, (_, i) => i - count) : [0]; };
  return { x: axis(a.width), y: axis(a.height) };
}
export function artworkObjectMarkup(o: ArtworkObject, color: string, width: number, height = width) {
  if (o.kind === 'image') return o.image ? `<image href="${o.image}" x="-50" y="-50" width="100" height="100" preserveAspectRatio="xMidYMid meet"/>` : '<rect x="-50" y="-50" width="100" height="100" fill="none" stroke="currentColor" stroke-dasharray="4 4"/>';
  if (o.kind === 'text') {
    // Text lives in a 100-unit object; its font size is constant, and size scales it.
    // Long lines are fitted to the page rather than clipped or silently omitted.
    const layout = artworkTextLayout(o, width, height);
    return `<g transform="scale(${layout.fit})"><text fill="${color}" text-anchor="middle" font-family="${STUDIO_FONT_FAMILY}" font-size="100" font-weight="${o.weight}" style="font-variation-settings:'wght' ${o.weight},'opsz' ${o.opticalSize}">${layout.lines.map(line => `<tspan x="0" y="${line.y}"${line.width ? ` textLength="${line.width}" lengthAdjust="spacingAndGlyphs"` : ''}>${studioEscape(line.text)}</tspan>`).join('')}</text></g>`;
  }
  if (o.kind === 'square') return '<rect x="-48" y="-48" width="96" height="96" rx="8"/>';
  if (o.kind === 'leaf') return '<path d="M-43 43C-62-18-18-62 43-43C62 18 18 62-43 43Z"/><path d="m-30 30 60-60" fill="none" stroke="white" stroke-opacity=".32" stroke-width="2"/>';
  if (o.kind === 'orbit') return '<circle r="42" fill="none" stroke="currentColor" stroke-width="12"/><circle cx="30" cy="-30" r="13"/>';
  return Array.from({ length: 8 }, (_, i) => `<ellipse cy="-25" rx="13" ry="24" transform="rotate(${i * 45})"/>`).join('') + '<circle r="11"/>';
}
export function artworkObjectsMarkup(a: ArtworkDocument, wrap = a.mode === 'tile') {
  return a.objects.map(o => {
    const color = artworkColor(a, o), scale = o.size * a.width / 100 / 100 * o.scale;
    const offsets = artworkWrapOffsets(a, o, wrap);
    return offsets.x.flatMap(dx => offsets.y.map(dy => `<g data-artwork-id="${o.id}" transform="translate(${n(a.width * o.x / 100 + dx * a.width)} ${n(a.height * o.y / 100 + dy * a.height)}) rotate(${o.rotation}) scale(${n(scale)})" fill="${color}" color="${color}" opacity="${o.opacity}"><use href="#shape-${o.id}"/></g>`)).join('');
  }).join('');
}
export function artworkSeamlessSize(input: ArtworkDocument) {
  const a = validateArtwork(input);
  if (a.mode !== 'tile') throw Error('Poster compositions are not seamless tiles. Choose Seamless tile first.');
  return { width: a.width * (a.repeat === 'half-drop' ? 2 : 1), height: a.height };
}
export function artworkSvg(input: ArtworkDocument, view: 'tile' | 'repeat' | 'seamless' = 'tile'): string {
  const a = validateArtwork(input), patternView = view !== 'tile';
  const { width, height } = view === 'seamless' ? artworkSeamlessSize(a) : { width: a.width * (view === 'repeat' ? 3 : 1), height: a.height * (view === 'repeat' ? 3 : 1) };
  const tile = `${a.transparent ? '' : `<rect width="${a.width}" height="${a.height}" fill="${a.palette.paper}"/>`}${artworkObjectsMarkup(a)}`;
  const pattern = a.repeat === 'half-drop' ? `<pattern id="artwork-repeat" width="${a.width * 2}" height="${a.height}" patternUnits="userSpaceOnUse"><g clip-path="url(#artwork-clip)">${tile}</g><g transform="translate(${a.width} ${a.height / 2})"><g clip-path="url(#artwork-clip)">${tile}</g></g><g transform="translate(${a.width} ${-a.height / 2})"><g clip-path="url(#artwork-clip)">${tile}</g></g></pattern>` : `<pattern id="artwork-repeat" width="${a.width}" height="${a.height}" patternUnits="userSpaceOnUse"><g clip-path="url(#artwork-clip)">${tile}</g></pattern>`;
  const shapes = a.objects.map(o => `<g id="shape-${o.id}">${artworkObjectMarkup(o, artworkColor(a, o), a.width, a.height)}</g>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Original Eidos artwork"><style>${studioFontCss}</style><defs>${shapes}<clipPath id="artwork-clip"><rect width="${a.width}" height="${a.height}"/></clipPath>${patternView ? pattern : ''}</defs>${patternView ? `<rect width="${width}" height="${height}" fill="url(#artwork-repeat)"/>` : `<g clip-path="url(#artwork-clip)">${tile}</g>`}</svg>`;
}
const canvasFonts = new Map<string, Promise<string>>();
function canvasFont(o: ArtworkObject): Promise<string> {
  const key = `EidosCanvas-${o.weight}-${o.opticalSize}`;
  let pending = canvasFonts.get(key);
  if (!pending) {
    pending = (async () => {
      if (typeof FontFace === 'undefined') throw Error('Bundled font loading is unavailable. Use SVG export in this browser.');
      const font = new FontFace(key, new Uint8Array(studioFontBytes()).buffer, { weight: String(o.weight), variationSettings: `"wght" ${o.weight}, "opsz" ${o.opticalSize}` });
      await font.load(); document.fonts.add(font); return key;
    })();
    canvasFonts.set(key, pending); pending.catch(() => canvasFonts.delete(key));
  }
  return pending;
}
export async function artworkPng(input: ArtworkDocument, view: 'tile' | 'seamless' = 'tile'): Promise<Uint8Array> {
  const seamlessSize = view === 'seamless' ? artworkSeamlessSize(input) : undefined;
  const a = validateArtwork(input), resources = await Promise.all(a.objects.map(async o => {
    if (o.kind === 'text') return { id: o.id, family: await canvasFont(o) };
    if (o.kind === 'image' && o.image) { const image = new Image(); image.src = o.image; await image.decode(); return { id: o.id, image }; }
    return { id: o.id };
  }));
  const resourceById = new Map(resources.map(r => [r.id, r]));
  const canvas = document.createElement('canvas'); canvas.width = a.width; canvas.height = a.height;
  const outputContext = canvas.getContext('2d'); if (!outputContext) throw Error('PNG export is unavailable. Export SVG instead.');
  let context = outputContext;
  // SVG applies opacity to the complete object group. A scratch surface keeps
  // overlapping bloom petals and leaf details from becoming darker in PNG.
  let groupCanvas: HTMLCanvasElement | undefined, groupContext: CanvasRenderingContext2D | undefined;
  if (!a.transparent) { context.fillStyle = a.palette.paper; context.fillRect(0, 0, a.width, a.height); }
  for (const o of a.objects) {
    if (o.opacity === 0) continue;
    const color = artworkColor(a, o), offsets = artworkWrapOffsets(a, o, a.mode === 'tile');
    for (const dx of offsets.x) for (const dy of offsets.y) {
      const x = n(a.width * o.x / 100 + dx * a.width), y = n(a.height * o.y / 100 + dy * a.height), scale = n(o.size * a.width / 10000 * o.scale);
      const extent = o.kind === 'text' ? (a.width + a.height) * .45 : scale * 75;
      if (x + extent < 0 || x - extent > a.width || y + extent < 0 || y - extent > a.height) continue;
      if (o.opacity < 1) {
        if (!groupCanvas) { groupCanvas = document.createElement('canvas'); groupCanvas.width = a.width; groupCanvas.height = a.height; groupContext = groupCanvas.getContext('2d') || undefined; if (!groupContext) throw Error('PNG compositing is unavailable. Use SVG export.'); }
        context = groupContext!; context.clearRect(0, 0, a.width, a.height);
      } else context = outputContext;
      context.save(); context.translate(x, y); context.rotate(o.rotation * Math.PI / 180); context.scale(scale, scale); context.globalAlpha = 1; context.fillStyle = color; context.strokeStyle = color;
      if (o.kind === 'text') {
        context.font = `${o.weight} 100px "${resourceById.get(o.id)!.family}"`; context.textAlign = 'center'; context.textBaseline = 'alphabetic';
        const layout = artworkTextLayout(o, a.width, a.height); context.scale(layout.fit, layout.fit);
        for (const line of layout.lines) {
          context.save(); const measured = context.measureText(line.text).width; if (line.width && measured) context.scale(line.width / measured, 1); context.fillText(line.text, 0, line.y); context.restore();
        }
      } else if (o.kind === 'image') {
        const image = resourceById.get(o.id)?.image;
        if (image) { const fit = Math.min(100 / image.width, 100 / image.height), w = image.width * fit, h = image.height * fit; context.drawImage(image, -w / 2, -h / 2, w, h); }
        else { context.setLineDash([4, 4]); context.strokeRect(-50, -50, 100, 100); }
      } else if (o.kind === 'square') { context.beginPath(); context.roundRect(-48, -48, 96, 96, 8); context.fill(); }
      else if (o.kind === 'leaf') { context.fill(new Path2D('M-43 43C-62-18-18-62 43-43C62 18 18 62-43 43Z')); context.save(); context.strokeStyle = '#ffffff'; context.globalAlpha = .32; context.lineWidth = 2; context.stroke(new Path2D('M-30 30 30-30')); context.restore(); }
      else if (o.kind === 'orbit') { context.lineWidth = 12; context.beginPath(); context.arc(0, 0, 42, 0, Math.PI * 2); context.stroke(); context.beginPath(); context.arc(30, -30, 13, 0, Math.PI * 2); context.fill(); }
      else { for (let i = 0; i < 8; i++) { context.save(); context.rotate(i * Math.PI / 4); context.beginPath(); context.ellipse(0, -25, 13, 24, 0, 0, Math.PI * 2); context.fill(); context.restore(); } context.beginPath(); context.arc(0, 0, 11, 0, Math.PI * 2); context.fill(); }
      context.restore();
      if (o.opacity < 1) { outputContext.save(); outputContext.globalAlpha = o.opacity; outputContext.drawImage(groupCanvas!, 0, 0); outputContext.restore(); }
    }
  }
  let encodedCanvas = canvas;
  if (seamlessSize && a.repeat === 'half-drop') {
    encodedCanvas = document.createElement('canvas'); encodedCanvas.width = seamlessSize.width; encodedCanvas.height = seamlessSize.height;
    const repeated = encodedCanvas.getContext('2d'); if (!repeated) throw Error('Seamless PNG export is unavailable. Use seamless SVG.');
    repeated.drawImage(canvas, 0, 0);
    repeated.drawImage(canvas, a.width, a.height / 2);
    repeated.drawImage(canvas, a.width, -a.height / 2);
  }
  const blob = await new Promise<Blob>((resolve, reject) => encodedCanvas.toBlob(value => value ? resolve(value) : reject(Error('PNG encoding failed.')), 'image/png'));
  return new Uint8Array(await blob.arrayBuffer());
}
export function artworkFiles(input: ArtworkDocument): ExportFile[] {
  const a = validateArtwork(input), svg = artworkSvg(a), encode = (value: string) => new TextEncoder().encode(value);
  const seamless = a.mode === 'tile' ? artworkSvg(a, 'seamless') : undefined;
  const extraFiles = seamless ? [{ name: 'seamless.svg', data: encode(seamless) }] : [];
  return [...Object.entries({ 'artwork.svg': svg, 'repeat.svg': artworkSvg(a, 'repeat'), 'artwork.json': JSON.stringify(a, null, 2), 'OFL.txt': studioFontLicense, 'index.html': `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Original Eidos artwork</title><style>body{margin:0;background:#dcded9;display:grid;place-items:center;min-height:100vh}svg{width:min(100%,900px);height:auto}</style>${seamless || svg}</html>`, 'README.md': `# Original Eidos artwork\n\nOpen index.html or artwork.svg independently. No remote fonts, API, or build step. SVG includes its licensed DM Sans variable font (weight 100–1000, optical size 9–40). OFL.txt accompanies it. This edition supports Latin text and punctuation.\n\nImport artwork.json through Artwork Studio to edit this source; the outer project.json (when present) restores the complete Playground project. Artwork dimensions: ${a.width} × ${a.height}. Transparent: ${a.transparent}.\n\n${a.mode === 'tile' ? `Use seamless.svg as a rectangular repeating background for the selected arrangement. Its unit is ${artworkSeamlessSize(a).width} × ${a.height}px: half-drop needs two columns to preserve offset parity at every horizontal seam. Artwork Studio also exports this unit as Seamless PNG. artwork.svg is the original single-cell design. repeat.svg is only a 3 × 3 inspection proof, not the half-drop repeat unit.` : 'This is a poster composition; it is not advertised as a seamless tile.'}\n\nUse the SVG as a background or image in software supporting embedded SVG fonts. Some design tools strip embedded fonts: use the PNG from Studio for that workflow. Uploaded images remain embedded and require your rights. Browser layout and external design software vary; inspect at the intended size before print.\n` }).map(([name, data]) => ({ name, data: encode(data) })), ...extraFiles];
}
