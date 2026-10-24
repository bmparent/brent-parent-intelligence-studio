# Insights search visibility — October 24, 2026

Brent requested checking whether the Insights articles are indexed and fixing
visibility gaps. This scoped frontend change starts at public main
`2c7dcf3cd6a01d88f23eb1da5d45e876d956f8f9` in an isolated checkout.
The separate in-progress AI essay and held feature branches are preserved.

## Observed baseline

At 04:09 UTC, all 21 published article URLs returned HTTP 200 after their normal
trailing-slash redirects, with the expected canonical, title, description,
visible article heading/body, BlogPosting data, and no HTML or HTTP noindex.
Googlebot, Bingbot and OAI-SearchBot are allowed by the live robots.txt.
All 21 URLs appear in the live sitemap, RSS feed and crawlable Insights links.
The public search lookup returned multiple existing article results; this is
evidence of discovery for those results, not a complete Google coverage count.
The redacted public-only inventory is retained alongside this record.

The hub's sitemap lastmod remained 2026-07-10 despite the October 23 article.
The connected owner's Search Console showed pending verification properties
and no verified whole-site Eidos Works property. A canonical HTTPS URL-prefix
property was prepared using Google's actual supplied verification tag.

## Changes and verification

The hub's sitemap lastmod now follows the latest published article update.
Drafts are excluded, ordinary rebuilds do not advance the date, and existing
article dates/URLs are preserved. The homepage template contains the public
Google verification tag for the already signed-in owner so the property can be
verified after deployment and the root sitemap submitted.

The seven existing indexing regression checks pass. The normal local Insights
runner's external-source fetch failed with DNS EAI_AGAIN in this environment;
the failed receipt is retained. Article text and source records are unchanged.
Schema/dist validation without external retrieval and all remaining local
build/editorial/indexing gates are recorded separately. No article source-fetch
success is inferred from those checks.

Exact candidate CI, production source/provider receipt, live verification-tag
and sitemap-date readback, Search Console ownership confirmation and sitemap
submission are recorded on the scoped PR after they occur. New Search Console
reports may initially be empty; submission does not guarantee crawling,
indexing, ranking, impressions or clicks.

Primary guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
and https://developers.google.com/search/docs/monitor-debug/search-console-start.

Rollback is a revert of this scoped source change through the existing
Playground editor release workflow; no migration or private-data rollback is
involved. Removing the Google tag would prevent continued tag-based ownership
verification, so retain it while the owner uses this property.
