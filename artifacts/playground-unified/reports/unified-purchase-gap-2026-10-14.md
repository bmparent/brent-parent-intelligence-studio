# Unified Playground purchase and delivery gap map — October 14, 2026

Historical pre-implementation audit. The source gaps below describe the inspected SHAs, not the final candidate. Implemented snapshot, order, checkout and recovery contracts and their remaining hosted gates are recorded in [the final acceptance ledger](unified-acceptance-2026-10-14.md).

This is a read-only source audit and implementation proposal for handoff milestone 5. No checkout, mail, provider request, credential change, schema deployment, or code activation was performed. The manual preview must continue with accounts, payments, mail, and AI disabled.

## Scope and inspected state

- Frontend: `C:\Users\bmpar\codex-worktrees\playground-unified-site-20261014`, branch `codex/playground-unified-20261014`, HEAD `3772075bb757bb372193cb5240e0ffa1820e00fb`, with concurrent uncommitted editor changes.
- Backend: `C:\Users\bmpar\codex-worktrees\playground-unified-backend-20261014`, same branch name, HEAD `01e82ac73a1bcb6a3159e93dccf96172fded4964`, with concurrent uncommitted accounting/preview changes.
- Backend path shorthand below: `B = apps/sentinel-lab/lib/works/vendor/functions`.
- The October 14 handoff requires one supported developer/static edition, exact approved snapshot delivery, existing order/recovery reuse, immutable original archives, two-account acceptance for new stored behavior, and actual TEST payment/mail/refund evidence. It authorizes no LIVE transaction or production sales activation.
- The later 16:02 UTC entry in `docs/paid-templates/STRIPE_COMPLETION_2026-10-14.md` supersedes its earlier missing-mail-key entry. It records a branch Preview `RESEND_API_KEY` binding, not inbox arrival. This audit did not reverify external provider configuration.

## Current boundaries

| Area | Current authoritative source behavior | Remaining gap |
| --- | --- | --- |
| Finish | `src/playground/Playground.tsx` opens a review dialog and downloads `zipFiles(exportFiles(project))`, labeled **Free preview export**. Source JSON and assets are included. | No selected paid edition, frozen order snapshot, price/allowance disclosure, checkout, or purchased recovery association. |
| Common page export | `src/playground/export.ts` validates the actual Project and emits the renderer output, embedded source, asset files, README, and handoff. | No deliverable identity, full inventory/hashes, order association, parent paid-license provenance, or server acceptance. Good foundation for exact page output. |
| Local identity | `useProject.ts` / `storage.ts` now persist document ID, revision, selected page/section/node, assets and prior projects. | No immutable pending purchase snapshot or persistent checkout attempt keyed to that snapshot. Ordinary later edits must not change a pending delivery. |
| Legacy account purchase | `src/playground/Purchases.tsx` calls `/api/playground/checkout` with saved cloud `projectId`, `revisionId`, and request ID. `B/_shared/platform/playgroundOrders.ts` freezes a ZIP into `eidos_pg_orders.archive` before its TEST session. | This is a separate legacy export order, not the paid template package flow. It has no template edition/license association, template receipt mail or template recovery. Do not wire the new Finish directly to it. |
| Legacy cloud | Frontend `releaseBoundary.ts` permits only the restricted schema-1 shape. Backend vendored `src/playground/model.ts` has `VERSION = 1`. `studioBoundary.ts` rejects schema >=5 or own `studios` fields before persistence. | Unified projects are schema 5. Removing the 409 guard would not make them safe or supported. Full paired validation, assets, ownership, conflict and reopen evidence is missing. |
| Asset persistence | `B/_shared/platform/playground.ts` stores/retrieves only top-level `section.image` via owner-scoped asset rows. | It does not traverse card images, authoring nodes, artwork or motion objects. General schema-5 cloud activation would lose or bypass parts of the asset contract unless this is deliberately completed. |
| Paid template checkout | `B/_shared/platform/templateShop.ts` derives edition/version/price/archive from the server catalog; writes `eidos_orders` + `eidos_template_orders`; rejects browser prices; uses Stripe idempotency; preserves frozen original archive hash. | Checkout input and order tables have no unified project document, revision, snapshot hash, rendered deliverable or parent/child relationship. |
| Paid status/download/recovery | `/api/shop/status`, `/download`, `/recover`, `/redeem` use existing receipt authorization, paid-state checks, expiring download tokens, original archive hash verification, private responses, and single-use recovery. | Status and recovery cannot identify/reopen a customized page. Download serves only `order.archive_key`; no separately authorized custom artifact is available. |
| Signed payment/refund | Existing template webhook verifies signature, mode, session, order/edition/version, USD amount, paid state and checkout email; revocations retain the existing journal. | New custom artifacts must be covered by the same entitlement/revocation. Browser redirects and successful prepare calls remain insufficient. Real final-pair paid acknowledgement, inbox arrival and refund/replay evidence remain missing. |
| Buyer personalization | `src/templates/buyerDerivative.ts` verifies an exact original ZIP pin, transforms actual family files, preserves license/support/asset/install bytes, and creates a new manifest and archive hash. It explicitly sets `commercialEntitlement:false` and `entitlementVerification:'not_performed'`. | It is a buyer-local tool using distinct `TemplateConfiguration` schema 3. It is not a server fulfillment entitlement. No owner/order is bound. |
| Configurator | `TemplateConfigurator.tsx` has a separate localStorage configuration and its own sample renderer; it asks users to export/re-upload Artwork PNG. | Sending a unified Project there would introduce a disconnected document. Mapping arbitrary authoring trees into its headline/palette/page options would silently lose the approved design. Its free sample must never substitute for paid family output. |
| Package choice | Existing catalog/pins identify developer and WordPress original archives. Switchboard developer is `switchboard-developer-v1`, version `1.0.3`, SHA-256 `e956fc2aad4f76ed0ff2c9aff71cdd6cfc202b0701da71c9bf9604e5264b00d5`, 28,560 bytes. | Start-screen names are not purchase metadata. A name/illustration must not silently select an edition or claim its full multipage/module behavior. Choose the actual package explicitly at Finish. |
| AI allowance | Concurrent backend work extends the existing order journal with controlled TEST grant/revocation accounting. | No LIVE included amount, retail price or default cap is approved. Finish must show the actual server-owned allowance or “not configured,” never infer the handoff's illustrative $5. |
| Paid deployment | `check-template-archives.mjs` verifies immutable inventory only when commerce is active; the exact source/mode/version/price pin exists in `scripts/template-preview-pin.mjs`. | `apps/sentinel-lab/private/templates` was absent in this new worktree when inspected. A manual-only preview may omit archives; a purchase candidate must restore and verify all current/retained originals and carry the full private bundle. |

