# Eidos Works Editorial Automation Instructions

These rules apply when working in this repository on Eidos Works public-site content, Insights articles, feeds, sitemap files, editorial automation, or production publishing.

## Core Rules

- Eidos Works is the public studio brand. Do not confuse it with Eidos Brain, which is a research and proof-stage portfolio area.
- Publish useful, human-facing essays and technical articles. Do not publish filler, generic AI copy, invented client results, fake quotes, unsupported metrics, or exaggerated platform claims.
- Use `Eidos Works Editorial` for automated or assisted articles unless Brent Parent has actually reviewed or written the piece.
- Keep current facts grounded in live sources. Prefer official documentation, standards bodies, primary announcements, and first-party technical references.
- Do not invent special AI schema, imply llms.txt is a Google ranking requirement, or claim foundational SEO is obsolete.
- Keep article URLs stable and readable: `/insights/descriptive-slug`.
- Keep research sources in article metadata and publication receipts for verification, without a dedicated public Sources or References section. Preserve publication dates, modified dates, canonical URLs, RSS inclusion, sitemap inclusion, and JSON-LD.
- Follow `docs/insights-voice.md`: two reflective essays and one technically useful article in the weekly rotation. The voice may draw on the Brent and Eidos stories, but fiction is never presented as biography, product proof, or personal testimony.

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
npm run verify:prerender
npm run validate:insights:dist
npm run verify:urls
```

For an untrusted pull request or draft, begin with `npm run validate:insights -- --skip-source-fetch` so contributor-controlled source URLs are not requested. The normal trusted publish gate must still run `npm run validate:insights` with source retrieval enabled when current external claims depend on those sources.

5. If the article is deployed, verify production with:

```bash
npm run verify:production-insight -- --slug=<article-slug>
```

## Scheduled Publishing Slots

- Monday 8:00 AM America/New_York: current-life essay grounded in verified developments when relevant.
- Wednesday 1:00 PM America/New_York: technically useful guide or explanation.
- Friday 6:00 PM America/New_York: philosophical Eidos Works essay with a human stake.

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
