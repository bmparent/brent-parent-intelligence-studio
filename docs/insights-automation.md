# Eidos Works Insights Automation

## Architecture

The Insights system uses repository-native static content and Codex scheduled runs.

- Canonical article data lives in `src/data/articles.json`.
- React imports that data through `src/data/articles.ts`.
- `scripts/generate-insights-assets.mjs` generates sitemap, RSS, llms.txt, article OG SVGs, and a generation receipt.
- `scripts/validate-insights.mjs` enforces editorial metadata, source links, duplication checks, generated asset inclusion, and optional prerendered HTML checks.
- `scripts/publish-insight-run.mjs` runs the full local quality gate and writes a run report.
- Codex cron automations perform the research, article writing, validation, commit, push, and post-deploy verification loop.

No paid CMS or new metered API is required by the repository workflow.

## Schedule

Timezone: America/New_York.

- 8:00 AM: current development, news, standards, or platform change.
- 1:00 PM: practical guide, comparison, implementation lesson, or explainer.
- 6:00 PM: strategic analysis, original framework, or case-study-style article.

Each scheduled run should publish one article. It should not batch three similar articles from the same prompt.

## Topic Pillars

1. Agentic search, AI discovery, structured data, and modern SEO.
2. UI/UX design, accessibility, responsive behavior, and design systems.
3. Small-business automation and operational efficiency.
4. Premium e-commerce and custom storefront experiences.
5. InkSoft, Printavo, production workflows, and related systems.
6. Web performance, Cloudflare, deployment, and technical architecture.
7. AI integrations that produce practical business value.
8. Cloudinary, media optimization, and visual-content workflows.
9. Interactive web experiences, WebGL, Babylon.js, and purposeful motion.
10. Eidos Works frameworks, experiments, lessons, and original analysis.

## Article Schema

Every article in `src/data/articles.json` includes:

- title, slug, description, dek, category
- publishedAt, updatedAt, author, byline
- readingTimeMinutes, tags, canonicalPath, excerpt
- pillar, slot, format, searchIntent, featured, draft
- thesis, sources, takeaways, relatedSlugs
- body sections, CTA, and OG image path

Automated or assisted articles should use `Eidos Works Editorial` as byline.

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
npm run publish:insight-run -- --slot=manual
```

That command performs:

- generated asset refresh
- source and schema validation
- lint
- production build
- dist HTML validation
- URL-presence verification
- run report creation

Blocking failures leave production unchanged.

## Manual Single-Article Run

1. Research the topic and open the sources.
2. Add exactly one article record to `src/data/articles.json`.
3. Run `npm run publish:insight-run -- --slot=<morning|midday|evening|manual>`.
4. Review the generated diff.
5. Commit with a message like `content(insights): publish storefront proof loop`.
6. Push through the existing GitHub to Cloudflare Pages deployment path.
7. Verify production:

```bash
npm run verify:production-insight -- --slug=<article-slug>
```

## Failure and Recovery

If validation fails:

- Do not publish.
- Keep the failed topic in a draft branch or run artifact.
- Record the failing command and exact error in `artifacts/insights/runs/<run-id>/run_report.md`.
- Attempt one safe correction pass.
- If it still fails, stop and report the blocker.

To pause automation, pause the three Codex cron automations named:

- Eidos Works Insights - morning current analysis
- Eidos Works Insights - midday practical guide
- Eidos Works Insights - evening strategy

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
- the existing Cloudflare Pages GitHub deployment connection
- production verification access to `https://eidos-works.com`

If any of those are missing, the automation must stop after validated local artifacts and report the blocker.
