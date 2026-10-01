# Storefront gallery refresh — October 1, 2026

Brent requested replacing the outdated Liberty Christian Prep, MDCA and Disney Junior gallery captures with the current storefronts, showing each complete homepage in the newer full-page gallery format. Other storefronts and animated reconstructions retain their existing source and gallery records.

## Scope and ancestry

Candidate branch: `codex/storefront-gallery-refresh-20261001`, based on production/main `7f03936366016f8bd005f2e3740896759e930889`. The change consists of three gallery records, six static WebP assets, provenance-aware gallery wording and these documentation updates. No InkSoft storefront setting, native commerce flow, animation source, backend, account, payment, migration, provider binding or dependency changes are included. The held site #73/backend #67 candidates are not inherited.

The animated Disney Villains, Beauty and the Beast, Jingle Bell Jingle BAM, Nighttime Spectaculars and Holidays in Hollywood demos remain unchanged. Early Learning and YMCA retain their existing historical gallery references. All 18 other gallery records retain their previous values; collection ordering and the 21-entry count remain the same.

## Capture provenance

All three source homepages loaded in the supervised Chromium browser without a password/PERNR prompt. The captures use the rendered live design, not generated imagery or a reconstructed mockup. Disney Junior's existing cast-member-only ordering language remains visible; absence of a gate does not change ordering eligibility or imply Disney sponsorship of Eidos Works.

| Gallery record | Observed source homepage | Complete image | Thumbnail |
| --- | --- | --- | --- |
| Liberty Christian Prep | https://stores.inksoft.com/Liberty_Christian_Preparatory_Sc/shop/home | 1350 × 2350 | 640 × 1114 |
| MDCA Uniforms | https://stores.inksoft.com/mdca_webstore_/shop/home | 1350 × 5126 | 640 × 2430 |
| Disney Junior | https://stores.inksoft.com/disney_junior_shows/shop/home | 1350 × 2154 | 640 × 1021 |

InkSoft scrolls inside `#storeFront`, so a standard document screenshot cannot cover the complete page. Overlapping browser viewport captures were joined at observed inner-container scroll offsets, from the first header through the final footer. Only repeated sticky chrome, the native scrollbar/outer pointer edge and intermediate shadows from Liberty's fixed final-sale notice were excluded from the joins. Liberty's final-sale notice is included once at the foot of the complete capture; MDCA's existing header notice remains visible. Page content and native product names/prices were not altered. The image width excludes seven outer content pixels alongside the scrollbar; no section is omitted.

The first slides were held using the existing carousel pause controls for stable capture. All main-document images were loaded. MDCA's embedded YouTube welcome player remained at 0:00/buffering after a normal Play interaction; the capture retains the visible player state. Live video playback is not claimed. No changes were made to that player or to the live store.

Full-image WebP payload totals 957916 bytes; the three thumbnails total 259328 bytes. Full images load when their reading dialog opens. `capturedAt` and the visible October 1 capture label record image freshness independently of the original project date.

## Behavior and verification

Full-page card images and Explore full page open the reading dialog, with a contained scroll region and full-size/fit-to-width control. A separate Open storefront link launches the observed live URL in a new tab. Fictional Concepts retain their existing disclosure; real storefront captures are labeled Client storefront and attributed to Brent's work through Data Graphics' client-services workflow.

- PASS: lint (zero errors; existing Wellway Fast Refresh advisory), TypeScript, client/SSR production build, prerender verification, editorial checks for 34 routes, validation of 17 built articles, URL checks and Git whitespace checks.
- PASS: image dimensions and full coverage checked against observed scroll-container dimensions; join overlap pixels and all complete compositions visually inspected.
- PASS: static comparison confirms only the three requested gallery records changed; existing animated demo source is unchanged.
- Local interactive candidate review is unavailable: the supervised browser blocks loopback navigation with `ERR_BLOCKED_BY_CLIENT`; the isolated local Chromium download returned an invalid archive. No local rendered gallery pass is claimed.
- Exact-head CI, published gallery interaction, responsive desktop/phone evidence and deployment identity will be recorded against the final release head when observed.
- Physical-device, assistive-technology and InkSoft checkout/Style Editor checks are not claimed; the live storefronts were only read/captured.

Rollback target: production/main `7f03936366016f8bd005f2e3740896759e930889`, previous upload https://c5803ce8.eidosworks.pages.dev. A source revert or the existing prior deployment restores the gallery without modifying customer data or provider settings.
