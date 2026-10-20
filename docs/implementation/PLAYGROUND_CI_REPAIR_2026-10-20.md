# Playground purchase CI repair — October 20, 2026

PR135 source `285d7dc8a1a7b44e40e8fcf2f09b66aa6bada42f` failed [purchase readiness run 39453436244](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39453436244). The failed receipt and artifact digest remain in `artifacts/implementation/2026-10-20/playground-reliability/purchase-ci-failure.json`; the full original job log is preserved in the task workspace. This is a real regression in the new account entry, not a provider failure.

Two failures reproduced against the built preview with provider/API interception:

- At 390px, later unified-editor CSS overrode the equally specific account toolbar wrapping rule. Account remained visible, but Finish was outside the viewport. The fix increases the wrap rule's scope using the actual app classes, so compiled stylesheet order cannot disable it.
- The closed account dialog mounted its signup form and verification widget. The purchase challenge scenario therefore saw an extra widget before any account action. Account controls now mount only while the dialog is open; the underlying editor, project and Undo history remain mounted.

The original local account check inspected the Account button and dialog at 390px on the development server. It did not prove every toolbar control was reachable in the compiled CSS. Its replacement checks every visible toolbar button at 1440/390/320px, clicks Finish, opens/closes Account and checks keyboard focus against the built preview. It also asserts that the closed account dialog has no mounted access form. The existing purchase challenge token/reset assertions remain unchanged. Purchase receipts now fingerprint the account component and both relevant stylesheets.

Only the affected built purchase, account and starter-focus browser flows, lint/type/build checks are rerun locally. The existing PR's required exact-head CI follows the pushed repair. Previous passing source receipts and the failed run remain historical evidence; no Stripe/provider operation, activation, deployment or production merge is part of this repair.

The corrected built preview passes all intercepted purchase scenarios, including mobile Finish access and the unchanged single-widget/fresh-token retry assertions. The strengthened seven-check account suite and WebKit immediate-input focus check also pass, with no runtime errors or unexpected provider requests. Lint and the TypeScript/client/SSR/prerender build pass. The compact receipt, source fingerprints and per-scenario checks are retained in `artifacts/implementation/2026-10-20/playground-reliability/purchase-ci-repair.json`. Exact pushed-source CI results belong to the PR receipt rather than a claim of hosted acceptance.
