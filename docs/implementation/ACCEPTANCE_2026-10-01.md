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

## CI infrastructure follow-through

The reconciliation was published as `6b2af7e5ee0aafc89a7d64814c969c88ebbaf82a`, tree `78acff2f51980a963bf71b836a317864681fea7c`. GitHub reports source mergeability; exact committed source/vendor parity is 76/76. [Site quality](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36898028882) and the full [Playground/editor/service browser workflow](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36898028968) passed on that source; production steps were skipped.

[Wellway run 36898028865](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36898028865) passed its application/data/UI/server/ledger tests and generated-source check, but both its initial job and one retry reached the 15-minute timeout while downloading Ubuntu browser dependencies from the runner mirror. No browser assertion failed because the browser step had not begun.

The follow-up changes only Wellway's CI execution environment plus this record: use Microsoft's official `mcr.microsoft.com/playwright:v1.58.2-noble` image with nonroot user 1001 and explicit Bash; retain Node 24 and the exact existing `playwright@1.58.2` package. The image already includes the browsers and OS dependencies, so the redundant `playwright install --with-deps` command is removed. The exact registry tag returned HTTP 200. See [Playwright's container CI guidance](https://playwright.dev/docs/ci#via-containers) and [versioned image source](https://github.com/microsoft/playwright/blob/v1.58.2/utils/docker/Dockerfile.noble).

All six browser/viewport cases and the mocked-AI suite remain unchanged. The timeout, triggers, permissions, disabled live-AI environment, local loopback target and artifact retention remain unchanged; no privileged container, host IPC or new access grant is added. A subsequent workflow-only commit needs its own exact-head CI, including all three site workflows, before a green final result is claimed. No product runtime, backend or production deployment is changed by this adjustment.

### Preserve the production runner while fixing PR browser setup

The first CI-only follow-up was published as `c2c64e9b4919eec542f1e599a33dca3095e55a2c`. Its [Wellway acceptance](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36902276780) passed completely in the version-matched container, and [Site quality](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36902276480) also passed. Its new [Playground run](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36902276750) then hit the same Ubuntu dependency-download stall and its 20-minute timeout before browser assertions began.

The next CI-only adjustment uses the same version-matched, nonroot Playwright container **only for pull requests**, and provisions Python 3.12 for the existing ZIP assertions. Main receives an empty container expression and retains its original hosted Ubuntu runner, GitHub CLI, Bash behavior, browser dependency installation and production scripts. The empty-string no-container behavior is explicit in [GitHub runner v2.337.0's converter](https://github.com/actions/runner/blob/v2.337.0/src/Sdk/DTPipelines/Pipelines/ObjectTemplating/PipelineTemplateConverter.cs#L230-L273); the image and npm Playwright package versions remain identical. The PR image supplies browser dependencies, so only the PR apt/browser install is omitted. All editor, hero, journey, three service-page and growth assertions, production conditions, permissions, timeout and artifact paths remain intact. YAML structural comparison confirms that no unrelated job behavior changes. Final acceptance still requires all three workflows to complete on the resulting exact head.
