# Insights publishing run — 2026-09-23 midday practical guide

## Status

Local editorial and release gates passed. Commit, deployment, and live verification are pending.

## Article

- **Title:** Mobile Storefront Filters: A Practical Guide to Safe, Reversible Choices
- **Slug:** `mobile-storefront-filters-safe-reversible-choices`
- **Audience question:** How should a storefront design mobile product filters so customers can narrow results without losing their place?
- **CTA:** `/friction-review`

## Source evidence

- W3C Target Size (Minimum): 24 by 24 CSS pixel target-size criterion and spacing exceptions; accessed 2026-09-23.
- W3C Dialog (Modal) Pattern: focus containment and inert content outside an active modal; accessed 2026-09-23.
- W3C Disclosure Pattern: a smaller in-page alternative to a modal interaction; accessed 2026-09-23.

## Deduplication

Reviewed the recent size-guide, quote-form, and storefront-discovery articles. This guide covers filter state, recovery, and interaction selection, so it is distinct from those topics.

## Validation

- `npm run content:generate` — passed
- `npm run validate:insights` — passed
- `npm run lint` — passed
- `npm run build` — passed; the new prerendered route was generated
- `npm run verify:prerender` — passed
- `npm run validate:insights:dist` — passed
- `npm run verify:urls` — passed
- `npm run verify:editorial` — passed

The first publishing-run attempt failed only because the required `What this means for your site` section was absent. After that safe correction, the Windows runner hung after its lint child exited. The equivalent sequential gate above was completed instead; this receipt preserves that distinction.

## Limits

This is an editorial framework and worked example. It does not establish accessibility conformance, a measured conversion result, or customer outcome. Analytics and webmaster data were unavailable for topic selection.
