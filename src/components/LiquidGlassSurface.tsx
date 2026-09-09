import { useEffect, useId, useRef } from 'react';
import { mountLiquidGlass } from '../lib/liquid-glass/controller';
import preset from '../lib/liquid-glass/preset.json';

/** Sibling decorative layers leave all existing link and menu hit targets intact. */
export function LiquidGlassSurface() {
  const layer = useRef<HTMLDivElement>(null);
  const id = `ew-lens-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  useEffect(() => {
    const surface = layer.current?.parentElement;
    if (surface) return mountLiquidGlass(surface);
  }, []);
  return (
    <div ref={layer} className="ew-liquid-layers" aria-hidden="true">
      <svg className="ew-liquid-defs" xmlns="http://www.w3.org/2000/svg">
        <defs><filter id={id} colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x="0" y="0" width="1450" height="76">
          <feImage data-lens-map="" x="0" y="0" width="1450" height="76" preserveAspectRatio="none" result="lensRaw" />
          <feGaussianBlur in="lensRaw" stdDeviation={preset.lens.mapSmoothingPx} result="lensMap" />
          <feDisplacementMap data-base-displacement="" in="SourceGraphic" in2="lensMap" scale="64" xChannelSelector="R" yChannelSelector="G" result="baseGlass" />
          <feFlood floodColor="#808080" result="neutralContact" />
          <feImage data-contact-map="" x="0" y="0" width="200" height="200" preserveAspectRatio="none" result="contactPatch" />
          <feImage data-edge-mask="" x="0" y="0" width="1450" height="76" preserveAspectRatio="none" result="edgeMask" />
          <feComposite in="contactPatch" in2="edgeMask" operator="in" result="edgeContact" />
          <feMerge result="contactRaw"><feMergeNode in="neutralContact" /><feMergeNode in="edgeContact" /></feMerge>
          <feComponentTransfer in="contactRaw" result="contactField"><feFuncR type="linear" slope="1" intercept="-0.0019607843" /><feFuncG type="linear" slope="1" intercept="-0.0019607843" /></feComponentTransfer>
          <feDisplacementMap data-contact-displacement="" in="baseGlass" in2="contactField" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter></defs>
      </svg>
      <div className="ew-liquid-optics" />
      <div className="ew-liquid-solid" />
      <div className="ew-liquid-rim" />
      <canvas className="ew-liquid-light" />
    </div>
  );
}
