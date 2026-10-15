# Public search eligibility repair — October 15, 2026

Brent authorized fixing Quote Desk and removing accidental indexing blockers from other public pages. This candidate starts from production/main `8de77210251b9a8d5d3e49e9fa1cf16c2c4624e3` (PR112). No newer repair was found in current refs or recent PRs. PR111/78 Playground and PR110 Insights remain separate. `docs/implementation/current-state.md` is absent; the current acceptance tracker, dated records, source and release workflow were used instead.

## Cause and scoped changes

PR112 removed the estimator's HTML noindex but retained `/quote-desk/*` in `public/_headers`. Its [review finding](https://github.com/bmparent/brent-parent-intelligence-studio/pull/112#discussion_r4282745696) identifies the same HTTP exclusion reported on the canonical domain at 13:34:54 UTC. The [existing main release](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38733334129) successfully uploaded deployment `42009341` at 12:23:35 UTC, so the defect existed in deployed source.

The blanket header is narrowed to the unreleased workspace's terms/privacy candidate pages. The released estimator and linked quoting guide become eligible. The guide's canonical and internal link use `/quote-desk/quote-guide`, which the real local Pages runtime confirms is the destination of the `.html` redirect. Its HTML noindex is removed and it joins the generated sitemap. The already released fictional Wellway gallery demo also joins the sitemap; its metadata was already indexable.

## Inventory and retained boundaries

The baseline sitemap has 53 URLs: 33 public React metadata routes, 19 published Insights articles and the free estimator. All marketing, service, gallery, Lab, public community and policy/product landing routes have matching canonicals, crawl permission and no source-level noindex. The new sitemap has 55 URLs after adding the guide and Wellway demo. This is discovery/eligibility work, not a ranking, traffic or actual search-engine indexing claim.

Existing exclusions remain for accounts, verification/preferences, member pages, moderation, checkout success, Snapshot start/results/success, the private shell, kit previews, Playground's free preview and unreleased Quote Desk workspace policy pages. Existing robots.txt rules, authentication, API authorization, provider settings, feature flags, backend, payment behavior and private data are unchanged. No paid resources or customer transactions are involved.

## Verification ledger

| Requirement | Observation | Environment / evidence | State |
| --- | --- | --- | --- |
| Cause reproduced in source | `/quote-desk/*` supplies HTTP noindex although estimator HTML has none | Exact baseline `8de7721`; PR112 review | Pass |
| Inventory audit | Public routes compared with metadata, robots, headers, canonicals and sitemap; only findings above | Source audit at baseline | Pass |
| Public response directives | Estimator and clean guide HTTP 200 with no X-Robots-Tag; `.html` guide redirects 308 to clean guide | Local Wrangler Pages static/Functions runtime, 14:37:29 UTC | Pass |
| Retained candidate exclusion | Clean terms route returns HTTP 200 plus `noindex, follow` | Same local runtime | Pass |
| Customer behavior | At 1440px and 390px, quantity 48→49 changes $926.88→$957.46; guide link opens correct heading/canonical | Chromium, real local Pages runtime | Pass |
| Regression coverage | Built inventory and actual final HTTP responses, including intentional exclusions; fixtures reject header-only noindex | New indexing checks; exact-head CI linked on PR | Pending exact-head CI |
| Existing quality gates | npm ci, lint (one existing Wellway Fast Refresh warning), typecheck/build, platform/playground/growth/analytics/glass/Snapshot tests, Insight runner, prerender/editorial/Insights/URLs and Functions build | Isolated checkout; local command logs | Pass |
| Production deployment and live final headers | Existing main workflow performs source/provider readback, then stable Pages and canonical-domain indexing audit | Exact SHA, run and receipts recorded on PR after release | Pending |

The final-response check preserves exclusions whether supplied by HTML or HTTP headers. The existing Snapshot success trailing-slash route retains HTML noindex; the synthetic member/result URLs normalize to the shared empty private shell, whose noindex is checked without reading real private records. No private-route behavior is changed.

The lockfile's local workerd supports compatibility dates through 2026-06-10 while production's fixture specifies 2026-09-01. Local header checks explicitly use the supported date; production configuration is unchanged. This validates local static response behavior and does not claim production runtime parity. Direct public-domain HTTP reads from this workspace are blocked by its proxy (CONNECT 403); hosted workflow evidence must establish live state.

## Release and rollback

Release only the scoped PR after exact-head checks pass, using the existing main workflow: current-main guard, provider identity/configuration fingerprint, upload to `eidosworks`, canonical deployment verification and final-response readback. Retain audit JSON with timestamp, source commit, URL/status, metadata and response directives; no private bodies or credentials. The PR is the final source/CI/deployment evidence ledger. Roll back by reverting this scoped change through the same pipeline to the baseline above; no migration or data rollback is required.
