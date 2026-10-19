# Frozen project delivery storage

This additive TEST-only layer freezes a schema-5 single-page project and the exact package bytes generated from it. A separately gated attachment can bind that stored package to the existing template TEST order before checkout. Neither storing a page nor selecting a parent grants a license or records payment. The legacy cloud endpoint still rejects newer formats with HTTP 409.

The public POST `/api/playground/delivery` accepts only `{requestId, snapshot}` from an authenticated email account. The snapshot follows `src/playground/purchaseSnapshot.ts`. The server validates the project and identity, recomputes its hashes and package using the accepted renderer, and stores immutable source, manifest, ZIP hash, and ZIP chunks. Browser-supplied HTML, ZIP bytes, manifests, owner IDs, and archive hashes are rejected. Embedded raster assets are validated through the shared contract; no remote asset is fetched. A retained parent edition reference does not assert ownership.

GET `/api/playground/delivery?id=<id>` returns the authenticated owner's source, manifest, and storage receipt. Another account receives 404. The route has no archive-download operation. `readProjectDeliveryArchive` is an internal integration seam that returns the originally frozen chunks after checking their exact length and SHA-256; it never rerenders against a later renderer.

## Configuration and limits

The environment flag `EIDOS_PLAYGROUND_DELIVERY_MODE` must equal `test`; omitted, disabled, and LIVE values fail closed. The configured canonical production domain and its subdomains, plus the canonical `eidosworks.pages.dev` production alias, are rejected. Local tests additionally use the existing `EIDOS_LOCAL_TEST=true` mode. No hosted flag was enabled for this slice.

- Request: 1,520,000 bytes, enforced by both the Pages relay and API reader.
- Snapshot source: 1,500,000 bytes.
- Generated archive: 6,000,000 bytes.
- Per owner: 20 frozen snapshots and 30,000,000 archive bytes. Source is additionally bounded by the count and per-snapshot source limit.
- Archive chunks: 65,536 decoded bytes, at most 92 chunks.

Count and byte quotas are predicates on the same SQLite insert that claims `(owner_id, request_id)`. Snapshot metadata and all chunks commit in one transaction. Concurrent identical requests return one record, a different valid payload under the same request ID returns 409, and a failed chunk write rolls back the entire attempt. The new migration and tables do not modify legacy project/order tables.

## Validation

From the frontend repository root:

```text
node --import tsx --test scripts/test-project-delivery.ts
node --import tsx --test scripts/test-project-delivery-orders.ts scripts/test-project-delivery.ts scripts/test-platform.ts scripts/test-relay.ts
npx eslint functions/_shared/platform/projectDelivery.ts functions/_shared/platform/projectDeliveryRenderer.ts functions/_shared/platform/projectDeliverySchema.ts functions/api/playground/delivery.ts scripts/test-project-delivery.ts
npm run typecheck
```

The focused storage suite covers exact frozen bytes, two-owner isolation, opt-in and production gates, schema rejection, unchanged legacy 409, forged fields, remote/malformed images, source limits, idempotent races, count/byte quotas, transactional rollback, archive tampering, migration parity, and relay request bounds. The attachment suite additionally checks signed payment evidence, matching merchant/snapshot, owner authentication, original bytes, competing checkout requests, failure/retry, recovery, refunds, and historical guest orders. All network responses are intercepted controlled fixtures; no real purchase, mail send, or hosted acceptance occurs. Attachment tests read the retained Switchboard ZIP built by `npm run templates:build`; its real bytes must match the pinned parent hash.

## Order attachment API

`GET /api/playground/delivery?capabilities=1` requires the signed-in email owner and the TEST gate. It returns `{capabilities:{mode,ownerId,available,reason,limits,turnstileSiteKey,localTest,products}}`. Products contain server-owned `productId`, `editionId`, `version`, `priceCents`, USD currency, and exact `parentArchiveSha256`/`parentArchiveBytes`. Availability checks configured TEST commerce and challenge readiness, verifies the configured Stripe account, and verifies the retained private archive bytes against the parent registry. This read is an explicit purchase preparation action, not part of manual editing.

