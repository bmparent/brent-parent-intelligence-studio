# Candlelight Exclusive showcase — October 22, 2026

Brent authorized recreating the complete Candlelight Exclusive design, adding
the subtle hero light flicker and warm jacket glow, featuring it in the gallery
and showcase, and shipping the scoped change. The branch starts at public main
`a76583d7ba195c2e22715552c1c858289f1d5f5c`. Backend main remains
`d01920b23430fcc317d90118ab985985ec3e22ac`; this is a public frontend change.
There is no `docs/implementation/current-state.md` in this baseline. The
existing acceptance tracker and `docs/site-gallery.md` supply the contract.

## Design source and boundaries

The authoritative source is version 2 of
`Candlelight_Exclusive_Build_2026-10-22.zip`, containing the final applied
`homepage.html`, its before-warmth snapshot and README. The October 21 resumed
checkpoint supplies the original decorated JST90/LST90 images and plain backs.
The live homepage was visually inspected October 22 America/New_York, confirming
the finished layout, ivory paper, gold type, amber arch and correct jacket art.
The observed header emblem was saved from the storefront's existing public
image. Fit guides are the two saved October 22 guides, not invented tables.
Local WebP derivatives preserve the source artwork without remote runtime
dependencies or expiring asset URLs.

The saved hero glow is static. The reconstruction keeps its exact radial colors
and adds a separate very low-opacity amber layer with a slow, irregular opacity
animation to satisfy the requested flicker. It neither flashes the whole image
nor moves the garment. Pause retains the base glow. Reduced motion disables
animation; IntersectionObserver and tab visibility pause offscreen work.

The homepage retains the original text, two product cards, finishing-touch
section, price table and dark closing invitation. Scoped collection, product,
fit-guide and temporary-bag views reproduce the browsing journey. The demo has
no checkout, account integration, persistence, live catalog calls or private
store links. Example prices are explicitly labeled. Removing items and leaving
or reloading the page clears the corresponding temporary data. Data Graphics
client-services attribution and third-party artwork ownership remain explicit.
No conversion claim, direct Disney engagement or endorsement is asserted.

`/work/candlelight-exclusive` is prerendered and included in the sitemap and
growth path inventory. The first gallery record and first full Work showcase
tile link into the working reconstruction; both render a composed ivory/amber
preview rather than presenting the jacket as a screenshot. The homepage's
separate four Selected Work choices remain as configured, and FNBMD remains
among its six gallery features. Other screenshot dialogs retain their behavior.

## Verification and release

Local typecheck, lint (zero errors; pre-existing Wellway warning), production
build, 35-route editorial/prerender verification, built Insights validation,
URL checks and Pages Functions compilation pass. No provider configuration,
shared server code, migration or held runtime branch is imported. The cloud
browser cannot reach this container's local server, so local rendered acceptance
is not claimed. The focused CI browser job and existing production release
workflow run `scripts/verify-candlelight-browser.mjs` on exact candidate source.

The suite covers gallery discovery, complete homepage, 1440/768/390/320 widths,
decoded artwork and correct fit guides, front/back views, invalid and valid
personalization, size/quantity prices and bag totals, removal/empty/reload states,
navigation focus, pause, active opacity changes, reduced motion, overflow,
runtime errors, and absence of requests to the live commerce host. Screenshots
are retained for visual comparison. Physical devices and screen readers are
separate untested environments.

Exact CI, merge and deployment/readback receipts are recorded on the PR after
verification. A build is not a live-release receipt. Main's existing release
workflow owns production upload; it is not raced with manual uploads. Rollback
is the baseline above, or a scoped revert through the same workflow, with no
customer-data changes. Unrelated account, payment, AI and Agent Exchange
activation work retains its existing state.
