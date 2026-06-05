# Patch summary

Built a repo-ready low-token ChatGPT API integration for `bmparent/brent-parent-intelligence-studio`.

## What it adds

- Visitor-facing Intelligence Studio Agent section.
- Four modes: Project Compass, Case Study Concierge, Automation Scanner, Eidos Brief Builder.
- Local deterministic recommendation engine for instant matching and API fallback.
- Cloudflare Pages Function at `/api/intelligence` that calls OpenAI's Responses API from the server side only.
- Strict JSON schema output for stable UI rendering.
- No OpenAI SDK dependency; uses native `fetch` to avoid package and bundle bloat.
- No frontend API key exposure.
- `.dev.vars.example` for local secret setup.
- Safe patch script that updates `src/App.tsx`, `.gitignore`, and `package.json`.

## Why this is token-light

- Guided input instead of open-ended continuous chat.
- One request per completed interaction.
- No conversation history.
- Only three short portfolio proof snippets go to the model.
- Output is capped and schema-constrained.
- Repeated identical requests are cached for 15 minutes in the Worker isolate.

## Deployment notes

This patch is intended to run on Cloudflare Pages with the build output in `dist` and the Pages Function in `functions/api/intelligence.ts`.

Production requires a Cloudflare Pages secret named `OPENAI_API_KEY`. `OPENAI_MODEL` is optional and defaults to `gpt-4o-mini`.