`POST /api/shop/checkout` retains its existing fields and accepts an optional `deliveryId`. For an attachment, the server requires the signed-in snapshot owner, current TEST flags, a developer product, the matching selected parent, and the exact private parent archive hash/length. It writes the order and immutable attachment in one transaction before requesting an external session. The attachment captures owner, delivery ID, document/revision, source and snapshot hashes, ZIP hash/length/output, parent product/version/hash/length/license reference, and verified merchant. Reusing the attempt with a changed or omitted delivery conflicts with HTTP 409. A historical unbound order cannot acquire an attachment later. Competing requests cannot replace the winning attachment.

Attached checkout returns to `/playground/?checkout=returned#receipt=<attempt>` or cancels to `/playground/?checkout=cancelled`. Original checkout return paths are unchanged. The signed paid event must match the attachment metadata and the same verified direct merchant before fulfillment becomes ready.

`POST /api/shop/status` keeps `{receipt}` and adds `approvedPage` only for attached orders. A signed owner receives `state` (`pending`, `ready`, or `revoked`), `deliveryId`, `ownerId`, `mode`, `documentId`, `revision`, `snapshotHash`, `projectHash`, `archiveSha256`, `archiveBytes`, `output`, `downloadName`, and `parent` (`productId`, `editionId`, `version`, `archiveSha256`, `archiveBytes`, `licenseId`). An anonymous receipt holder receives only `{state:'sign_in_required'}` for that field. Original receipt/status behavior remains available.

`POST /api/shop/download` keeps `{receipt,downloadToken}` for the original template, whose bytes and filename are unchanged. Add `artifact:'approved-page'` for the attached package. That path requires the signed owner, paid/ready TEST order, exact immutable parent/binding, valid existing download token, and no refund/revocation. It reads and hashes the originally stored chunks; it never regenerates a purchased artifact. Existing paid retrieval does not require today's sales flag, current catalog entry, parent registry lookup, or original archive provider. The explicit delivery TEST gate and payment/owner checks still apply.

Attached recovery redemption requires the signed owner and keeps the same order/binding. It returns `{receipt,continuePath,approvedPage}`, where `continuePath` is exactly `/playground/?checkout=returned#receipt=<new receipt>`. Original recovery remains `{receipt}`. Recovery tokens remain single-use, old receipts stop working, and refunds block the approved page. Independent payment revocation is checked before consuming the token, and returned metadata derives its state from the current order after receipt rotation.

Authentication failures return 401; cross-owner snapshot reads return 404; conflicting attempts/parent identity return 409; disabled or unavailable services return 503. A stored receipt includes `ownerId` so the client can reject a late response after an account switch. Client status matching is an extra check; the server always derives ownership and payment authority independently.

## Paired integration and remaining acceptance

1. The backend adapter uses a separate `lib/works/project-delivery/src` graph, preserving the legacy vendor model. `scripts/export-playground-delivery.mjs` exports and verifies its normalized source inventory. Browser/server compiled output must also match; source parity alone cannot establish byte-identical packages.
2. The backend delivery route and 1,520,000-byte request bound are registered. `EIDOS_PLAYGROUND_DELIVERY_MODE` remains off in the manual preview until an accepted TEST deployment is configured.
3. The attachment helper, migration 0007, and checkout/payment/status/download/recovery hooks are mirrored together. The original archive route and AI payment receipt hooks are preserved. `verify-playground-contract-parity.mjs <backend-app> --delivery` checks all sixteen shared files.
4. Hosted save/replay/two-owner isolation, signed payment, refund blocking, exact download hashes, and actual receipt/recovery inbox arrival still need independent acceptance. Local fixtures alone do not establish those outcomes.

Raster container checks bound embedded source; actual browser image decode is a separate local Finish check. Neither a stored snapshot nor its parent reference proves platform installation, valid commercial entitlement, or production delivery.
