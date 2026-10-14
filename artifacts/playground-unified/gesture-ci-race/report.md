# Gesture CI selection synchronization investigation

Release CI run `38622652428` failed on source `b2a53914` at the first canvas-to-Layers selection assertion, before any drag. It expected `Movable photograph` but read the initial `Two columns` selection. The retained log is `../ci-final-release-first-attempt/failure.log`, lines 118–122. The concurrent isolated preview run passed all 14 gesture checks on the same source.

The old `selectPhoto()` clicked the photo and waited for a drag handle inside the preview iframe. `authoringRuntime.select()` creates its toolbar synchronously and then sends the selected ID to the parent using `postMessage`. `Preview.tsx` receives that separate task and updates React's editor selection. Thus a canvas handle is not an acknowledgement that Layers has applied the selection. An immediate parent `innerText()` read can observe the previous root selection.

This is a demonstrated synchronization gap in the test and a plausible explanation of the CI result. The original failure did not reproduce in the unmodified local run, so the exact CI interleaving is not claimed as independently observed. No product selection or drag defect was reproduced.

## Narrow repair

`scripts/verify-playground-unified-gestures.mjs` now waits for the photo's named toolbar and for the selected Layers row with the exact stable photo ID and `aria-pressed="true"`. Both original assertions remain: visible layer text must name the photograph, and the saved editor selection must contain its stable ID. If the message is lost or the product keeps the wrong selection, the condition times out and the test still fails. No delay, extra click, retry loop, production code, or assertion relaxation was added.

The receipt environment now records `process.platform`, `process.arch`, and `process.version` instead of reporting every host as Windows.

## Validation

The following repo-root command ran against current Vite source at `http://127.0.0.1:5184`, using the existing external Playwright installation:

```text
node --import tsx scripts/verify-playground-unified-gestures.mjs
```

- Unmodified baseline: 14/14 checks passed; `before-local/receipt.json`.
- Corrected run 1: 14/14 passed; `after-local-1/receipt.json`.
- Corrected run 2: 14/14 passed; `after-local-2/receipt.json`.
- `node --check scripts/verify-playground-unified-gestures.mjs`: passed.
- `npx eslint scripts/verify-playground-unified-gestures.mjs`: passed.

The full runs retain actual pointer dragging, cancellation, nested empty-container moves, frame resize, crop, keyboard alternatives, mobile inheritance, exact Undo/Redo, and Layers movement. Screenshots and final JSON projects accompany each receipt. Timing values are samples from a shared host and are not used to claim device latency.

The original failed CI did not upload its gesture receipt or screenshot because those files were written outside that workflow's artifact path. Its failure log is preserved; no missing screenshot is represented as available. The root task separately corrected CI evidence destinations. A fresh Linux CI result remains required to validate the corrected harness in that environment.

## Service-number verifier

`scripts/verify-playground-service-numbers.mjs` is the reproducible source for `../service-number-wrap/receipt.json` and the 320/390-pixel before/after screenshots. It is not a duplicate of an artifact-folder verifier; that folder contains generated packages, images, and the receipt. Retain the script unchanged.
