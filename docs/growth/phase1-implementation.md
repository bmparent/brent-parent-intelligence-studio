# Phase 1 implementation record

## Starting point

Inspected the attached brief, current production deployment, repository branches, open PRs, source, inquiry Worker, analytics, privacy controls, service pages, and release workflows. Production and `origin/main` began at `235286d0d985c022e262d7e3790aaeaba6696780`. The requested working folder was not a usable Git checkout. The older live checkout contained unrelated editorial edits, so this work uses an isolated branch/worktree from current main.

The original analytics test and 27 platform/inquiry tests passed locally. Upstream Site quality passed for the baseline: https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/35138063984 . The baseline Playground release workflow failed after upload because its custom-domain content probe did not observe the build from the hosted runner: https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/35138064075 . Cloudflare nevertheless identified the intended source as canonical production. This is recorded separately from successful production acceptance.

An early local build attempt overlapped the creation of the new generated route manifest and failed on that missing file. It is retained as a failed attempt, not a baseline regression claim. The completed manifest and subsequent builds resolve it.

## Decisions

- Existing three service pillars and Friction Review offer remain the basis of the acquisition pages. No hero, glass engine, account, Playground, Sentinel, Wellway, or payment feature expansion.
- D1 was available in the Cloudflare account, but the only existing database was unrelated Data Graphics data. Created a separate Eidos Works growth database rather than mixing business data or changing Sentinel.
- First-party measurement shares the existing analytics-consent decision. Session attribution survives full page navigation after consent, with no tracking before permission.
- Server-confirmed inquiry delivery is the conversion boundary. Optional telemetry cannot turn a failed provider response into a successful submission, or block a valid delivery.
- A dedicated owner-only aggregate endpoint and CLI were chosen over a new owner UI because account integration is outside this release.
- Retention has both request-time pruning and a daily dedicated Worker, so inactivity does not leave old sessions indefinitely.
- Rasterized the approved existing social SVG locally for broader social-card compatibility; no generated brand artwork or paid imagery.
- Added a real static 404 and narrowly scoped empty-shell rewrites for existing private dynamic routes. Prerender validation explicitly verifies the empty shell and private metadata rather than treating it as a public content page.
- Hosted CI uses the established stable Pages QA origin plus canonical deployment metadata. Actual canonical-domain acceptance remains a separate required release proof from the local environment.

## Evidence boundaries

`artifacts/growth/phase1-20260920/quality.json` records the automated gates. `browser-local/` is controlled SQLite/provider acknowledgement evidence, not delivered customer inquiries. `browser-production/` will hold canonical browser evidence after release. Only a necessary explicitly labeled QA inquiry may be delivered for release proof. No historical traffic or client results are manufactured.

`production-responses.json` and `deployment-receipt.json` are retained after release. The source commit cannot contain its own final deployment receipt without changing its identity; final receipts live in the local evidence package and CI artifacts, with hashes in the final manifest. The package is outside the public build.

## Remaining measurement limits

The system measures consented tab sessions, with daily rotation, rather than every visitor or unique people. Source attribution is first-touch within that session. Public means not identified as QA or obvious automation; it is not proof of human identity. Blockers and network failures can reduce counts. Historical GA4 figures are unavailable through the current deployment runtime. No social distribution has been performed automatically.

## Reproduction

Run `node scripts/growth-quality.mjs`, then start `node --import tsx scripts/growth-local-server.ts` and run `node scripts/verify-growth-browser.mjs` with the available Playwright module selected through `PLAYWRIGHT_MODULE`. The Browser plugin/skill was not available in this session; existing Playwright engines supplied desktop Chromium and mobile WebKit acceptance.

Retention deployment can be repeated from the repository root with `npx wrangler deploy --config ops/growth-retention/wrangler.jsonc` using an already-authorized Cloudflare identity. The owner report and launch-kit commands are documented in `phase1-growth-system.md` and `phase1-launch-kit.md`.
