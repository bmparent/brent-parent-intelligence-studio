# Insights automation recovery — 2026-10-13

## What changed and why

The October 12 scheduled essay was valid, but its fresh worktree had no executable ESLint. Earlier retained drafts also used old site revisions that failed private-shell or sitemap checks. Current main passed those site checks in CI before this repair. The shared checkout's unrelated July changes and all older retained drafts were preserved.

This repair installs the existing lockfile in a clean worktree, resumes exactly one retained essay, adds local dependency entry-point checks, includes editorial/privacy and Functions checks in the publisher, and saves receipts while each command runs. Entry-point checks catch absent or visibly partial installs; they cannot prove every transitive dependency or native binary is intact. The quality commands remain authoritative.

The three existing schedules retain their IDs, local project, model, reasoning effort, notifications, and cadence: Monday 08:00, Wednesday 13:00, Friday 18:00 America/New_York. Their prompts now require dependency installation, retained-slot recovery, nine local gates, and waiting for the existing production workflow. No duplicate schedules or new services were created.

The current `Playground editor release` workflow already performs the Cloudflare Pages Direct Upload after full site/browser checks on main. The publishing documentation incorrectly said a merge never triggers deployment. It now explains how to wait for that exact commit's workflow, inspect the receipt, and verify the article on production without racing CI.

## Article recovery

- Slug: `after-submit-website-tell-truth-about-waiting`
- Original scheduled slot: October 12, morning.
- Original failed receipt: `2026-10-12T12-05-55-morning/run_report.json`, preserved in its original worktree.
- The same essay is resumed on current main; older backlog is not published.
- Publication/modified timestamps reflect October 13, the actual recovery day; `recovery.json` retains the original scheduled timestamp.
- Author/byline: Eidos Works Editorial.
- Sources are intentionally empty for a reflective essay without news, numerical results, or externally sourced factual claims.
- CTA uses the current `/contact` route.
- Public source/reference blocks remain absent; existing article metadata and validation rules remain intact.

## Validation and release evidence

- Clean `npm ci --no-audit --no-fund`: passed, 190 packages installed.
- Initial `npm run content:generate` and trusted `npm run validate:insights`: passed for 19 articles.
- `node --test scripts/test-insight-run.mjs`: 6/6 passed.
- `npm run publish:insight-run -- --slot=morning`: all nine gates passed; receipt `../runs/2026-10-13T18-51-35-morning/run_report.json`. Lint had zero errors and one existing Wellway Fast Refresh warning.
- PR checks, merge, provider upload, and public readback: separate states; see `recovery.json` and the final release receipt.

## Files and artifacts

- Runner and regression tests: `scripts/publish-insight-run.mjs`, `scripts/test-insight-run.mjs`.
- CI regression hook: `.github/workflows/quality.yml`.
- Contract: `AGENTS.md`, `docs/insights-automation.md`, `docs/site-gallery.md`.
- One article record and generated feed/sitemap/OG/growth-path assets.
- Local repair evidence: `artifacts/insights/repair-2026-10-13/`.
- Incremental command evidence: `artifacts/insights/runs/<run-id>/`.

## Limits and next observation

No core Eidos Brain/Sentinel behavior changed. This is an Eidos Works publishing repair, not a research proof milestone. No paid provider was added, no production bindings were changed, and no inquiry was sent. The next unattended scheduled run has not yet occurred; a successful manual recovery proves this release path, while the next scheduled execution must establish unattended operation. Local schedules require this computer and the desktop app to remain running. Older blocked drafts are preserved and require a separate decision before publication.
