# Account acceptance recovery — October 19, 2026

## Exact source ancestry

This successor merges held site #98 `cc2808a62a6fe43e6c8779bcaf25ca6b6bdee97a` with public main `09cb0b0199c8e6b1f4df3689464cf0fee67e2ae3`. The paired backend is [draft #85](https://github.com/bmparent/eidos/pull/85), `bc47de2c6eabe90c204a12643b88161a98a801d4`, with parents held #67 `c18b580358dcfeb0b70ba7a045c8f506513f452f` and current backend main `34c3d21509dfa1017705244e0d42a6eb7bc7dff9`. The original branches/previews and overnight tutorial #128/rehearsal #129 remain separate and preserved.

## Resolution and behavior

- Preserve current public editor, document identities, import-before-switch persistence, Arrange controls, media handling, frozen package review and independently runnable exports. Keep the held account/Google/password, owner and payment code. NEXT-STEPS.md remains in the developer export alongside the current renderer.
- Current editor formats remain local-only at the UI. Schema-5 and disguised studio fields fail before authentication/database access in both runtimes; the older explicitly gated schema-4 server path keeps its prior configuration. No feature activation occurs.
- Legacy cloud UI retains reported owner identity, expected-owner saving and account-epoch invalidation. Open/restore awaits successful persistence of the outgoing document; account changes while that save is pending cancel replacement without losing local edits or attaching a prior owner's target.
- Optional outcome telemetry now accesses its binding only for monitored routes, inside error containment. A missing/throwing telemetry binding preserves the handler's controlled response. This was a reproducible integration failure; it has not been established as the cause of Brent's reported public error.
- Export and verification use one complete runtime inventory. The exact-pair read-only CI check includes all 86 registered source files, including added schema/runtime dependencies; it does not deploy a preview.

## Local evidence

Fresh lockfile installs in both worktrees. Frontend TypeScript and lint pass; 41 platform, 36 audit, 106 Playground, 8 owner-console, 14 growth, 7 finance-policy, 7 indexing, 1 analytics and 6 glass tests pass. Snapshot/signature smoke, snapshot Worker typecheck and 7 isolated-preview guard tests pass. Client/SSR/prerender build, Pages Functions compilation, 34-route editorial verification, source/built validation for 20 articles, URL verification and built indexing policy for 56 eligible pages/13 intentional exclusions pass. No article content changed; external source retrieval was intentionally skipped. Final shared-source parity: 86/86.

Backend TypeScript, 16 JavaScript and 69 TypeScript tests and webpack production build pass; the final four-test studio/telemetry suite passes after adding its last regression. Three frontend regressions cover telemetry failure and account-change cancellation.

Read-only public-browser observations around 10:26–10:33 AM Eastern: canonical Playground loaded, reopened its saved local project and prepared its frozen review. No application console error was reproduced in that session; the observed errors belonged to the browser extension. No real account signup, message, payment, API generation or user-project edit was submitted. Existing repository browser executables are unavailable locally; exact-head cross-browser CI and physical-phone verification remain distinct and pending.

## Current blockers and release gates

### Local-only regression discovered during release integration

Editor run `39270651040` failed the retained no-provider-request check: opening/importing a supported legacy local document mounted the account panel and automatically fetched `/api/playground/projects`. The continuation removes that mount/session-change fetch. Session changes still clear the previous account's list, history, proposal and new-format capability; explicit Refresh/Open/Save actions keep their authorization and account-epoch checks. The production-component hook regression verifies zero requests on mount/session change, one GET on explicit Refresh, and removal of the old account list without fetching the next account. Existing three-engine persistence acceptance retains its strict zero-request assertion. This frontend-only correction changes no shared runtime, account identity, API, provider flag or backend pin.

The Stripe connector exposes only the LIVE Eidos Works context. Intended TEST access, actual endpoint/event HTTP results and the selected guest 105/76 paid lifecycle remain unavailable. The account-access link was presented to Brent; no LIVE operation was substituted. Historical webhook retry cutoffs remain October 19 at 9:46:45 PM and 9:49:31 PM Eastern, not proof of a currently failed or obsolete route.

This is a source recovery, not hosted account acceptance. Real Google consent/password confirmation/reset inbox delivery, two controlled member identities, owner-console access, isolated saved-project reopen and intended signed TEST lifecycle remain open. Existing deployment workflow still pins the older backend; do not use it to claim this new pair is hosted. No database/binding/credential/provider/cost/schedule changes or production promotion occurred. Production remains unaccepted for the held runtime.

Rollback uses the original held pair and preserved deployed previews, retaining every member, project/revision, immutable order/archive and additive schema. Recovering an old branch is not authority to replace production with it.
