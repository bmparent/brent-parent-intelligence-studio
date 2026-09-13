# Wellway — Your wellness journey

A fictional member and advisor experience by Eidos Works. Wellway’s wordmark, navy/slate palette, Spectral headings and Inter text remain intact. The approved Eidos `eidos-edge-light-v5` optics are adapted to the header, navigation, assistant, visit controls and selected cards.

## Use the app

The gallery destination is `/demos/wellway/`. The generated `dist/wellway-demo.html` also works as a standalone file. Edits save in the current browser; Help & guide offers manual JSON backup and restore. GitHub holds source and Google Drive holds manually transferred files. Neither is a member database.

1. Start a check-in and inspect its date in My journey. Select the September 8 sleep gap and compare the recorded movement value. Missing observations never become zeroes.
2. Ask about a date or pattern. Guided answers are explicitly labeled. Enable **Use live AI** when the hosted service reports available. Live answers have inspectable supporting records and preserve follow-up questions within the conversation.
3. Choose **Join visit**, write an agenda and select allowed context. Optionally prepare a brief with live AI. Join the simulated visit and explore a topic.
4. End the visit, edit its follow-up and save for advisor review. Closing the visit preserves its agenda and draft. Advisor edits also save while switching views.
5. **Approve plan** is a separate human action. A follow-up without permission to use the plan becomes an approved note and does not rewrite an activity.

The persistent workspace indicator explains the fictional scenario. Every visit visibly says **Simulated visit**. Portraits are static: no camera, microphone, recording, real advisor connection, provider sync, authentication or clinical monitoring is implemented. Use fictional information only.

## Development and validation

Use Node `^22.22.2`, `^24.15.0`, or `>=26.0.0` (the DOM dependency requires this). From the repository root:

```sh
npm ci
npm ci --prefix apps/wellway
npm run dev --prefix apps/wellway
npm test --prefix apps/wellway
npm run test:ui --prefix apps/wellway
npm run test:server --prefix apps/wellway
node --import tsx --test ops/wellway-ai/ledger.test.ts ops/wellway-ai/runtime.test.ts
node scripts/update-wellway-demo.mjs
```

The update script type-checks and rebuilds source, creates the standalone file, then copies it into `public/demos/wellway/index.html`. Run the site’s release checks afterward. It does not deploy.

`tests/browser.mjs` covers real browser workflows and screenshots. `tests/ai-browser.mjs` checks cancellation, retry, continuity and scoped drafts with a mocked provider. Supply an installed Playwright module through `WELLWAY_PLAYWRIGHT_MODULE`, a running app URL through `WELLWAY_TEST_URL`, and an output folder through `WELLWAY_BROWSER_ARTIFACTS`. These tests never make paid calls. See [validation](docs/VALIDATION.md).

## Hosted AI

The same-origin `/api/wellway/status` and `/api/wellway/ask` Pages Functions use a private service binding to `ops/wellway-ai`. The Worker owns the OpenAI secret. A Durable Object stores only spending counters and hashed admission identifiers, not member records, questions or answers. Credentials never enter the public bundle.

The pinned model is `gpt-4.1-mini-2025-04-14`, checked against the account’s model catalogue and [official model documentation](https://developers.openai.com/api/docs/models/gpt-4.1-mini). Each request uses the Responses API with structured output, `store:false`, no tools, at most 1,200 output tokens and a 25-second upstream timeout. `store:false` is not a claim of zero provider retention.

Evidence contains dated observations, units, gaps, source identities, recorded/imported timestamps, and the displayed and comparison periods. Server validation recomputes averages. Each explanatory segment must cite authorized records that users can inspect. Source membership checks do not prove every sentence is correct; responses remain explanations or editable drafts, never independent approvals or diagnoses.

The launch allowance authorized September 12, 2026 is **$1 total and $0.25 per UTC day**, with no automatic renewal. A single durable transaction reserves a conservative cost before inference. Failures retain reservations. New browser sessions do not reset the shared allowance. See [service setup and rollback](../../ops/wellway-ai/README.md).

## Optional loopback server

`server.mjs` serves the built app at `http://127.0.0.1:4318`. Copy `.env.example` to a private `.env` in this folder. Set an existing `OPENAI_API_KEY`, `WELLWAY_AI_ENABLED=true`, and separately approved positive budget values in micro-USD. Then run `npm start --prefix apps/wellway` from the repository root. Never enter keys into the app or include `.env` in an archive.

Defaults disable paid calls. The local usage file fails closed if corrupt. It does not share the hosted allowance: obtain a separate allocation or deduct local reservations from the authorized total before also enabling hosted AI. Publishing HTML alone does not enable the hosted service.

## Record conventions

CSV columns are `id,date,metric,value,unit,sourceId`. Sleep uses `h`, movement uses `steps`, and energy uses `score` (1–5). Source plus record ID is the deduplication key. Existing records are not silently overwritten. Overlapping sources remain inspectable; charts select the preferred check-in/sample-watch record, then the most recently imported alternative, without summing overlapping measures.

Average = sum of selected available values / recorded days. Missing days are excluded. The scenario calendar and real save/import timestamps remain distinct. Google Drive is optional manual backup storage.
