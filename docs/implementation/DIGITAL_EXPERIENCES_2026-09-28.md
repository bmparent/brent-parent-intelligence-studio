# Digital Experiences showcase candidate — 2026-09-28

## Scope and ancestry

This public-site-only page change is stacked on the draft site integration branch `codex/works-paired-integration-20260927` at `ff7a076e1335d528224e94536c994b5438c35d39`. It does not change the paired backend, database, accounts, payments, AI, or production configuration. Its PR should target that integration branch, not `main`, because the integrated site/backend release gates are still open and the site main workflow can deploy production.

The Digital Experiences page now features Holidays in Hollywood, the live MDCA Webstore, Little House, and Tidal; Jingle Bell, Jingle BAM! and Pocket Portal are supporting cards. The Services index image is a saved Holidays in Hollywood design reference. The page uses existing published gallery media and links, with no private store access or customer records.

## Claim boundaries

- Holidays in Hollywood is labeled a public portfolio reconstruction of private storefront work completed within Data Graphics' client-services workflow. No Disney relationship, asset ownership, transaction, or measured uplift is claimed.
- MDCA links to the public live InkSoft store. The image is a saved design reference, and the copy describes visible ordering, fit, final-sale, and pickup guidance. No direct Eidos Works client relationship or measured uplift is claimed.
- Little House and Tidal are labeled independent studio projects. The illustrated Little House route is linked directly because 3D availability varies by browser/device. Pocket Portal is labeled experimental with the same capability caveat.
- The project copy describes visible behavior and documented platform boundaries. Exact development chronology or framework claims for the studio Sites are intentionally absent.

## Local evidence

- `npm run lint` — passed.
- `npm run build` — passed, including TypeScript and prerender.
- `npm run verify:prerender` and `npm run verify:urls` — passed.
- `npm run verify:editorial` — passed after updating its expected service-index image.
- Browser acceptance script `scripts/verify-digital-experiences-browser.mjs` is wired into the existing isolated CI browser job. It checks the selector, goal interaction, page landmarks, key links, client errors, and desktop/mobile overflow, and captures full-page images. CI outcome and visual review must be recorded on the PR; this local record is not a hosted or physical-device receipt.

## Remaining checks

Review the CI screenshots at 1440 and 390 pixels, check the hosted branch preview if available, and verify tap/focus, reduced motion, low-power behavior, and the live MDCA destination on a physical device. Confirm the client-work role language and approved media before production promotion. This page change does not close the integrated site/backend release gates recorded in `ACCEPTANCE_2026-09-27.md`.
