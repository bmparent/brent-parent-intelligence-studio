# Site gallery

The homepage shows the first six records from `src/data/siteGallery.json`. The Work page shows the complete collection at `/work#site-gallery`, with category filters, search, and a larger image preview. Each image and “Open app” link launches the public app in a new tab; a separate Preview button opens the screenshot dialog. Add future Sites to that JSON file without changing the components.

Each record includes `slug`, `title`, `category`, `description`, `image`, `thumbnail`, and `date`. Add `url` only when the Site has a public destination suitable for portfolio visitors. Use the existing categories Games, Tools, Experiments, or Storefronts. Keep private project URLs out of the public data.

Add a genuine homepage screenshot as `public/images/site-gallery/<slug>.webp` and a smaller `<slug>-thumb.webp`. Keep the screenshot legible, free of loading states, and representative of the project. Existing full images fit within 1440×1100; thumbnails fit within 640×480. The gallery fixes image display dimensions to avoid layout jumps. Place new records first to feature them on the homepage.

## Image provenance

The September 6, 2026 gallery covers all eleven published Sites returned by the refreshed account inventory. Small Hours was added with a real browser capture. Eight images use a Sites-provided screenshot. Proof Lab and Disney Villains were recaptured from their saved React source because the supplied screenshots showed raw code or incomplete artwork. Little House uses the saved version 1 screenshot of its illustrated dollhouse; its current app offers both a 3D cleanup game and the illustrated edition. The Villains design and Proof Lab are historical previews, not statements about current production pricing or capabilities.

The Amazon Product Momentum draft has no saved version, live URL, or screenshot, so it is not included. At the user's request for customer access, nine previously owner-only published Sites were made public; Sayward and EmbroideryCalc were already public. Editor access was preserved. The gallery stores image files locally, not expiring signed screenshot URLs. Public access lets visitors use each app; it does not create shared account storage across the separate apps.

## Customer accounts follow-up

The requested sign-in methods are Google and email/password with email password recovery. Clerk's free Hobby plan was selected through the existing Sentinel Vercel project. Installation requires the account owner to accept Clerk's marketplace terms before provider setup and account integration can proceed. No custom password tables or recovery-code system are included in this gallery change. Account-owned agent keys and authenticated discussion attribution remain part of that follow-up, using the current backend and moderation controls.

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
