# Unified Playground acceptance — 2026-10-14

Status: candidate in progress. This record separates source fixtures, local browser evidence, hosted runtime evidence, provider usage and paid fulfillment. No production activation or LIVE charge has occurred.

## Editor and direct manipulation

**Local acceptance passed. Hosted acceptance pending.** A clean browser starts with an explicit choice; it does not save a hidden default project. Switchboard, Tideglass and Matter create distinct populated pages with optional brand and images. The editor keeps Pages, Add, Layers, Assets and Project alongside one canvas and a contextual inspector. Brand, save, history, device review, Preview and Finish operate on that project. The current page model is explicitly single-page.

The browser journey creates a project, edits its headline inline, uploads an image, moves it into columns, resizes it through the inspector, updates brand, reorders sections, checks exact Undo/Redo, reloads and continues the same document, rejects malformed imports and downloads a ZIP. The extracted ZIP opens independently with the exact project and all images. All 60 checks pass across Chromium, Firefox and WebKit at 1440px and 390px; the narrow run uses reduced motion. These are emulated browser viewports, not physical-device acceptance.

Legacy schemas 1–4 still import and reopen; schema5 uses the existing renderer. Invalid imports leave current content/identity/revision unchanged. New preserves the previous project. A delayed IndexedDB reopen cannot replace newer manual edits. Existing local-only cloud409 behavior remains a required hosted preflight.

Rendered gesture tests verify actual nested and empty-container moves, destination labels, visible drag preview, crop, aspect-locked resize, one-step Undo/Redo, keyboard alternatives, mobile inherited/overridden/reset values, Layers agreement, Escape, pointercancel and lost capture. The failing before-state for final/empty list drops and an offscreen drag preview is retained beside the passing runs. The drag preview defect was a CSS inset override; list append now differs explicitly from dropping outside.

The latest controlled local sample recorded 79 pointer samples with p95 animation-frame style update **1.5ms** and p95 frame interval **16.8ms**. The event does not instrument actual display presentation latency. The host ran other work concurrently; physical touch and representative devices remain untested.

Receipts:

- `artifacts/playground-unified/browser-local/receipt.json` — desktop/narrow journeys, screenshots and independently opened ZIPs.
- `artifacts/playground-unified/browser-three-engine/receipt.json` — 60 checks against the frozen Finish flow in three engines and two widths.
- `artifacts/playground-unified/frozen-review/receipt.json` — six checks including byte-identical frozen ZIPs after later draft edits and reload, image decode rejection, and no API requests.
- `artifacts/playground-unified/persistence/receipt.json` — 13 persistence/migration checks and retained harness-attempt failures.
- `artifacts/playground-unified/gestures/receipt.json` — 14 rendered manipulation checks and measured limits.
- `artifacts/playground-unified/gestures/ghost-reproduction/receipt.json` — reproduced offscreen preview failure.
- `artifacts/playground-unified/list-move/receipt.json` and `list-move-before/` — list-move regression evidence.

Browser receipts made before the source commit name the integration base SHA. They describe a working tree, not that unmodified commit. The source inventory records tested working-file hashes; committed hosted CI will record its exact checkout SHA separately.

## Validation commands

Run from the frontend repository root:

| Command | Current result |
| --- | --- |
| `npm run test:playground` | 53 passed, including start, workspace, image insertion, frozen packages and server snapshot storage |
| `npm run test:showcase` | 37 passed, including local studio/schema/export contracts |
| `npm run test:platform` | 35 passed, including relay isolation and synthetic signed-event/refund contracts |
| `npm run test:templates` | Package/build/manifest and six catalog-guide checks passed; see full log for individual groups |
| `node --test scripts/test-playground-preview-pin.mjs` | 2 passed; refuses production, unpinned runtime and enabled feature flags |
| `npm run lint` | Passed; one existing Wellway Fast Refresh warning |
| `npm run typecheck` | Passed during editor/gesture integration |
| `npm run build` | Final editor/snapshot source build passed, including SSR/prerender |
| `npm run build:functions` | Worker compiled successfully |
| Legacy composition/media/structure/editor-release/editor-review source tests | 28 passed |
| `node scripts/verify-playground-unified-browser.mjs` | Desktop + narrow passed; requires `PLAYWRIGHT_MODULE` when Playwright is external |
| `node --import tsx scripts/verify-playground-persistence.mjs` | 13 passed |
| `node --import tsx scripts/verify-playground-unified-gestures.mjs` | 14 passed |
| `node scripts/verify-playground-list-move.mjs` | 10 passed |

## AI and caps

**Accounting fixture evidence exists; public generation remains disabled.** Backend work adds integer-microdollar accounting, customer monthly commitments, separate lifetime provider commitments, atomic reservation, one dispatch claim, bounded deadlines, technical waivers and signed-order grant hooks. Independent review found and verified repairs for TEST merchant identity and budget reduction before dispatch. The backend's 15 focused accounting tests and 96 full-suite tests pass; one Windows symlink-privilege test is explicitly skipped. Controlled tests do not establish actual provider billing or hosted maintenance cadence. Backend source is `a6503364c4cfe36e74e41612e1efb570897bc0a6`; eight mirrored contract files passed parity. Its narrow security dependency patch also passes build/typecheck and reports zero npm audit vulnerabilities.

The existing process has an OpenAI key, but reuse/separate-project selection and a total USD provider-test budget have not been approved. No key was printed and no provider request was made. The real hosted proposal, actual usage receipts and 20–30-case Astra/Sol comparison are pending. No model-quality conclusion is inferred from fixtures.

## Purchase and delivery

**Paid fulfillment not accepted.** Finish now freezes a local Project revision and builds an exact standalone page, editable source and SHA256 inventory. Later edits/reload retain identical ZIP bytes until explicit re-preparation; old local frozen records remain. Existing paid template originals and historical archives remain separate and immutable. Selecting a parent edition reference establishes no purchase/license and does not add that paid archive.

The separate disabled TEST storage endpoint validates schema5 and generates the ZIP server-side. Eight source tests cover two owners, forged fields, malformed assets, bounded source/archive sizes, idempotency conflicts, atomic per-owner count/byte quotas, chunk rollback and corruption rejection. This does not change the legacy cloud409 boundary. It stores frozen bytes for later order integration; it has no public archive download or paid entitlement. Exact existing-order binding, signed fulfillment and hosted ownership remain pending.

Genuine TEST payment, endpoint-specific signed acknowledgement, exact owned download, receipt/recovery inbox arrival, expiry/single-use/replay, refund access removal and two-account acceptance remain unverified. The manual preview will keep accounts, AI, commerce and mail disabled and have no database. This is deliberate preview scope, not acceptance of TEST database persistence or fulfillment.

## Remaining handoffs and limits

- Select reuse or a dedicated OpenAI key and authorize a bounded total USD provider-test budget before provider-dependent implementation/testing.
- The existing sensitive TEST database/relay credentials cannot be read through the current provider API. Preserve the original candidate. A manual-only preview uses a new branch-scoped relay and no database; authenticated two-account acceptance needs the configured TEST environment.
- Complete server snapshot/order packaging and authenticated ownership tests before enabling purchase for the unified project.
- Actual TEST payment/refund and inbox evidence must be retained independently. No prepared transaction or redirect counts as fulfillment.
- Physical-device checks and 6–8 unfamiliar target-user sessions are pending; no customer validation has been fabricated.

Local evidence is under `artifacts/playground-unified/`. The artifact/Drive manifests record checksum inventory and mirror outcome. A successful mounted-folder copy does not prove remote cloud synchronization.
