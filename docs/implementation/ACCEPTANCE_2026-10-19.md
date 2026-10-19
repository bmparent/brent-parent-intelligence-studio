# Account acceptance recovery — October 19, 2026

## Continuation after the network interruption

This section supersedes the earlier source/hosting pointers below; their dated observations remain historical evidence. Operational frontend #134 merged into release #133 as `a3d0dbe91d2fae5a45f359e84334d6866ce4c66c`. Its complete tree `885a14d3da651e92a198ac9c882ebd2a979eed60` equals both tested #134 head `09f1fc3b7d3a46181b6c016d400aef5a2d7f7398` and tested PR merge `0a4e3922ae46c2fa0fb11cef76b913c91572eb3b`. The new #133 test merge `de466a174a1ac6e968b0af579467bc241a15804e` also has that tree. Seven isolated-preview guard tests pass again locally. All seven fresh combined CI workflows passed, including [full editor/browser run 39291754860](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39291754860); #133 merged into held account #131 as `34d2c034ebc3e70c79463323792682b4795728b9`. The source integration is accepted; production is not.

The paired preview is already hosted: canonical account origin `https://eidosworks-test-20260923.pages.dev/account/`, immutable Pages deployment `1396daa7-0e67-4fdf-9fe6-2acad23d06ff`, backend source `55044733c122067562321b412bd4f1b01b333106`, Vercel deployment `dpl_CVJ5ERsLQiigU8BoHC9uc5B7CEwB`. Successful preview workflow [39277624014](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39277624014) verified both source inventories, exact delivered account assets, canonical credential-route redirects, the runtime backend revision, ready password/Google configuration, `localTest:false`, denial boundaries and unchanged production configuration. Backend #86 is merged into held #85 as `944accb1c52d6af708b0f02709f5c819241d33b7`; its [merged-source quality run](https://github.com/bmparent/eidos/actions/runs/39276044116) passes. These preview and source receipts do not accept actual identities or payments.

Fresh cloud Chromium observations at approximately 13:08–13:14 America/New_York: account signup, sign-in and reset screens load without the earlier account-load message. A new disposable local project retained its entered name and offer, saved, reopened after reload, prepared a frozen review and completed a page-package download. Account purchase availability while anonymous clearly requested sign-in; local download remained available. This is a desktop cloud-browser result, not physical-device, cloud-project or purchased-delivery acceptance. No real account, password, reset request, mail, payment or AI generation was submitted.

The subsequent secure Google sign-in reached the real Google account chooser. After user takeover, the canonical preview returned with "Google verified your email. Choose a public name to finish." This is positive Google callback/email-proof evidence. It is not a completed member/session: the visible page still requires a username and Finish creating account. That account-creation and terms step is left for the user. No credential, OAuth code/token/state, Google URL or private account identifier is included in this receipt.

Current blockers are specific: the Google-backed member signup is unfinished, no second controlled hosted member or owner Access session is established, and the Stripe connector still exposes only the LIVE Eidos Works account. No confirmation/reset/sign-in message matched today's targeted Eidos Works inbox search; no new mail was requested, so this is not a delivery failure finding. Completed Google account/session acceptance, password/reset inbox receipt, two hosted owners with save/reopen and cross-owner denial, authenticated owner-console/backend pairing and the intended signed Stripe TEST lifecycle remain open. Shell HTTP attempts returned 403 from this execution path; browser access and the successful hosted workflow remain separate evidence. Production baseline remains site `09cb0b0199c8e6b1f4df3689464cf0fee67e2ae3` and backend `34c3d21509dfa1017705244e0d42a6eb7bc7dff9`. No production promotion, provider activation, database migration or LIVE transaction occurred.

Preview rollback references remain prior Pages `d6a35701-ede4-4781-a129-07b623b65168` and the prior immutable backend described below. Preserve all records and additive schema. The separate owner Worker still needs its own authenticated current-backend verification.

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

## Release and queue closeout continuation

Brent explicitly authorized readying and releasing the open Works work on
October 19. Google member signup **completed**, the account dashboard showed the
linked Google identity, and a full reload preserved that session (PR131's
19:01 UTC follow-up). This supersedes this file's earlier unfinished-signup
observation. Owner MFA and dashboard reads also passed, but only against owner
backend source `1bbcab6bf1e2483d8a769bf12534039c397a994d`; the owner Worker
configuration still targets its older immutable backend, rather than `5504473`.

The public-only PR114 reconciliation is carried into this candidate without
changing the 107 shared runtime files or 18-file delivery graph. Its own release
receipt remains separate. The 19 duplicate/superseded/retired reviews closed in
this continuation retain their branches and evidence. Historical PR109's sole
extra documentation-only spacing correction is retained here too.

Fresh browser UI opened the guest template preview's Switchboard developer
1.0.3 checkout and Stripe explicitly showed Sandbox and TEST. No payment was
submitted. Automatic approval review rejected entry of the receipt email and
Stripe test-card data because explicit permission for that particular test was
not present; no alternate entry method was attempted. This is an approval
blocker, not a failed card payment or proof of fulfillment. The connector still
exposes only LIVE.

The current browser has no recovered authenticated member/owner session. Actual
password/reset inbox receipt, two hosted controlled members with owned project
reopen/isolation, owner routing/current-backend acceptance, signed TEST
webhook/download/recovery/refund/replay and full production configuration remain
open. No status is silently changed to pass. Paid AI, new-format cloud, new LIVE
sales and Snapshot remain disabled pending their own gates.

### Reconciled presentation regression

New candidate browser run `39327644730` failed at the affected service link: the
combined project selector begins with Signal House, while the old presentation
conditional and test assumed Holidays was first. Composition now selects the
actual Holidays project by title, and the browser flow explicitly selects it.
The regression also checks that initial Signal House keeps its original artwork
and Holidays retains both composed pairs. This is a frontend-only repair; shared
backend and delivery contracts remain unchanged. The failed artifact is retained;
new-source CI must pass before this candidate is accepted.
