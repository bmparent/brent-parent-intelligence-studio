# Canonical indexing access follow-up — October 15, 2026

The source indexing repair is deployed through [PR113](https://github.com/bmparent/brent-parent-intelligence-studio/pull/113), commit `b8bfbbc4e6f9dd73c7c899f0b32e829207314b75`. The remaining canonical-domain failures are confirmed Cloudflare challenge responses to the diagnostic clients. Verified search-crawler access and actual search-engine indexing remain unverified. The whole canonical-domain audit is **not complete**.

## Current response evidence

[Read-only diagnostic run 38759546476](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38759546476) completed successfully at source `384b349bccb35724f460d53838f9e644eefa3359`. Its success means evidence collection completed, not that accessibility passed. [Sanitized response receipt](indexing-evidence/canonical-access-diagnostic-2026-10-15.json) contains timestamps, status, selected headers, redirects, document title/hash, robots metadata and canonical metadata. The [original Actions artifact](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38759546476/artifacts/11985117355) expires November 14, 2026; the repository copy persists.

Every canonical document below returned **HTTP 403**, `server: cloudflare`, `cf-mitigated: challenge`, `content-type: text/html; charset=UTF-8`, title `Just a moment...`, and challenge-page `noindex,nofollow`. No `X-Robots-Tag` was present. This HTML belongs to the challenge, not the underlying Eidos page.

| Exact requested URL | Verifier UTC / Ray ID | Chromium UTC / Ray ID |
| --- | --- | --- |
| https://eidos-works.com/sitemap.xml | 15:21:40 / `a4afd098fd319df8-YVR` | 15:21:55 / `a4afd0f90fd7efcd-YVR` |
| https://eidos-works.com/work/nighttime-spectaculars | 15:21:42 / `a4afd0a5fe7aefcd-YVR` | 15:21:57 / `a4afd1065e7c2724-YVR` |
| https://eidos-works.com/lab/eidos-brain | 15:21:44 / `a4afd0b2ed4c7631-YVR` | 15:21:59 / `a4afd113aeba6e05-SEA` |
| https://eidos-works.com/quote-desk/ (control) | 15:21:46 / `a4afd0bfc8d283f9-YVR` | 15:22:01 / `a4afd1211cb2efcd-YVR` |

Cloudflare documents `cf-mitigated: challenge` as its reliable challenge-page indicator, including when the requested resource is XML. [Cloudflare challenge-response documentation](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/challenge-pages/detect-response/)

The three equivalent stable Pages controls returned HTTP 200 at 15:21:48–15:21:52 UTC. The sitemap contained 55 URLs. Both pages followed normal HTTP 308 slash normalization and returned `index, follow`, their intended canonical URLs, and no restrictive response header. These controls establish available content on that host, **not canonical-domain access**.

## What the diagnostic establishes

The honest `EidosIndexingVerifier/1.0` client and a fresh default Chromium document check received explicit Cloudflare challenges. Requests were bounded to four canonical documents and three Pages controls, with no retries or challenge solving. Chromium disabled JavaScript and blocked subresources; this does not represent an ordinary full-browser session. Both clients used the same CI runner, so they are not independent network samples.

The results do not identify the triggering Cloudflare feature/rule, prove a temporary propagation problem, establish that verified Googlebot/Bingbot are challenged, or prove they can access the site. A crawler-looking user-agent would not establish a verified crawler's identity. [Cloudflare verified-bot documentation](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/)

No source-level denial rule was found for the three affected paths in `public/_headers`, `public/_redirects`, `public/robots.txt`, or the Functions routing/middleware. Their public content and sitemap entries remain present. No additional application patch or speculative security exception is justified by these observations.

The workspace's direct network attempt separately failed at the executor proxy with CONNECT HTTP 403 and `server: envoy`; that is not an origin response and was not used as Cloudflare evidence.

## Preserved release and prior checks

[Production run 38756057654](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38756057654) uploaded [deployment 77302234](https://77302234.eidosworks.pages.dev) at 15:07:26 UTC and verified exact commit/assets/provider identity at 15:07:27 UTC. The provider configuration fingerprint covers Pages deployment configuration, not zone WAF/Bot settings.

All five PR candidate workflows passed. Validation included seven indexing regression tests, real local Pages headers for 55 public URLs and 13 retained exclusions, responsive estimator/guide behavior, build/typecheck/lint, and platform/Playground/growth/analytics/glass/Snapshot/Insights/prerender/URL/Functions gates. There is one pre-existing Wellway Fast Refresh lint warning.

Stable production passed the 55-public/13-excluded audit at 15:09:13 UTC. On canonical attempt four at 15:11:16 UTC, Quote Desk, its guide and Wellway returned HTTP 200 with intended canonicals and no `X-Robots-Tag`, and all 13 exclusions passed. The canonical audit still failed on the three URLs above. The later challenge for the Quote Desk control demonstrates varying access, not a restored source noindex header.

The release workflow remains failed at the complete canonical audit step; the successfully uploaded PR113 deployment remains in place. Intentional exclusions for private accounts, checkout, recovery, owner/admin areas, preview/test routes and unreleased products were retained. PR111/78 and PR110 were not merged or altered by this follow-up.

[Original release artifact, including provider and per-attempt indexing receipts](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38756057654/artifacts/11983404424). Artifact SHA-256: `5f275aa1da5961fda9dd5dc24947af348ac0a76ac39fe3a30c8824867d07dc33`.

## Exact provider evidence and remaining blocker

At **15:27:35 UTC**, [read-only provider run 38760478156](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38760478156), source `5981f4275bff6abb5e9ca44c29db9fb351cc33eb`, refreshed the existing Pages project's metadata. HTTP 200 confirmed production branch `main`, the attached `eidos-works.com` domain, successful deployment `77302234-d955-4835-a633-455a7f02bf3d` and deployed source `b8bfbbc4e6f9dd73c7c899f0b32e829207314b75`. The diagnostic has preserved the successful PR113 deployment.

The exact Pages custom-domain metadata was also readable. A single read-only Cloudflare GraphQL query, restricted to the eight known Ray IDs and the 35-second diagnostic window, returned HTTP 200 **with a GraphQL authorization error `authz`**. It did not return accepted Security Events evidence. HTTP 200 here is API transport success, not query authorization or a passing site-access check. Existing credentials were used without modification, and no broader credential or bypass was attempted.

[Sanitized provider receipt](indexing-evidence/provider-access-diagnostic-2026-10-15.json) and [original Actions artifact](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38760478156/artifacts/11985342091). The response receipt's `productionSource` field is a diagnostic label; this separate provider read supplies the fresh deployment evidence.

**Specific blocker:** the available credential cannot authorize this Security Events query, and no connected Search Console evidence is available. The triggering security rule and verified search-crawler access therefore remain unknown. No exact security-setting change can responsibly be proposed until the matched rule and real crawler behavior are known. Owner-side read access is sufficient for the next investigation; this handoff does not request a credential or WAF change.

## Owner handoff for the remaining verification

1. In Cloudflare Security Events for hostname `eidos-works.com`, inspect October 15, 2026 **15:21:35–15:22:10 UTC** and the eight Ray IDs above. Record the matching security product/source, action, rule ID/name, ruleset/phase and available bot classification. Read the matched rule's exact expression/action and verified-bot handling without changing it.
2. Check existing recent request evidence for the three affected paths and slash variants using **provider-verified search-crawler identity**, timestamp, requested URL, action/rule and edge/origin status. Absence from sampled Security Events does not prove successful passage.
3. Read available Search Console URL Inspection crawl status/time for the two pages and the sitemap's last-read/status. Search eligibility and an accessible URL do not prove actual indexing.
4. If those records show verified search crawlers are blocked, prepare an approval request naming the exact matched rule/setting, current and proposed value, precise public paths and security effect. No WAF/bot exception, broad allowlist, authentication removal or security relaxation is proposed without that evidence.
5. After access is established through authorized evidence, rerun the complete canonical audit against the preserved build: `node scripts/verify-indexing.mjs --base-url=https://eidos-works.com --output=/tmp/eidos-indexing-canonical.json`. A stable Pages pass alone does not close this item.

No credentials, cookies, raw challenge bodies, client IPs or private account data are included in the repository receipts. This diagnostic branch has no production deployment step and is not merged into main.
