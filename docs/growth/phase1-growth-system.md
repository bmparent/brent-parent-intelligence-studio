# Phase 1 growth system

## Architecture and trust boundary

The public React site sends approved events to the same-origin Cloudflare Pages Function `/api/growth/events`. This is additive to consent-gated GA4 (`G-8N7Y7EM4CS`, property `552876683`). It does not depend on Google collection or a successful tag load. The existing Pages platform relay, Sentinel, accounts, inquiry mailer, hero, and glass implementation are not replaced.

Storage is a dedicated D1 database `eidos-works-growth`, bound as `EIDOS_GROWTH_DB` to production and preview. The preexisting D1 database belongs to unrelated Data Graphics work and is not used. The schema is `migrations/growth/0001_growth.sql`. No new paid SaaS subscription or billing resource is needed.

The owner endpoint `/api/growth/report` requires a dedicated `EIDOS_GROWTH_OWNER_TOKEN`, using the existing hashed operator-token comparison. It returns aggregates, never session or event IDs. There is no public dashboard and no reliance on unfinished account work. The random credential is a Pages secret; the local credential file is outside the repository. No credential goes into Vite variables, browser code, reports, or screenshots.

## Event contract

`src/lib/growthContract.ts` is the shared contract. A POST must have exactly `event`, `id`, `path`, `consent`, `session`, `qa`, and `attribution`. Attribution must contain exactly `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `landingPage`, and `referrer`. Unknown events/properties, unsafe paths, malformed contexts, oversized bodies, and missing consent are rejected.

Public ingestion accepts `page_view`, `session_start`, `landing_page`, `friction_cta_click`, `friction_form_start`, `select_project`, and `lab_open`. Successful `friction_submit` and `contact_submit` are **server-only**, after the existing delivery provider acknowledges the inquiry. A browser cannot submit those events to the collector. GA4 retains the existing conversion events and behavior.

No names, email addresses, form text, raw IP addresses, raw user agents, private receipt URLs, arbitrary query strings, or arbitrary event properties are accepted into growth storage. Event UUIDs and session UUIDs are HMAC-hashed under a domain-separated key using the existing server-only platform secret and UTC date. Provider receipt values are hashed before use as conversion deduplication keys.

Known public paths are generated from the site's static metadata and published Insights slugs by `npm run content:generate`. Private and unknown routes fail closed. Query strings/fragments are removed at the browser boundary; server input containing them is rejected. UTM values use lowercase letter/digit/underscore/hyphen tokens up to 64 characters. Do not place identity information in UTM tags. Referrers are reduced to a hostname and a known-safe path; unknown paths become `/`, and credentials, ports, local IP hosts, and unsafe schemes are discarded. Only external referral hosts are persisted in analytics.

## Consent and attribution

The existing `eidos.analytics.v1` decision controls both measurement layers. No event or growth identifier is created before consent. The form continues to work with “Essential only.” The privacy panel and privacy page describe both layers.

A random tab session starts only after consent. Session storage retains its sanitized first-touch attribution through full-document navigation for 30 minutes of inactivity. It is not a cross-device or unique-person identifier. No referrer or campaign history is saved before consent. Consequently, if a person navigates before granting consent, the baseline begins on the page where they grant it; the system does not secretly reconstruct their earlier journey. Revocation clears the growth session and stops emission.

First-touch attribution remains stable in a session; an internal Insights CTA does not overwrite an already-attributed external visit. A fresh entry through the Insights campaign URL is attributed to Insights. Campaign generation is deterministic: `docs/growth/campaigns.json` → `npm run growth:links` → the campaign URL manifest.

The Friction Review, contact form, and project intake send the same sanitized attribution to `/api/project-inquiries`. The server sanitizes it again before constructing the private brief. Subject and headers remain server-controlled. Invalid optional telemetry must not change successful inquiry delivery. The mailer response includes `measurementRecorded` so acceptance can distinguish delivery from measurement success. Honeypot, size limits, same-origin checks, mailer throttling, and provider acknowledgement remain in place.

## QA, automation, and bot limits

Reporting buckets are `public`, `production_qa`, `preview_qa`, `automation`, and `bot`. Production means the canonical `eidos-works.com` hostname. Other origins are preview QA. `?eidos_qa=1` explicitly marks a consented session and persists across navigation; it also labels GA4 traffic as QA. Acceptance uses `x-eidos-qa: automation`. Obvious headless/browser automation and crawler user agents are detected transiently, without saving raw user agents. An unusual browser alone is not QA.

QA inquiry names begin `Eidos Works QA`; their briefs explicitly say they are not customer leads. This flag is also applied server-side to conversion storage. Tests must set the session QA flag from the entry page, so earlier funnel stages are excluded too.

`public` is a heuristic exclusion category, not proof that every request is human. Headers and user agents can be spoofed; consent cannot be independently verified against a malicious client. Same-origin checks, schema validation, and rate limits reduce misuse but do not establish human identity. Public reporting excludes all four nonpublic buckets. QA view includes production QA, preview QA, and automation. Combined diagnostics include bots as a separate bucket.

## Storage, rate limits, and retention

`growth_events` stores daily session-event facts; `growth_quotas` stores hashed-session and global minute reservations. Atomic reservations allow at most 90 events per session per minute and 600 globally per minute, with a 5,000-event global daily ceiling. Reaching a ceiling produces missing measurement rather than unbounded storage growth. Duplicate page event IDs, session-start/landing events, and form starts are deduplicated. Sessions rotate at UTC midnight as well as browser inactivity expiry.

Rows older than 60 UTC days are removed on ingestion and by `eidos-growth-retention`, a dedicated scheduled Worker running daily at 04:17 UTC. Quotas expire within one day. Its only binding is the growth database, and its HTTP handler returns 404. `ops/growth-retention/worker.mjs` is the retained source. No longer-lived identifiable event archive is created; exported owner reports contain aggregates only. Cloudflare's own backups and operational logs follow provider retention, separate from application tables.

## Owner reporting

From the repository root:

```sh
npm run growth:report -- --days=1
npm run growth:report -- --days=7
npm run growth:report -- --days=30
npm run growth:report -- --days=7 --view=qa
npm run growth:report -- --days=7 --view=combined
```

Defaults: last seven calendar days including today, UTC, public traffic only. The owner token is read from `EIDOS_GROWTH_OWNER_TOKEN` or an external JSON file selected with `EIDOS_GROWTH_CREDENTIAL_FILE`; the default local file is `~/.codex/secrets/eidos-growth-owner.json`. Do not paste this credential into chat or URLs. Reports are saved under `artifacts/growth/reports/` as Markdown and JSON. `--input=<aggregate-json>` can render a retained authenticated snapshot. Reports are local artifacts, never shipped in `public/` or `dist/`.

Metrics include sessions, page views, Friction Review page sessions, CTA clicks, form-start sessions, provider-confirmed Friction submissions, and contact submissions, plus landing pages, pages, source/medium, campaign, referrals, and source-to-conversion breakdowns. Sessions are measurable tab sessions with daily rotation, not unique people.

Visit → review = sessions viewing `/friction-review` / measured page-view sessions. Visit → submit = submitted sessions / page-view sessions. Start → submit = sessions with both a start and a confirmed submission / started sessions. Ratios are percentages; zero denominators display `NA`, not fictional performance. These are same-day session co-occurrence metrics, not a claim of causality or a strict ordered funnel across multiple days.

## GA4 reconciliation

Historical GA4 read access unavailable from deployment environment.

The Pages runtime exposes the public measurement ID through its existing platform relay, not a GA4 Data API credential. No historical numbers have been invented. Optional reconciliation requires an already-authorized Google identity with Viewer access to GA4 property `552876683`, an OAuth credential with Analytics read scope, and GA4 Data API availability in an existing Google project. Do not create a new Google Cloud resource, billing project, or service account for this release. Compare consent coverage, UTC windows, daily sessions versus GA4 session definitions, and QA filters before interpreting differences.

## Release and rollback

Run the repository gates, `npm run test:growth`, the built-app Chromium/WebKit acceptance, and the growth SEO check. Confirm D1 schema/bindings and the dedicated owner secret exist. Use the existing verified-main Cloudflare Pages Direct Upload process for `eidosworks`; never substitute a Git push for deployment. Hosted-runner checks use the stable Pages QA origin because the canonical domain can challenge those IPs; final canonical-domain verification is separately required. Verify the provider's canonical deployment SHA, exact built assets on `https://eidos-works.com`, live routes, inquiry readiness, collector response, owner auth, and owner report after upload. Retain the deployment receipt and screenshots.

The new migration is additive. Roll back by redeploying the previous accepted source commit; leave the new database for audit and keep retention scheduled. Do not drop unrelated tables or replace existing provider bindings. The growth collector fails closed when its binding/secret is missing and never blocks public browsing. Provider-confirmed inquiry delivery remains successful if optional measurement fails.

## Sources

- Cloudflare D1 prepared statements and transactional batches: https://developers.cloudflare.com/d1/worker-api/d1-database/
- Cloudflare Pages D1 bindings require redeployment: https://developers.cloudflare.com/pages/functions/bindings/
- Local contract, migration, tests, browser receipts, and production receipt are the evidence for this implementation, not generic platform claims.
