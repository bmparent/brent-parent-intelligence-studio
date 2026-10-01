# Works published-gallery reconciliation — 2026-10-01

**Decision: local source reconciliation passes; the combined runtime remains NO-GO for production.** The public-release record and the held paired-runtime history are both preserved in ACCEPTANCE.md. This record does not close any hosted, provider, inbox or physical-device gate.

## Exact source

- Existing site draft [#73](https://github.com/bmparent/brent-parent-intelligence-studio/pull/73), branch `codex/works-paired-integration-20260927`
- First parent: site release `665c7062d47f398ff484ec73c690478ca1a6e5cb`
- Second parent: current main/public release `7f03936366016f8bd005f2e3740896759e930889`
- Paired backend draft [#67](https://github.com/bmparent/eidos/pull/67) remains unchanged at `97d806d4d0a7a71575090e10d5e81aca1036b4e4`, tree `243ebb81c09ce21f46cce5e433c780dca9e502a1`
- This record is committed with the merged source. Use that containing revision and its own GitHub checks for the final candidate identity, not the older SHAs in the PR descriptions.

## Reconciliation choices

Five conflicts were resolved: the editor workflow comment, the two independent acceptance histories, editorial image checks, prerender approved-route/reference checks, and the service-family image data. Both histories remain, including the separate public release scope. The workflow keeps candidate customer-journey coverage and adds all three published service-page browser checks; production upload remains main-only.

The gallery component, gallery data/styles, all three published service components, standalone supported-answer component and service-family image data match current main byte-for-byte. About retains Holidays in Hollywood, the production dashboard and Sentinel images. Published service pages supersede the candidate's older public-service layout, including the older Liberty/PERNR problem selector; this is not a claim that every earlier public-service interaction is still shown. The held free Playground, separate kit and custom-build paths remain reachable. Liberty captures remain in the source; their presence check is retained.

The prerender verifier keeps About and Intelligent Systems as approved evidence pages, plus the existing About calculator-link exception. Account reset metadata is preserved alongside the new Digital Experiences metadata. The candidate's Pages Functions, Playground source, member/account implementation, migrations, runtime configuration, headers, provider settings and feature gates are unchanged. No backend export refresh is needed: all 76 shared contract files still match. Quote Desk is inherited from main as isolated TEST/checkout-disabled source; no app hosting, checkout activation or new provider configuration is performed.

## Local evidence

| Requirement | Observation | State |
| --- | --- | --- |
| Compilation | ESLint, TypeScript, Vite client/SSR production build and Pages Functions build pass | Local pass |
| Runtime regression | Platform 29, audit 36, Playground 26, editor-unit 32, growth 13, finance 7, owner 8, analytics 1 and glass 6 tests pass; Snapshot smoke and Worker typecheck pass | Local pass |
| Editorial/URLs | Editorial regression, prerender, 34-route editorial validation, source/built validation of 17 articles and URL checks pass; external article source retrieval was disabled and no article content changed | Local pass |
| Quote Desk | 27 estimator, ownership/billing lifecycle and revenue tests plus the Wrangler dry build pass using fixtures | Local pass, no hosted/payment evidence |
| Shared contract | 76/76 source/vendor files match; backend source is unchanged | Local pass; exact committed parity rechecked after publication |
| Browser | Final-head Playground workflow must run editor/hero acceptance in Chromium, Firefox and WebKit, customer journey, the three service suites, and controlled growth acceptance; Wellway workflow supplies its own acceptance | Remote exact-head checks required after commit |
| Paired hosted runtime | No accepted isolated deployment of this exact site/backend combination is established | Not tested |

The first local Pages Functions build compiled successfully but its default log path was unavailable; rerunning with logs under the workspace-supported temporary directory completed cleanly. A separate cloud-browser gallery smoke was blocked before loading the local build by `net::ERR_BLOCKED_BY_CLIENT`; it supplies no interaction evidence. Browser and backend historical green runs are not used as new hosted acceptance.

## Remaining release gates

The combined runtime needs an isolated site/backend/database pair and verified relay/Access bindings plus additive migrations; owner/wrong-owner/expired-session/CSRF/stale-version/replay checks; Google consent/linking and two-account owned save/reopen; Stripe TEST signed event, replay, recovery and refund/dispute; physical mobile and assistive-technology acceptance. Inquiry and account-email delivery remain open and are deferred at the user's request.

Keep paid AI, new-format cloud authoring, Snapshot and LIVE payment activation gated. Do not merge to main or enable auto-merge: main can trigger production upload. This task updates the existing draft source only. The deployed public site and current production backend are not changed, and no new production acceptance or rollback action is claimed here. Preserve customer data, orders, archives, identities and additive migrations.
