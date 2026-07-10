# Eidos Works Editorial Automation Instructions

These rules apply when working in this repository on Eidos Works public-site content, Insights articles, feeds, sitemap files, editorial automation, or production publishing.

## Core Rules

- Eidos Works is the public studio brand. Do not confuse it with Eidos Brain, which is a research and proof-stage portfolio area.
- Publish useful, source-linked, customer-facing articles. Do not publish filler, generic AI copy, invented client results, fake quotes, unsupported metrics, or exaggerated platform claims.
- Use `Eidos Works Editorial` for automated or assisted articles unless Brent Parent has actually reviewed or written the piece.
- Keep current facts grounded in live sources. Prefer official documentation, standards bodies, primary announcements, and first-party technical references.
- Do not invent special AI schema, imply llms.txt is a Google ranking requirement, or claim foundational SEO is obsolete.
- Keep article URLs stable and readable: `/insights/descriptive-slug`.
- Preserve visible sources, publication dates, modified dates, canonical URLs, RSS inclusion, sitemap inclusion, and JSON-LD.

## Article Workflow

1. Inspect the existing `src/data/articles.json` content before selecting a topic.
2. Compare against at least recent Insights titles, tags, pillars, and search intents. Reject duplicative topics unless there is a meaningful new development.
3. Add or update one article record in `src/data/articles.json`.
4. Run:

```bash
npm run content:generate
npm run validate:insights
npm run lint
npm run build
npm run validate:insights:dist
npm run verify:urls
```

5. If the article is deployed, verify production with:

```bash
npm run verify:production-insight -- --slug=<article-slug>
```

## Scheduled Publishing Slots

- 8:00 AM America/New_York: current development, news, standards, or platform change.
- 1:00 PM America/New_York: practical guide, explanation, comparison, or implementation lesson.
- 6:00 PM America/New_York: strategic analysis, applied business insight, original framework, or case-study-style article.

Each run should normally publish one article only.

## Quality Gate

Do not commit or push an article if validation fails. Leave failed work as a draft or run artifact, record the exact blocker, and keep production unchanged.

Generated public files are intentional source artifacts:

- `public/sitemap.xml`
- `public/feed.xml`
- `public/llms.txt`
- `public/insights-og/*.svg`
- `artifacts/insights/latest-generation-report.json`
- `artifacts/insights/runs/*`

Do not commit secrets, tokens, customer-private data, or raw sensitive operational data.
