# Site gallery

The homepage shows the first six records from `src/data/siteGallery.json`. The Work page shows the complete collection at `/work#site-gallery`, with category filters, search, and a larger image preview. Add future Sites to that JSON file without changing the components.

Each record includes `slug`, `title`, `category`, `description`, `image`, `thumbnail`, and `date`. Add `url` only when the Site has a public destination suitable for portfolio visitors. Use the existing categories Games, Tools, Experiments, or Storefronts. Keep private project URLs out of the public data.

Add a genuine homepage screenshot as `public/images/site-gallery/<slug>.webp` and a smaller `<slug>-thumb.webp`. Keep the screenshot legible, free of loading states, and representative of the project. Existing full images fit within 1440×1100; thumbnails fit within 640×480. The gallery fixes image display dimensions to avoid layout jumps. Place new records first to feature them on the homepage.

## Image provenance

The September 6, 2026 gallery covers all ten built Sites returned by the account inventory. Eight images use a Sites-provided screenshot. Proof Lab and Disney Villains were recaptured from their saved React source because the supplied screenshots showed raw code or incomplete artwork. Little House uses the saved version 1 screenshot of its illustrated dollhouse; its current local preview could not start in the capture environment. The description labels that edition explicitly. The Villains design and Proof Lab are historical previews, not statements about current production pricing or capabilities.

The Amazon Product Momentum draft had no saved version, live URL, or screenshot, so it is not included. No Sites sharing settings or source projects were changed. The gallery stores image files locally, not expiring signed screenshot URLs.

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
