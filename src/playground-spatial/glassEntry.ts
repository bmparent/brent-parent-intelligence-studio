import { mountLiquidGlass } from '../lib/liquid-glass/controller';
import type { Project } from './model';
export function mount(glass: Project['glass'], root: ParentNode = document) {
  const surface = root.querySelector<HTMLElement>('.pg-header .ew-header__inner');
  if (!surface) return () => {};
  return mountLiquidGlass(surface, {
    disabled: !glass.enabled, reducedMotion: glass.reducedMotion,
    lens: { frostPx: glass.frost },
    light: { whitePeak: glass.edge, colourPeak: glass.prism },
    contact: { pressScale: glass.touch }, springs: { light: glass.response },
    site: { solidColour: glass.solid, solidThroughPx: glass.start, fullyLiquidAtPx: glass.end, desktopRadiusPx: glass.radius, mobileRadiusPx: Math.min(23, glass.radius) },
  });
}
