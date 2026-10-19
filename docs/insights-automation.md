# Eidos Works Insights Automation

## Architecture

The Insights system uses repository-native static content and Codex scheduled runs.

- Canonical article data lives in `src/data/articles.json`.
- React imports that data through `src/data/articles.ts`.
- `scripts/generate-insights-assets.mjs` generates sitemap, RSS, llms.txt, article OG SVGs, and a generation receipt.
- `scripts/validate-insights.mjs` enforces editorial metadata, source links, duplication checks, generated asset inclusion, and optional prerendered HTML checks.
- `docs/insights-voice.md` defines the essay voice, weekly mix, and factual boundaries.
- `scripts/publish-insight-run.mjs` runs the full local quality gate and writes a run report.
- Codex cron automations perform the research, article writing, validation, commit, push, and post-deploy verification loop.

No paid CMS or new metered API is required by the repository workflow.

## Schedule

Timezone: America/New_York.

- Monday 8:00 AM: a reflective essay that connects a verified current development or durable social question to a person's life and Eidos Works' craft.
- Wednesday 1:00 PM: a technically useful article with concrete mechanisms, tradeoffs, and an executable decision or practice.
- Friday 6:00 PM: a deeper philosophical essay about attention, memory, trust, making, care, or the human stakes of technology.

Each scheduled run should publish one article. It should not batch three similar articles from the same prompt.

## Topic Pillars

1. Agentic search, AI discovery, structured data, and modern SEO.
2. UI/UX design, accessibility, responsive behavior, and design systems.
3. Small-business automation and operational efficiency.
4. Premium e-commerce and custom storefront experiences.
5. Hosted storefront platforms, fulfillment, production workflows, and related systems.
6. Web performance, deployment, and technical architecture.
7. AI integrations that produce practical business value.
8. Media delivery, optimization, and visual-content workflows.
9. Interactive web experiences, WebGL, Babylon.js, and purposeful motion.
10. Eidos Works frameworks, experiments, lessons, and original analysis.

## Article Schema

Every article in `src/data/articles.json` includes:

- title, slug, description, dek, category
- publishedAt, updatedAt, author, byline
- readingTimeMinutes, tags, canonicalPath, excerpt
- pillar, slot, format, searchIntent, featured, draft
- thesis, sources, takeaways, relatedSlugs (`takeaways` may be empty for essays)
- body sections, CTA, and OG image path

Automated or assisted articles should use `Eidos Works Editorial` as byline.

Use `format: "essay"` for the Monday and Friday reflective pieces. Essays need a real thesis, at least two body sections, and can use natural headings instead of the required practical-guide headings. They may leave `sources` empty only when the piece makes no time-sensitive or externally verifiable factual claims. Wednesday technical articles keep the practical headings, takeaways, and source requirements. The article UI does not display a Sources or References section; source records stay in the content data and validation workflow.

## Research and Source Rules

Live research is required for news, product updates, standards, laws, platform changes, software capabilities, pricing, and other time-sensitive claims.

Prefer:

- official documentation
- release notes
- standards bodies
- original research
- company announcements
- government or first-party technical sources

If no worthwhile verified news exists for the morning slot, publish timely evergreen analysis instead of manufacturing urgency.

Source retrieval is only a final quality gate for trusted article records. When reviewing an untrusted pull request or draft, run `npm run validate:insights -- --skip-source-fetch` first so contributor-controlled URLs are not fetched. A trusted scheduled or release run must still complete the normal `npm run validate:insights` check before publication whenever an article relies on current external claims. Research notes and links belong in article metadata and the run receipt; do not append a public bibliography section.

## Deduplication

Before adding a topic, inspect `src/data/articles.json` for:

- same or similar title
- same category and overlapping tags
- same search intent
- same thesis
- recent coverage in the last 90 days

`npm run validate:insights` blocks records that reuse the same category, search intent, and overlapping tags.

## Quality Gates

Run the full gate:

```bash
npm ci --no-audit --no-fund
npm run publish:insight-run -- --slot=manual
```

Run the dependency installation in every fresh worktree before validation. The publishing runner checks worktree-local dependency entry points before generating assets and reports an actionable installation command if they are missing. It does not install packages or alter the lockfile itself. If an install fails, preserve the error and retry in a new clean isolated worktree with the same retained article; do not borrow dependency shims from another checkout or create another article for that slot.

