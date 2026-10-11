# Varied-content and constrained-performance acceptance

Source acceptance: passed. Shop visual review: partial pending disabled primary button contrast fix.

Local Chromium, 390 × 844 touch viewport, reduced motion. CPU slowdown 4×; 150 ms network latency; 200000 B/s download; 75000 B/s upload; cache disabled. One cold observation per family, not field data, Lighthouse, INP, or a performance guarantee.

| Family | DCL ms | Load ms | observed LCP ms | observed CLS | keyboard/touch, missing imagery, long-copy/aspect |
| --- | ---: | ---: | ---: | ---: | --- |
| switchboard | 2796.2 | 2891.7 | 2760 | 0 | passed |
| tideglass | 2478.6 | 2614.4 | 2480 | 0 | passed |
| matter | 2420.4 | 2490.5 | 2404 | 0 | passed |
| nightjar | 2562.6 | 2728 | 2520 | 0 | passed |

Screenshots and reproducible script: `E:\CodexArtifacts\paid-templates-20261010`. Source/archive files were not edited by this run.

Runtime/network image failures intentionally induced for the missing-image negative control are expected; JavaScript page errors are checked separately.

## Limits

- Host load and concurrent acceptance runs affect timings.
- CDP throttling is a simulation, not a physical constrained phone or mobile carrier.
- LCP and CLS are observed only until the recorded snapshot before interactions; no CrUX/field metrics.
- Original raster/SVG fixture uses test-only DOM replacement; no purchased archive is personalized.
- Contrast review is limited to sampled visible UI and screenshots, not an accessibility certification.

## Fresh mobile shop visual review

Actual collection and phone iframe previews paint correctly when visible. Blank offscreen iframe areas in full-page screenshots are a capture limitation, not a failed live preview.

Root corrected purchase heading/price/body/label contrast; fresh computed text/background ratios were15.1 and10.89. The disabled primary button still has a dark foreground on dark background (raw contrast1.04, opacity0.6); an explicit light primary-button foreground is required and has been sent to the owning agent. See external computed-style/viewport receipts. No source/archive bytes changed by this acceptance run.
