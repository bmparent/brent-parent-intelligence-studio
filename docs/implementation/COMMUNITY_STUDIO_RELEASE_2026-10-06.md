# Studio community release — October 6, 2026

Brent authorized resolving the community agent release blockers and shipping the result. This release restores the original independent site #84/backend #68 pair, preserving current public changes and the unrelated held Works #98/#67 runtime.

## Candidate and environment

Site #84 incorporates public main `a6faf20fbedffda38f01f3052a3df9a8d541c4b4`; its original acceptance append conflict is reconciled without removing either history. Backend #68 starts from `c18cb36da54dac3d5e45554cfcf02f58767096d2`. The five scoped shared community files match the current export byte for byte. The runtime contract and prepared topics remain in [the October 1 record](COMMUNITY_STUDIO_AGENTS_2026-10-01.md).

Backend candidate `67fbd9b85ce3c413d18159236dd77eca59a7ff9d` is paired with tested site `d58a3b59b55e81c6b676a9eb4dbcbc74c834485c`. The Vercel preview is `dpl_E2Ky5M3VpSQQPJstotrfq2qF7cRf`, at `https://eidos-sentinel-asqzjumqv-1brentbm-1876s-projects.vercel.app`. Its prefix selects the previously verified isolated database (identity hash `4882b7d6be40a19a97d5dabce311089dc72a984e5a2b3b3f64081216926bb353`). Missing prefixed bindings fail closed and cannot fall back to production. Its exact allowed frontend origin is `https://eidosworks-test-20260923.pages.dev`.

The hosted workflow temporarily uploads to that existing validation project, records its prior deployment/relay, uses the same concurrency lock as the held Works preview, and restores both in an always-run step. The customer project is read-only throughout preview testing. The first hosted attempt caught canonical edge propagation before the new roster became visible; the bounded readback now waits for the required roster and never accepts an old response.

## Evidence ledger

| Requirement | Observation | Environment / exact source | Evidence | State |
| --- | --- | --- | --- | --- |
| Backend source quality | Tests, TypeScript lint and Next build pass | Backend `67fbd9b` | [37513148469](https://github.com/bmparent/eidos/actions/runs/37513148469) | pass |
| Durable identities and dedupe | 20 overlapping calls create at most one disclosed starter; three real registry rows; repeated run creates none | Hosted isolated DB, backend `67fbd9b`; 2026-10-06T18:41:22Z | Vercel deployment build receipt `EIDOS_COMMUNITY_HOSTED_ACCEPTANCE` | pass |
| Moderation and readback | Unauthorized approval denied; clearly labeled stored QA reply approved; disclosed topic visible in JSON feed | Same hosted isolated DB/build | Same sanitized provider receipt | pass |
| Paired HTTP relay | Real roster, thread list, thread HTML and feed pass through Pages/Next | Site `d58a3b5` to exact backend preview above | [37514183974](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/37514183974) | pass |
| Hosted browser | Pending the actual desktop/390px browser receipt and restoration step | Same isolated pair | Same run, retained screenshots and result JSON | pending |
| Production promotion | Must verify both merged commits, backend alias, Pages canonical deployment and maintenance receipt | Production | Final exact receipts are recorded on [site #84](https://github.com/bmparent/brent-parent-intelligence-studio/pull/84) and [backend #68](https://github.com/bmparent/eidos/pull/68) | pending |

The isolated build uses a simulated schedule date solely to exercise the scheduler; the deployed API has no clock override. The hosted QA reply is inserted as a clearly labeled test contribution and approved through the actual protected dispatch handler. The existing CI browser fixture separately exercises visitor submission plus moderation. No hosted guest CAPTCHA completion, physical phone, assistive-technology, or automatic model-reply acceptance is claimed.

## Authorized activation and operations

After exact-source gates pass, merge/deploy the backend, set only production `EIDOS_COMMUNITY_STUDIO_ENABLED=true` and frozen `EIDOS_COMMUNITY_STUDIO_START_DATE=2026-10-06`, then merge/deploy the site. Tuesday's real maintenance receipt should register the identities and report `waiting`, with zero new posts. The first eligible public starter is Wednesday October 7 after 9am America/New_York; GitHub's hourly schedule may be delayed. No public test prompt or simulated production date is used.

The existing hourly workflow now checks the maintenance response and reads active identities. A newly published starter must be readable with its operator disclosure in both the JSON feed and HTML thread. It logs sanitized receipts and fails when required service credentials or readback are missing. A revoked identity may remain paused; rejected topic receipts remain durable. The source merge also triggers a real maintenance run so activation is observed without waiting for the next hourly slot.

There are three disclosed role identities sharing one prepared-content scheduler, a 24-prompt queue, and no automatic replies. This scope adds no paid model calls or budget changes and does not activate other held features. Existing newsletter/account configuration keeps its existing behavior.

Rollback pauses the studio flag and restores site `a6faf20fbedffda38f01f3052a3df9a8d541c4b4` / backend `c18cb36da54dac3d5e45554cfcf02f58767096d2` (Vercel `dpl_CACaaPPGSB798D6nKVQp2GyK3Ci6`). Keep registry IDs, the frozen queue anchor, publication/rejection receipts, customer replies and all unrelated data. No migration or data reset is included.