That command performs:

- generated asset refresh
- source and schema validation
- lint
- production build
- prerender verification
- editorial/privacy verification against the generated output
- dist HTML validation
- URL-presence verification
- Pages Functions build
- incremental run report creation before and after each command

Blocking failures leave production unchanged.

## Manual Single-Article Run

1. Research the topic when it uses outside facts, and open the sources. For a purely reflective essay, document that no external claim required a source.
2. Add exactly one article record to `src/data/articles.json`.
3. Run `npm ci --no-audit --no-fund`, then `npm run publish:insight-run -- --slot=<morning|midday|evening|manual>`.
4. Review the generated diff.
5. Commit with a message like `content(insights): publish storefront proof loop`.
6. Wait for the publishing PR's required CI checks and merge it when they pass. Continue in the same run; an open PR is not publication. Fetch the merged `origin/main`. The existing `Playground editor release` workflow (`.github/workflows/playground-editor-release.yml`) runs on every main push and performs the Cloudflare Direct Upload to `eidosworks` after full site/browser checks. Wait for that exact merge commit's workflow, inspect its deployment receipt, and verify production; do not start a competing manual upload while CI is deploying. If a newer main supersedes it, follow the newer run only after confirming it contains the article. A workflow failure is a blocker, not permission to bypass a quality check. If the automated upload is unavailable and all release checks pass, use the existing authenticated manual fallback documented in `docs/site-gallery.md` from the verified latest main commit. Preserve configured bindings and runtime settings and never replace a newer deployment.
7. Verify production:

```bash
npm run verify:production-insight -- --slug=<article-slug>
```

The production verifier accepts Cloudflare Pages' same-article trailing-slash redirect while still requiring the expected canonical metadata. Redirects to another page, origin, scheme, or query remain failures. Runner, dependency preflight, and redirect regression checks run with `node --test scripts/test-insight-run.mjs`. The runner's nine checks validate the local candidate; CI adds the broader site and browser checks. Neither a local pass nor a merge alone proves publication.

## Failure and Recovery

If validation fails:

- Do not publish.
- Keep the failed topic in a draft branch or run artifact.
- Record the failing command and exact error in `artifacts/insights/runs/<run-id>/run_report.md`.
- Attempt one safe correction pass.
- If it still fails, stop and report the blocker.

Resume retained slot drafts on current `origin/main` by transferring only that article record and keeping the original failed receipt linked in the recovery report. Preserve unrelated work and older backlog. Record the original scheduled slot separately; publication and modified dates must reflect when the article actually goes live. Check article slug, slot, pending PRs, and live inventory before adding a record.

To pause automation, pause the three Codex cron automations named:

- Eidos Works Insights - Monday analysis
- Eidos Works Insights - Wednesday practical guide
- Eidos Works Insights - Friday perspective

To resume, reactivate those same automations after confirming the repo checkout, GitHub push access, and Cloudflare Pages deployment path are healthy.

## Corrections and Retractions

For a correction:

- Update the article body.
- Update `updatedAt`.
- Add `correctionNote` when the change is material.
- Regenerate assets and rerun the full gate.
- Commit with `content(insights): correct <slug>`.

For a retraction:

- Mark the article as `draft: true` or remove it from `src/data/articles.json`.
- Regenerate assets so sitemap, feed, llms.txt, and prerendered pages no longer expose it.
- Add a short replacement note only if a public explanation is needed.

## Run Logs and Reports

Run reports are written under:

```text
artifacts/insights/runs/<run-id>/
```

The latest static-asset generation receipt is:

```text
artifacts/insights/latest-generation-report.json
```

## Remaining Manual Dependencies

The repo can validate and build content without new paid services. Unattended publish-and-deploy still depends on:

- a real Git checkout
- GitHub push permission for the automation environment
- existing Cloudflare authentication for direct upload to the `eidosworks` Pages project
- production verification access to `https://eidos-works.com`

If any of those are missing, the automation must stop after validated local artifacts and report the blocker.

The schedules run locally and depend on the configured host being available. Each attempt must resume an existing slot PR or deployment before writing another article, and finish with a verified live URL or an exact actionable blocker. Do not stop merely because CI is still running. Record merge, upload, and production-verification states separately.
