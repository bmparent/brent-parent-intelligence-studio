# FNBMD gallery showcase — October 20, 2026

Brent explicitly requested adding the public First National Bank of Mount Dora
storefront to the gallery, using the existing long-image presentation and
showing product pages as well. Branch `feat/fnbmd-gallery-20261020` starts at
public main `bcfe13c1ca0b6bb9c59f9fde6c1ca7d73847d4e5`, independently of the held
account/Playground PRs. No backend change is required. No current-state.md file
exists in this checkout; the current gallery contract is `docs/site-gallery.md`.

## Captures and attribution

The public InkSoft store was opened without authentication on October 20
America/New_York. These are actual rendered browser captures, not generated
illustrations. Data Graphics client-services attribution and client ordering
eligibility remain visible in the preview. No account, benefit code, checkout,
cart, customer record, or store configuration was changed.

| View | Public source | Asset dimensions |
| --- | --- | --- |
| Homepage | https://stores.inksoft.com/fnbmd/shop/home | 1346 × 2907 |
| Collection | https://stores.inksoft.com/fnbmd/shop/products/polos_knits_easy_care?page=1 | 1346 × 936 |
| Polo details | https://stores.inksoft.com/fnbmd/shop/product-detail/1001241 | 1346 × 936 |
| Shirt details | https://stores.inksoft.com/fnbmd/shop/product-detail/1001275 | 1346 × 936 |

InkSoft uses an inner scrolling container. The complete homepage joins four
overlapping viewport captures at observed document-relative offsets 0, 702,
1404 and 1971, accounting for the native header's 28px compact state. Only
repeated fixed header chrome and outer scrollbar/pointer edges are excluded.
The complete homepage runs from the header through the footer; product and
collection images intentionally show the initial product-selection viewport.
The polo's Navy and shirt's Light Blue / Light Stone choices were selected for
the capture without adding anything to a cart. Local versioned WebP images and
thumbnails avoid expiring external image links. Capture dates describe image
freshness, not the original project's creation date or commerce acceptance.

## Experience

FNBMD leads the homepage gallery and full Work gallery. Search accepts its slug,
including FNBMD, or the bank name; Storefronts filtering includes the card. The
existing modal now supports optional related-page buttons with visible selected
state, captions, individual alternative text, and page-specific live links.
Changing views restores fit-to-width and resets the image's horizontal/vertical
scroll. Full-size reading, Escape, close/focus restoration and the project
inquiry link remain. Existing concepts retain their fictional disclosure and
single-image presentation. The homepage is now an approved InkSoft portfolio
surface in the existing prerender guard; canonical/retired-host rules remain.

## Verification and release

Local lockfile install, lint (zero errors; existing Wellway Fast Refresh advisory),
TypeScript/client/SSR build, prerender, 34-route editorial checks, built Insights
validation, URL checks and Pages Functions compilation pass. The complete
homepage and each product/category source were visually inspected. Local
Chromium is absent; no local rendered-gallery acceptance is claimed.

`scripts/verify-site-gallery-browser.mjs` is added to the existing release gate.
It covers desktop 1440px and phone 390/320px gallery discovery, four loaded
captures, full-size reading, scroll reset, live links, Escape/focus, reopening,
existing concepts, homepage featuring, overflow and runtime errors. Exact-head
CI screenshots and results must pass before merge. The existing main workflow
remains responsible for production upload; do not race it with a manual upload.
PR/CI/deployment receipts and production readback are recorded on the PR so a
status-only documentation commit does not trigger another deployment.

Physical devices, screen readers and live InkSoft checkout are outside this
read-only showcase verification. The paired account/payment/runtime gates remain
independent. Rollback is the public-main baseline above; reverting this gallery
change involves no customer data or provider-setting migration.
