# Varied-content and constrained-performance acceptance

Focused source and mobile shop acceptance: passed.

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

Actual collection and phone iframe previews paint correctly when visible. Blank offscreen iframe areas in full-page screenshots are a capture limitation.

Root corrected purchase heading/price/body/labels and the primary-button foreground. Fresh computed heading/price ratios were15.1; body/labels10.89 against the panel. The corrected disabled primary button uses rgb(241,246,239) on rgb(20,37,41): raw ratio14.45 and opacity-composited estimate6.04 at opacity0.6. Its unavailable/disabled state remains intact. See external shop-primary-button-final.json and purchase-button-final-390.jpg. This is sampled local contrast/layout inspection, not accessibility certification.

Source/archive bytes were untouched. The initial test harness raced anchor navigation; its corrected rerun waits explicitly around Enter/tap. Full cross-engine CI, CMS installation, provider checkout/email, physical devices, and production remain separate gates.
