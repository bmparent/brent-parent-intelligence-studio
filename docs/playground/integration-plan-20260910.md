# Playground final integration — September 10, 2026

Status: integration and controlled verification are implemented; hosted account/provider gates remain pending. Production, live Playground sales and public AI remain unchanged. A passing local fixture is never a real-provider result. The final external receipt is saved under the evidence directory below.

## Baseline and integration path

- Frontend main: `c5d2525feb006a07a7ac00e19d2d8c574e220b5c`; Cloudflare production deployment `5c362fa8-fab1-4419-b3fe-96efb03d614b` confirmed through Wrangler on September 10.
- Backend main and Vercel production: `a2da5fd9af21c02573e538fd30aaf7d5c690e457`, deployment `dpl_8ztuTFv3h34YFuBSjHS31F8Q13aV`, READY, verified against the production alias.
- Frontend stack: #28 `cfe9682` → #31 `3eb26fa` → #32 `cfdb58f` → #33 `f2eb004`. Each preceding head is an ancestor of the next; GitHub bases match.
- Backend stack: #54 `4032aa7` → #55 `92ec804` → #56 `0aa5417` → #57 `7cb8661`. Each preceding head is an ancestor of the next; GitHub bases match.
- Navigation #29 is independent from main: `4bcc291` → `354814b` → `5436444` (including the tablet dropdown-positioning correction).
- New isolated branches: `codex/playground-integration-20260910` and `codex/playground-integration-backend-20260910`, based on the top of each stack. Final integration PRs will compare against main and supersede the stacks after acceptance, preserving ancestry. Existing PRs and dirty worktrees are preserved.
- The full implementation handoff and product-release, optional-ai, media-brand and structure documents have been read. The prior preview is explicitly not a paired authenticated environment.

## Execution plan and gates

1. Complete baseline/provider inspection and isolate work. **PASS**, including exact Pages and Vercel deployment metadata.
2. Implement additive password credentials, signup/login/recovery, safe Google OIDC linking, compatible member sessions and a useful account dashboard. Preserve existing member IDs, usernames, projects, agent keys and newsletters.
3. Integrate all #29 behavior and verify 390/760/761/768/850/980/981/1100/1440 widths.
4. Provision a dedicated preview database and matching frontend/backend configuration; migrate preview only. Record exact deployed SHAs and provider IDs.
5. Exercise legitimate two-account application flows, media/branding/sections, cross-context persistence, revisions, expected-head conflicts and ownership denial.
6. Verify dedicated Stripe TEST checkout/webhooks/immutable delivery/revocation using real provider traffic if test credentials are available. Keep Snapshot/shop configuration intact.
7. Run physical iPhone Safari and authorized InkSoft demo checks if available; otherwise record NOT RUN and precise manual checklists.
8. After critical prior flows work, evaluate bounded text and minimal draft-image calls. Total provider spend ceiling USD 2.00. Keep public AI disabled. Resolve or explicitly block public image enablement on unknown/long-running charges.
9. Refresh shared vendor files with the existing exporter; run every requested frontend/backend check and exact parity verification.
10. Run authenticated/anonymous Chromium, Firefox and WebKit desktop/mobile regression plus accessibility/console/network/privacy checks.
11. Produce final PRs, durable receipts, journal, plain-language analysis and Drive mirror status. Present known gates before any production merge; deploy only when applicable critical gates pass.

## Evidence policy

External browser artifacts: `C:/Users/bmpar/SystemDiagnostics/playground-integration-20260910/`. Durable backend gate metadata will be recorded under `artifacts/playground_integration_2026_09_10/`. Record failures and reruns; no secrets, raw session cookies or private credentials in receipts. Research/model logic is outside this task.

Browser plugin skill is absent in this session; regular Playwright is the test path for the required three browser engines. This environment also exposes CUA for interactive browser tasks.

## Reviewable integration and preview

- Frontend integration PR: https://github.com/bmparent/brent-parent-intelligence-studio/pull/34
- Backend integration PR: https://github.com/bmparent/eidos/pull/58
- Both target main and preserve the original stack ancestry. The old PRs remain open; the integration PRs propose superseding them after acceptance.
- Isolated frontend: https://eidos-pg-preview-20260910.pages.dev
- Its backend uses the branch-specific `EIDOS_PG_INTEGRATION` Turso binding and an exact frontend-origin allowlist. Deployment receipts identify each immutable frontend/backend URL and SHA.
- The isolated database received additive migrations 0001–0006. Production database/bindings were not changed.
- Dedicated preview Google OAuth and domain-restricted mail credential forms are prepared. Creation requires the browser tool's action-time credential approval. Hosted signup/reset/Google verification, real Stripe TEST traffic and the subsequent provider AI evaluation remain pending until the required credentials and critical account flows work.
- The integrated site header passed all nine widths in Chromium, Firefox and WebKit, including the Firefox navigation recheck. Physical iPhone and actual InkSoft remain separate NOT RUN gates; see `external-checklists-20260910.md`.
