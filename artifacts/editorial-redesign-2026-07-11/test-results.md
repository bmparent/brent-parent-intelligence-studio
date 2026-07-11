# Eidos Works Editorial Redesign — Validation Receipt

Date: 2026-07-11

## Passed commands

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run verify:prerender`
- `npm run verify:editorial`
- `npm run verify:urls`
- `npm run validate:insights:dist`
- `npm run validate:insights`
- `npm run test:snapshot`
- `node scripts/setup-google-drive-command-center.ts --check`

## Build receipt

- HTML shell: 2.89 kB raw / 0.98 kB gzip
- CSS: 61.53 kB raw / 12.50 kB gzip
- Application JavaScript: 166.04 kB raw / 44.62 kB gzip
- React vendor JavaScript: 190.21 kB raw / 59.82 kB gzip
- SSR entry: 209.57 kB raw / 49.68 kB gzip
- Babylon.js is not present in the homepage build chunks.

## Editorial verification

- Public routes checked: 15
- Homepage density: 7 sections, 6 H2, 13 H3, 9 article elements, 2 buttons, 31 links, and 6 images.
- Production-before density: 42 sections, 12 H2, 88 H3, 88 article-like elements, 69 buttons, 67 links, and 32 images.

## Browser verification

- Responsive widths: 360, 390, 430, 768, 1024, and 1440.
- No horizontal overflow at checked widths.
- Mobile navigation focus and Escape behavior passed.
- Contact fallback state passed.
- Fictional PERNR approved and denied states passed.
- No final browser-console errors observed.

## Limitations

- Lighthouse field-style performance metrics were not available in the in-app browser, so LCP, INP, and CLS targets are not claimed as measured.
- Automated and manual checks do not establish complete WCAG 2.2 AA conformance.
- The hosted browser screenshot endpoint failed to capture the preview tab; the exact deployed `dist` build is visually documented with local browser screenshots, and hosted behavior is documented with DOM, console, and HTTP receipts.

## Deployment verification

- Cloudflare Pages project: `eidosworks`
- Preview deployment: `d5ead3fe-c8bc-4fea-9664-6e957caefac3`
- Production deployment: `0d34c632-03d1-4ffc-b757-fd0efe2d9791`
- Deployed source: `7ab12cc1ea6ac2576f235f8aa105d151f70dbc69`
- Production domain: `https://eidos-works.com`
- Required production routes: 13 of 13 returned HTTP 200.
- Production homepage: new hero present, selected-work heading present, `eidos-works.com` canonical present, stale `eidosworks.pages.dev` reference absent.
- Production browser: 7 sections, 6 H2, 13 H3, 9 article elements, 2 buttons, 31 links, 6 images, no horizontal overflow, and no console warnings/errors.
