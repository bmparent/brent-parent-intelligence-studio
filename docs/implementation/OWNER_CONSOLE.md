# Eidos Works owner console candidate — 2026-09-24

This is a separate Cloudflare Worker under `ops/owner-console`, paired to the **preview** Sentinel Lab Works backend and the existing validation Turso database. It is not part of the public site bundle, navigation, feed, or sitemap. Keep PR #66 and #63 draft. No production alias or customer database is a preview target.

## Exact source and security decision

Work began from site `f2d98bc1d1de8a7b01509b580558c39858949684` and backend `a50647dddb8a270563062b378033155afe935753`, both draft candidate heads checked on 2026-09-24. Main was site `c8f5d89a57f90bf817157326df5ad5f4ec403c48`, backend `a2da5fd9af21c02573e538fd30aaf7d5c690e457`. The September 23 preview receipt reflects older source and is not an acceptance receipt for this console.

Use an exact host Access application for the separate Worker. A route on the public Pages project risks leaving static HTML outside a path rule. The Worker denies every request unless its configured host matches and a Cloudflare Access JWT has a valid signature, issuer, audience, expiration, exact owner subject, and verified email. The paired backend repeats that check for every operations request. The backend also requires the existing platform relay token and an exact console origin. No mutable username or form email is an owner credential. The Worker carries no static private data and has no public analytics.

The preferred production host is `control.eidos-works.com` after production approval. The isolated Worker `workers.dev` host is the preview target. Both must have an exact Access application; a policy for the whole public site or for a path alone is insufficient. Set an owner-only Allow policy with independent MFA where supported. The application audience belongs only to that Access app. Do not set the owner subject based on an unverified email input.

### Controlled owner bootstrap and recovery

1. Create the exact preview Access app and restrict it to Brent's verified IdP identity; require MFA. Confirm the app protects `/` and `/api/operations` and record its audience.
2. Sign in through that app. Read the validated Access identity subject from a controlled server-side identity receipt (or Cloudflare Zero Trust identity view). Confirm the email against the IdP account, then store `EIDOS_OPS_OWNER_SUB` and `EIDOS_OPS_OWNER_EMAIL` as environment values on both Worker and backend. Do not log or commit the JWT. Until both are present, all owner requests return 403.
3. To recover a lost subject, revoke the previous Access session, independently verify Brent through the provider, update both allowlists together, and verify the old subject is denied. Never add a permanent alternate owner or unauthenticated bootstrap route.

## Source and permission inventory

The adapter envelope is `{status, observedAt, source, environment, data, staleAfter, errorCode, correlationId}`. Missing bindings or source errors are unavailable, never an empty or healthy record count. Browser requests do not poll high-volume logs.

| Source | Authoritative entity and current endpoint | Scope and preview | Frequency / retention | PII | Failure state and owner action |
| --- | --- | --- | --- | --- | --- |
| Works Turso database | Members, sessions, projects, orders, community agents, outcomes via `/api/operations/console` | Existing preview database binding; server only | On owner read; bounded 25-row member page, 50-row operational lists; existing table retention | High for member detail; redacted search rows | Unavailable on missing binding/query failure; verify preview database and migration |
| Works owner operations tables | Manual work, notes, idempotency claims, checkpoints, action audit via additive `0007_operations.sql` | Same validation Turso binding; owner JWT plus action checks | On action; append-only audit and notes, no automatic deletion | Medium; reasons must avoid customer secrets | Unavailable until migration; apply only to verified validation database |
| Works readiness/outcomes | Source revision, feature flags, quota and response outcomes | Protected backend read; existing readiness endpoint and Works tables | Per console read, 5-minute freshness target; outcomes retained by existing platform logic | Low aggregate | Unknown if no successful read; check backend/relay |
| Site inquiry form / Drive CRM | Lead delivery webhook and private Sheet, no Works inquiry read endpoint | **Disconnected**; approved Drive/Sheets read scope or mailbox API needed | No polling enabled | High | Show not configured; inspect the private CRM or inbox externally; do not infer inbox receipt from HTTP acceptance |
| Stripe | Provider TEST/LIVE order, refund and dispute state | **Disconnected**; scoped read token and separate TEST/LIVE credentials needed | No polling enabled | Financial/PII | Works ledger only, provider totals unknown; reconcile in Stripe dashboard |
| GitHub | PR, workflow and commit state | **Disconnected**; read-only repo/workflow scope needed | No polling enabled | Low | Show linked draft PRs and documented SHA, not a live deployment claim |
| Cloudflare / Vercel | Deployments, security events, runtime logs | **Disconnected**; read-only project and analytics scopes needed | No polling enabled | Medium to high for logs | Deep link to provider console; no generic log ingestion |
| Google OAuth / mailbox | Consent status and actual inbox observation | **Disconnected**; preview callback missing and no mailbox-read grant | No polling enabled | High | Preserve release blocker; authorize callback and controlled inbox test separately |
| GA4 / Search Console / Drive Sheets | Traffic, search and pipeline | **Disconnected**; owner-granted scoped read credentials needed | No polling enabled | Medium | Show setup state; do not infer zero activity |
| OpenAI / usage | Metered provider costs and tokens | **Disconnected**; server-side usage scope and pricing context needed | No polling enabled | Low aggregates / high raw prompts | Cost unknown; do not expose raw prompts or a fabricated estimate |

## Preview configuration

Worker environment names: `EIDOS_OPS_HOST`, `EIDOS_OPS_ACCESS_TEAM`, `EIDOS_OPS_ACCESS_AUD`, `EIDOS_OPS_OWNER_SUB`, `EIDOS_OPS_OWNER_EMAIL`, `EIDOS_PLATFORM_URL`, `EIDOS_PLATFORM_TOKEN`, `EIDOS_PLATFORM_PREVIEW_BYPASS` (only if the paired Vercel preview still needs its project-scoped protection bypass). Backend preview names: the same Access and owner fields, `EIDOS_OPS_ORIGIN` (the exact Worker origin), `EIDOS_OPS_ENVIRONMENT=preview`, existing `EIDOS_PLATFORM_TOKEN`, `EIDOS_SOURCE_REVISION`, and its existing validation Turso binding. Never use production Turso credentials for this preview. Store relay token, bypass, and database credentials as secrets, and do not print them in receipts.

The backend handles account and work mutations with reason, exact identity checks, idempotency key, and safe-field audit. Suspensions change the member's enforced `disabled` gate; session revoke deletes only that member's sessions. Username correction updates only the selected member after uniqueness validation. No password setting, account merging, payment ledger editing, provider write, or production deployment action is exposed. Treat account actions as pending hosted acceptance until exercised against controlled test identities.

## Release and rollback

Before hosted acceptance, check anonymous, wrong identity, forged header, expired JWT, malformed body, missing CSRF/origin, duplicate key, stale version, and cross-member action boundaries. Check keyboard, phone, zoom, and reduced motion in a real authenticated browser. Do not equate a local build with these checks. The existing public release remains NO-GO for Google callback/consent, inbox receipt, Stripe TEST flow, hosted cloud editor/AI, native accessibility, and Snapshot gates.

For rollback, remove the console Worker route or restore its prior Worker version and disable the preview Access app only after the route is no longer reachable. Revert the backend preview deployment if needed. Keep additive operations tables and audit history; never delete member, order, project, or ledger records. Production rollback still follows `ACCEPTANCE_2026-09-23.md` and requires a separate approved release.