## Smallest faithful implementation

Use the existing template order service as the payment authority. The first candidate should offer one explicitly selected developer package, retaining its original licensed archive and a **separately identified exact approved one-page output**. Disclose both deliverables: the unchanged family archive retains its own pages/modules; the customer's approved page uses the common Playground renderer and retains its editable Project. Do not imply that the one-page output has the original family's entire multipage structure, and do not label a free configurator sample as that original source.

The ordinary page output must be generated from the same validated `Project` used for review. Reuse `exportFiles` and ZIP primitives; reuse the buyer derivative machinery's pinned-parent verification, deterministic identity, manifest structure and preserved notices where suitable. Do **not** squeeze the unified Project into `TemplateConfiguration`, introduce a second editor store, or promise arbitrary family-template roundtripping without implementing it.

### 1. Freeze and review locally — safe to build now

Add a pure frontend `src/playground/purchaseSnapshot.ts` with a versioned envelope:

```text
kind / formatVersion
documentId / draftRevision / selectedPageId
rendererVersion / projectSchemaVersion
canonical validated Project
selected server catalog edition identity
projectSha256 / asset inventory (path, media type, byte count, sha256)
output inventory (path, byte count, sha256)
preparedAt / local snapshot identity
```

Capture a deep validated snapshot at the explicit Review action. A local fingerprint is a comparison aid, not payment or ownership proof. Use canonical serialization and deterministic packaging so same input yields the same output identity. The server must recompute every trusted digest and metadata field. Keep a separate metadata receipt for the complete ZIP so no self-referential manifest hash is implied.

Create `src/playground/FinishReview.tsx` around that snapshot. Review the actual frozen desktop/mobile page, one-page scope, artwork and supported modules, contact mechanism, exact edition/license/install/support details, price mode, one-time versus recurring cost, and the actual allowance state. A later edit marks the draft newer; it never mutates the frozen review. Show a clear action to prepare a new snapshot.

Persist the local pending snapshot and attempt identity by document/snapshot ID in the existing IndexedDB workspace storage. Cancel, back, reload, and retry restore the current draft and the original pending review. Failed/unavailable checkout leaves editing, JSON backup and free export usable. Payment controls remain disabled until the server advertises the complete supported contract.

