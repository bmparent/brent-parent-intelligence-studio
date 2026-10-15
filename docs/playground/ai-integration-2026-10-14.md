# Scoped Eidos assistance — 2026-10-14

Status: implemented source and controlled tests; real provider and hosted billing acceptance remain pending. Brent selected a dedicated key in the `eidos-works` OpenAI project and approved **$5 total** for provider tests, including both models, failures and retries. The dedicated Vercel Preview binding is metadata-verified. No provider call has occurred.

## One project, explicit scope

Eidos proposes at most six typed changes to an element, section, whole page or shared brand. The existing model validator, renderer, export and Undo history remain authoritative. Element changes include text, links, image descriptions, bounded dimensions/spacing/alignment and explicit mobile overrides. Whole-page operations can reorder existing sections or change content-section visibility while preserving permanent header/footer and section identities. This is bounded adaptation of an existing starter; it does not claim arbitrary page generation or a general app platform.

`createProposalContext` validates the local project, strips image bytes/media filenames and standalone artwork/motion payloads, and retains the target IDs and relevant brand/text/layout. This projection is not a cloud save or proof of ownership of stored assets. Client Apply validates against the full current project, preserving its actual images, artwork and unrelated manual content. Scope, document, revision, full source hash, target selection and signed-in account must still match. Stale proposals cannot replace newer work.

The UI requests availability only when Ask Eidos is opened. A server quote identifies the model, estimate, maximum and frozen scope. Generation requires explicit confirmation of that exact maximum. The balance view separates included and purchased allowance, monthly spend/reservations, requested cap/effective floor and reset. Generated usable output consumes metered allowance even when discarded. Apply adds one Undo entry and no second provider call. Unknown/time-out requests retain their action reference; status must be checked before another submission. Preview uses the existing read-only page renderer before Apply.

## Provider and accounting

The paired adapter uses the Responses API with one generation call, Standard processing, fixed reasoning/output limits, no paid tools or hidden retries, and a dedicated server credential. It never falls back to the process's unrelated `OPENAI_API_KEY`. Provider/client request identities, full counted payload hash, output, usage and settlement stay associated with one durable action.

Integer microdollar accounting reserves customer and owner commitments atomically. Actual cached-input/cache-write categories and reasoning-inclusive output are recorded separately; input reserves cover the higher cache-write rate even when explicit no-breakpoint caching is requested. Technical invalidity waives the customer action while retaining metered or unknown provider expense. Overruns pause dispatch. The $5 owner budget is lifetime for the same persistent TEST ledger, across models and month boundaries; restarting a process or changing models cannot reset it.

Current source tests: eight new scoped-operation checks plus twenty-three legacy/model checks pass; five corpus checks validate all twenty representative inputs. Final provider/accounting reports retain 47 focused and 134 full backend passes, with one existing Windows symlink skip. The UI has an earlier 108 checks across three engines and two widths, plus 14 final readiness/Finish checks and a 40-check final built Chromium run. These are controlled fixtures, not hosted provider acceptance. Durable counting admission limits attempts to 20 per owner/hour, 60 globally/hour and 200 across the persistent TEST ledger; the 20-case/two-model comparison must span at least two owner windows without bypassing the quota.

## Real-call gates

The secure picker selected `WORKS_PLAYGROUND`, but the local destination confirmation was declined. No key was created or written by the agent. Brent saved an existing key directly to Vercel; metadata verification on 2026-10-14 confirms:

- Project `eidos-sentinel-lab`
- Preview branch `codex/playground-unified-20261014`
- Sensitive variable `EIDOS_PLAYGROUND_OPENAI_API_KEY`

The Secret binding was created/updated at `2026-10-14T23:52:13.232Z`; no value was read or decrypted. Production-only same-name and earlier mistaken variables were left untouched. The existing process key has not been used. The public manual preview retains disabled accounts/AI/commerce/mail, a per-deployment blank credential override, and no database. Hosted tests also need the authorized TEST database/account/funding setup; synthetic source tests do not establish it. The dedicated `playgroundAiReady` flag remains separate from legacy `aiReady`, and both global and Playground AI kill switches must permit dispatch.

Official token-counting documentation establishes exact full-request counting, including roles and schemas, but the retrieved documentation does not establish the count endpoint's billing. The adapter therefore keeps real transport disabled unless that pricing gate is supported. Do not set a `verified-zero` flag merely to bypass the gate. This uncertainty is separate from key access and from model-quality acceptance.

The 20-case corpus covers starter adaptation, brand, copy, section changes, responsive repairs and preservation of manual work. No candidate has been called yet. All actual cost, latency, corrections and human visual scores remain null/not run. Rendered desktop/mobile review and blinded human review remain required before choosing a route; no cheaper model is substituted for exhausted funds.

## Primary sources and receipts

- [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol), [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra), [pricing](https://developers.openai.com/api/docs/pricing)
- [Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [token counting](https://developers.openai.com/api/docs/guides/token-counting), [prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)
- Backend `artifacts/playground-unified-backend-20261014/continuation-provider-adapter/` and `continuation-provider-identity/`
- Frontend `artifacts/playground-unified/ai-comparison-protocol/`; final UI receipts are recorded separately

No production activation or LIVE payment is authorized. Saving a credential or obtaining a READY deployment is not provider, customer-account, payment or inbox acceptance.
