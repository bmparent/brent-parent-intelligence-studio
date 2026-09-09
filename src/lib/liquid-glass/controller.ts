import preset from './preset.json';
import { advanceSpring, clamp, scrollProgress, smoothstep, surfacePoint, type Spring } from './math';
import { createContactMap, createLensMaps, createRimRenderer } from './optics';

/** The controller owns transient optics only; React continues to own navigation. */
export function mountLiquidGlass(surface: HTMLElement) {
  const outer = surface.closest('header')!;
  const query = <T extends Element>(selector: string) => surface.querySelector<T>(selector)!;
  const filter = query<SVGFilterElement>('filter');
  const lens = query<SVGImageElement>('[data-lens-map]');
  const mask = query<SVGImageElement>('[data-edge-mask]');
  const contact = query<SVGImageElement>('[data-contact-map]');
  const baseDisplacement = query<SVGFEDisplacementMapElement>('[data-base-displacement]');
  const contactDisplacement = query<SVGFEDisplacementMapElement>('[data-contact-displacement]');
  const canvas = query<HTMLCanvasElement>('canvas');
  const optics = query<HTMLElement>('.ew-liquid-optics');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  let native = /Chrome|Chromium|Edg\//.test(navigator.userAgent) && !/iPhone|iPad|iPod/.test(navigator.userAgent) && CSS.supports('backdrop-filter', `url(#${filter.id})`);
  const abort = new AbortController();
  const passive = { passive: true, signal: abort.signal };
  const rim = createRimRenderer(canvas);
  const keys = Object.keys(preset.springs) as (keyof typeof preset.springs)[];
  const states = Object.fromEntries(keys.map(key => [key, { x: key === 'x' ? .3 : key === 'y' ? .5 : 0, v: 0 }])) as Record<typeof keys[number], Spring>;
  const targets = Object.fromEntries(keys.map(key => [key, states[key].x])) as Record<typeof keys[number], number>;
  let frame = 0, previousStamp = 0, previousScroll = Math.max(0, window.scrollY), stopped = false;
  let resizeNeeded = true, materialDirty = true, radius = 29, baseScale = 64;
  let pointer: { x: number; y: number; kind: string } | null = null;
  let activePointer: number | null = null, keyboardTarget: HTMLElement | null = null, keyboardPressed = false;
  let itemTones: { el: HTMLElement; brightness: number }[] = [];
  const initial = scrollProgress(previousScroll);
  surface.style.setProperty('--ew-liquid', String(initial));
  surface.style.setProperty('--ew-glass-frost', `${preset.lens.frostPx}px`);
  surface.style.setProperty('--ew-glass-saturation', String(preset.lens.saturation));
  surface.style.setProperty('--ew-glass-solid', preset.site.solidColour);
  surface.style.setProperty('--ew-glass-radius', `${preset.site.desktopRadiusPx}px`);
  surface.style.setProperty('--ew-glass-mobile-radius', `${preset.site.mobileRadiusPx}px`);

  function wake() {
    if (!frame && !stopped && !document.hidden) { previousStamp = performance.now(); frame = requestAnimationFrame(tick); }
  }
  function signedDepth(x: number, y: number, rect: DOMRect) {
    return surfacePoint(x - rect.left, y - rect.top, rect.width, rect.height, radius).depth;
  }
  function updateContact(rect: DOMRect) {
    targets.light = 0; targets.hover = 0; targets.press = 0;
    if (keyboardTarget?.isConnected) {
      const r = keyboardTarget.getBoundingClientRect();
      targets.x = (r.left + r.width / 2 - rect.left) / rect.width;
      targets.y = (r.top + r.height / 2 - rect.top) / rect.height;
      targets.light = 1; targets.hover = 1; targets.press = keyboardPressed ? 1 : 0;
      return;
    }
    if (!pointer || (pointer.kind === 'touch' && activePointer === null)) return;
    const depth = signedDepth(pointer.x, pointer.y, rect), hit = depth >= 0;
    targets.light = smoothstep(1 - Math.max(0, -depth) / preset.light.reachPx);
    targets.hover = hit ? 1 : 0; targets.press = hit && activePointer !== null ? 1 : 0;
    if (targets.light > 0) {
      targets.x = (pointer.x - rect.left) / rect.width; targets.y = (pointer.y - rect.top) / rect.height;
      if (states.light.x < .025) { states.x = { x: targets.x, v: 0 }; states.y = { x: targets.y, v: 0 }; }
    }
  }
  // Read painted DOM backgrounds only on scroll/resize, not every pointer frame.
  // An explicit data-glass-tone="dark|light" supports future image-led sections.
  function backgroundBrightness(x: number, y: number) {
    let brightness = 0, remaining = 1;
    for (const el of document.elementsFromPoint(x, y)) {
      if (outer.contains(el)) continue;
      const tone = el.closest<HTMLElement>('[data-glass-tone]')?.dataset.glassTone;
      if (tone) { brightness += remaining * (tone === 'dark' ? 25 : 245); remaining = 0; break; }
      const colour = getComputedStyle(el).backgroundColor.match(/[\d.]+/g)?.map(Number);
      if (!colour || colour.length < 3) continue;
      const alpha = colour[3] ?? 1;
      brightness += remaining * alpha * (colour[0] * .2126 + colour[1] * .7152 + colour[2] * .0722);
      remaining *= 1 - alpha;
      if (remaining < .01) break;
    }
    return brightness + remaining * 245;
  }
  function readMaterial(rect: DOMRect) {
    itemTones = [...surface.querySelectorAll<HTMLElement>('.ew-brand,.ew-nav a,.ew-header__cta,.ew-menu-toggle')]
      .filter(el => el.getClientRects().length > 0).map(el => {
        const r = el.getBoundingClientRect();
        const drawer = !!el.closest('.ew-nav.is-open') && getComputedStyle(el.parentElement!).position === 'absolute';
        return { el, brightness: drawer ? 25 : backgroundBrightness(r.left + r.width / 2, r.top + r.height / 2) };
      });
    const brightness = backgroundBrightness(rect.left + rect.width / 2, rect.top + rect.height / 2);
    targets.material = brightness < 135 ? 1 : 0;
    materialDirty = false;
  }
  function resize(rect: DOMRect) {
    const w = Math.round(surface.clientWidth), h = Math.round(surface.clientHeight);
    if (w < 2 || h < 2) return;
    radius = Math.min(h / 2, parseFloat(getComputedStyle(surface).borderTopLeftRadius));
    rim?.resize(w, h, radius);
    if (native) {
      try {
        const maps = createLensMaps(w, h, radius); baseScale = maps.scale;
        filter.setAttribute('width', String(w)); filter.setAttribute('height', String(h));
        for (const el of [lens, mask]) { el.setAttribute('width', String(w)); el.setAttribute('height', String(h)); }
        lens.setAttribute('href', maps.lens); mask.setAttribute('href', maps.mask);
        contact.setAttribute('href', createContactMap());
        optics.style.backdropFilter = `url(#${filter.id}) blur(${preset.lens.frostPx}px) saturate(${preset.lens.saturation})`;
      } catch { native = false; optics.style.removeProperty('backdrop-filter'); }
    }
    surface.dataset.glassEngine = native ? 'refraction' : 'frosted';
    resizeNeeded = false; readMaterial(rect);
  }
  function render(rect: DOMRect, progress: number) {
    const effects = !motion.matches && !forced.matches;
    const light = effects ? clamp(states.light.x) * progress : 0;
    const press = effects ? clamp(states.press.x) : 0;
    const flow = effects ? clamp(states.flow.x, -1, 1) : 0;
    const material = clamp(states.material.x);
    surface.style.setProperty('--ew-liquid', progress.toFixed(4));
    surface.style.setProperty('--ew-rim-energy', String(preset.scroll.rimRest + Math.abs(flow) * preset.scroll.rimBoost));
    surface.style.setProperty('--ew-glass-top', `rgba(${Math.round(255 - 238 * material)},${Math.round(255 - 224 * material)},${Math.round(255 - 200 * material)},${.15 + .07 * material})`);
    surface.style.setProperty('--ew-glass-bottom', `rgba(${Math.round(209 - 21 * material)},${Math.round(233 + 11 * material)},${Math.round(228 + 5 * material)},${.07 - .025 * material})`);
    surface.dataset.glassState = progress === 0 ? 'solid' : progress === 1 ? 'liquid' : 'transition';
    surface.dataset.glassContact = activePointer !== null ? 'pressed' : targets.hover ? 'hover' : 'rest';
    for (const { el, brightness } of itemTones) {
      const effective = 34 * (1 - progress) + brightness * progress;
      // Hysteresis prevents contrast chatter at a background boundary.
      if (effective < 125) el.dataset.glassTone = 'dark';
      else if (effective > 145) el.dataset.glassTone = 'light';
    }
    rim?.render(states.x.x * rect.width, states.y.x * rect.height, light, press, material);
    if (native) {
      const footprint = clamp(rect.width * preset.contact.widthRatio, preset.contact.minFootprintPx, preset.contact.maxFootprintPx);
      contact.setAttribute('x', (states.x.x * rect.width - footprint / 2).toFixed(3));
      contact.setAttribute('y', (states.y.x * rect.height - footprint / 2).toFixed(3));
      contact.setAttribute('width', String(footprint)); contact.setAttribute('height', String(footprint));
      contactDisplacement.setAttribute('scale', (effects ? progress * (states.hover.x * preset.contact.hoverScale + press * preset.contact.pressScale) : 0).toFixed(4));
      baseDisplacement.setAttribute('scale', (baseScale * (1 + Math.abs(flow) * preset.scroll.bendBoost)).toFixed(4));
    }
  }
  function tick(stamp: number) {
    frame = 0;
    if (stopped || document.hidden) return;
    const dt = Math.max(.001, (stamp - previousStamp) / 1000); previousStamp = stamp;
    const rect = surface.getBoundingClientRect();
    if (resizeNeeded) resize(rect); else if (materialDirty) readMaterial(rect);
    updateContact(rect);
    const y = Math.max(0, window.scrollY), progress = scrollProgress(y);
    targets.flow = Math.tanh((y - previousScroll) / Math.max(1 / 120, dt) / preset.scroll.velocityScale); previousScroll = y;
    if (motion.matches || forced.matches || progress === 0) {
      for (const key of keys) { states[key].x = targets[key]; states[key].v = 0; }
      states.light.x = 0; states.hover.x = 0; states.press.x = 0; states.flow.x = 0;
    } else for (const key of keys) advanceSpring(states[key], targets[key], preset.springs[key], dt);
    render(rect, progress);
    const moving = progress > 0 && !motion.matches && !forced.matches && keys.some(key => Math.abs(states[key].x - targets[key]) > .0001 || Math.abs(states[key].v) > .001);
    const finishScroll = progress > 0 && !motion.matches && !forced.matches && Math.abs(targets.flow) > .0001;
    if (moving || finishScroll) frame = requestAnimationFrame(tick);
  }
  function release(clear = false) {
    activePointer = null; keyboardPressed = false;
    if (clear || pointer?.kind === 'touch') pointer = null;
    wake();
  }
  function reset() {
    pointer = null; activePointer = null; keyboardTarget = null; keyboardPressed = false;
    for (const key of ['light', 'hover', 'press', 'flow'] as const) { states[key] = { x: 0, v: 0 }; targets[key] = 0; }
    canvas.style.opacity = '0'; contactDisplacement.setAttribute('scale', '0');
    if (frame) cancelAnimationFrame(frame); frame = 0;
    materialDirty = true; previousScroll = Math.max(0, window.scrollY); wake();
  }
  document.addEventListener('pointermove', event => {
    if (!event.isPrimary || (activePointer !== null && event.pointerId !== activePointer) || (event.pointerType === 'touch' && activePointer === null)) return;
    pointer = { x: event.clientX, y: event.clientY, kind: event.pointerType }; keyboardTarget = null;
    const rect = surface.getBoundingClientRect();
    if (signedDepth(event.clientX, event.clientY, rect) > -preset.light.reachPx || states.light.x > .001 || activePointer !== null) wake();
  }, passive);
  surface.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || activePointer !== null || signedDepth(event.clientX, event.clientY, surface.getBoundingClientRect()) < 0) return;
    activePointer = event.pointerId; keyboardTarget = null;
    pointer = { x: event.clientX, y: event.clientY, kind: event.pointerType }; wake();
  }, passive);
  document.addEventListener('pointerup', event => {
    if (event.pointerId !== activePointer) return;
    pointer = { x: event.clientX, y: event.clientY, kind: event.pointerType };
    release();
  }, passive);
  document.addEventListener('pointercancel', event => { if (event.pointerId === activePointer) release(true); }, passive);
  document.documentElement.addEventListener('pointerleave', () => release(true), passive);
  surface.addEventListener('lostpointercapture', () => release(true), passive);
  surface.addEventListener('focusin', event => {
    const target = event.target as HTMLElement;
    if (target.matches(':focus-visible')) { keyboardTarget = target; pointer = null; wake(); }
  }, passive);
  surface.addEventListener('focusout', event => {
    if (!surface.contains(event.relatedTarget as Node)) { keyboardTarget = null; keyboardPressed = false; wake(); }
  }, passive);
  surface.addEventListener('keydown', event => { if (keyboardTarget && event.key === 'Enter') { keyboardPressed = true; wake(); } }, passive);
  surface.addEventListener('keyup', () => { keyboardPressed = false; wake(); }, passive);
  window.addEventListener('scroll', () => { materialDirty = true; wake(); }, passive);
  window.addEventListener('resize', () => { resizeNeeded = true; materialDirty = true; wake(); }, passive);
  window.addEventListener('pageshow', reset, passive);
  window.addEventListener('blur', reset, passive);
  document.addEventListener('visibilitychange', reset, passive);
  motion.addEventListener('change', reset, passive); forced.addEventListener('change', reset, passive);
  const resizeObserver = new ResizeObserver(() => { resizeNeeded = true; wake(); }); resizeObserver.observe(surface);
  const menuObserver = new MutationObserver(() => { materialDirty = true; wake(); });
  const nav = surface.querySelector('nav'); if (nav) menuObserver.observe(nav, { attributes: true, attributeFilter: ['class'] });
  wake();
  return () => {
    stopped = true; abort.abort(); resizeObserver.disconnect(); menuObserver.disconnect();
    if (frame) cancelAnimationFrame(frame);
    canvas.style.opacity = '0'; optics.style.removeProperty('backdrop-filter');
  };
}
