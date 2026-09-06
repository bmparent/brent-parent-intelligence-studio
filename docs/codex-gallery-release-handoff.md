# Codex handoff: calculator and Eidos gallery release

Complete the remaining Cloudflare deployment work for Eidos Works. The user has approved going live, adding the working embroidery calculator to the gallery, and fixing issues found during verification. Use the existing authenticated Cloudflare/GitHub environment; preserve unrelated work and existing services. Carry the work through verification and report the actual deployment result.

## Sources and completed work

- Portfolio repository: `bmparent/brent-parent-intelligence-studio`. Fetch current `main`; preserve newer commits. PR #12 is merged as `4b60e9490e8023e542c69aab9a55d8f7b6711f9c`. It adds three themed storefronts, five InkSoft homepage references, visible Nighttime fireworks and consistent collection/product/bag designs. All CI gates passed.
- The follow-up calculator-gallery change replaces the older EmbroideryCalc Preview entry with EmbroideryCalc Pro, a fresh live-homepage capture, and `https://embroiderycalc-pro.pages.dev/`. It places the calculator first so it appears on the Eidos homepage as well as the full Work gallery. Gallery count stays 15. Confirm that this follow-up is present in `main` before deploying.
- Portfolio hosting: direct-upload Cloudflare Pages project `eidosworks`, domain `eidos-works.com`. GitHub merge alone does not deploy it. Read `AGENTS.md`, `docs/site-gallery.md`, `docs/storefront-demos.md`, and the existing deployment documentation.
- Calculator repository: `bmparent/emb-calc`. On September 6 its main commit was `a3f088c3551cfaae0b859bdd8c8376860ca76700`; fetch again before making decisions. Read its README and CI workflow.

## Resolve the calculator deployment mismatch

At `https://embroiderycalc-pro.pages.dev/`, the browser showed the older EmbroideryCalc Pro interface with Printavo Import, Generate Matrix, and AI Production Insights. The repository main documents a newer Astro site, with a standalone browser-local calculator at `/calculator/`, DST analysis, image colors and Madeira matching. Do not assume the deployed project is built from current main.

1. Inspect the Cloudflare project, deployment source/branch/build settings and production asset revision. Identify whether the older integration-based app is intentionally used operationally. Preserve its source and a rollback deployment before changing anything; do not remove working private workflows, data or bindings to publish the showcase.
2. Establish a safe public calculator destination. Verify that unauthenticated visitors cannot access real Printavo orders or private shop data and that any AI feature has the intended access and cost controls. The browser showed Printavo status “Ready”; no private order search was attempted and this is not proof of an access-control defect. The sample calculation displayed AI insights, so do not describe that deployed version as having no AI service.
3. Prefer the existing standalone implementation for the public showcase when appropriate. Run `npm ci`, `npm test`, `npm run typecheck`, and `npm run build` in the calculator repository. Verify `SITE_URL`, the calculator route, static assets and any consent-gated analytics configuration. Keep optional analytics disabled unless the existing approved settings are valid. Do not reintroduce AI or ERP dependencies into the browser-local calculator.
4. Deploy the verified public calculator to the intended Cloudflare project. If the existing project must remain operationally private, use a separate public preview/destination under the authorized account instead of overwriting it. A Site conversion is optional, not necessary for the Eidos gallery; avoid maintaining duplicate public versions without a reason.
5. Test a synthetic manual estimate on the actual public destination. Verify the intended DST/color tools with non-customer fixtures, mobile layout, keyboard controls and browser-local data behavior. If deployment changes the homepage, refresh the Eidos gallery screenshot, title, description and URL to match what visitors will actually see.

## Deploy Eidos Works

1. Use a clean checkout/worktree of the current merged portfolio `main`. Confirm the calculator record in `src/data/siteGallery.json`, its two WebP assets, all five storefront routes and the existing gallery records are present.
2. Run the established gates:
   - `npm ci --no-audit --no-fund`
   - `npm run lint`
   - `npm run test:platform`
   - `npm run test:analytics`
   - `npm run test:snapshot`
   - `npm run build`
   - `npm run verify:prerender`
   - `npm run verify:editorial`
   - `npm run validate:insights -- --skip-source-fetch`
   - `npm run validate:insights:dist`
   - `npm run verify:urls`
   - `npm run build:functions`
3. Record the current Cloudflare deployment for rollback. Deploy the complete app and existing Pages Functions with the verified source commit:

   `node node_modules/wrangler/bin/wrangler.js pages deploy dist --project-name eidosworks --branch main --commit-hash <verified-main-commit> --commit-dirty=false`

   Preserve production database bindings, runtime variables, Sentinel relay, inquiry delivery, analytics consent and Stripe configuration. Do not copy the local Wrangler fixture over production settings.
4. Verify the live domain after deployment:
   - `/` and `/work#site-gallery`: calculator thumbnail loads, preview opens, live link reaches the verified calculator, search/filter works, Escape closes the dialog and returns focus.
   - `/work/nighttime-spectaculars`: rising fireworks and bursts are visibly present, Pause/Resume works, reduced motion is respected.
   - `/work/holidays-in-hollywood`, `/work/disney-villains`, `/work/beauty-and-the-beast`, `/work/jingle-bell-jingle-bam`: imagery, responsive layouts, filters, product inspection, example options and temporary bag work; Jingle Bell front/back views switch correctly.
   - Check browser errors, broken assets, narrow-screen overflow and new-route metadata. Confirm no real orders or payments are created by the demo bag.
5. Fix concrete regressions, rerun the affected checks and redeploy as needed. Return the verified source commits, deployment identifiers/URLs, checks performed, and any precise unresolved blocker. Distinguish merged, deployed and production-verified work.
