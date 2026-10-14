# Frozen project delivery storage

This additive TEST-only layer freezes a schema-5 single-page project and the exact package bytes generated from it. It does not enable checkout, grant a license, record payment, or change the legacy cloud project's schema boundary. The existing cloud endpoint still rejects newer formats with HTTP 409.

The public POST `/api/playground/delivery` accepts only `{requestId, snapshot}` from an authenticated email account. The snapshot follows `src/playground/purchaseSnapshot.ts`. The server validates the project and identity, recomputes its hashes and package using the accepted renderer, and stores immutable source, manifest, ZIP hash, and ZIP chunks. Browser-supplied HTML, ZIP bytes, manifests, owner IDs, and archive hashes are rejected. Embedded raster assets are validated through the shared contract; no remote asset is fetched. A retained parent edition reference does not assert ownership.

GET `/api/playground/delivery?id=<id>` returns the authenticated owner's source, manifest, and storage receipt. Another account receives 404. The route has no archive-download operation. `readProjectDeliveryArchive` is an internal integration seam that returns the originally frozen chunks after checking their exact length and SHA-256; it never rerenders against a later renderer.

## Configuration and limits

The environment flag `EIDOS_PLAYGROUND_DELIVERY_MODE` must equal `test`; omitted, disabled, and LIVE values fail closed. The configured canonical production domain and its subdomains are rejected. Local tests additionally use the existing `EIDOS_LOCAL_TEST=true` mode. No hosted flag was enabled for this slice.

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
npx eslint functions/_shared/platform/projectDelivery.ts functions/_shared/platform/projectDeliveryRenderer.ts functions/_shared/platform/projectDeliverySchema.ts functions/api/playground/delivery.ts scripts/test-project-delivery.ts
npm run typecheck
```

The focused suite covers exact frozen bytes, two-owner isolation, opt-in and production gates, schema rejection, unchanged legacy 409, forged fields, remote/malformed images, source limits, idempotent races, count/byte quotas, transactional rollback, archive tampering, migration parity, and relay request bounds. It uses controlled local SQLite fixtures, not a real purchase or hosted acceptance.

## Remaining integration

1. Mirror the strict schema-5 renderer graph through `projectDeliveryRenderer.ts`. The backend adapter points to its separate `lib/works/project-delivery/src` tree, preserving the legacy vendor model.
2. Register the backend delivery route and the same 1,520,000-byte request bound. Keep `EIDOS_PLAYGROUND_DELIVERY_MODE` off until an explicitly accepted TEST deployment.
3. Bind a snapshot ID, snapshot hash, archive hash, archive length, output format, and any verified parent entitlement to an existing immutable template order. Derive the owner from the session and verify ownership with `readProjectDelivery`; the browser cannot assert an order owner or paid status.
4. At existing signed paid status/download boundaries, require the exact order/member/snapshot binding, successful verified TEST payment, and no refund or revocation before invoking `readProjectDeliveryArchive`. Check the returned archive identity against the order. Do not rebuild an already purchased package.
5. Independently accept hosted save/replay/two-owner isolation, signed payment, refund blocking, exact download hash, and actual receipt/recovery inbox arrival. Local fixtures alone do not establish those outcomes.

Raster container checks bound embedded source; actual browser image decode is a separate local Finish check. Neither a stored snapshot nor its parent reference proves platform installation, valid commercial entitlement, or production delivery.
