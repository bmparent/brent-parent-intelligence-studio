# Snapshot durable delivery — release remains gated

Pages and the scheduled worker must bind the same SNAPSHOT_DB and private SNAPSHOT_OBJECTS bucket. The checked-in Worker configuration uses local placeholder database identity and zero allowance. It is not a deployable production approval.

Apply snapshot-migrations/0001_durable_jobs.sql to a new isolated database first. Payment and queued job persist in one SQL transaction. The scheduled worker scans two jobs per run; no status GET performs generation. Duplicate payment delivery cannot create a second job. A single conditional SQL UPDATE claims a job. Report and image stage attempts are unique. A crash or timeout after a provider request moves to manual review after fifteen minutes; it never automatically retries an ambiguous paid request. This deliberately does not claim exactly-once execution by a third-party provider.

An allowance reservation is charged before generation and never released automatically. Daily admission is floor(daily allowance / configured maximum cost per job). Activation requires dated model identifiers and a verified conservative maximum cost covering the bounded report input, 3,200 output tokens and one 1536x1024 medium image. The configured cost is a reservation, not measured provider billing. Pricing changes require revalidation. No allowance has been approved in this implementation.

Written output survives image failure as partial delivery. The private R2 image is SHA-256 checked on write and download. An unavailable image is never represented as complete. Customers see a delivery-review/refund contact. Review does not automatically issue refunds. Refund/dispute events revoke future access and queued work. A provider request already in flight cannot be recalled. Dispute reversal requires manual reconciliation; do not automatically grant access on an unrelated event. Only card Checkout is enabled; asynchronous payment methods remain disabled.

Record access expires after 30 days for paid records (two days unpaid). Configure a 30-day R2 lifecycle and scheduled database cleanup only after retention/support policy approval. Object expiration alone does not delete database records. Existing KV orders need a separately verified migration before binding SQL in production; no historical records are silently copied or discarded.

Capture currently checks public hostnames, DNS answers and redirects, but DNS validation and fetch are separate operations. DNS rebinding is therefore an unresolved egress boundary; SNAPSHOT_CAPTURE_APPROVED must remain false until a pinned-address fetch proxy or equivalent network control is verified. This is an explicit launch blocker, not a claim that URL string validation solves SSRF.

Before activation: verify bindings, migration, cron invocation, signed Stripe TEST delivery, webhook endpoint version/mode, object lifecycle, inbox recovery, per-visitor intake controls, provider budget ceiling and egress boundary. Keep public orders off until all acceptance receipts exist.

References: [D1 transactions](https://developers.cloudflare.com/d1/worker-api/d1-database/), [R2 bindings](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/), [Worker practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/).