This slice is independently useful and testable without a provider or account. It is not milestone-5 completion.

### 2. Paired schema-5 purchase snapshot contract — safe to implement behind gates

Add an explicitly versioned purchase-snapshot validator/renderer bundle shared with the frontend, with a full transitive dependency allowlist and hashes. The existing `scripts/export-sentinel-platform.mjs` is unsafe to run wholesale here: it recursively overwrites shared platform/API directories and copies the new model without its complete authoring/studio dependency graph. That would clobber concurrent accounting changes and break the old accepted cloud runtime.

Keep the general `/api/playground/projects` schema-1 contract and 409 guard until its separate acceptance is complete. A purchase snapshot endpoint can be narrower than a general cloud editor, but storing a schema-5 snapshot still requires its own paired validation, owner/capability access, complete asset handling, byte limits, conflict/idempotency and reopen tests before activation. It cannot bypass the boundary by renaming the stored document.

For the first bounded implementation, derive authenticated owner identity on the server and reject browser owner IDs. Bind all asset reads to that owner; embedded uploads must pass full type/signature/size/dimension limits, and external references must not allow arbitrary server fetches. Validate all project IDs, supported nodes, safe URLs and paths before packaging. Treat the browser's rendered HTML, ZIP bytes and digest as untrusted; generate the deliverable server-side from the accepted document.

The existing guest/developer purchase remains unchanged. New member-associated snapshot checkout remains disabled until the required two-account hosted acceptance passes. A later guest snapshot capability must be separately designed and tested; possession of a document ID or original ZIP hash must not become ownership.

### 3. Additive delivery attachment to the existing order

Use an additive table such as `eidos_template_project_deliveries`, keyed by existing `order_id`, storing owner, accepted snapshot format/document ID/revision, frozen canonical source, parent edition/version/hash, renderer/build identity, deliverable inventory/hash, private artifact key or bounded bytes, and state. Do not change the meaning of existing `eidos_template_orders.archive_key` / `archive_sha256` or rewrite any old order. Do not open a new competing checkout ledger.

During preparation, recompute the snapshot/output identity and freeze it atomically with the order attachment before Stripe submission. Bind the checkout attempt to that exact snapshot and edition. Replay of the same attempt returns its existing result; the same attempt with a different snapshot/owner/edition fails. New draft edits require a fresh explicit review/attempt, not a rewritten pending artifact.

Extend `/api/shop/status` to report the custom artifact identity and reopen information only for authorized purchases. Extend `/api/shop/download` with a server-owned artifact selector for the original archive versus the approved-page package; default old requests to the existing original behavior. Both downloads must require the same paid entitlement, mode, receipt/session authorization, expiry, and revocation checks. Recovery rotates access through the existing single-use flow and restores access to the same frozen artifacts, never regenerating them from a later draft or latest template version.

Bundle the approved-page package with `project.json`, manifest, parent-license/provenance notices, setup/reopen instructions and exact assets. Preserve the original archive and notices byte-for-byte. If packaging uses any licensed family bytes, preserve their applicable notices; do not attach the free configurator's MIT grant to paid source. A newer renderer must not silently rebuild an already purchased artifact.

### 4. Hosted verification after local gates

Restore all 8 current and 24 retained originals from the frozen inventory into the private backend bundle without overwriting mismatching bytes. Verify the Next output trace includes them. Deploy a separate TEST-enabled candidate with the exact final backend source/bundle, isolation/database identity and frontend relay pin. Do not repoint the manual-only preview to an unrelated commerce deployment or copy production secrets.

Before using a real TEST checkout, verify intended merchant, TEST key/session mode, expected server amount and exact endpoint. Then obtain the genuine signed paid-event endpoint acknowledgement, exact original/custom ZIP hashes and editable reopen, actual receipt/recovery inbox arrival, recovery expiry/single-use, replay idempotency and TEST refund/access removal. Keep those receipts separate from fixtures and deployment readiness.

## File ownership / collision plan

