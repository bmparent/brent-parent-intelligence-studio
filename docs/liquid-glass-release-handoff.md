# Release the approved liquid-glass header

The approved preset and shared Eidos Works integration are complete on `codex/liquid-glass-header-20260909` in `bmparent/brent-parent-intelligence-studio`.

The authoring workspace could access GitHub but `wrangler whoami` reported **not authenticated**. It did not deploy or change the production website. Eidos Works uses the existing direct-upload Cloudflare Pages project **eidosworks**, serving **eidos-works.com**; merging alone does not deploy it.

## Codex handoff

Use the already connected Cloudflare and GitHub environment to finish this header release. Read `AGENTS.md`, `docs/liquid-glass-preset.md`, the pull request, and the existing production release documentation. Preserve the current site, its member/account changes, functions, bindings, content, payments, analytics, and Sentinel relay.

1. Fetch current main and `codex/liquid-glass-header-20260909`. Inspect the complete diff and resolve any new conflicts without dropping unrelated work. The expected scope is the shared header decoration/controller, its CSS, imported preset JSON, reference documentation, and a small glass regression test added to the existing quality workflow.
2. Confirm the pull request's quality checks. Run the existing build, type/lint, and prerender gates as needed, including `npm run test:glass`. Keep the approved values: edge bend 16, magnification 1.03, frost 1.2px, and restrained edge-only prism light.
3. Verify the actual browser experience: opaque at 0–4px scroll; halfway through the transition at 38px; fully liquid at 72px; opaque again at the top. Check home plus an interior light page, desktop and mobile, menu open/close/Escape, navigation, outside pointer release, and touch cancellation. The header's hit targets must stay fixed. Check restored scroll positions and reduced motion. Safari has a frosted fallback; do not claim native refraction parity without device verification.
4. Retain the current production deployment as the rollback target, merge the reviewed change, and deploy the resulting current main to the existing **eidosworks** Pages project through its established direct-upload process. Do not create a replacement Site or change domain, bindings, or unrelated configuration.
5. Verify the exact production asset revision at **https://eidos-works.com**, not just the GitHub merge. Confirm solid-to-glass behavior on the home page and at least one interior page, plus the mobile menu. Report the production deployment ID and any remaining browser limitations. If a regression appears, roll back this frontend deployment while preserving all data and backend configuration.

## Checks completed during implementation

- Build, TypeScript, ESLint, and prerender validation passed.
- Numerical tests cover scroll thresholds, rounded hit geometry, and refresh-rate-independent spring settling.
- Chrome browser checks confirmed the opaque top state, live homepage refraction after scrolling, navigation to Insights with a solid header, and the 390px mobile menu and Escape behavior.
- A 390px in-browser integration fixture passed nine assertions: opaque top; 50% transition at 38px; full glass after scrolling; contrast over a light page; touch pressure/light; transparent center; cancellation cleanup; exact return to solid; no horizontal overflow.
- The browser extension emitted its own metadata errors and some scroll/screenshot requests timed out. Subsequent DOM reads and screenshots verified the relevant states; no application errors were observed. Physical iPhone/Safari testing was not performed.
