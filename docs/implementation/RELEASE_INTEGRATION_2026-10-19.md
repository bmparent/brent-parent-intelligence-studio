# Combined Works release integration — October 19, 2026

## Candidate and observed baseline

The source combines account recovery #131 (`cd2068e93b2475ea1588be43d56f07ff5da0414a`) with tutorial/readiness and the approved four-file purchase-message fix (`870c877fc6cffb5a7ea252cf7489ca2b0c48bcf0`). The fix passed all four CI workflows and merged as #132 into tutorial #128 (`7e33061745d8fe55b20c2d441f6a17a778444667`). Account #131 passed all five workflows after its local-only cloud-fetch correction. This candidate still needs its own combined-source CI.

Paired backend [#86](https://github.com/bmparent/eidos/pull/86) is `55044733c122067562321b412bd4f1b01b333106`, tree `fb25dd006ce7de71c6035f19591114d84868f005`, combining recovered account #85 and readiness #83. All 107 registered shared files match; the independent 18-file delivery/proposal graph matches inventory `a173de046f9184dce51821b8c12682496196e1cca341f75f037fc8b2ec97646d`. CI pins that backend revision and checks both inventories.

The public source baseline remains site `09cb0b0199c8e6b1f4df3689464cf0fee67e2ae3` and backend `34c3d21509dfa1017705244e0d42a6eb7bc7dff9`. The observed tutorial rehearsal remains deployment `61cd9002`, not this combined candidate. The original reported error remains unspecified; the reproduced purchase-503 message and local legacy-project fetch regression are resolved in source.

## Integration decisions

Retain account epochs, password/Google/owner security, cloud asset quotas, canonical account redirects, OAuth cookie forwarding, current production indexing and publication workflows. Keep the current editor local-only until its cloud gates pass. Retain the new scoped-AI, immutable purchase attempts, tutorial and frozen review without activating providers.

Historical migration bytes, including legacy AI 0005, are unchanged. New scoped-AI accounting is additive 0009. Historical legacy AI code/tests have explicit Legacy names, avoiding a case-only path collision. A retained unknown AI row remains unchanged; applying the complete combined migration sequence twice passes integrity/foreign-key checks. No hosted migration or data rewrite was performed.

The combined checkout/webhook retains template and kit delivery. Tests caught a legacy kit refund querying an absent template table; it now checks table availability, preserving old receipts/refunds before template rollout. A missing template order still cannot be falsely fulfilled.

## Verification ledger

| Gate | Observation and environment | State |
| --- | --- | --- |
| Frontend source/local | TypeScript, lint, 43 platform, 168 editor/purchase, 36 audit, 37 showcase tests; template package/manifest/shop tests pass. Two additional migration regressions pass. | Pass locally |
| Frontend build | Client/SSR/prerender, editorial, indexing and URL verification, Functions compilation pass. | Pass locally |
| Backend source/local | TypeScript, 20 JavaScript and 178 TypeScript tests, Next production build pass. | Pass locally |
| Paired contracts | 107 shared files and separate 18-file graph match; exact backend pinned in CI. | Pass locally |
| Combined exact-head CI and browser suite | Required on this new integration head; earlier parent CI is separate evidence. | Pending |
| Hosted accounts | Actual Google/password/reset inbox, two-member ownership, saved-project reopen, owner access on the exact pair remain open. | Not tested |
| Provider/payment | Intended Stripe TEST endpoint/lifecycle proof remains unavailable through the LIVE-only connected context. Existing source/fixture proofs do not replace it. | Blocked |
| Production acceptance | Combined source is not yet hosted/provider accepted. No production promotion or feature activation occurred. | NO-GO pending gates |

Source integration PRs target the held account branches, preserving production. The new backend release branch has automatic Vercel deployment disabled. Original immutable account/readiness previews, public aliases, database rows, archive pins and credentials remain intact. No LIVE charge/refund or paid AI call was made. Rollback source identities are the public baselines above; retain additive tables and all member/project/order records.
