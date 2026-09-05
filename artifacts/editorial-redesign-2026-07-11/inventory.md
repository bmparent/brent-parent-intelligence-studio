# Eidos Works Editorial Redesign — Inventory

Date: 2026-07-11

Branch: `agent/eidos-editorial-redesign`

Source commit: `eb695212172d2b2b24efc74bb130cbfae5045893`

## Source of truth

- Repository: `https://github.com/bmparent/brent-parent-intelligence-studio`
- Production domain: `https://eidos-works.com`
- Authoritative local checkout: `C:\Users\bmpar\OneDrive\Documents\brent-parent-intelligence-studio-live`
- The originally focused workspace folder is a source copy with an unusable/empty `.git` directory. It is not being edited.
- `origin/main` contains the required PERNR case-study commit and is two commits newer than the previous local `main` checkout.
- The redesign branch was created directly from `origin/main` so the Snapshot, Command Center, editorial automation, and PERNR work remain in scope.

## Production evidence

The live homepage was inspected separately in the in-app browser.

| Signal | Production | `origin/main` local build |
| --- | ---: | ---: |
| Sections | 42 | 9 |
| H2 headings | 12 | 8 |
| H3 headings | 88 | 15 |
| Article containers | 88 | 12 |
| Buttons | 69 | 2 |
| Links | 67 | 29 |
| Images | 32 | 6 |
| Canonical | `https://eidosworks.pages.dev/` | `https://eidos-works.com/` |

Production still serves the June 8-era experience. The live navigation is anchor-heavy and exposes Home, Services, Work, Diagnostics, Eidos Brain, Insights, and Pricing. The newer source already reduces density and corrects the canonical domain, but it still does not implement the requested route architecture or three evidence-led primary case studies.

Screenshots:

- `before/production-home-1440x1024.png`
- `before/production-home-desktop.png`
- `before/origin-main-home-1440.png`

## Current source routes

- `/`
- `/snapshot`
- `/snapshot/start`
- `/snapshot/success`
- `/snapshot/result/:resultToken`
- `/services/agentic-seo`
- `/work/pernr-access-gate`
- `/insights`
- `/insights/:slug`
- `/editorial-policy`

## Required new public routes

- `/work`
- `/work/production-dashboard`
- `/work/storefront-experience`
- `/services`
- `/services/digital-experiences`
- `/services/storefront-access-systems`
- `/services/dashboards-workflow-tools`
- `/about`
- `/contact`
- `/lab/eidos-brain`

Existing valid Snapshot, Insights, Agentic SEO, editorial-policy, and PERNR routes must remain compatible. Private Snapshot result routes must remain excluded from discovery files and retain noindex, nofollow, no-referrer behavior.

## Production-critical integrations to preserve

- Cloudflare Pages Functions under `functions/api`
- Project inquiry delivery with honest email fallback
- Snapshot KV/Stripe/OpenAI flow and disabled production launch flags
- Google Apps Script Command Center scaffolding
- Insights generation, validation, feed, sitemap, and social-card generation
- Static SSR/prerender behavior
- Existing Cloudinary asset URLs
- PERNR safe public demo with fictional credentials only

## Baseline validation

- `npm ci` — passed; 190 packages installed. NPM reported 5 dependency vulnerabilities (1 low, 4 high); no automatic dependency mutation was applied.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run test:snapshot` — passed.
- `npm run validate:insights -- --skip-source-fetch` — passed for 10 published articles.
- `node scripts/setup-google-drive-command-center.ts --check` — passed: 12 folders, 11 Docs, 4 workbooks, 29 tabs.
- `npm run build` — passed.
- `npm run validate:insights:dist` — passed.
- `npm run verify:urls` — passed.
- `npm run verify:prerender` — initially failed because Windows path separators prevented the explicit PERNR/InkSoft exception from matching. `scripts/verify-prerender.mjs` now normalizes labels to forward slashes; the verifier passes.

Baseline production bundle:

- CSS: 43.28 kB raw / 9.22 kB gzip
- Application JS: 143.38 kB raw / 38.42 kB gzip
- React vendor JS: 190.21 kB raw / 59.82 kB gzip
- Prerendered root shell: 2.70 kB raw / 0.91 kB gzip before route HTML injection

## Cloudflare status

- Installed Wrangler version: `4.110.0`.
- Repository documentation names the existing Pages project `eidosworks`, production branch `main`, output directory `dist`, and custom domain `eidos-works.com`.
- Live authenticated project enumeration is not currently available: `wrangler whoami` opened a Cloudflare OAuth login flow. The flow was stopped without signing in or changing external state.
- Preview and production deployment require Brent to complete that Cloudflare login in the active environment, unless an approved noninteractive credential is already made available.

## Supporting source availability

The named supporting files were searched in the attachment tree and common Documents roots but were not found:

- `deep-research-report (2).md`
- `deep-research-report (1).md`
- `clean-style-UI-UX-inksoft.txt`
- `Site audit suggestions.docx`

The redesign brief itself contains the usable constraints from those sources. No unsupported claims will be inferred from absent documents.

## Preservation decision

No old assets are being deleted. Homepage-only material will be relocated or removed from rendering while remaining available to case studies, Lab, Snapshot, or the media registry.
