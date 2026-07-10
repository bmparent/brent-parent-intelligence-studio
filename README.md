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
npm run content:generate
npm run validate:insights
npm run typecheck
npm run lint
npm run build
npm run validate:insights:dist
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

The production URL defaults to `https://eidos-works.com` in metadata and generated crawler files. Set `VITE_SITE_URL` in Cloudflare Pages only if the production domain changes.

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

## Insights Automation

Insights content is managed in `src/data/articles.json`. Run this full gate before publishing an article:

```bash
npm run publish:insight-run -- --slot=manual
```

The gate regenerates public crawler assets, validates article metadata and sources, runs lint/build checks, validates prerendered article HTML, and writes a run report under `artifacts/insights/runs/`.

Production verification for a deployed article:

```bash
npm run verify:production-insight -- --slug=<article-slug>
```

See `docs/insights-automation.md` and `AGENTS.md` for the editorial schedule, topic pillars, source rules, deduplication checks, failure behavior, and Codex automation expectations.
