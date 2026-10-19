# Playground AI readiness — 2026-10-17

## Scope and result

Source baseline: frontend `9352f4bd440227d677633d52c182e1b80515c25d`, backend `6f7a29350ed8837ba86ce5d26603bfd674ef2c0e`. This candidate does not change deployments, preview pins, provider credentials, account funding, feature flags or the $5 lifetime test budget. No new count or generation requests were made.

The candidate already implements typed element/section/page/brand proposals, quoted spending, explicit confirmation, read-only visual preview, stale-project/account checks, one-step Apply/Undo, and uncertain-result status recovery without generation retries. Those source capabilities are separate from hosted customer acceptance.

### Exact spending display

`usd()` previously rounded every value to cents. It now preserves all nonzero microdollar digits, retaining at least two decimal places. A $0.001742 amount cannot display as $0.00 and a maximum cannot be rounded below the actual commitment. Invalid/negative/noninteger amounts fail closed. The payment price formatter is unchanged.

### Atomic count liability foundation

The shared accounting module now supports an explicit request-hash-bound, server-supplied nonzero count ceiling. Its count claim and retained owner liability commit in one SQLite transaction before outbound I/O. The liability uses the existing append-only diagnostic expense journal, so all existing shared-budget admission checks include it across models, owners, month changes and policy reconfiguration. Counting does not charge customer allowance. A failed request, crash, cancellation or expired quote never releases an unknown count expense; a successful count also retains its ceiling until separate billing reconciliation.

The adapter currently accepts such bounds ONLY with controlled fixture cards and injected test transport. It rejects them for real transport because no justified full-request bound has been established. This is deliberately not an alternative activation flag and makes no zero-fee assertion. Existing real zero-priced counting still requires its separate verified-zero gate, which remains unset. No schema migration is needed.

## Evidence review and route choice

The backend's dated hosted record documents one Sol generation (701 input, 34 output; $0.001742) and a separate unresolved count ceiling of $0.001753: $0.003495 committed, $4.996505 remaining at that recorded readback. This audit did not access live ledger credentials or independently refresh that balance. The old count's exact actual fee remains unknown. The recorded cost export was zero even for the known generation, so it cannot prove a free count endpoint. A replacement provider key is unnecessary.

Fresh official documentation review:

- [Pricing](https://developers.openai.com/api/docs/pricing) says Responses API is not separately priced and model token rates apply. This supports the previously recorded conservative interpretation for the observed count, but is not endpoint-specific fee confirmation.
- [Counting tokens](https://developers.openai.com/api/docs/guides/token-counting) documents exact full request counts and does not establish a count endpoint fee or a maximum billable token count for rejected requests.
- [Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol) and [Astra](https://developers.openai.com/api/docs/models/gpt-6-astra) document 1,050,000-token context windows and doubled input/cache rates above 272,000 tokens. Hypothetical whole-context ceilings would already be $5.25 and $26.25 respectively, exceeding the authorized test budget before generation. The model context window is not documented as an enforced count-endpoint bound.
- [Official tiktoken model mappings](https://github.com/openai/tiktoken/blob/main/tiktoken/model.py) currently do not map Sol/Astra. The [counting cookbook](https://developers.openai.com/cookbook/examples/how_to_count_tokens_with_tiktoken) explicitly describes message counts as estimates and warns of additional tool formatting overhead. Neither justifies treating a JSON byte count plus an invented constant as an exact Responses/schema bound.

A no-count, small text-only route is attractive, but still needs a reviewed model tokenizer and full fixed-wrapper/schema overhead bound. One measured 701-token payload does not establish that bound for different instructions/context. This candidate therefore does not replace exact counting with an undocumented heuristic, increase the budget, or silently substitute models.

## Validation

- Frontend: 21 scoped-operation/corpus/client tests; TypeScript; targeted lint; full client/SSR build; Pages Functions compilation pass
- Backend: 20 JavaScript tests and 140 TypeScript tests pass; TypeScript check passes
- New coverage: exact microdollar display; liability visible before I/O; successful/failed counts retaining cost; cancellation/crash survival; same- and different-action concurrency; independent connections; shared cap reductions blocking generation; mismatched evidence/real-transport rejection; transaction rollback if liability persistence fails
- Shared contract parity: all 18 AI/delivery contract files match between the two worktrees
- Current-source browser verification is not claimed: local Chromium executable is absent, and official Playwright browser download returned an invalid/truncated archive. Existing earlier fixture-browser evidence remains historical only

## Smallest next acceptance sequence

1. Obtain current settled provider billing evidence for the dedicated project and the October 15 request, or provider confirmation explicitly covering `/v1/responses/input_tokens` fees including failed requests. A zero-only export that omits the known generation is insufficient. This is an authenticated billing evidence step, not key replacement or permission to spend.
2. If count fees are nonzero or uncertain, establish a documented enforced complete-request ceiling, admit that exact evidence in the adapter, and keep the existing atomic liability reservation. Alternatively establish a documented Sol tokenizer/wrapper bound for a narrowly constrained no-count request. A browser-provided estimate cannot authorize either.
3. Reconcile the exact lifetime TEST ledger before any paid request. Restore TEST customer entitlement only through an explicitly authorized genuine TEST purchase/funding flow; the recorded refunded order has revoked allowance and a frozen account. Do not fabricate grants or reset the budget.
4. On an approved paired TEST deployment, test one narrow useful edit through sign-in → quote → explicit maximum confirmation → proposal preview → Apply → Undo. Verify owner isolation, actual metered receipt, reload/status recovery and duplicate dispatch protection. Keep generation and count expenses in the same lifetime ledger.
5. Treat model comparison, LIVE funding/pricing, and production activation as separate decisions. Passing these controlled tests does not authorize or establish them.

## Exact billing evidence retrieval

An organization owner (or user with Usage Dashboard permission) can open
https://platform.openai.com/usage, select the organization containing the
`eidos-works` project, then select `eidos-works` in the Usage Dashboard's own
project filter. That filter is independent of the global platform project.
Set the reporting range to October 15–17, 2026, in UTC. Choose **Export → Cost
data**, group by **Line item**, select that project, CSV format, and daily
interval. Download the generated file. Export **Activity data** for the same
range, grouped by API key/model, to check the dedicated Playground key's known
701-input/34-output Sol generation against costs.

If the known generation is still missing or only zero-valued costs appear,
verify organization/project filters rather than declaring counting free.
If the count cannot be separated, the owner can ask OpenAI support to confirm
billing for `/v1/responses/input_tokens`, including rejected/timed-out requests,
using the October 15 count request ID
`req_91e73b7e1c5e40d39a9cd846dc247661`. No secret key is needed in that request.
The requested evidence is the count's billed amount (or explicit no-charge
confirmation), the applicable pricing basis and whether failed attempts can
incur fees. Do not release the retained liability on an absent line item alone.

Official instructions: [export usage/cost CSVs](https://help.openai.com/en/articles/20001072-how-do-i-export-monthly-usage-details-from-the-api-usage-dashboard)
and [dashboard permissions and independent project filtering](https://help.openai.com/en/articles/10478918-reviewing-api-usage-and-costs).
