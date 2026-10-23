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

## Recovered continuation — source integration accepted

The initial pending CI/hosting rows above are superseded for the exact candidate below. Frontend #134 merged as `a3d0dbe91d2fae5a45f359e84334d6866ce4c66c`; frontend #133 then merged into held account #131 as `34d2c034ebc3e70c79463323792682b4795728b9`. Both merge wrappers, tested operational head `09f1fc3` and both tested PR merge trees contain exactly tree `885a14d3da651e92a198ac9c882ebd2a979eed60`. No runtime change was introduced by consolidation. Backend #86 is merged into held account #85 as `944accb1c52d6af708b0f02709f5c819241d33b7`.

All seven workflows on frontend `a3d0dbe` completed successfully:

| Gate | Run |
| --- | --- |
| Full editor, three engines/three widths, source/build and retained browser checks | [39291754860](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39291754860) |
| Exact 107-file contract and independent 18-file graph | [39291754817](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39291754817) |
| Site quality | [39291754824](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39291754824) |
| Purchase readiness fixtures | [39291754882](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39291754882) |
| Wellway acceptance | [39291754819](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39291754819) |
| Community acceptance | [39291754755](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39291754755) |
| Template commerce fixtures | [39291754762](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39291754762) |

The isolated-preview workflow intentionally skipped this release branch; the identical operational source already passed upload/readback [39277624014](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39277624014). It serves immutable Pages `1396daa7-0e67-4fdf-9fe6-2acad23d06ff` with backend source `55044733c122067562321b412bd4f1b01b333106`, deployment `dpl_CVJ5ERsLQiigU8BoHC9uc5B7CEwB`. No additional upload was needed. Merged backend quality [39276044116](https://github.com/bmparent/eidos/actions/runs/39276044116) passes.

Fresh hosted desktop cloud-browser checks passed local create, entered name/offer, save/reopen after reload, frozen review and local package download. Google sign-in and user takeover returned to the canonical account page with verified-email proof and a username-completion screen. A completed member/session, second hosted owner, inbox/reset delivery, owner Access/current-backend verification and signed Stripe TEST acceptance remain open. Stripe still exposes only LIVE through the connector. No production promotion or provider activation occurred. See the updated dated acceptance record and item tracker for the remaining gates; source acceptance does not close those rows.
