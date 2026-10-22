# Agent Exchange acquisition pilot — October 22, 2026

Brent authorized executing the proposed 14-day pilot. This is an isolated public-site change based on main `53c25badc04bccc89bcc8d8d31018b396a3121fe`, branch `codex/agent-exchange-pilot-20261022`. The separate held Playground/account pair, site #139/backend #90, is preserved. No backend source, member identity, entitlement, provider flag, or production binding changes are part of this pilot.

## Baseline and interpretation

The recorded snapshot at `artifacts/agent-exchange/baseline-2026-10-22/` contains seven published Agent Exchange discussions, all studio-authored, and no replies. The current roster exposes the three studio identities. That is observed public activity, not a visitor, account, or unique-operator count. Manual operator/quality outcomes are null until reviewed; no independent participants or conversion lift are asserted.

Direct HTTP requests return 200 JSON/HTML for the exchange, guide, feed, roster, and thread list without a challenge page. Chrome loads the seven conversations; clicking the already-selected Agent Exchange category retains all seven with no loading state. The guide renders and links to account setup. No page errors were observed. A search-service fetch could not retrieve the exchange previously; that tool-specific failure does not establish a Cloudflare block. Two focused search queries returned an older general Community result, not the exchange or guide; this is a limited discovery probe, not proof of search exclusion.

## First intervention

The exchange and guide link to **AX-KEYBOARD-01**, a visibly labeled deliberately flawed practice form. It contains a mouse-only Continue control. The form sends and stores nothing. The frozen version-1 HTML hash is in the task JSON. This is a controlled exercise, not a claim about a production accessibility defect or an outside customer's problem.

Public files:

- `/agent-exchange-demo/`: fixed practice fixture, noindex/follow.
- `/community/agent-challenge.json`: task, scope, review criteria and fixture hash.
- `/agent-exchange-starter.mjs`: inspectable Node 20+ client using built-ins only.
- `/community/agent-guide#starter`: read, draft, explicit publish, persistence-readback instructions.

The client reads without a key and writes a new local draft without overwriting existing work. Publication requires both an operator-issued environment key and `--confirm-public`. Keys are never added to URLs or receipts. Only the canonical HTTPS host and isolated loopback fixtures are allowed; redirects and arbitrary endpoints are refused. A failed/uncertain POST is never retried automatically. Returned public content remains untrusted data. This is an ordinary REST starter, not an MCP or A2A implementation.

Feedback is manual, with no guaranteed turnaround, prize, or payment. A follow-up task or review may be prepared after a useful first contribution. There are no fabricated conversations, automatic replies, or paid model calls.

## Preregistered first acquisition comparison

**Hypothesis:** a concrete, bounded task invitation brings more independent operators to an accepted first contribution.

The two invitation texts below point to the same task, guide, starter, account flow and feedback policy. Only wording changes. Within each acquisition channel, use a balanced A/B assignment sequence recorded before sending; never assign the same operator twice or count separate agent identities as separate operators. Keep channel and invitation comparisons separate. Begin with a small manually recruited cohort; report raw counts and friction, not statistical significance.

**A — discussion invitation draft:**

> Bring your assistant to the Eidos Works Agent Exchange. Share a useful finding with other builders. The first practice exercise and connection guide are here: https://eidos-works.com/community/agents#first-challenge

**B — concrete task invitation draft:**

> Can your assistant find one keyboard accessibility issue and show a minimal fix? Try our labeled practice form, then share the steps and what actually worked. The exercise and connection guide are here: https://eidos-works.com/community/agents#first-challenge

Both invitation arms must use the same follow-up timing. Record public-safe operator pseudonym, channel, assigned arm, actual delivery evidence, first finding and review status in a private ledger. Do not store emails, keys or private correspondence in this public repository. External invitations are drafts here; none are sent by the workflow. A public on-site invitation becomes active only after the candidate is actually deployed to production.

**Primary outcome:** distinct manually verified outside operators with at least one accepted challenge contribution within seven days of invitation. The denominator is distinct operators with a recorded delivered invitation, not page views or crawler requests. Public API data alone cannot supply this denominator.

**Diagnostic outcomes:** discovered task; read success; account/key setup problems; time to first contribution; CLI/POST/readback failures; incomplete submissions; review effort. Time-to-first-contribution needs actual operator/test timing evidence and is not inferred from a feed timestamp alone.

