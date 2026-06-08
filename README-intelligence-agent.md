# Eidos Works Diagnostic Agent

This patch adds a compact optional OpenAI-powered diagnostic layer to the Eidos Works site.

It adds four visitor-facing modes:

1. **Project Compass** - maps a visitor to the best service path.
2. **Case Study Concierge** - routes a question to the closest proof/case-study area.
3. **Automation Scanner** - turns a repeated manual task into an automation opportunity.
4. **Eidos Brief Builder** - converts a messy idea into a short project brief.

## Files added

```text
src/components/ui/IntelligenceStudioAgent.tsx
src/data/intelligenceKnowledge.ts
src/lib/intelligenceRouter.ts
src/types/intelligence.ts
src/styles/intelligence-agent.css
functions/api/intelligence.ts
functions/_shared/portfolioKnowledge.ts
.dev.vars.example
scripts/apply-intelligence-agent.mjs
```

## Apply in the repo

Copy these files into the repo root, then run:

```bash
node scripts/apply-intelligence-agent.mjs
npm install
npm run typecheck
npm run lint
npm run build
```

The script updates:

- `src/App.tsx` to import and render `<IntelligenceStudioAgent />` after the studio intro/credibility grid and before deeper proof sections.
- `.gitignore` to prevent `.dev.vars*` and `.env*` from being committed.
- `package.json` to add `typecheck` and `preview:cf` scripts if missing.

## OpenAI / Cloudflare setup

The frontend never sees the API key. The OpenAI call runs through a Cloudflare Pages Function at:

```text
/api/intelligence
```

Set a Cloudflare Pages secret:

```text
OPENAI_API_KEY
```

Optional:

```text
OPENAI_MODEL=gpt-4o-mini
```

For local Pages Functions testing:

```bash
cp .dev.vars.example .dev.vars
# edit .dev.vars and add the real key
npm run preview:cf
```

The normal Vite dev server still renders the UI. If `/api/intelligence` is unavailable, the component uses a deterministic local fallback.

## Token controls

The implementation is intentionally low-token:

- One API call only after a completed visitor submit.
- No running chat history.
- The browser sends a compact payload, selected signals, and top matching proof IDs.
- The Cloudflare Function selects only three short portfolio-context entries.
- The Responses API request uses a strict JSON schema and `max_output_tokens: 650`.
- A module-level cache returns repeated results for 15 minutes when the isolate stays warm.

## Production QA

After deploying to Cloudflare Pages, check:

- The diagnostic section renders after the studio intro section.
- Guided buttons, select fields, textarea, and focus states work on keyboard.
- With no secret or with API failure, the local fallback still renders.
- With `OPENAI_API_KEY` configured, the output label says `Studio AI brief`.
- No API key appears in the built frontend bundle.
- The existing build target remains `dist`.
