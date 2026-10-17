# Playground AI comparison protocol — 2026-10-14

This protocol prepares a fair comparison of bounded editing proposals over the existing public Playground starters. It does not record a live model run or human acceptance. The corpus has 20 cases, all six requested task categories, all four typed scopes, real visible section/element targets, manual-edit preservation cases, and reference proposals with at most six operations.

The user authorized a **$5 aggregate test budget**. That is the total ceiling across models, retries, unsuccessful calls, corrections and reruns, rather than a budget for each model or case. A dedicated credential must be connected securely before the live driver runs. The corpus validator makes no provider calls and needs no key.

## Files and validation

- `scripts/fixtures/playground-ai-cases.json` is the versioned corpus.
- `scripts/playground-ai-case-fixture.ts` loads cases, builds deterministic public fixtures and resolves targets.
- `scripts/test-playground-ai-cases.ts` validates corpus coverage, real targets, bounded reference operations, compact context, manual-work preservation, rejected ambiguous selectors and rejected customer uploads.

Run from the frontend repository root:

```text
node --import tsx --test scripts/test-playground-ai-cases.ts
```

The five focused tests passed on October 14. They validate fixture feasibility and mutation boundaries. They do not measure model quality, live usage, visual quality or human acceptance.

Local receipts are in `artifacts/playground-unified/ai-comparison-protocol/`: `corpus-validation.txt` contains the five-test result and `corpus-validation.json` records source hashes, all 20 resolved targets, deterministic project/context hashes and context sizes. The largest fixture context is 3,651 UTF-8 bytes. Every model run remains `not_run`, every usage/cost/latency/correction measurement is `null`, human review is `pending`, and actual provider calls are zero.

## Corpus coverage

| Category | Cases | Scope represented | What is tested |
| --- | ---: | --- | --- |
| Initial design | 3 | Page | Adapt a public starter's hero and shared styling to a fictional service, retreat or portfolio brief. |
| Brand application | 3 | Brand | Apply a palette, shared typography or consistent name/tone while retaining content and geometry. |
| Copy refinement | 4 | Element, section | Respect word limits, clear actions, claim boundaries and exact untargeted content. |
| Section redesign | 3 | Section | Refine supported section copy, spacing and alignment while retaining the page. |
| Responsive repair | 4 | Element | Change explicit mobile geometry without changing desktop geometry or sibling content. |
| Preservation of manual work | 3 | Element, section | Keep prior manual copy/geometry and locked brand values while making the requested narrow change. |

The same three existing public starters are used throughout: Switchboard, Tideglass and Matter. Names and business descriptions are fictional. No customer photos, logos, accounts, private projects, paid archives or sensitive uploads are in the corpus. Matter's default About section is hidden, so its visible Work section is used for section comparison. This protocol does not change starter behavior.

## Fixture and target contract

Each case contains a public `brief`, `target`, `manualEdits`, user `prompt`, `allowedFields`, `referenceProposal` and `successCriteria`.

The target includes `scope`, a real `sectionId`, and either `node: null` or an element selector containing its exact `type` and `name`. The resolver checks for one matching node in the actual starter's authoring graph; a missing or ambiguous match fails. It never guesses an ID. Non-element scopes must carry no node target.

The fixture builder uses `createStarter`, then replaces fresh working-draft node IDs with deterministic `node-fixture-<section-id>-<preorder-index>` IDs. It applies the case's explicit manual edits through `applyProposal`, then any listed brand locks. Every configured model receives the identical resulting project/context for a case.

```ts
import { loadAiCases, createAiCaseFixture } from './playground-ai-case-fixture';
const corpus = loadAiCases();
for (const testCase of corpus.cases) {
  const { project, context, sectionId, nodeId } = createAiCaseFixture(testCase);
  // The live driver sends testCase.prompt and context to its configured route.
  // The driver records the exact project/context hashes and resolved IDs.
}
```

For visual runs, use only the bundled public artwork returned by `loadStarterArtwork(testCase.brief.starter)` as the fixture builder's optional second argument. Use the same rasterized bytes for each model's version of that case. Record their hash. The builder itself does not fetch artwork. Provider contexts use `createProposalContext`, which strips raw images, media source filenames and standalone studio data. Every fixture context is checked to fit within the 48,000-byte corpus ceiling; keep the user prompt under 1,200 characters. Do not send reference proposals, success criteria or other models' answers to a candidate model.

Reference proposals demonstrate that a request is possible under the current typed contract. They are deterministic validation fixtures, not a preferred model response, visual-quality gold standard, accepted user answer or evidence of provider capability. Creative copy may differ while satisfying the stated criteria. Never score a model simply by its similarity to the reference wording.

## Run controls and receipts

Freeze the corpus, code commit, renderer/runtime versions, public artwork bytes, exact model IDs, prompt template, sampling configuration, maximum output tokens, rate card/version and server cap policy in a run manifest before dispatch. Record SHA-256 digests of the corpus, fixture project and projected context. Record the transport/provider request ID and local request ID after each dispatch, without credentials or authorization headers.

Keep identical prompts, contexts and render conditions across configured models. Change only the declared model/route and required provider-specific transport fields. Use a fixed seed only where the route supports it; record unsupported seeds explicitly. A repeated call is a new paid attempt even when it uses the same case. Include failures and retries in the evidence and budget ledger.

