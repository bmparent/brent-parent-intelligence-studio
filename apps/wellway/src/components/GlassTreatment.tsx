import { useEffect } from "react";
import preset from "../../../../src/lib/liquid-glass/preset.json";
import {
  createLensMaps,
  createRimRenderer,
} from "../../../../src/lib/liquid-glass/optics";
import {
  advanceSpring,
  type Spring,
} from "../../../../src/lib/liquid-glass/math";

/** The approved Eidos optics, adapted to bounded card geometry. Never samples or clones member content. */
function mount(surface: HTMLElement, paused: boolean) {
  const layer = document.createElement("div");
  layer.className = "ww-material";
  layer.setAttribute("aria-hidden", "true");
  const optics = document.createElement("div");
  optics.className = "ww-material-backdrop";
  const canvas = document.createElement("canvas");
  canvas.className = "ww-material-light";
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  defs.classList.add("ww-material-defs");
  const filter = document.createElementNS(defs.namespaceURI, "filter");
  const id = `ww-lens-${crypto.randomUUID()}`;
  filter.setAttribute("id", id);
  filter.setAttribute("color-interpolation-filters", "sRGB");
  filter.setAttribute("filterUnits", "userSpaceOnUse");
  const image = document.createElementNS(defs.namespaceURI, "feImage");
  image.setAttribute("result", "lens");
  const displacement = document.createElementNS(
    defs.namespaceURI,
    "feDisplacementMap",
  );
  displacement.setAttribute("in", "SourceGraphic");
  displacement.setAttribute("in2", "lens");
  displacement.setAttribute("xChannelSelector", "R");
  displacement.setAttribute("yChannelSelector", "G");
  filter.append(image, displacement);
  defs.append(filter);
  layer.append(defs, optics, canvas);
  surface.prepend(layer);
  surface.classList.add("ww-glass");
  surface.dataset.glassPreset = preset.id;
  let rim: ReturnType<typeof createRimRenderer> = null;
  const forced = matchMedia("(forced-colors: active)");
  let forceFallback = false;
  try {
    forceFallback = sessionStorage.getItem("wellway.glassFallback") === "true";
  } catch {
    /* Storage is optional. */
  }
  if (!paused && !forced.matches)
    try {
      rim = createRimRenderer(canvas, {
        ...preset,
        light: { ...preset.light, pixelRatioCap: 1 },
      });
    } catch {
      /* Frosted fallback remains readable. */
    }
  let frame = 0,
    visible = false,
    stopped = false,
    dirty = true,
    stamp = 0,
    w = 0,
    h = 0;
  let px = 0.5,
    py = 0.5,
    target = 0,
    press = 0;
  const light: Spring = { x: 0, v: 0 };
  const native =
    !forceFallback &&
    !paused &&
    !forced.matches &&
    /Chrome|Chromium|Edg\//.test(navigator.userAgent) &&
    !/iPhone|iPad|iPod/.test(navigator.userAgent);
  const resize = () => {
    w = Math.round(surface.clientWidth);
    h = Math.round(surface.clientHeight);
    const radius = Math.min(
      h / 2,
      parseFloat(getComputedStyle(surface).borderTopLeftRadius) || 0,
    );
    surface.dataset.glassEngine = "frosted";
    optics.style.removeProperty("backdrop-filter");
    if (w < 2 || h < 2) return;
    // Card dimensions replace the Eidos header's fixed 1450×76 filter geometry.
    if (w * h <= 450_000) {
      rim?.resize(w, h, radius);
      if (native && !forced.matches)
        try {
          const maps = createLensMaps(w, h, radius, {
            ...preset,
            lens: {
              ...preset.lens,
              edgeBend: 10,
              magnification: 1.018,
              rimWidthPx: 14,
            },
          });
          filter.setAttribute("x", "0");
          filter.setAttribute("y", "0");
          filter.setAttribute("width", String(w));
          filter.setAttribute("height", String(h));
          image.setAttribute("width", String(w));
          image.setAttribute("height", String(h));
          image.setAttribute("href", maps.lens);
          displacement.setAttribute("scale", String(maps.scale));
          optics.style.backdropFilter = `url(#${id}) blur(8px) saturate(${preset.lens.saturation})`;
          surface.dataset.glassEngine = "refraction";
        } catch {
          /* Canvas/filter failure leaves the same frosted material. */
        }
    }
    dirty = false;
  };
  const tick = (now: number) => {
    frame = 0;
    if (stopped || !visible || document.hidden) return;
    if (dirty) resize();
    advanceSpring(
      light,
      target,
      preset.springs.light,
      Math.min(0.05, (now - stamp) / 1000 || 0.016),
    );
    stamp = now;
    if (!paused && !forced.matches && w * h <= 450_000)
      rim?.render(px * w, py * h, light.x, press, 0);
    if (Math.abs(light.x - target) > 0.001 || Math.abs(light.v) > 0.001)
      frame = requestAnimationFrame(tick);
  };
  const wake = () => {
    if (!frame && visible && !document.hidden && !stopped) {
      stamp = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };
  const cancel = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    canvas.style.opacity = "0";
    light.x = 0;
    light.v = 0;
  };
  const point = (e: PointerEvent) => {
    if (paused || forced.matches) return;
    const r = surface.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width;
    py = (e.clientY - r.top) / r.height;
    target = 0.8;
    wake();
  };
  const leave = () => {
    target = 0;
    press = 0;
    wake();
  };
  const down = (e: PointerEvent) => {
    press = 1;
    point(e);
  };
  const up = () => {
    press = 0;
    target = 0;
    wake();
  };
  const abort = new AbortController(),
    options = { passive: true, signal: abort.signal };
  surface.addEventListener("pointermove", point, options);
  surface.addEventListener("pointerdown", down, options);
  surface.addEventListener("pointerleave", leave, options);
  window.addEventListener("pointerup", up, options);
  window.addEventListener("pointercancel", up, options);
  const visibility = () => {
    if (document.hidden) cancel();
    else {
      dirty = true;
      wake();
    }
  };
  document.addEventListener("visibilitychange", visibility, options);
  const change = () => {
    cancel();
    dirty = true;
    wake();
  };
  forced.addEventListener("change", change);
  const resizeObserver = new ResizeObserver(() => {
    dirty = true;
    wake();
  });
  resizeObserver.observe(surface);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    surface.dataset.glassVisible = String(visible);
    if (visible) wake();
    else cancel();
  });
  observer.observe(surface);
  return () => {
    stopped = true;
    cancel();
    abort.abort();
    observer.disconnect();
    resizeObserver.disconnect();
    forced.removeEventListener("change", change);
    layer.remove();
    delete surface.dataset.glassPreset;
    delete surface.dataset.glassEngine;
  };
}
export function GlassTreatment({ paused }: { paused: boolean }) {
  useEffect(() => {
    // DOM-only test environments and unsupported browsers keep the CSS fallback.
    if (
      typeof ResizeObserver === "undefined" ||
      typeof IntersectionObserver === "undefined" ||
      typeof matchMedia === "undefined"
    )
      return;
    const mounts = new Map<HTMLElement, () => void>();
    const scan = () => {
      for (const [el, cleanup] of mounts)
        if (!el.isConnected) {
          cleanup();
          mounts.delete(el);
        }
      document
        .querySelectorAll<HTMLElement>(
          ".topbar,.sidebar,.modal,.visit-card,.call-controls,.goal-strip",
        )
        .forEach((el) => {
          if (!mounts.has(el)) mounts.set(el, mount(el, paused));
        });
    };
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.querySelector(".wellway-app")!, {
      childList: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
      for (const cleanup of mounts.values()) cleanup();
    };
  }, [paused]);
  return null;
}
