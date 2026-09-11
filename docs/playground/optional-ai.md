# Optional bounded Playground AI

Default: off. Manual editing, local autosave, imports and free exports have no provider dependency. No public spending was enabled. No new key was created. The read-only account model catalogue listed gpt-5-mini, gpt-image-2.5-flare and gpt-image-2.5-sunburst on September 10; this does not prove generation quality or pricing compatibility for an account test.

The first action is Describe a change for one selected section; page palette/type settings require explicit page scope. It requires an owned saved project/revision while allowing bounded current local text/settings. New unsaved section IDs must first be saved. The provider receives only that request, selected text/settings, preset IDs, locks and a strict operation schema. No raw uploaded images, application source, renderer bundle, executable code or conversation history is sent. Six operations maximum. Validation runs on server and client. Apply rechecks member ownership, workspace generation and a full base-state SHA-256, then makes one undoable edit. It never automatically saves a cloud revision. Late results are ignored; intervening edits require a fresh proposal.

## Flags and deliberate enablement

- VITE_PLAYGROUND_AI_UI=true reveals the controls at build/dev time. It was used only for local mocked browser tests.
- EIDOS_PLAYGROUND_AI_ENABLED=true and EIDOS_PLAYGROUND_AI_KILL=false are both required on Sentinel.
- The existing OPENAI_API_KEY supplies only the server adapter. It never enters the client bundle.
- EIDOS_PLAYGROUND_AI_CONFIG must contain an evaluated pinned model, pricing/version, positive accountMicro/globalMicro budgets, maxInputBytes <=12000 and maxOutputTokens <=2000. No prices, budgets or model are defaulted in code.
- The additive 0005 migration inserts the separate eidos_pg_ai_control singleton with enabled=0. Only an explicitly approved rollout may set it to 1. Set it to 0 to stop admissions immediately.
- Image generation additionally requires EIDOS_PLAYGROUND_IMAGE_ENABLED=true, imageModel, separate imagePricing, and a verified imageMaxMicro reservation. It stays blocked until its real bounded evaluation is approved.

Config pricing fields are input, cachedInput, cacheWrite, output, imageInput, imageOutput, cachedImageInput, plus version. Numeric rates are USD per million tokens, equivalent to micro-USD per token. Token usage records input, cached input, cache writes, output, reasoning (included in output), image input/output and cached image input. Each durable record includes model, requested quality, provider request ID, pricing version, reservation and actual charge. Private prompts are not logged or stored; only the owner-bound content hash is retained. Completed result content is owner-readable and bounded, not publicly accessible.

## Monetary admission and idempotency

A single INSERT...SELECT atomically checks account and global lifetime monetary totals, one pending request per account, four globally, and a 100-request owner storage bound. These are Playground-specific counters; the unrelated assistant allowance is untouched. The existing rate infrastructure also applies a separate 20/hour account request bucket. Integer micro-USD reservations use a conservative UTF-8 input bound plus framing allowance and separately capped output. Cache-write premiums are included in the maximum input rate. Completed actual charges release only the difference from a known reservation. Missing/inconsistent usage, unexpected model versions or ambiguous failures retain pending reservations. If actual usage exceeds its reservation, the global database switch closes. No retry is made after dispatch.

Request IDs are owner-scoped and bound to request content, workspace/base hash, cloud revision, model and action. Duplicate completed requests replay stored results; duplicate pending requests do not call again. GET by the same request ID can inspect the outcome even after the project changes. A different deliberate variation needs a new ID. Client Stop waiting does not cancel billing, release a reservation or imply provider cancellation. Unknown reservations require operator reconciliation with the provider receipt; do not expire/refund them automatically. The initial budgets are lifetime validation pools, not daily plans or customer billing.

## Text and image adapters

Text uses the Responses API with store:false, strict JSON schema, no tools, no arbitrary HTML/CSS/JS and a separate output token cap that includes reasoning. Refusal, incomplete output and invalid operations are charged where usage is known but never applied. Stable developer instructions/schema precede changing content. The adapter uses explicit developer-prefix caching for supported 5.6+ models and records actual cache usage; no generic savings or minimum threshold is assumed. The selected model and caching behavior require evaluation before enablement.

Images use the direct Image API, one explicit 1024x1024 low-quality WebP draft (compression 80), no uploaded input images, and default provider moderation. No regeneration occurs on edits, reload, breakpoint changes or export. Accepted bytes receive model/quality/provider metadata and remain embedded locally until the user explicitly saves to the same owned asset pipeline. A simple image request may outlast the current 20-second provider/24-second relay window; such an outcome remains unknown, and image release must resolve latency/reconciliation during its bounded evaluation. Do not enable public image generation merely because the adapter exists.

## Evaluation gate and current sources

Local PASS: six admission/operation mock tests, two provider transport tests, and Chromium/Firefox/WebKit proposal/apply/undo/stale-workspace browser fixtures. All generated test text and images are controlled fixtures. Full build/check receipts are in the final handoff. No real inference calls occurred.

Real evaluation BLOCKED: approve a total validation budget (proposed ceiling USD 2.00) before running up to six text-edit prompts on two available economical text candidates and one low-quality draft on each Image 2.5 model. Record per-action correctness, refusal, locked-field preservation, latency, input/output/reasoning/cache usage and actual dollars. Pin the least costly candidate meeting the gates. The proposed budget is not authorization. Verify per-image worst-case reservation and resolve long-running image delivery before public enablement.

Official documentation checked September 10:
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/guides/prompt-caching
- https://developers.openai.com/api/docs/guides/image-generation
- https://developers.openai.com/api/docs/models/gpt-image-2.5-flare
- https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst

Both image model pages currently quote USD 5/M text input, 1.25/M cached text input, 8/M image input, 2/M cached image input and 30/M image output. Equal token rates do not establish equal image cost, token consumption, quality or latency. The Image 2 calculator does not estimate Image 2.5 token consumption. Pricing is evidence for the pending evaluation, not installed production configuration.

Final local check receipt: npm run test:playground (24 PASS), test:platform (26 PASS), test:glass (3 PASS), test:analytics (1 PASS); frontend build/typecheck/lint/Functions build; backend lint/test (51 PASS)/build. Browser mocked fixtures: ai-browser.json under C:/Users/bmpar/SystemDiagnostics/playground-20260910. Some checks first exposed encoding and event-handling issues; those were corrected and the relevant checks rerun. No skipped check has been relabeled passed.