Start with a small smoke covering the typed operation envelope and preservation checks. Expand to the full corpus only if transport, usage capture, typed validation, rendering and cap settlement pass and the remaining aggregate budget can fund the worst-case commitments. Reserve bounded cost before dispatch; stop when the next call would exceed the remaining $5 ceiling. If the budget cannot cover all cases/models, retain the partial matrix with `not_run` or explicit skip reasons. Do not silently reduce the test denominator or add top-up funding.

Use one to six validated operations per proposal. Validate with the same `validateProposal` and `applyContextProposal` as the editor, then apply accepted operations to the full preserved project using `applyProposal`. A malformed, unsafe, locked, out-of-scope or no-op response is a failed attempt with its actual cost retained. No automatic retry or fallback may evade the original reservation or declared budget.

Save raw response metadata and usage, validated operations, before/after project hashes, a readable change list, validation failures, renderer diagnostics and desktop/mobile screenshots under the run's local artifact folder. Keep the original fixture and model result immutable; corrections produce separate attempts. Do not store secrets or private uploads. A mounted/configured Drive mirror may copy this evidence after local saving; report actual copy status independently.

## Success measures

Record each measure independently. A good-looking screenshot cannot excuse unwanted changes, and valid operations do not establish visual quality.

| Measure | Required evidence and rule |
| --- | --- |
| Instruction fidelity | Evaluate every case-specific criterion, including requested numeric values, word limits, required disclosures and excluded claims. Record automated checks separately from human interpretation. Use `pass`, `fail`, `partial` or `not_reviewed` with evidence and reason. |
| Valid typed proposal | One to six unique supported fields; correct scope/target; no unsafe links, unsupported structure, invalid geometry, brand-lock violation or no-op. Keep raw invalid responses and their costs visible. |
| Unwanted mutations | Compare the full before/after source. Required count is zero outside the declared fields and documented section-to-block/name synchronization. Preserve node/section IDs and order, artwork/crop, links, desktop settings for mobile-only tasks, locked brand values and manual edits. A change outside the allowance is a failure. |
| Rendered behavior | Use the common renderer/export path. Record browser errors, missing assets, clipping, overlaps, focus usability and desktop/mobile output. Test at 1440×1000 and 390×844 CSS pixels; horizontal scroll must not exceed viewport width by more than one CSS pixel. Preserve exact before screenshots for comparison. |
| Visual quality | Model-blinded human review of the rendered result, with reasoned observations and review status. Pending review stays pending; an automated check must not fill human scores. |
| Correction count | Record additional model calls and human edit actions separately, beginning at zero for the initial attempt. Increment only from actual logged correction events. Show attempts-to-acceptance only after acceptance exists; otherwise use `null` with the stopping reason. |
| Latency | Measure monotonic dispatch-to-response time for every attempt, plus validation/render time separately. Report per-attempt values and sample count; use percentile summaries only for a sufficient recorded sample. Include timeouts and failures explicitly. |
| Actual usage and cost | Retain provider-reported input, output, cached/reasoning usage and any explicit charged-cost evidence as available. Compute token cost only from the recorded rate card and applicable actual usage. Distinguish that computation from a provider invoice/charge. Missing usage/cost remains `null` with a reason; never substitute zero or the estimated reservation. Track pending liability and reconcile it before claiming a final total. |

For a simple token-priced route, the recorded-rate computation is:

```text
computed_cost_usd = (billable_input_tokens × input_usd_per_million
                   + billable_output_tokens × output_usd_per_million
                   + separately priced usage components) / 1,000,000
```

Apply cached-token or other component rules only when the actual usage and recorded rate card support them. Keep reserved estimate, computed metered cost, provider-reported cost and unresolved liability in separate fields. Sum all chargeable attempts across models and retries for the aggregate budget.

## Model-blinded human review

Generate opaque model labels once per run and retain their private mapping separately from review screenshots. Present the same case brief, before image, and candidate after images at identical viewport sizes. Remove model names, provider IDs, price and latency from the review packet. Randomize candidate order deterministically and record the ordering seed. Include every attempted candidate; label failed render/invalid proposal outcomes rather than discarding them.

Ask a human to assess instruction fidelity, hierarchy, readability, spacing, mobile coherence and preservation of intentional manual work. A suggested ordinal scale is 1–5 with written anchors: 1 unusable, 2 substantial correction required, 3 usable with clear corrections, 4 strong with minor corrections, 5 meets the brief without identified correction. Human reviewers may decline or mark uncertain. Until a real reviewer supplies a score, `score`, `reviewer`, `reviewed_at` and acceptance must be `null` and status must be `pending`. Do not create fictitious users or claim unfamiliar-user acceptance from an agent review.

Unblind only after independent reviews are recorded. Report per-case results and failures before any aggregate average. State reviewer count, reviewed-case coverage, correction counts, actual usage/cost coverage and remaining uncertainty alongside summaries. The unfamiliar-target-user acceptance gate is separate and stays open until actual users complete the requested work.

## Supported claims and limits

“Initial design” here means adapting an existing public starter's selected hero and shared tokens. It does not generate a new page graph, full website, assets, components or integrations from scratch. “Section redesign” covers supported copy, alignment and spacing changes. It does not authorize arbitrary section replacement, node insertion/reordering, image generation, image crop, Motion/Effect creation or unsupported CSS. Those operations are absent from the current six-operation proposal contract and cannot be inferred from an attractive result.

These cases can measure bounded instruction following, responsive fixes, preserving manual work, operator correction burden, latency and actual usage under the current editor contract. They cannot establish production readiness, connected booking/contact services, real commerce acceptance, human taste, physical-device behavior or full-site generation quality. All result metrics remain `not_run`, `pending` or `null` until their own receipts exist.
