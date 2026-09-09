import preset from './preset.json';

export const clamp = (n: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
export const smoothstep = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
export const scrollProgress = (y: number, site = preset.site) => smoothstep((y - site.solidThroughPx) / (site.fullyLiquidAtPx - site.solidThroughPx));
export type Spring = { x: number; v: number };
export function advanceSpring(state: Spring, target: number, omega: number, dt: number) {
  const delta = state.x - target, j = state.v + omega * delta, decay = Math.exp(-omega * dt);
  state.x = target + (delta + j * dt) * decay;
  state.v = (state.v - omega * j * dt) * decay;
  if (Math.abs(state.x - target) < .0001 && Math.abs(state.v) < .001) { state.x = target; state.v = 0; }
}
export function surfacePoint(x: number, y: number, w: number, h: number, radius: number) {
  const sx = x - w / 2, sy = y - h / 2;
  const qx = Math.abs(sx) - (w / 2 - radius), qy = Math.abs(sy) - (h / 2 - radius);
  const ox = Math.max(qx, 0), oy = Math.max(qy, 0), length = Math.hypot(ox, oy);
  const depth = radius - length - Math.min(Math.max(qx, qy), 0);
  let nx = 0, ny = 0;
  if (length) { nx = ox / length * Math.sign(sx); ny = oy / length * Math.sign(sy); }
  else if (qx > qy) nx = Math.sign(sx); else ny = Math.sign(sy);
  return { depth, nx, ny };
}
