# Local frozen page package — 2026-10-14

This is a frontend/local foundation for handoff milestone 5. It does not complete purchase/delivery. The inspected commerce gaps and protected-original requirements remain in [unified-purchase-gap-2026-10-14.md](unified-purchase-gap-2026-10-14.md).

## Implemented behavior

Finish prepares a specific document/revision from the common validated Project model and common `exportFiles` renderer. It stores the exact compiled bytes in a separate local IndexedDB database, shows those bytes in a sandboxed preview, and downloads that stored archive after the person reviews it. The preview uses real 1280-pixel desktop and 390-pixel mobile viewport widths, scaled to the available panel.

Later draft edits do not change the frozen project, manifest, compiled files, preview, or ZIP. The dialog explains when the working revision differs. Only **Prepare current draft again** creates a replacement review. Older snapshot records remain in the local review database. Reload restores the existing compiled review and requires local review acknowledgement again; it never silently rebuilds that archive using the latest renderer. Importing its `project.json` creates an editable working draft through the existing project import flow.

The output is explicitly a standalone developer HTML/CSS/JavaScript page. WordPress, Squarespace, GoDaddy, hosting, domain, form delivery, and purchase entitlement are not represented by this output. Existing supported legacy projects can still export without a schema upgrade. Specialized non-page studio exports retain their existing tools.

## Identity and files

- `ProjectSnapshot` schema 1 binds `documentId`, integer `revision`, `pageId: page-main`, the validated Project, `projectHash`, explicit output `eidos-local-page-package-v1`, and an optional retained parent developer edition reference.
- `projectHash = SHA256(canonicalJson(project))`. Object keys are sorted; array order is preserved. `snapshotHash = SHA256(canonicalJson(snapshot fields except snapshotHash))`. Document/revision/parent changes therefore create a different snapshot identity even if page content is identical.
- Parent metadata is selected only from the existing frozen buyer archive pin registry. Family/product ID, developer edition, version, original archive hash/bytes, catalogue version, and existing commercial-license path/identity are retained exactly. The record says `grant: not-verified`. Choosing the reference does not add a paid archive, prove ownership, or grant a license. No parent source bytes or original archive are modified.
- The page files are the byte-exact result of `exportFiles(snapshot.project)`. Added files are `SNAPSHOT.json`, `PROVENANCE.md`, and `PACKAGE_MANIFEST.json`. The manifest hashes every other file, including editable source and provenance. The separate `local-package-receipt.json` hashes the complete ZIP, avoiding a self-referential manifest hash.
- The receipt says `purchase: not-performed`; the manifest says `entitlement: not-verified`, `checkout: disabled`. These are integrity receipts, not authentic ownership or payment evidence. Local storage is not an authorization boundary.

Local database: `eidos-playground-reviews-v1`, store `packages`. `snapshot:<snapshotHash>` retains the complete frozen object; `document:<documentId>` points to its current review. Those two writes share one transaction. Existing `eidos-playground-v1/workspace` editable records are not replaced by review writes. Failed review storage leaves a visible tab-only warning and retains downloadable bytes. Stale work for another mounted document cannot switch the new review.

## Validation and safeguards

The source is limited to 16 MB; the local package to 48 MB and 200 files. Safe relative file names, case-insensitive duplicate detection, every file hash, exact archive bytes, editable-source identity, and source snapshot identity are checked. These local limits are not an approved server-storage allowance; the server may intentionally impose narrower bounds.

Only embedded PNG/JPEG/WebP uploads are accepted. The snapshot layer checks complete container boundaries and bounded dimensions before Finish performs a real browser image decode. All page section/card/block images and retained inactive artwork/motion image objects are checked. No asset fetch is used by preparation. Core structural checks do not claim to be a full server image decoder. The browser layer supplies the actual decode evidence; future server intake must make its own bounded validation decision and recompute source/output hashes rather than trust client metadata.

Existing validators restrict link destinations, colors, sizes, fields and node identities. The existing renderer escapes text. Frozen review uses a sandboxed iframe plus a CSP that denies network, forms, and external assets; the exact packaged CSS/script/image bytes are substituted locally for preview. Exported links remain the user's declared destinations; no form or booking service is invented.

Purchase is a disabled control. This component has no API request to checkout, mail, AI, provider, or server storage. The concurrently developed server snapshot foundation is separate and is not wired or represented as an order by this local component.

