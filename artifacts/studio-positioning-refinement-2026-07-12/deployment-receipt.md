# Deployment Receipt

Date: 2026-07-12

- Production URL: https://eidos-works.com
- Cloudflare Pages project: `eidosworks`
- Production branch: `main`
- Final source commit: `9f7c781` (`Defer email links until after hydration`)
- Final production deployment ID: `eeddf874-7035-4718-8fe7-4c734aed486c`
- Immutable deployment URL: https://eeddf874.eidosworks.pages.dev
- Primary refinement commit: `ab9bb0b2a8a6127dd308b3ac6d874bac9f313df5`
- Hydration regression commits: `b4a65b7`, `9f7c781`
- Deployment status: production, verified

Post-deployment receipts:

- 16 required public routes returned HTTP 200.
- 16-route browser audit found one H1 per route, no missing alt attributes, no broken images, no empty interactive controls, and no horizontal overflow.
- Clean production browser session found zero warnings and zero errors.
- Cloudflare did not rewrite the final email links before hydration.
