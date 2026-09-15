export const HERO = { width: 1672, height: 941, motion: .45, water: .41, light: .38, source: [.824, .726] as const };

/** Same object-fit: cover / object-position: 95% 50% mapping for photo, shader and light. */
export function heroCrop(width: number, height: number) {
  const ratio = width / height / (HERO.width / HERO.height);
  return ratio < 1
    ? { x: (1 - ratio) * .95, y: 0, width: ratio, height: 1 }
    : { x: 0, y: (1 - 1 / ratio) * .5, width: 1, height: 1 / ratio };
}
export function heroLight(rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>, time: number) {
  const crop = heroCrop(rect.width, rect.height);
  return {
    x: rect.left + (HERO.source[0] - crop.x) / crop.width * rect.width,
    y: rect.top + (HERO.source[1] - crop.y) / crop.height * rect.height,
    intensity: HERO.light * (1 + HERO.motion * .045 * Math.sin(time * .44)),
  };
}
