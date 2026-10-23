# Unified Playground candidate — October 14, 2026

The authorized independent implementation is delivered as an isolated manual preview and two draft PRs. The whole handoff remains partial: provider assistance and hosted authenticated fulfillment require the owner inputs below. No production sales activation or LIVE transaction occurred.

- Preview: https://eidosworks-playground-20261014.pages.dev/playground/
- Frontend draft PR: https://github.com/bmparent/brent-parent-intelligence-studio/pull/111
- Backend draft PR: https://github.com/bmparent/eidos/pull/78
- Deployed frontend: `a669fddccc6f6be77f6e24e36ccd3f103c518fc0`.
- Deployed backend: `bd3c6ab2a636a5a1783babd304f2ac4c75f7a1b6`, deployment `dpl_3ybMcNrPqdT9dMWpbVvxDANqSaZr`.
- Backend bundle: `1e471a710c1d4d1343f0ac50d294f5efcf9c4ef8f2c56a49223f65bb69bda27c`.
- Database: none. Accounts, customer AI, commerce, delivery, mail and community are disabled in this preview.

## What changed

The start screen separates New and Continue, supplies three distinct populated single-page starters, and gathers an optional brief, brand and images. One workspace now holds Pages, Add, Layers, Assets, contextual editing, Brand, history, mobile review and Finish. Local persistence retains document identities and rejects stale asynchronous writes. Supported legacy projects still reopen.

Canvas and Layers share nested/empty/final destinations, a visible drag preview, stable selection identities and single-gesture Undo. Image crop/resize, cancellation, parent selection and mobile inheritance/reset have browser evidence. Timings measure animation-frame style updates; actual display latency and physical devices remain unproven.

Finish freezes the reviewed project. The purchase client and server storage/order contracts bind its exact package to an existing TEST order, preserve original paid archives, verify owner and signed-event identity, and keep later draft edits separate. Fresh-browser recovery verifies stored ZIP bytes and opens a new editable copy without replacing current work. Canonical runtime strings fix the demonstrated browser/compiled-Next package mismatch. Historical packages retain their original bytes.

Backend accounting adds integer customer/provider ledgers, atomic holds, owner-wide caps, one dispatch claim, technical waivers, unknown-cost retention and grant/refund guards. These are controlled accounting tests; no provider execution or model-quality claim is made.

Principal changed paths are `src/playground/`, `functions/_shared/platform/projectDelivery.ts`, `functions/_shared/platform/projectDeliveryOrders.ts`, the paired delivery APIs/migration, `scripts/*playground*`, the two Playground workflows and dated documentation. The backend has corresponding shared contracts, a separate delivery renderer graph, accounting contracts and TEST-only lifecycle hooks. The Git diffs are the authoritative full file list; generated public fixture packages/screenshots are retained as evidence.

## Verification

All six configured frontend workflows passed for final source `a669fdd`; see `final-source-ci-runs.json`. Isolated preview run `38623788219` built the exact candidate and verified hosted behavior. Broader release run `38623788224` tested a review merge with an identical full tree; see `release-merge-identity.json`.

- `npm run test:playground`: 73 passed.
- `npm run test:showcase`: 37 passed.
- `npm run test:platform`: 36 passed.
- Catalog/shop group: six passed; archive and full-site gates also passed in CI.
- `node --test scripts/test-playground-preview-pin.mjs scripts/test-playground-preview-assets.mjs`: eight passed.
- Lint, typecheck, frontend build and Functions build passed. Lint retains one existing Wellway Fast Refresh warning.
- Three-engine editor journeys: 60 checks. Final CI persistence: 13. Final CI gestures: 14. Actual hosted desktop/narrow journey: 20.
- Final Chromium purchase fixture suite: eight scenarios, 29 checks. Earlier explicitly identified three-engine purchase build: 21 scenarios, 78 checks, with separate final-patch coverage.
- Backend: 100 passed, one documented Windows symlink-privilege skip; build/typecheck passed.
- Browser/actual compiled Next package equality: 128,380 bytes, SHA256 `9def4cc49c1f79a061af9470c46fb96d6aa3550ba490304770ea1550364f29ed`.

CI also checks the exact protected backend source/bundle, disabled feature flags, wrong relay/origin rejection, local-only cloud409 boundaries, published JS/CSS hashes and the public relay. Production Pages deployment `5926dfb4-1df2-4dbf-8864-1f3f38e034f1` was unchanged. The original complete TEST candidate and all 32 original/current paid archives remain preserved.

The first Cloudflare asset failure, later relay propagation failure, cross-compiler mismatch and gesture-selection synchronization failure remain in named evidence folders. Passing reruns do not erase them. The deployment check now waits within a finite bound for a disabled stale source but rejects unsafe flags immediately; exact identity assertions remain mandatory.

## Evidence and archive

This folder contains logs, JSON receipts, source and artifact inventories, screenshots, independent fixture packages and the dated acceptance/handoff reports. `ci-final-preview/` contains the final deployed pair and hosted journey. `ci-final-release/` retains final three-engine, persistence and gesture receipts. `backend-final/` identifies the final backend evidence and separate mirror.

`artifact_manifest.json` inventories local files, sizes and SHA256 hashes. `drive_manifest.json` records the exact mounted Drive destination and readback results. A verified mounted-folder copy does not prove remote cloud synchronization. No provider credentials or original private paid archives are included.

## Remaining owner inputs and acceptance

1. Choose authorized reuse of the existing OpenAI key or a dedicated key, and state the maximum total USD provider-test budget. Then implement the scoped provider route, verify actual model access, run a bounded real proposal and the 20–30-case Astra/Sol comparison, and record actual usage. No key was printed or used.
2. Supply the local path to the existing ignored TEST configuration, or securely bind its authorized database/account/signing/mail settings to the candidate. Do not send secret values in chat. The original TEST deployment has been preserved.
3. With that configuration, complete real hosted two-account isolation, TEST payment and endpoint-specific signed acknowledgement, exact owned downloads, actual receipt/recovery inbox arrival, expiry/single-use/replay and refund/access-removal checks.
4. Complete representative physical-device checks and 6–8 unfamiliar target-user sessions. No device, customer-study or paid-pilot results have been fabricated.

Ordinary manual editing, local saving, backup and frozen local package downloads are available now. Purchase fixtures, ready deployments and source tests do not establish real fulfillment or provider acceptance.
