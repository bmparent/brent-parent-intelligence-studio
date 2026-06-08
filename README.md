# Eidos Works

Eidos Works is the public-facing creative technology studio by Brent Parent. It evolved from the Brent Parent Intelligence Studio portfolio and now presents custom storefronts, graphic design and mockups, production dashboards, workflow automation, and Eidos Brain / Sentinel intelligence prototypes.

## Stack

- Vite + React + TypeScript
- Babylon.js as progressive enhancement for subtle canvas and glass-edge effects
- Static prerender step for crawlable first-load HTML
- Cloudflare Pages Functions for diagnostics and project inquiry delivery
- Cloudinary-hosted logos, profile imagery, storefront examples, mockups, and campaign assets

## Local Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm run verify:urls
```

## Cloudflare Pages Deployment

Use the existing Cloudflare Pages project connected to GitHub.

Recommended settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Node version: 24 LTS
Production branch: main
Root directory: /
```

The production URL defaults to `https://eidosworks.pages.dev` in metadata and public crawler files. If the final production domain changes, set `VITE_SITE_URL` in Cloudflare Pages and update `public/sitemap.xml`, `public/robots.txt`, and `public/feed.xml` to match.

## Project Inquiry Delivery

The Start a Project flow posts to `functions/api/project-inquiries.ts`.

If no delivery env vars are configured, the UI does not fake a sent state. It returns a generated brief with mailto and copy-to-clipboard fallback.

Optional Cloudflare Pages environment variables:

```text
CONTACT_EMAIL
CONTACT_WEBHOOK_URL
RESEND_API_KEY
CONTACT_FROM_EMAIL
```

The existing diagnostic layer can still use:

```text
OPENAI_API_KEY
OPENAI_MODEL
```

## Public Content

- Sticky navigation with Home, Services, Work, Diagnostics, Eidos Brain, Insights, Pricing, and Start a Project
- Live InkSoft storefront case studies with visit and on-demand preview actions
- Deduplicated Cloudinary media explorer with category filters, accordion groups, featured strip, and lightbox
- DG Printavo Production Reports case study
- Eidos Brain / Sentinel scenarios
- Pricing and engagement models with scoped language
- Insights area with seed articles, RSS feed, sitemap entries, JSON-LD, and llms.txt
- Real Start a Project intake flow with review-before-submit behavior
