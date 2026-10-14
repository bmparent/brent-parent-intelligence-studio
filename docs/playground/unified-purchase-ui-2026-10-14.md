# Unified Playground purchase UI and owned recovery — 2026-10-14

## Implemented boundary

The Finish dialog retains the frozen local package and offers a deliberate account-availability check. It performs no availability, snapshot submission, checkout, status, recovery, or download request simply because a person opens the editor or Finish. The existing manual preview stays usable with the delivery feature disabled.

The server TEST capability supplies the signed owner, exact original edition/version/archive identity, current one-time price, challenge readiness, and source/package limits. The client displays AI allowance as unavailable. Hosting, domains, form delivery, ongoing services, and CMS installation are not included. License/support and installation links use the existing terms and edition guides.

Saving a reviewed page submits only the immutable snapshot and stable request ID. Its server receipt must match the owner, document, revision, project hash, snapshot hash, and compiled archive hash/size. Checkout sends only the accepted delivery ID, server product/edition IDs, a stable private attempt, terms acceptance, and verification challenge. The original template archive and the approved page remain separate artifacts. The client never submits a price or claims payment from a checkout redirect.

Closing Finish, changing the current draft revision, changing local approval, changing the older-revision choice, or changing terms invalidates a pending operation. A late checkout response cannot navigate. An already-dispatched attempt is kept for status checks/retry. An owner change clears the previous owner’s displayed attempt/status. Failed and expired attempts can be replaced explicitly; uncertain/cancelled attempts are reused.

The outbound private receipt is retained before dispatch, so a cancellation URL without a receipt fragment can still check the same attempt when new checkout capability is unavailable. Fresh status and download checks remove the prior paid display while access is revalidated.

Every checkout dispatch resets its consumed verification challenge in `finally`, including failures, while retaining the private attempt and late-response guard. The widget exists only while Finish is open; a failed request cannot leave a used token presented as ready for retry or refresh a hidden widget after the dialog closes.

## Paid recovery and historical compatibility

A return or validated recovery continuation can begin on a clean browser with no IndexedDB project. It displays a recovery panel before any API call. Explicit restoration checks the signed owner’s existing paid/ready receipt, downloads the approved archive, and verifies exact byte length and SHA-256. It does not request current capability, merchant readiness, price, parent registry, or a new checkout. Existing receipt checks and downloads in Finish follow the same separation.

Supported ZIPs are parsed as the deterministic ZIP STORE format and re-encoded byte-for-byte to check the entire archive, central directory, and CRC fields. The manifest, file hashes, embedded snapshot, and editable source must agree. The owned server source/manifest must match the archive. Reading historical snapshots accepts their retained parent version without replacing it with a current catalog entry; creating a new snapshot/checkout remains subject to the strict current-pin validator.

If the source is no longer supported by this editor, or its owned source cannot be verified, the exact server-receipt-verified ZIP remains downloadable and the UI states that the source cannot reopen. It never rebuilds the purchased bytes with a current renderer. The original archive remains accessible separately on the existing purchase page, using the private receipt fragment.

Opening a supported recovered source reauthorizes immediately, preserves the current draft, and creates a new local document identity. A validated review-storage alias retains the paid snapshot’s original document/revision/hash. It cannot replace the old document head. Workspace generation checks after pending saves prevent a delayed recovery/open operation from replacing work that changed in the meantime.

## Runtime byte parity repair

The rendered acceptance fixture exposed a real defect: `pageRuntime.toString()` serialized different JavaScript under Vite and server bundling. An identical snapshot produced a 25,732-byte browser script and a 26,820-byte server script, so exact archive acceptance correctly rejected it. The failure receipts are retained in `artifacts/playground-unified/purchase-browser-renderer-parity-failure/`.

`scripts/build-playground-runtime.mjs` now compiles the existing page, composition, and authoring runtimes once into the checked-in `src/playground/runtimeBundle.ts`. The renderer consumes those complete, self-contained source literals. Application bundlers can no longer rename or reformat the embedded functions. All three original runtime source files are unchanged. The generator emits deterministic LF bytes, with no timestamps, source maps, or machine paths. `playground:glass` invokes it, and the parity regression verifies freshness and identical files/manifests/ZIP/editor bridges across four browser/server build settings, including minification and keepNames differences.

Already stored packages remain byte-preserved. The pre-fix revision-A ZIP still verifies as SHA-256 `11cdc84b2ea5f7ea5d681898cecc210667069cc65b2d8fd5a79462ceec5972e5` (77,693 bytes) through the stored reader; the current compiler produces different bytes for that same snapshot. This is recorded in `purchase-client/stored-runtime-compatibility.json`. The schema and strict accepted-archive check remain unchanged. An old local review with a different compiled archive cannot establish a new checkout merely by retaining the same source hash. Keep/recover its existing purchased bytes, or change the working draft to advance its revision and prepare a new review for a new submission. The UI reports a conflict/mismatch rather than silently substituting a new archive.

## Files