## Files

- `src/playground/purchaseSnapshot.ts` — snapshot identity, validation, file manifests, deterministic package, receipt verification and frozen preview.
- `src/playground/purchaseReviewStorage.ts` — separate local frozen-record persistence.
- `src/playground/FinishReview.tsx`, `finish-review.css` — explicit preparation/review/download, draft divergence, source/provenance details, unavailable purchase.
- `src/playground/Playground.tsx` — Finish dialog integration only in this slice.
- `src/playground/StartScreen.tsx` — manual creation now bypasses missing bundled art when a user photo is available; otherwise a missing illustration leaves the existing editable placeholder.
- `scripts/test-playground-purchase-snapshot.ts` — seven focused contract tests.
- `scripts/verify-playground-frozen-review.mjs` — actual local browser lifecycle and negative-asset acceptance.

## Validation observed

From the frontend repository root:

```powershell
node --import tsx --test scripts/test-playground-purchase-snapshot.ts
# 7 passed, 0 failed, including retained inactive studio image rejection.

node --import tsx --test scripts/test-playground-purchase-snapshot.ts scripts/test-playground-start.ts scripts/test-playground-workspace.ts
# 19 passed, 0 failed before the additional inactive-studio assertion;
# the final snapshot-only 7-test run includes that assertion and passed.

npx eslint src/playground/purchaseSnapshot.ts src/playground/purchaseReviewStorage.ts src/playground/FinishReview.tsx src/playground/Playground.tsx src/playground/StartScreen.tsx scripts/test-playground-purchase-snapshot.ts scripts/verify-playground-frozen-review.mjs
# Passed. Root owns the final whole-repository gates after concurrent API files land.

$env:PLAYWRIGHT_MODULE = '<installed Playwright module path>'
node --import tsx scripts/verify-playground-frozen-review.mjs
# 6 browser checks passed; zero runtime errors and zero API requests.
```

Browser assertions cover: uploaded-photo start while all bundled starter asset requests fail; exact source and ZIP hash with retained parent edition; actual 1280/390 frozen viewport sizes and decoded images; unchanged ZIP after later draft edits and reload; explicit new review retaining the old frozen record; truncated PNG rejection without a frozen record; no API or provider call.

Artifacts: `artifacts/playground-unified/frozen-review/receipt.json`, `desktop-review.png`, `mobile-review.png`, `revision-a.zip`, `revision-a-after-edit.zip`, `revision-a-after-reload.zip`. The three archives are checked byte-for-byte equal. Screenshots were inspected; a scoped CSS specificity correction restored the Finish heading and close control sizes after inherited editor rules had reduced them.

The first local focused run reported an expected-message assertion mismatch for unsafe links (the validator rejected correctly); the assertion was corrected. The first typecheck found an output literal type inference error, which was fixed. A later typecheck ran while another agent's API schema file was still being created and reported that missing module; it is not recorded here as a passing whole-repository gate. The parent coordinates the completed source gate. Root separately reported 60 browser-journey checks across Chromium, Firefox and WebKit at 1440/390, including independently opened ZIP output; those receipts live under `artifacts/playground-unified/browser-three-engine` and remain separate from this local six-check receipt.

The parent subsequently reported `npm run test:playground` passing **53/53**, including this snapshot suite and the separate server delivery foundation suite. Final whole-repository build/type/lint and built-output browser evidence remain recorded by the parent release run. The final local six-check browser receipt is timestamped `2026-10-14T18:16:44.829Z`; its three matching ZIP downloads have SHA-256 `11cdc84b2ea5f7ea5d681898cecc210667069cc65b2d8fd5a79462ceec5972e5`.

## Remaining milestone 5 work

This slice does not prove server ownership/isolation, immutable server snapshot/order association, checkout idempotency, paid access, original plus customized archive delivery, actual receipt/recovery inbox arrival, or refund revocation. Those require the paired, explicitly gated server path and genuine TEST evidence. No LIVE action or provider call was made by this work. No original paid archive, commercial license, historical version, existing shop route, or backend record was changed by this slice.

Local proof and implementation notes are saved in the worktree. Drive copying, release gates, candidate deployment and final evidence manifest are coordinated by the parent task; this slice made no standalone Drive or deployment claim.