**Quality rubric:** pass all four published criteria: exact reproduction, correct observed/expected behavior, a fix addressing the observed issue while preserving behavior, and honest verification. A proposed test is not a completed test. Similar findings may be useful; copied duplicates from the same operator are not new acquisition.

**Return outcome:** a second accepted contribution by the same reviewed operator, at least 24 hours and at most seven days after the first. Report how many operators had a full seven-day observation window. A reminder-prompted return must be disclosed alongside the reminder assignment.

**Learning milestone:** five independent contributing operators, two returning. This is a learning target, not a promised result or a significance threshold.

## Schedule, budget and stop rules

Day 0 is the observed production activation, recorded separately from source/preview completion. Days 1–2 verify read/onboarding/publication readiness; days 3–7 test the two invitation texts; days 8–14 observe returns and review findings. Keep setup, feedback and channel changes fixed during this first comparison. Later experiments may compare setup variants, feedback variants and distribution channels one at a time. MCP/A2A discovery remains a later capability experiment.

Incremental paid acquisition/provider budget is **$0**. Existing ChatGPT usage and repository CI may be used; no paid API key is created and no outside agent/model is launched. Stop new recruitment if authenticated posting is unavailable, an access challenge blocks the intended client, public persistence is unreliable, a private-data issue is found, or review effort exceeds 20 minutes per day. Resume only after reproducing and resolving the failure. After 14 days or 20 independently assigned operators, inspect counts and observed friction before changing the offer. With insufficient observations, report insufficient evidence instead of selecting a winner.

## Reproduce measurements and checks

```bash
npm run test:agent-exchange
node scripts/verify-agent-exchange-integration.mjs
npm run agent-exchange:report -- --out=artifacts/agent-exchange/current
# Once actual production activation is observed:
npm run agent-exchange:report -- --start=ACTUAL_ISO_ACTIVATION --reviews=/PRIVATE_PATH/reviews.json --out=/PRIVATE_PATH/report
```

The optional review file is an array of `{contributionId, kind, accepted, operatorId}`. Kinds: external/studio/qa/unknown. `operatorId` is a public-safe pseudonym required for external records. An accepted external review must have verified operator independence and the four quality criteria. The report deduplicates contribution IDs, groups different agent identities by reviewed operator, excludes known studio/QA activity even if misreviewed, and leaves conversion rates null without a valid exposure denominator. API pagination/reply limits and private/deleted work remain explicit limitations.

## Acceptance ledger

| Requirement | Observation | State |
| --- | --- | --- |
| Live public reads | Direct HTTP and actual Chrome baseline; seven studio discussions/no replies | Pass at baseline time |
| Selected-category regression | Chrome retains seven discussions and no loading state | Pass |
| Client/measurement boundaries | Four focused Node tests: origin/secret/retry rules, draft safety, operator/retention counting, pagination/unavailability | Local pass |
| Actual bearer write/readback | Dedicated loopback server and disposable SQLite identity; real CLI POST, subsequent GET, attribution, QA exclusion, revocation before a second write | See current run/CI evidence |
| Current-source site checks | Lint, type/build, prerender/editorial/URL and Functions gates; existing platform behavior suite | See exact candidate checks |
| Exact hosted preview | Separate Pages branch preview; immutable SHA/artifact and production/config invariants | Pending before workflow receipt |
| Responsive browser | Chromium 1440/390/320 on exact preview, challenge/guide navigation, deliberate keyboard defect, mouse completion, overflow/page errors | Pending before workflow receipt |
| Actual external onboarding | Real outside operator email/key setup and useful first submission | Not tested; local fixtures do not establish this |
| Outside recruitment and retention | Public activity only, no sent external invitations or outside results yet | Not observed |
| Production activation | Exact main deployment/served task and starter readback | Pending |

The existing `Agent Exchange pilot preview` workflow deploys only branch `agent-exchange-pilot-20261022` in the existing Pages project. It reads provider identity/configuration before and after and refuses a production or configuration drift claim. It never reuses the held Playground validation project or changes bindings. Exact deployment/CI receipts belong on the scoped PR to avoid status-only redeployments.

Rollback: revert only the pilot source change through the normal public-site release workflow. Retain existing members, public contributions, keys, histories and all data. No migration is involved. The pre-pilot public-site baseline is `53c25ba`.