- `src/playground/purchaseClient.ts`: strict capability/acceptance/status contracts, bounded verified downloads, attempt/return storage, and exact same-origin recovery continuation validation.
- `src/playground/FinishPurchase.tsx` and `finish-purchase.css`: gated purchase controls and paid status/downloads.
- `src/playground/purchaseRecoveryClient.ts` and `PurchaseRecovery.tsx`: fresh-browser paid restoration and explicit reopening. Names intentionally differ beyond casing to avoid Windows TypeScript module collisions.
- `src/playground/Playground.tsx`, `FinishReview.tsx`, `useProject.ts`, and `purchaseReviewStorage.ts`: return wiring, distinct recovered identity, historical review alias, and pending-save guard.
- `src/playground/purchaseSnapshot.ts`: historical stored-snapshot validation and byte-exact ZIP reader. The server export graph also incorporates the canonical runtime repair below.
- `src/components/TemplateShop.tsx`: only a response continuation equal to `/playground/?checkout=returned#receipt=<same validated receipt>` can redirect recovery. All other paths retain existing purchase-page behavior.
- `src/playground/renderer.ts`, `runtimeBundle.ts`, `scripts/build-playground-runtime.mjs`, and `scripts/test-playground-runtime-parity.mjs`: canonical runtime bytes and cross-build regression. `package.json` wires generation/tests, and `.gitattributes` preserves generated LF source.

## Validation and evidence

Focused command from the frontend repository root:

```powershell
npx tsx --test scripts/test-playground-purchase-client.ts scripts/test-playground-purchase-recovery.ts scripts/test-playground-purchase-snapshot.ts scripts/test-playground-runtime-parity.mjs
```

Result: **20/20 passed**. Evidence: `artifacts/playground-unified/purchase-client/focused-tests.log`.

The client tests use injected fetch fixtures only. They cover disabled gates without POSTs, owner/revision/hash mismatches, rejected assets, stable retry identifiers, safe checkout URLs, pending/revoked status, exact approved bytes, unchanged original-download selector, private attempt scope, and recovery-path restrictions. Recovery tests cover fresh-device state, historical version rejection for new checkout but successful exact paid retrieval, mismatched owned source, unsupported-source ZIP fallback, unsigned/pending/refunded access, and corrupt bytes.

Scoped ESLint and `npm run typecheck` passed across the changed UI/helpers/tests. Parent coordinates the final build/full suite and the independent fixture-browser harness `scripts/verify-playground-purchase-browser.mjs`.

The independent built-browser receipt at `artifacts/playground-unified/purchase-browser/receipt.json` records **21 passed scenarios and 78 checks** across Chromium, Firefox, and WebKit. Fresh-browser recovery ran at 1440 and 390 pixels; draft preservation, delayed recovery, reauthorization, cancellation, and deferred checkout ran at 1440 pixels. It includes exact server/browser archive acceptance, independently executing the recovered package, a new editable identity, no purchase API calls before an explicit action, cancellation without a fragment while new checkout is unavailable, and blocked reopening after owner/revocation changes. There were no page errors or unexpected network requests. Expected ownership-denial HTTP 403 console entries and browser preload/layout warnings remain in the receipts. All purchase APIs and the checkout destination were fixtures, with outside network blocked. The served build predates the consumed-challenge reset and mobile service-number CSS repair; `served-build-manifest.json` records its actual HTML/JavaScript/CSS hashes, and later workspace source hashes do not establish those repairs. Earlier failed run folders remain available for diagnosis.

The consumed-challenge fix has a separate **3/3-check Chromium pass** against current Vite source at `artifacts/playground-unified/purchase-browser-challenge-after/receipt.json`. A deliberate fixture HTTP 502 after dispatch removes/recreates the verification widget, disables retry until a fresh token arrives, and then dispatches the same immutable attempt/delivery with token 2 instead of consumed token 1. The expected 502 is retained in the console evidence. No Cloudflare or Stripe request occurred; the verification widget and checkout destination were controlled fixtures. The harness includes this eighth scenario for the final committed-source matrix.

The canonical runtime also passed a separate production-compiler check: plain Node loaded the actual optimized Next route module and used real in-memory SQLite to freeze/read the raw built Vite browser snapshot. The input and output ZIPs were both **128,347 bytes**, SHA-256 `3f1b0c20f676a51126af4faa6207a6f90c8f0dda2af5d2b09d1f18699846fe71`; fetch was forbidden. Its backend receipt is `artifacts/playground-unified-backend-20261014/delivery/compiled-browser-parity/receipt.json`. A separate 66,201-byte canonical package also matched across esbuild and optimized Next; its exact compiled ZIP was opened independently in all three browser engines at 1440 and 390 pixels, including working mobile navigation. The frontend execution receipt is `artifacts/playground-unified/compiled-server-runtime-after/receipt.json`. These receipts prove the runtime repair before the subsequent narrow mobile service-number CSS adjustment; final renderer-graph checks and the rebuilt full matrix are recorded separately by the release owner.

## Limits and protected originals

No real TEST or LIVE checkout, payment, email, authentication-provider flow, or merchant operation was performed for these UI tests. Fixture payment/status messages are not commerce evidence. Hosted manual preview keeps delivery and sales gates off. Real authorized account/Stripe TEST/mail acceptance remains a separate release gate.

Paid approved-page reads still require the backend's explicit TEST delivery mode. Independence from current new-checkout availability does not bypass that deployment gate; the disabled hosted manual preview makes no approved-page delivery claim.

Existing paid template source trees and immutable original archives were not modified by this client work. Existing unbound shop checkout/download behavior is retained. The original purchased ZIP is never embedded in or relabeled as the approved-page package. No provider-backed AI allowance or proposal feature was added.
