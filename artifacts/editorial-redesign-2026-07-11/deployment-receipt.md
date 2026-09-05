# Eidos Works Cloudflare Deployment Receipt

Date: 2026-07-11

## Project identity

- Cloudflare account: `1brent.bm@gmail.com's Account`
- Pages project: `eidosworks`
- Project domains: `eidosworks.pages.dev`, `eidos-works.com`
- Production branch: `main`
- Git provider: none

The lack of a Git provider connection explains why newer GitHub main work was not automatically appearing on the custom domain.

## Preview

- Branch: `editorial-redesign-preview`
- Source: `7ab12cc1ea6ac2576f235f8aa105d151f70dbc69`
- Deployment ID: `d5ead3fe-c8bc-4fea-9664-6e957caefac3`
- Deployment URL: `https://d5ead3fe.eidosworks.pages.dev`
- Alias URL: `https://editorial-redesign-preview.eidosworks.pages.dev`
- Verification: 17 required public/resource URLs returned HTTP 200; browser-rendered homepage density, H1, canonical, overflow, and console passed.

## Production

- Branch: `main`
- Source: `7ab12cc1ea6ac2576f235f8aa105d151f70dbc69`
- Deployment ID: `0d34c632-03d1-4ffc-b757-fd0efe2d9791`
- Deployment URL: `https://0d34c632.eidosworks.pages.dev`
- Custom domain: `https://eidos-works.com`

Verified production HTTP 200 responses:

- `/`
- `/work`
- `/work/pernr-access-gate`
- `/work/production-dashboard`
- `/services`
- `/services/agentic-seo`
- `/about`
- `/insights`
- `/contact`
- `/lab/eidos-brain`
- `/snapshot`
- `/sitemap.xml`
- `/llms.txt`

Production homepage checks:

- New editorial hero present.
- Selected-work heading present.
- Canonical is `https://eidos-works.com/`.
- No `eidosworks.pages.dev` reference in rendered HTML.
- 7 sections, 6 H2, 13 H3, 9 article elements, 2 buttons, 31 links, and 6 images.
- No horizontal overflow at the verified desktop viewport.
- No browser console warnings or errors.
