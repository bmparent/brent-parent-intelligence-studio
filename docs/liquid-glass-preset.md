# Eidos liquid glass

Approved preset: **Eidos edge light v4** · September 9, 2026.

Clear glass with a narrow curved bevel. Text and shapes beneath it remain recognizable. Pointer light appears along the edges, with a restrained white glint and small prism colors. Pressing affects the bevel; the center stays quiet.

## Main settings

| Setting | Approved value | What it controls |
| --- | --- | --- |
| Profile | iOS-inspired, Refined | The approved fourth lab version |
| Edge bend | **16** | Distortion near the curved border |
| Magnification | **1.03×** | Slight enlargement of the live backdrop |
| Frost | **1.2px** | Softening after refraction |
| Saturation | **1.2×** | A small lift in transmitted color |
| Optical bevel width | Up to **19px**, capped at 25% of header height | Keeps the center clear |
| Map smoothing | **0.55px** | Softens displacement-map boundaries |
| Desktop corner radius | **29px** | Approved rounded shape |
| Site mobile corner radius | **23px** | Fits the site's shorter mobile header |

## Pointer light and prism

| Setting | Value |
| --- | --- |
| Light reach beyond the header | 170px, smoothly fades to zero |
| Local light falloff | 115px |
| Visible reflection band | Outer 7px only |
| White glint | Peak 0.72; centered 0.9px inward; width 0.85px |
| Prism color | Peak 0.32; centered 2.8px inward; width 1.35px |
| Spectral spread | 48px, widens gently at grazing angles |
| Spectral separation | 30px, increases gently with angle |
| Green balance | 0.84 |
| Extra brightness when pressed | Up to 18% |
| Dimming over dark material | 12% |
| Reflection canvas pixel ratio | Capped at 1.5× |

Brightness depends on pointer distance and the direction each part of the rounded edge faces. Color separation follows that local curve. These peak values are multiplied by distance, orientation, and entry/exit fading, so they are not whole-header opacity values.

## Touch and motion

| Setting | Value |
| --- | --- |
| Hover deformation scale | 0.5 |
| Additional press deformation scale | 4.3 |
| Full pressure response | Outer 3px |
| Pressure fades completely | 22px inward |
| Local contact footprint | 24% of width, limited to 150–240px |
| Contact texture | 96 × 96px, prepared on size changes |
| Pointer X / Y spring frequency | 48 / 48 |
| Light / hover / press spring frequency | 28 / 25 / 32 |
| Scroll / material spring frequency | 18 / 24 |
| Scroll velocity normalization | 1,100px per second |
| Maximum scroll bend boost | 1.4% |
| Ambient rim strength | 0.42, with up to 0.10 extra during scrolling |

Springs use elapsed seconds and a critically damped solution. The header and links remain stationary. Normal browser scrolling and navigation are preserved. Outside release, touch cancellation, window blur, hidden tabs, and unmounting clear the interaction. Reduced motion disables pointer and scroll reactions; it keeps the basic material and scroll-state changes.

## Eidos Works: solid at the top

| Page scroll | Header appearance |
| --- | --- |
| 0–4px | Fully opaque **#0f2530**; pointer light and live refraction hidden |
| 4–72px | Smooth transition from solid to glass |
| 72px and beyond | Full approved liquid-glass treatment |
| Return to the top | Immediately restores the opaque state |

The transition follows scroll position using `smoothstep((scrollY - 4) / 68)`. It does not run on a timer. Reloading or returning through browser history synchronizes it with the restored scroll position.

The shared header applies this behavior to every route. Its current navigation, mobile drawer, page content, links, and fixed placement remain in place. The mobile drawer itself stays opaque for readability.

## Reuse and tune

- **Machine-readable preset:** [preset.json](../src/lib/liquid-glass/preset.json). This is imported by the implementation; it is not a disconnected copy.
- **React decoration:** [LiquidGlassSurface.tsx](../src/components/LiquidGlassSurface.tsx).
- **Interaction lifecycle:** [controller.ts](../src/lib/liquid-glass/controller.ts).
- **Lens and prism rendering:** [optics.ts](../src/lib/liquid-glass/optics.ts).
- **Geometry and spring functions:** [math.ts](../src/lib/liquid-glass/math.ts).
- **Layer styling:** [liquid-glass.css](../src/styles/liquid-glass.css).

Place `<LiquidGlassSurface />` inside the header surface before its navigation. Keep optical layers behind the links and leave the wrapper's opacity and filters unset: filtering the wrapper would isolate the live page backdrop. Import the stylesheet after the site's base header rules.

Navigation contrast follows the painted DOM background beneath each control. For a future image or video section with an ambiguous background, give its container `data-glass-tone="dark"` or `data-glass-tone="light"`. This is a material hint, not pixel sampling of the media. A very mixed image still needs visual review.

Start new designs with this exact preset. Adjust frost or magnification first; preserve the thin prism band and zero-pressure center if you want to retain the approved feel. Record a new preset ID when changing the appearance.

## Browser behavior

Desktop Chromium receives the SVG backdrop refraction. Other browsers receive frosted glass with the same edge-light treatment when canvas is available. Forced-colors mode uses an ordinary readable solid header. Without JavaScript, the header remains solid.

This is a browser approximation inspired by the approved experiment, not Apple's native rendering system. Physical iPhone/Safari verification is still required before claiming identical mobile refraction.
