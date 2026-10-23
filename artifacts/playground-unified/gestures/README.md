# Unified editor: direct manipulation acceptance

The local app passed 14 rendered checks using real mouse and keyboard input in headless Chromium at a 1600 × 1050 viewport. A valid two-column test project was imported through the visible Project controls; tests did not mutate application state through browser internals. IndexedDB was read to compare the entire saved project before and after each operation.

## Verified behavior

- Canvas selection and Layers identify the same image.
- Drag feedback names and highlights an empty nested destination.
- Escape, pointer cancellation and lost capture leave project content unchanged. The cancellation events were injected during actual drags; Escape used real keyboard input.
- Actual canvas dragging moves an image into the empty second-column stack.
- Actual resize retains the locked aspect ratio, and crop adjusts the focal point independently of frame size.
- Each completed drag, resize and crop is one exact Undo/Redo transaction.
- Keyboard controls move and resize the image.
- Mobile overrides are visible, independent of desktop, and reset to inheritance.
- The full Layers UI appends to the empty nested destination with the same semantics as the canvas.

## Bug found and fixed

The initial ghost existed in the DOM but appeared below the viewport. Its CSS declared `top: 0; left: 0` before `inset: auto`, which reset those positions. The failing viewport assertion and geometry are retained in `ghost-reproduction/receipt.json`. The screenshot and prior measurements are also retained as `ghost-before-fix.png` and `ghost-before-fix.json`.

Changing the declaration to `inset: 0 auto auto 0` anchors the ghost correctly. In the final run its top was approximately 216 CSS pixels, versus approximately 1744 before the fix. `02-empty-container-drag-preview.png` shows the ghost beside the named destination. All checks passed after the fix.

## Timing evidence and limits

The final run captured 79 `playground-gesture-paint` samples. Pointer sample to animation-frame style update p95 was **1.5 ms**, and active frame interval p95 was approximately **16.8 ms**. During the measured drag there were zero IndexedDB writes, zero page-root replacements, zero glass-header removals and zero observed long tasks.

This instrument measures JavaScript style updates, not actual screen presentation latency. It does not establish the requested representative-device pointer-to-paint budget or physical-device acceptance. Other work shared the Windows host; GPU was disabled. Physical devices and touch input remain untested by this script. One unrelated unused public-site preload warning was observed; there were no application runtime errors.

## Re-run

From the frontend repository root, with its dev server running:

```powershell
$env:PG_BASE_URL='http://127.0.0.1:5184'
$env:PLAYWRIGHT_MODULE='<installed Playwright module path>'
node --import tsx scripts/verify-playground-unified-gestures.mjs
```

The default evidence folder is `artifacts/playground-unified/gestures`; set `PG_GESTURE_EVIDENCE` to preserve a separate run. `receipt.json` contains exact source identity, full metrics, console observations, stable IDs and every asserted check. The final project is `final-project.json`.
