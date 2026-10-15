# Unified Playground acceptance — 2026-10-14

Status: candidate in progress. This record separates source fixtures, local browser evidence, hosted runtime evidence, provider usage and paid fulfillment. No production activation or LIVE charge has occurred.

Continuation audit: the initial candidate below did not yet expose selected-element motion or measured layout guides, and its recovery/accounting acceptance missed concrete edge cases. These are being repaired and independently verified in [the continuation record](unified-continuation-2026-10-14.md). Counts and source identities below remain historical until that record names the replacement candidate. An evidence-only PR push can retrigger the preview workflow; it is not a guarantee that deployment was skipped.

## Editor and direct manipulation

**Local and manual hosted editor acceptance passed.** A clean browser starts with an explicit choice; it does not save a hidden default project. Switchboard, Tideglass and Matter create distinct populated pages with optional brand and images. The editor keeps Pages, Add, Layers, Assets and Project alongside one canvas and a contextual inspector. Brand, save, history, device review, Preview and Finish operate on that project. The current page model is explicitly single-page.

The browser journey creates a project, edits its headline inline, uploads an image, moves it into columns, resizes it through the inspector, updates brand, reorders sections, checks exact Undo/Redo, reloads and continues the same document, rejects malformed imports and downloads a ZIP. The extracted ZIP opens independently with the exact project and all images. All 60 checks pass across Chromium, Firefox and WebKit at 1440px and 390px; the narrow run uses reduced motion. These are emulated browser viewports, not physical-device acceptance.

Legacy schemas 1–4 still import and reopen; schema5 uses the existing renderer. Invalid imports leave current content/identity/revision unchanged. New preserves the previous project. A delayed IndexedDB reopen cannot replace newer manual edits. Existing local-only cloud409 behavior remains a required hosted preflight.

Rendered gesture tests verify actual nested and empty-container moves, destination labels, visible drag preview, crop, aspect-locked resize, one-step Undo/Redo, keyboard alternatives, mobile inherited/overridden/reset values, Layers agreement, Escape, pointercancel and lost capture. The failing before-state for final/empty list drops and an offscreen drag preview is retained beside the passing runs. The drag preview defect was a CSS inset override; list append now differs explicitly from dropping outside.

The initial controlled local sample recorded 79 pointer samples with p95 animation-frame style update **1.5ms** and p95 frame interval **16.8ms**. The later canonical-runtime build (`gestures-final/receipt.json`) recorded 79 samples, **2.7ms** style update and **16.7ms** frame interval. Neither measurement instruments actual display presentation latency. The host ran other work concurrently; physical touch and representative devices remain untested.

Receipts:

- `artifacts/playground-unified/browser-local/receipt.json` — desktop/narrow journeys, screenshots and independently opened ZIPs.
- `artifacts/playground-unified/browser-three-engine/receipt.json` — 60 checks against the frozen Finish flow in three engines and two widths.
- `artifacts/playground-unified/frozen-review/receipt.json` — six checks including byte-identical frozen ZIPs after later draft edits and reload, image decode rejection, and no API requests.
- `artifacts/playground-unified/persistence/receipt.json` — 13 persistence/migration checks and retained harness-attempt failures.
- `artifacts/playground-unified/gestures/receipt.json` — 14 rendered manipulation checks and measured limits.
- `artifacts/playground-unified/gestures/ghost-reproduction/receipt.json` — reproduced offscreen preview failure.
- `artifacts/playground-unified/list-move/receipt.json` and `list-move-before/` — list-move regression evidence.
- `artifacts/playground-unified/browser-final/receipt.json` and `gestures-final/receipt.json` — production frontend build after the canonical runtime repair: twenty desktop/narrow journey checks and fourteen actual gesture checks passed.

Browser receipts made before the source commit name the integration base SHA. They describe a working tree, not that unmodified commit. The source inventory records tested working-file hashes; committed hosted CI will record its exact checkout SHA separately.

