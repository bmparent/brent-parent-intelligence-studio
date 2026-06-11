# Eidos Works

Eidos Works is a static-prerendered Vite + React platform for current UI/UX standards, agentic SEO, AI-search visibility, small-business automation, and Brent Parent's custom systems work.

The site keeps the service conversion path, but the public architecture is now an editorial intelligence hub with route-level metadata, structured article pages, interactive diagnostics, resource placeholders, and trust-preserving monetization surfaces.

## Stack

- Vite + React + TypeScript
- Static prerendering through `scripts/prerender.mjs`
- Cloudflare Pages compatible output in `dist/`
- Cloudflare Functions support preserved under `functions/`
- Optional Babylon.js and intelligence-agent layers preserved as progressive enhancements

## Information Architecture

Top-level routes:

- `/`
- `/intelligence`
- `/ui-ux`
- `/agentic-seo`
- `/automation`
- `/tools`
- `/newsletter`
- `/work-with-eidos`

Editorial and tool routes are defined in `src/data/platform.ts` and rendered through `src/components/platform/Pages.tsx`.

## Monetization Surfaces

The monetization system is intentionally quiet:

- `SponsorUnit` renders only active sponsor records from `src/data/platform.ts`.
- Placeholder sponsors are inactive by default.
- Recommended tools use normal outbound URLs unless a real affiliate relationship is added.
- Affiliate or sponsored links must use `rel="sponsored noopener noreferrer"`.
- Disclosures live at `/disclosures`.

No intrusive ads, popups, interstitials, autoplay ad units, sticky bottom ad bars, or fake affiliate links are included.

## Newsletter and Resources

Newsletter forms are no-op by default. They show a clear "not configured" status rather than pretending a signup succeeded.

Future providers can be wired to Beehiiv, ConvertKit, Mailchimp, Buttondown, or a custom Cloudflare Worker endpoint.

Downloadable resource surfaces are placeholders until final PDFs or templates are prepared:

- Agentic SEO Readiness Checklist
- UI/UX Site Audit Checklist
- Small Business Automation Scorecard
- AI Search Visibility Setup Guide
- Design System Starter Checklist

## SEO and Discovery

The build generates:

- Route-level titles and descriptions
- Canonical URLs
- Open Graph and Twitter metadata
- Article, Organization, WebSite, and BreadcrumbList JSON-LD
- `sitemap.xml`
- `robots.txt`
- `rss.xml`
- `llms.txt`
- `humans.txt`
- Cloudflare `_redirects`

`llms.txt` is included as a human-readable orientation index, not as an SEO ranking mechanism.

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
npm run preview
```

The production build output is written to `dist/`.

## Cloudflare Pages Deployment

Recommended settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Production branch: main
Root directory: /
```

## Remaining Configuration TODOs

- Add real affiliate URLs only after partner links exist.
- Add real sponsor assets only after partner approval.
- Connect a real newsletter provider.
- Add a privacy-conscious analytics provider if measurement is approved.
- Replace resource placeholders with finished downloadable PDFs or templates.
