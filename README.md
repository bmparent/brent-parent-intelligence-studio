# Eidos Works

See [redesign release and operations](docs/eidos-platform-release.md) for the new platform, account setup, token budgets, payment fulfillment, and deployment gates.

The production website for **Eidos Works**, Brent Parent's studio for digital experiences and operational tools. The public site combines cinematic project showcases, studio services, an edited Insights publication, a separately hosted Sentinel Lab, moderated community questions, a token-conscious Eidos assistant, and a first paid starter package.

Production domain: `https://eidos-works.com`

## Stack

- Vite 8, React 19, and TypeScript
- Static SSR/prerendering for public discovery pages
- Cloudflare Pages with Pages Functions
- One D1 database for community records, assistant quotas, and purchase entitlements
- Cloudflare KV for the separately gated legacy Snapshot request/report storage
- Stripe Checkout for the $29 Cinematic Starter download (legacy Snapshot remains independently gated)
- Published-source Eidos answers by default, with an optional capped OpenAI follow-up
- Existing OpenAI Responses/Image API integration for the independently gated Snapshot experiment
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
npm run verify:editorial
npm run verify:urls
npm run test:snapshot
npm run validate:insights -- --skip-source-fetch
npm run validate:insights
node scripts/setup-google-drive-command-center.ts --check
```

The build creates `dist`, generates article social images, refreshes `sitemap.xml`, `feed.xml`, and `llms.txt`, and prerenders every public route. The source validator performs DNS-aware public-network checks before fetching external references; use `--skip-source-fetch` for untrusted pull-request content.

## Public routes

- `/` — concise editorial studio homepage
- `/work` — selected case-study index
- `/work/pernr-access-gate` — private storefront roster-gate case study and safe demo
- `/work/production-dashboard` — production reporting case study
- `/work/storefront-experience` — hosted storefront transformation case study
- `/services` — three service families
- `/services/digital-experiences` — websites and customer-facing UX
- `/services/storefront-access-systems` — storefront and roster-access work
- `/services/dashboards-workflow-tools` — reporting, automation, and internal tools
- `/services/agentic-seo` — dedicated Agentic SEO service page
- `/about` — Brent Parent and the design/operations background behind Eidos Works
- `/insights` — edited, source-linked publication
- `/insights/:slug` — prerendered articles
- `/contact` — low-friction project inquiry and direct email fallback
- `/lab/eidos-brain` — proof-stage Eidos Brain research, limits, and maturity
- `/snapshot` — Eidos Snapshot offer
- `/snapshot/start` — private intake and checkout start
- `/snapshot/success` — processing state
- `/snapshot/result/:resultToken` — private, unguessable report route
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