The first [isolated manual preview](https://eidosworks-playground-20261014.pages.dev/playground/) passed [CI run 38616145773](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38616145773) at frontend `d1c7c1b4790e2519b395fa30367f1832b830dcac`, paired to protected backend source `0e0aabc48f0ca7894b917495b661ef44cd337dce` and deployment `dpl_GKzpxmZ16TXCry6Pwr6jX5LgB48w`. The runtime SHA/full bundle hash, all disabled feature flags, wrong-relay/origin rejection and schema-5/contaminated-schema-1/future-schema cloud409 responses were verified before upload. Published JS/CSS hashes match that CI build. Database is `none`. Accounts, provider calls, payment and mail remain disabled.

The first hosted CI attempt retained Cloudflare 522 failures while loading desktop assets; its mobile journey passed. A fresh hosted desktop/narrow run passed all 20 checks and the subsequent CI passed after adding bounded published-asset readiness verification. Failures remain in `ci-first-preview/`; successful deployment and hosted receipts are in `ci-preview-passed/` and `browser-hosted-local/`. The broader three-engine editor/site workflow passed for both initial source and the readiness follow-up. Canonical production Pages deployment `5926dfb4-1df2-4dbf-8864-1f3f38e034f1` was unchanged before and after isolated uploads.

## Initial candidate and hosted pair (historical)

[Final isolated-preview CI 38623788219](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38623788219) passed on frontend `a669fddccc6f6be77f6e24e36ccd3f103c518fc0`. It builds a clean checkout, runs the source and browser gates, uploads only the isolated project, and completes the actual hosted desktop/narrow journey. The paired backend is `bd3c6ab2a636a5a1783babd304f2ac4c75f7a1b6`, deployment `dpl_3ybMcNrPqdT9dMWpbVvxDANqSaZr`, full bundle `1e471a710c1d4d1343f0ac50d294f5efcf9c4ef8f2c56a49223f65bb69bda27c`. The direct authenticated preflight and public Pages relay both verify that identity. Database remains `none`; accounts, customer AI, commerce and mail remain disabled. Receipts are in `artifacts/playground-unified/ci-final-preview/`.

The preceding `b2a53914` run passed its build and all local browser fixtures but failed the immediate public-relay source read after upload. A later read returned the exact intended pair. Relay readiness now permits a bounded wait for a disabled previous source or transient transport failure; missing/enabled safety flags fail immediately, and both exact hashes remain mandatory. Failed logs and post-propagation readback are retained in `ci-final-first-attempt/`.

The concurrent broader release run passed all 60 three-engine editor checks and 13 persistence checks, then failed after reading the previous Layers selection. The harness did not wait for React to acknowledge the iframe selection message. The corrected harness waits for the exact photo toolbar and selected Layers ID before retaining the original assertions. Its local baseline and two repaired runs passed 14/14; the exact failed CI interleaving was not reproduced locally. The failed log is retained in `ci-final-release-first-attempt/`, and `gesture-ci-race/` explains the evidence and limit. CI now retains persistence and gesture receipts even on failure. No application behavior changed in this follow-up.

[Final broader release CI 38623788224](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38623788224) passed, including all three-engine editor journeys, persistence, corrected gesture checks and the full configured site gates. It used review merge `a2b16caa5716574131e13deaae6840d46872284a`; `release-merge-identity.json` verifies its entire tree equals final candidate `a669fdd`. The other four configured workflows also passed; `final-source-ci-runs.json` records all six outcomes. Final CI retains eight purchase scenarios / 29 checks, 20 hosted journey checks, 13 persistence checks and 14 gesture checks. Production deployment `5926dfb4-1df2-4dbf-8864-1f3f38e034f1` remained unchanged before/after the final isolated upload. No production step ran on this draft PR.

## Initial-candidate validation commands (historical)

Run from the frontend repository root:

| Command | Current result |
| --- | --- |
| `npm run test:playground` | 73 passed, including start, workspace, frozen packages, purchase/recovery, storage/orders and four-compiler package parity |
| `npm run test:showcase` | 37 passed, including local studio/schema/export contracts |
| `npm run test:platform` | 36 passed, including relay isolation and synthetic signed-event/refund contracts |
| `npm run test:templates` | Package/build/manifest and six catalog-guide checks passed; see full log for individual groups |
| `node --test scripts/test-playground-preview-pin.mjs scripts/test-playground-preview-assets.mjs` | 8 passed; exact runtime/feature boundaries, bounded alias propagation, unsafe-state rejection and published asset identity |
| `npm run lint` | Passed; one existing Wellway Fast Refresh warning |
| `npm run typecheck` | Passed after purchase/recovery and canonical runtime integration |
| `npm run build` | Clean-checkout build passed for `b2a53914` and `a669fdd`, including final challenge/CSS repairs, SSR/prerender and canonical runtime |
| `npm run build:functions` | Worker compiled successfully |
| Legacy composition/media/structure/editor-release/editor-review source tests | 28 passed |
| `node scripts/verify-playground-unified-browser.mjs` | Desktop + narrow passed; requires `PLAYWRIGHT_MODULE` when Playwright is external |
| `node --import tsx scripts/verify-playground-persistence.mjs` | 13 passed |
| `node --import tsx scripts/verify-playground-unified-gestures.mjs` | 14 passed |
| `node scripts/verify-playground-list-move.mjs` | 10 passed |

## AI and caps

**Accounting fixture evidence exists; public generation remains disabled.** Backend work adds integer-microdollar accounting, customer monthly commitments, separate lifetime provider commitments, atomic reservation, one dispatch claim, bounded deadlines, technical waivers and signed-order grant hooks. Independent review found and verified repairs for TEST merchant identity and budget reduction before dispatch. The backend's 15 focused accounting tests and final 100 full-suite tests pass; one Windows symlink-privilege test is explicitly skipped. Controlled tests do not establish actual provider billing or hosted maintenance cadence. Sixteen mirrored contract files and the final seventeen-file delivery renderer graph passed parity. Its narrow security dependency patch also passes build/typecheck and reports zero npm audit vulnerabilities. Exact deployed source and bundle are recorded in `config/playground-preview.json` and hosted receipts, rather than inferred from the evidence-only branch head.

At this initial historical freeze the dedicated key and budget had not been approved. That dependency is now resolved: Brent approved $5 aggregate testing and saved the dedicated Vercel Preview Secret. Scoped provider/UI implementation and additional accounting tests are recorded in the continuation. No provider request has been made; exact-count billing, authenticated TEST setup, actual usage and model-quality acceptance remain pending.

## Purchase and delivery

**Paid fulfillment not accepted.** Finish now freezes a local Project revision and builds an exact standalone page, editable source and SHA256 inventory. Later edits/reload retain identical ZIP bytes until explicit re-preparation; old local frozen records remain. Existing paid template originals and historical archives remain separate and immutable. Selecting a parent edition reference establishes no purchase/license and does not add that paid archive.

The separate disabled TEST storage endpoint validates schema5 and generates the ZIP server-side. Eight source tests cover two owners, forged fields, malformed assets, bounded source/archive sizes, idempotency conflicts, atomic per-owner count/byte quotas, chunk rollback and corruption rejection. This does not change the legacy cloud409 boundary. Raster checks bound container structure and dimensions; actual image decode is separately tested by browser Finish.

Seven additional order tests verify attachment in the existing order transaction before checkout dispatch, the exact original parent archive, owner isolation, conflicting concurrent attempts, signed merchant/snapshot/payment matching, unchanged original downloads, recovery, replay and refund blocking. Already-paid approved archives remain readable from their original chunks even when current sale eligibility or current catalog archives change. All provider/mail responses are controlled fixtures. These source checks do not establish real signed-event delivery, actual inbox arrival or hosted ownership.

The built purchase/recovery UI passed 21 scenarios and 78 checks across Chromium, Firefox and WebKit: fresh-browser recovery, exact stored ZIPs, separate editable identities, preservation of existing drafts, cancelled return without a receipt fragment, delayed checkout/recovery responses, and account/revocation changes. `purchase-browser/receipt.json` and its served-build manifest identify the tested build. That matrix preceded the final consumed-challenge reset and two-declaration mobile number-width fix. Separate targeted receipts cover those changes; the clean `b2a53914` CI build passed eight Chromium purchase scenarios with 29 checks, including a consumed-token retry with the same purchase attempt and a fresh verification token. Expected denial responses remain visible in raw evidence; no real authentication, payment, or mail occurred.

The rendered checkout test found a real cross-build defect: `pageRuntime.toString()` emitted different script bytes under Vite and the production Next renderer, so the client correctly rejected the server's package despite identical project input. A plain-Node check of the actual compiled Next module confirmed the mismatch independently of the test loader. The fix compiles the unchanged page/composition/authoring runtime functions into checked-in deterministic string literals. Four compiler configurations now produce identical package and editor-bridge bytes; the actual compiled Next route also matches the canonical fixture ZIP exactly. Existing paid archives and historical recovery keep their stored bytes. A pre-fix 77,693-byte local ZIP still passes exact-byte recovery; new checkout after a compiler upgrade remains subject to matching current package bytes and may require a new draft revision/review. No hash or ownership check was weakened.

Genuine TEST payment, endpoint-specific signed acknowledgement, exact owned download, receipt/recovery inbox arrival, expiry/single-use/replay, refund access removal and two-account acceptance remain unverified. The manual preview will keep accounts, AI, commerce and mail disabled and have no database. This is deliberate preview scope, not acceptance of TEST database persistence or fulfillment.

## Remaining handoffs and limits

- Resolved in continuation: dedicated key selected, $5 aggregate budget approved, correct Vercel Preview Secret metadata verified. No additional key-creation step is needed.
- The existing sensitive TEST database/relay credentials cannot be read through the current provider API. Preserve the original candidate. A manual-only preview uses a new branch-scoped relay and no database; authenticated two-account acceptance needs the configured TEST environment.
- Server snapshot/order packaging and fixture ownership tests are implemented. Complete their real hosted two-account acceptance before enabling purchase for the unified project.
- Actual TEST payment/refund and inbox evidence must be retained independently. No prepared transaction or redirect counts as fulfillment.
- Physical-device checks and 6–8 unfamiliar target-user sessions are pending; no customer validation has been fabricated.

Local evidence is under `artifacts/playground-unified/`. The artifact/Drive manifests record checksum inventory and mirror outcome. A successful mounted-folder copy does not prove remote cloud synchronization.
