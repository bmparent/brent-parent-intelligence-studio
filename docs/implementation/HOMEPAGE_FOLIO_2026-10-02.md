# Homepage service folio — October 2, 2026

Brent approved the refined paper-collage service mockup and requested its implementation in Eidos Works. The isolated candidate starts from public main `24ea6e5d25d16ff7014e32cedce9444b197c6082` on `codex/home-services-folio-20261002`.

## Scope

The homepage `#services` section uses six distinct transparent illustrations, warm ivory paper, dark teal type, a serif/italic introduction and a mint project action. The first pair uses a 7/5 grid and the remaining pairs a 6/6 grid. Below 700px, the services stack with native image aspect ratios. Visible titles, descriptions, scope lists and service links are HTML. The three existing service families, six meaningful destinations, Contact action, section ID and prior removal of decorative numbering are preserved.

Files are scoped to HomeServices, its CSS and new public illustration files. No dependencies, global styles, hero, selected projects, route definitions or runtime configuration change. Existing Wellway image fitting is retained. The six service artworks are illustrative; tiny product UI and gauges are part of the visual concept, not live product capabilities or measured outcomes. Asset provenance and hashes are in `homepage-folio-assets.json`.

## Verification

- Local lint: zero errors, with the existing Wellway fast-refresh advisory.
- TypeScript, client/SSR build and prerender pass.
- Prerender, editorial (34 routes), source and built article validation (17 articles), and public URL checks pass.
- Actual Chromium rendering is compared with the approved source in `../../design-qa.md` and `homepage-folio-evidence/`. Desktop, narrow-phone, phone and tablet browser contexts preserve readable copy and have no horizontal overflow. Each card and CTA uses a native accessible link; keyboard focus and Enter navigation are checked. The three service destinations and Contact render their intended pages.
- Responsive images resolve to the 640-width sources on the phone and 1280-width sources on desktop. The 12 responsive WebP files plus paper total 1,388,206 bytes. The six smaller sources total 327,244 bytes. Images load lazily with intrinsic dimensions and async decoding; no new JavaScript behavior is required.

The existing PR workflows must pass on the final candidate before merge. The main release workflow then checks source identity, deploys to the existing Cloudflare Pages project `eidosworks`, and reads back production. Exact candidate, merged SHA, workflow results and canonical browser readback are recorded on the PR.

## Acceptance and rollback

This is the authorized public homepage presentation change. It does not accept the held paired-runtime work on #73/#67, which remains separate. No backend, account, payment, provider or migration change is included. Rollback is the public-main baseline above; customer data is unaffected.

Local browser widths and CI browser engines are browser-based evidence, not physical-device or assistive-technology testing. Temporary iframe review files are removed before commit and are not production files. Publication is claimed only after production identity and canonical rendering are read back.
