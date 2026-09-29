# Business Systems page candidate — 2026-09-29

## Scope

This public page revision is stacked on Digital Experiences PR #74, which is stacked on the draft Works site integration PR #73. It changes no backend, provider configuration, customer data, payment path, or production deployment.

The page now presents EmbroideryCalc, the internal Data Graphics production reporting case, and the private Promo Photo Organizer workflow. The production capture omits customer rows; the Promo example uses a diagram rather than customer photos. Three interactive concept applications use explicitly fictional jobs and rates. The copy describes the operator problem, interface approach, and evidence boundary for each example.

## Local verification

- Site lint and TypeScript/production build passed.
- Prerender, URL, and editorial verification passed.
- The page is rendered through the existing `/services/business-systems` route; no external provider or customer system is exercised by these checks.

## Release boundary

Review the new layout in the PR preview at desktop and phone sizes, including real touch, focus, zoom, and loaded images. The combined Works candidate still needs its isolated paired hosted account, inquiry, owner, and Stripe TEST acceptance. Keep the stacked PR draft and do not merge it or its bases to `main` as a page-only check cannot establish paired release readiness.
