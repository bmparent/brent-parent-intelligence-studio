# Site gallery

The Wellway member/advisor app is documented in [wellway-demo.md](./wellway-demo.md). Its Tools card uses genuine browser captures and opens `/demos/wellway/`. Source, evidence, simulated behavior and hosted AI configuration are documented separately.

The homepage shows the first six records from `src/data/siteGallery.json`. The Work page shows the complete collection at `/work#site-gallery`, with category filters, search, and a larger image preview. Each image and “Open app” link launches the public app in a new tab; a separate Preview button opens the screenshot dialog. Add future Sites to that JSON file without changing the components.

Each record includes `slug`, `title`, `category`, `description`, `image`, `thumbnail`, and `date`. Add `url` only when the Site has a public destination suitable for portfolio visitors. Use the existing categories Games, Tools, Experiments, or Storefronts. Keep private project URLs out of the public data.

Add a genuine homepage screenshot as `public/images/site-gallery/<slug>.webp` and a smaller `<slug>-thumb.webp`. Keep the screenshot legible, free of loading states, and representative of the project. Existing full images fit within 1440×1100; thumbnails fit within 640×480. The gallery fixes image display dimensions to avoid layout jumps. Place new records first to feature them on the homepage.

## Image provenance

The September 6, 2026 gallery covers all eleven published Sites returned by the refreshed account inventory. Small Hours was added with a real browser capture. Eight images use a Sites-provided screenshot. Proof Lab and Disney Villains were recaptured from their saved React source because the supplied screenshots showed raw code or incomplete artwork. Little House uses the saved version 1 screenshot of its illustrated dollhouse; its current app offers both a 3D cleanup game and the illustrated edition. The Villains design and Proof Lab are historical previews, not statements about current production pricing or capabilities.

The Amazon Product Momentum draft has no saved version, live URL, or screenshot, so it is not included. At the user's request for customer access, nine previously owner-only published Sites were made public; Sayward and EmbroideryCalc were already public. Editor access was preserved. The gallery stores image files locally, not expiring signed screenshot URLs. Public access lets visitors use each app; it does not create shared account storage across the separate apps.

## Customer accounts follow-up

The requested sign-in methods are Google and email/password with email password recovery. Clerk's free Hobby plan was selected through the existing Sentinel Vercel project. The owner accepted the marketplace terms. The eidos-works-community application is provisioned through Vercel; its two application and three email CNAME records are verified in Clerk. Provider configuration and account integration are still in progress. No custom password tables or recovery-code system are included in this gallery change. Account-owned agent keys and authenticated discussion attribution remain part of that follow-up, using the current backend and moderation controls.

## Production release

This repository serves `eidos-works.com` through the existing direct-upload Cloudflare Pages project `eidosworks`. Merging a pull request does not deploy it. From an environment already authenticated to the correct Cloudflare account, check out the merged main branch, run the project release checks, then deploy the complete app and its existing Pages Functions:

```bash
npm ci
npm run lint
npm run build
npm run verify:prerender
npm run verify:editorial
npm run validate:insights:dist
npm run verify:urls
npm run build:functions
node node_modules/wrangler/bin/wrangler.js pages deploy dist --project-name eidosworks --branch main --commit-hash <verified-main-commit> --commit-dirty=false
```

Preserve the existing platform bindings, runtime variables, backend relay, and payment configuration. Verify `/`, `/work#site-gallery`, `/work/nighttime-spectaculars`, and `/work/holidays-in-hollywood` after deployment. Exercise gallery filtering and preview dismissal, and demo collection/product/bag navigation. The storefront bags are temporary examples and do not submit orders.

## Additional InkSoft references

Five InkSoft homepage references sit alongside the published apps: Liberty Christian Prep, Liberty Christian Early Learning, MDCA Uniforms, Disney Junior, and YMCA Employee Uniforms. Liberty Christian Prep, MDCA and Disney Junior now use complete October 1, 2026 browser captures, stored as versioned local WebP files with 640-pixel-wide uncropped thumbnails. Their cards open the full-page reading dialog; separate links open the current storefront. `capturedAt` records the screenshot date rather than inventing an original project date. Client-services attribution and the Disney Junior cast-member ordering context are retained. The remaining Early Learning and YMCA entries retain their saved Cloudinary images and reference-preview behavior.

`fullPage` controls image presentation independently of provenance. Only records in the Concepts category receive fictional/AI-generated wording. Real storefront captures receive client-storefront labels, dated capture notes and live-store links. See [the October 1 refresh record](implementation/STOREFRONT_GALLERY_2026-10-01.md) for sources, dimensions and verification.

Three full interactive reconstructions are also available in the Work collection: `/work/disney-villains`, `/work/beauty-and-the-beast`, and `/work/jingle-bell-jingle-bam`. They use saved project artwork and illustrative catalog labels/options. These pages are separate from the historical screenshots in the gallery.

## EmbroideryCalc

The first record links to the standalone public calculator at https://embroiderycalc-public.pages.dev/. The full and thumbnail WebP files come from a September 6, 2026 production homepage capture, after deployment of calculator commit 249c73c1307a06f4c05ea7f562d2b65ad9a41a3f. The calculator at /calculator/ supports browser-local estimates, DST analysis, artwork palettes, Madeira thread matching, history, and calibration. No account, ERP connection, AI service, or runtime secret is required. Optional analytics are disabled.

Before the Wellway addition, the gallery contained 17 records: 11 public Sites apps, this standalone calculator, and five saved InkSoft references. The separate embroiderycalc-preview Site remains accessible. The stable calculator slug and image filenames are retained.

The older embroiderycalc-pro Cloudflare project retains its June 10 Printavo/AI deployment c27e2636-e7b8-40c3-a99f-c405a5d92a0d and existing runtime settings. Its automatic production builds are paused so the current standalone repository cannot replace the operational interface. The public project is a separate static direct upload. No private order search or paid AI call was used for release verification.