| Owner / slice | Proposed files | Coordination required |
| --- | --- | --- |
| Frontend purchase work | New `src/playground/purchaseSnapshot.ts`, `FinishReview.tsx`, focused tests and browser verifier. Extend `storage.ts` for frozen attempts. | `Playground.tsx` integration is owned by the unified-editor agent/root; do not overwrite its Finish or gesture work. Existing start/persistence contract must stay stable. |
| Shared contract integration | New explicit snapshot schema/renderer export manifest and parity test; bounded improvement to `scripts/export-sentinel-platform.mjs` or a dedicated allowlisted script. | Root owns frontend/backend reconciliation. Full recursive export is not acceptable with active backend accounting changes. |
| Backend purchase work | New `B/_shared/platform/projectDelivery.ts`, additive migration/schema, focused delivery tests; narrow shop checkout/status/download hooks. | Backend agent currently owns `core.ts`, `templateShop.ts`, shop webhook, AI schemas and grants. Coordinate exact hooks; do not independently edit these shared files. |
| Existing delivery UI | `src/components/TemplateShop.tsx` purchase start view gains authorized original/custom artifact labels and source reopen. | Preserve guest recovery and old download defaults; no new standalone payment flow. |
| Release integration | Existing archive restore/import/check/bundle tools, source pin, paired acceptance ledger. | Root owns deployment; manual preview settings remain off. Original/retained archives and signing keys are protected. |

## Tests needed before enabling the new path

1. Pure snapshot tests: canonical identity, identical export bytes, parent hash, asset inventory, no input mutation, extra-field rejection, oversized/malformed image rejection, traversal/duplicate paths, unsupported schema/studio state, and proper source reopen.
2. Lifecycle tests: freeze A → edit draft B → checkout/retry/cancel/reload → delivery remains A; changed payload on same attempt is rejected; selected page, document ID, revision and assets persist.
3. Browser tests: actual desktop/mobile frozen review equals independently opened exported HTML; canceled/retried checkout preserves draft; returned status is pending until server paid evidence; original and custom downloads are clearly distinguished; no provider calls when unavailable.
4. Server tests: two owners cannot read, prepare against, change, download or reopen each other's snapshot/assets; forged owner/edition/version/price/hash cannot pass; write/read/packaging limits enforced; snapshot preparation and duplicate submits are race-safe.
5. Payment fixtures: wrong merchant/source/mode/amount/session/edition rejected, unpaid and out-of-order events cannot unlock content; repeated paid event cannot duplicate attachment/allowance; refunds/disputes revoke both artifacts; old guest orders/recovery still work after new sales close.
6. Archive tests: all original hashes/bytes remain unchanged; derivative writes use separate namespace and identity; no private ZIP/project source under frontend `public/` or unauthenticated responses; server and browser manifests/export outputs agree.
7. Hosted evidence: two distinct authenticated accounts for the new stored contract; genuine TEST payment and endpoint acknowledgement; actual inbox/header evidence; original/custom hashes; recovery/replay/refund. Physical-device evidence is separate from viewport emulation.

Relevant existing repo-root commands (not run by this read-only audit):

```powershell
# Frontend
node --import tsx --test scripts/test-playground.ts scripts/test-playground-cloud.ts scripts/test-playground-workspace.ts scripts/test-playground-start.ts scripts/test-buyer-derivative.ts scripts/test-template-configurator.ts scripts/test-template-preview-pin.mjs
npm run test:templates
npm run test:showcase
npm run typecheck
npm run lint
npm run build
npm run verify:templates
npm run build:functions

# Backend, from its repository root
npm --prefix apps/sentinel-lab test
npm --prefix apps/sentinel-lab run lint
npm --prefix apps/sentinel-lab run build
```

The proposed new focused snapshot/delivery tests and paired-contract parity command must be added to those gates. Existing test names alone do not prove the missing snapshot behavior.

## Protected originals and precise remaining dependencies

- Preserve `products/templates/**`, all current/historical archive versions, frozen pins/inventories, old order rows, old recovery/download semantics and signing keys. New output gets a separate manifest/hash/key; never reuse an original `templates/<family>/<version>/<edition>.zip` path for it.
- Existing test/dev source can be built now with fixtures and disabled routes. No credentials are necessary for local freeze, manifests, packaging, owner-isolation fixtures or the review UI.
- Hosted storage acceptance needs a deliberately paired TEST database/configuration and two distinct controlled accounts. A schema-1 account receipt is insufficient for schema-5 storage.
- Real commerce acceptance needs final-source TEST merchant/session access and the existing isolated mail configuration to be verified at runtime, then actual inbox arrival. Earlier “key missing” notes are superseded; key presence is still not delivery proof.
- Included allowance/cap settings and any future LIVE pricing remain unapproved. Do not silently apply pilot figures or enable public grants. Coordinate with the existing accounting implementation.
- Human/device acceptance and unfamiliar-user friction studies remain separate evidence. No invented customer findings or provider receipts.

Milestone 5 status from inspected current source: **incomplete**. The largest missing piece is an entitlement-bound immutable schema-5 project delivery attached to the existing template order, not a checkout button.
