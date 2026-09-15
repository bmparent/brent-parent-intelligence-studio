# Animated Eidos Works hero — Codex implementation handoff

Brent approved this visual direction and requested repository delivery so Codex can integrate, complete the liquid-glass CTA treatment, verify, and deploy to eidos-works.com. This commit supplies reference material; it does not integrate or deploy the hero.

## Start here

1. Read repository AGENTS.md and deployment documentation.
2. Open `docs/hero-handoff-2026-09-15/hero-reference.html` in a local browser. It is a standalone reference with the original image embedded and no external dependencies.
3. Integrate into the **active homepage**. At handoff, code search identifies `src/components/HomePage.tsx` (`ew-cinema`), while `src/components/Hero.tsx` contains a legacy profile/Babylon hero. Trace routing/imports; do not edit only the legacy component.
4. Implement the remaining CTA tile and lifecycle hardening below. Verify, then use the existing production deployment pipeline. Do not stop at a plan or a local build.

## Provenance and limitations

The exact final inline HTML from the Work session was no longer on the temporary filesystem. This reference was recovered from the saved water prototype and the subsequent code edits recorded in the conversation (ripples, edge highlights, mist transport, shoreline wash, mobile composition, adaptive resolution and copy). It is **a recovered reference, not a byte-identical verified export** of the final inline preview. The original embedded image is preserved from the saved prototype. The source is supplied so Codex need not reconstruct the effects from prose.

Checks completed: JavaScript syntax; exact defaults; expected effect functions and controls. Browser rendering, shader compilation and device performance have **not** been verified here. The reference must pass visual review before production. No screenshot identifying the red-outlined CTA was supplied with the latest request; the older screenshot marks glass edges only.

## Locked initial parameters

| Parameter | UI | Runtime |
| --- | --- | --- |
| Motion | 45% | 0.45 |
| Water | 41% | 0.41 |
| Light | 38% | 0.38 |

These are already applied to the reference. Motion controls some effect amplitudes; do not reinterpret 45% as a universal playback-speed multiplier. Lighting includes baked highlights in the photograph, so 38% does not dim the entire source image to 38%.

## Preserve the accepted scene

- Original glass arch right; calm dark headline area left.
- Light anchored beneath the arch around image UV (0.824, 0.726), with consistent crop coordinates.
- Narrow moving glints on the two marked glass edges, varying in width.
- Wisps drifting left from the arch, spreading above the water and dissipating.
- Full-width irregular shoreline wash, small broken foam patches, receding wet reflections. Glass foot remains solid.
- Mouse/touch disturbances create bounded, damped spreading ripples that alter the same surface normals used by reflections.
- Dedicated mobile text and image composition, working CTA links, immediate still-image fallback, accessible pause/play, reduced-motion support.

The waves use analytic gravity-wave slopes; pointer wakes, mist, shoreline and lighting are visually calibrated approximations over a photograph. Do not market this as a full fluid simulation or physically exact ray tracing.

## Image asset

Brent says the original hero is already in Cloudinary. Resolve and reuse the exact existing asset, including suitable CORS behavior for WebGL textures; do not guess its public ID or upload another Cloudinary copy. The current repo also contains `public/images/eidos-glass-hero.webp`. Confirm composition/aspect against the embedded reference rather than assuming that similarly named assets are identical. The reference uses 1672/941 for coordinates; adapt mapping to verified actual dimensions/crop. Set crossOrigin before src when loading a cross-origin texture. Retain the native image on failure.

## Liquid-glass CTA tile — remaining work

Place the exact button outlined in the user's latest screenshot on a liquid-glass tile. If Codex receives no screenshot, ask which of the two CTAs is intended; do all other authorized work first. Do not guess, or apply tiles to every button.

Existing reusable implementation verified in the repo:
- `src/components/LiquidGlassSurface.tsx`
- `src/lib/liquid-glass/controller.ts`
- `src/lib/liquid-glass/optics.ts`
- `src/lib/liquid-glass/math.ts`
- `src/lib/liquid-glass/preset.json`
- `src/styles/liquid-glass.css`
- `docs/liquid-glass-preset.md`

The current site preset is **eidos-edge-light-v5**, with frost 1.2, bend 16, magnification 1.03, white peak 0.72, colour peak 0.32 (touch 0.65), reach 170. Do not overwrite it globally.

The earlier handoff recorded the user's remembered glass treatment for this tile:
- frost 3.6 px
- edge bend 9
- magnification 1.015
- white glint 0.53
- colour intensity 0.22
- reach 225 px

Apply those as a **local tile variant** on the established engine, preserving the remaining v5 mechanics. The older identifiers were `dg-inksoft-glass-lab-v3` and `eidos-edge-light-v4`; reuse optics, not InkSoft coupling. These values are implementation parameters, not whole-element opacity values. Keep text and interactions above decorative layers and do not copy header scroll/sticky behavior to the tile.

Share the hero light source and intensity with the tile:
- Map its source position through real image crop and responsive layout into tile-relative coordinates.
- Use edge/surface normal, view direction and smooth distance attenuation to favor the edge facing the arch light.
- Subtle source-linked glint and tint, with shared slow light variation in glass/mist/water.
- Cursor reaction remains secondary. No unrelated sweeping gradient or uniform glowing border.
- Keep the label crisp, keyboard focus visible and touch targets at least 44px.

## Production hardening

Adapt the standalone reference into framework components with scoped styles and lifecycle cleanup; do not paste the document wholesale into the app. Keep production tuning controls hidden/removed while retaining accessible pause/play.

- Dispose all observers, listeners, RAF handles, textures, shaders, programs and buffers on unmount.
- Avoid duplicate loops in React StrictMode.
- Replace the reference's context-restored `location.reload()` with local reinitialization or still-image fallback. Never reload the whole site to recover graphics.
- Test shader/texture failure, context loss, reduced-motion changes, forced colors, hidden/offscreen suspension, pause/resume and resize/orientation.
- Fix elapsed-time behavior on throttled devices: avoid animation unintentionally slowing because dt is hard-clamped each frame. Reset timing on resume without replaying hidden time.
- Adapt rendering resolution using measured frame performance and respect save-data/device limitations where appropriate. Do not claim measured FPS without evidence.
- Preserve regular touch scrolling; keep pointer positions aligned with the actual rendered canvas/crop.
- Reserve layout space and show the original image immediately; fade motion in only after the first rendered frame.
- Ensure the mobile headline/CTA and arch do not overlap. Preserve the real site's navigation, routing and brand typography.

## Validation and deployment

Test 320, 390, 768px and large desktop layouts. Use available Chromium, WebKit and Firefox coverage; explicitly distinguish emulation from physical iPhone/Android checks. Record screenshots and a short animation capture where supported.

Confirm exact 45/41/38 startup values, visible restrained effects, directional CTA highlight, keyboard/touch behavior, no layout overflow or console errors, functional CTA destinations, static/reduced-motion behavior and measured performance.

Run relevant repository checks/build gates. Follow the actual deployment configuration in `docs/DEPLOYMENT.md`; do not assume Vercel simply because other projects use it. Do not create a replacement site or change domains. Deploy through the existing pipeline and verify the actual production URL after release.

Report changes, commit/deployment IDs, production URL, browser/performance evidence and remaining limitations. Do not call a branch, draft PR, local build or preview a production deployment.
