# Eidos Works

The production website for **Eidos Works**, Brent Parent's customer-facing web and systems studio. The site presents website and UX redesign, storefront platform experiences, dashboards and automation, agentic SEO, organized Insights, and the $5 Eidos Snapshot product.

Production domain: `https://eidos-works.com`

## Stack

- Vite 8, React 19, and TypeScript
- Static SSR/prerendering for public discovery pages
- Cloudflare Pages with Pages Functions
- Cloudflare KV for durable Snapshot request/report storage
- Stripe Checkout for the one-time $5 Snapshot payment
- OpenAI Responses API and Image API for paid Snapshot generation
- Optional Google Apps Script integration for the private Eidos Works Command Center
- Existing Cloudinary assets for Eidos Works branding and selected work

No new paid CMS, CRM, booking system, database, or automation subscription is required.

## Local development

```bash
npm ci
npm run dev
```

For Pages Functions:

```bash
cp .dev.vars.example .dev.vars
npm run preview:cf
```

Never commit `.dev.vars`, `.env*`, API keys, Stripe secrets, or client data.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm run verify:prerender
npm run verify:urls
npm run test:snapshot
npm run validate:insights -- --skip-source-fetch
npm run validate:insights
node scripts/setup-google-drive-command-center.ts --check
```

The build creates `dist`, generates article social images, refreshes `sitemap.xml`, `feed.xml`, and `llms.txt`, and prerenders every public route. The source validator performs DNS-aware public-network checks before fetching external references; use `--skip-source-fetch` for untrusted pull-request content.

## Public routes

- `/` — customer-facing studio homepage
- `/snapshot` — Eidos Snapshot offer
- `/snapshot/start` — private intake and checkout start
- `/snapshot/success` — processing state
- `/snapshot/result/:resultToken` — private, unguessable report route
- `/services/agentic-seo` — dedicated Agentic SEO service page
- `/insights` — centralized knowledge hub
- `/insights/:slug` — prerendered articles
- `/editorial-policy` — sourcing, assisted-editing, and correction policy

## Insights publishing

`src/data/articles.json` is the single source for published Insights. A publish run generates social cards and discovery files, validates metadata and source links, builds the site, checks prerendered HTML, and writes a receipt under `artifacts/insights/runs/`.

```bash
npm run publish:insight-run -- --slot=manual
npm run verify:production-insight -- --slug=<article-slug>
```

The scripts do not commit, push, deploy, or schedule themselves. See `docs/insights-automation.md` and `AGENTS.md` for the editorial workflow and external automation expectations.

## Cloudflare Pages

Use the existing GitHub-connected Pages project.

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Node version: 24
Production branch: main
Root directory: /
Custom domain: eidos-works.com
```

Production Snapshot checkout and the public API remain independently disabled. Keep `VITE_SNAPSHOT_CHECKOUT_ENABLED=false` and `SNAPSHOT_PUBLIC_ENABLED=false` until the durable fulfillment, state ownership, recovery-link, Turnstile/rate-limit, Stripe, and `SNAPSHOT_STORE` checks in `docs/EIDOS_SNAPSHOT.md` pass.

## Project inquiries

The contact form posts to `/api/project-inquiries`. When `GOOGLE_APPS_SCRIPT_WEBHOOK_URL` or `CONTACT_WEBHOOK_URL` is configured, the function sends a minimal validated record. Without delivery configuration, it returns an honest `mailto:` fallback to `projects@eidos-works.com`.

## Documentation

- `docs/EIDOS_SNAPSHOT.md`
- `docs/COMMAND_CENTER.md`
- `docs/EMAIL_ROUTING.md`
- `docs/AGENTIC_SEO_IMPLEMENTATION.md`
- `docs/insights-automation.md`
- `docs/DEPLOYMENT.md`
