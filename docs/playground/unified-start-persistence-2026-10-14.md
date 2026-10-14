# Unified Playground start and local persistence — October 14, 2026

## Implemented behavior

The first visit opens a start screen without saving an unexplained example. Returning visitors explicitly choose Continue. New project creation saves the previous document under its existing identity before opening a new identity; earlier projects are available on the start screen. If preserving the previous project fails, the switch is rejected and the previous design remains open.

The brief offers a business site, landing page, or portfolio; contact, estimate, or a reviewed HTTPS destination; and optional name, offer, logo, accent, and photo. Details can be skipped. Output is one page with section navigation. Contact starters explicitly require a destination and do not represent a connected form. A reviewed booking or purchase URL is only a link, not an integrated store.

Three editable starters reuse the common schema-5 project and existing renderer:

- Switchboard: modern typography, text/image columns, original house-and-plan illustration, service introduction.
- Tideglass: editorial typography, centered introduction and wide original coastal landscape, one focused offer.
- Matter: editorial image/text columns, original vessel study, selected work and about sections.

The illustrations are Eidos-owned assets from the existing template demos. At creation, the trusted bundled SVG is rasterized from its viewBox dimensions into embedded WebP bytes so the saved project and exported page do not depend on the starter asset URL. All approved glass settings remain intact.

Local workspace envelopes now retain document ID, revision, selected page/section/node, images, and variations. The single supported page ID is `page-main`; no artificial multipage state is introduced. Existing schema 1–4 validators remain in use. Legacy envelopes receive an identity without changing their project schema. Cloud save identity is deliberately not inferred from a local envelope.

Selection changes do not create Undo entries. Document replacement still detaches the cloud target and preserves the existing Undo/Redo behavior. A delayed saved-project read or stale IndexedDB acquisition cannot replace newer work. Selecting the already selected node does not invalidate a pending autosave.

## Validation

Source contract command:

```powershell
node --import tsx --test scripts/test-playground-start.ts scripts/test-playground-workspace.ts
```

Result: **12 passed, 0 failed**. Covers starter structures and portability, preserved glass settings, safe explicit destination links, legacy migration, identity/revision/selection persistence, history, transactional storage of prior projects, and stale writes. The IndexedDB fixture is labeled as a narrow storage fixture, not browser acceptance.

The renderer regression check verifies that two-column flex ratios target stable content IDs rather than `:last-child`. The actual editor appends resize handles as siblings; the old selector mistakenly applied the second column's flex value to the handle and collapsed the image column. Stable child selectors preserve layout while editor controls are present.

Browser command from the repository root:

```powershell
$env:PLAYWRIGHT_MODULE='C:\Users\bmpar\.codex\tmp\eidos-growth-browser\node_modules\playwright'
node --import tsx scripts/verify-playground-persistence.mjs
```

`PLAYWRIGHT_MODULE` is an optional installed tooling path; the script otherwise uses the project-resolvable `playwright` package. `PG_PERSISTENCE_URL` overrides the default local candidate at `http://127.0.0.1:5184/playground/`. `PG_PERSISTENCE_EVIDENCE` overrides its output folder. Browser plugin was not listed; this run used Playwright Chromium.

Result: **13 passed, 0 failed**, no app runtime errors or framework overlay. Real browser checks cover:

- Clean visit leaves IndexedDB without a default workspace.
- Schema 1, 2, 3, and 4 legacy saved envelopes open and retain the same document identity after reload.
- Each legacy schema imports through the actual file input and preserves Undo.
- Invalid import leaves project, identity, and revision unchanged.
- Explicit New retains the old editable document and creates a different document with embedded image bytes.
- A deliberately held IndexedDB read is released after Continue and a manual edit; the stale read does not replace that edit, including after reload.

Artifacts:

- `artifacts/playground-unified/persistence/receipt.json` — final browser receipt, timestamp 2026-10-14T17:53:51.787Z.
- `artifacts/playground-unified/persistence/continued-project.png` — rendered continued project.
- `artifacts/playground-unified/persistence/receipt-attempt1.json` and `receipt-attempt2.json` — retained earlier harness selector failures. The first selector matched both JSON and image inputs; the second expected toast text without its dismiss button. Both were corrected in the harness.

`npm run typecheck` and focused ESLint checks of the new start/persistence source passed. The parent integration run owns full repository validation, desktop/mobile editor interaction, independent export, hosted preview, deployment pairing, and release evidence.

## Limits

These results establish local browser behavior, not cloud project acceptance, two-account ownership, provider AI execution, payment fulfillment, inbox arrival, physical-device behavior, or production readiness. Local storage remains browser/device-specific; JSON backup is available for moving the project. Local project lists currently retain every explicitly saved document rather than silently pruning older work. No customer AI usage, customer spending rule, original paid archive, or production setting is enabled by this change.

No commit was made by the start/persistence subtask; changes are left for the coordinated integration branch.
