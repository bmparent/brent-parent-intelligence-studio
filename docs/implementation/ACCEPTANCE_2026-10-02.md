# Works paired-preview preparation — 2026-10-02

The paired release candidate now incorporates the current public site, including the October 2 homepage folio, removal of decorative numbering and lowercase e branding. The account/password/Google and held Playground implementation remain intact. **Production remains NO-GO pending hosted customer and provider acceptance.**

## Source and reconciliation

- Site draft [#73](https://github.com/bmparent/brent-parent-intelligence-studio/pull/73), branch `codex/works-paired-integration-20260927`.
- Site first parent `fe6821f0dbf120c789489ed46b89d3834e8ca115`; current public main parent `27a05a3b2cf11b77569811ef98d1877afab028ef`.
- Backend draft [#67](https://github.com/bmparent/eidos/pull/67) stays at `97d806d4d0a7a71575090e10d5e81aca1036b4e4`, tree `243ebb81c09ce21f46cce5e433c780dca9e502a1`. Backend main `c18cb36da54dac3d5e45554cfcf02f58767096d2` is already contained.
- Resolved two source conflicts: retain the candidate's `AccountAccess` component in MemberPages and the public service fallback heading in ServicePages. Account identity and cloud/payment contracts, migrations and purchased archives are unchanged.
- Use the commit containing this record as the frontend candidate identity. The hosted receipt records its exact SHA and delivered account asset hashes.

## Local verification

Site lint, client/SSR build, Pages Functions build, prerender, editorial regression, source/built article validation and URL checks pass. The source validator skips external source retrieval; this work changes no article claims. Platform 29, audit 36, Playground 26, growth 13, owner 8, analytics 1 and glass 6 tests pass. Backend TypeScript lint, 16 JavaScript and 60 TypeScript tests, and Next production build pass. All 76 shared source/vendor contract files match. Three tests cover the new preview isolation guards and drift detection; lint also passes with the deployment script. Existing final-head PR workflows supply the separate browser acceptance checks.

These are local observations. No consent, inbox, owned cloud reopen, signed provider event or physical-device claim follows from them. The two trailing-blank-line notices in inherited Tabler assets predate this merge and are left intact.

## Isolated deployment path

The existing backend preview is READY at `https://eidos-sentinel-ixfp83azz-1brentbm-1876s-projects.vercel.app`, deployment `dpl_21iJLg5gp16P7LAwuaJbCbYnoSKb`, on the exact backend revision above. It is Vercel-protected; build readiness does not prove configured dependencies or accepted customer behavior.

The workspace has no Cloudflare CLI login. The added `Works isolated paired preview` workflow uses existing GitHub deployment credentials only after source/contract checks. It runs solely on the draft integration branch when the head commit contains `[paired-preview]`, and only uploads to existing test project `eidosworks-test-20260923` at `https://eidosworks-test-20260923.pages.dev`. Its configured production branch is historically named `codex/works-audit-implementation-20260921`; this selects the test project's stable pages.dev origin, not the production Works project.

Preflight refuses custom domains, a different project/branch or missing protected relay bindings. It reconciles only the test relay's ordinary URL to the immutable backend preview, retaining existing credentials and bindings. It fingerprints all other preview settings and reads the actual `eidosworks` production configuration before/after. It writes no production setting, provisions no database or service, applies no migration and enables no paid feature. CI records exact deployed source and asset identity, paired readiness flags and anonymous/owner/origin/unsigned-event HTTP observations without credential values.

The sanitized `works-paired-preview-<site SHA>` CI artifact contains the exact contract and deployment receipts. A failed preflight or runtime check is a remaining gate, not permission to weaken an isolation guard. The existing main-only production workflow is unchanged.

## Gates still open

Verify the isolated database prefix and additive schemas through authorized protected readiness before creating test identities or projects. Then exercise real Google consent/linking, two-account owned save/reopen, wrong-owner and stale-version paths, session expiry, inquiry/account-message delivery, and Stripe TEST signed event/replay/recovery/refund. Confirm actual payment mode before starting any checkout; no LIVE charge or paid AI call is authorized here. New-format authoring, paid AI and Snapshot stay gated until their corresponding acceptance passes. Physical mobile and assistive-technology checks remain distinct from CI viewport tests.

Keep both PRs draft. Merge to main remains a separate production decision because main can upload the public site.

## First hosted attempt

The reconciled candidate was published as `3575e9c29c368fe839e8c51d3ae00952a3b05825`, tree `e18a76397a7cfb1186d9263c8b2779902d6fdab4`, with both merge parents preserved. GitHub reports source mergeability. [The first isolated preview run](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/37067017274) passed committed 76/76 contract parity and its local source/build gates, then stopped before upload: the URL readability check did not accommodate the test project's encrypted relay URL. The historical provider record explicitly identifies all three relay variables as encrypted.

The follow-up handles Cloudflare's masked `secret_text` values, retains the URL binding's existing type, and records only a safe bounded origin when readable. Domain/project/branch restrictions, other-binding drift checks and production read-only guards remain unchanged. Four isolation tests now pass, including masked values and refusal to record credentials or query tokens embedded in a URL. A masked provider read does not itself prove the new destination; hosted relay behavior must still pass after upload.

The follow-up candidate `5be1e1e84a6fbfbebab911500dbcf607c652e574` passed preflight and uploaded successfully to `https://27ae598c.eidosworks-test-20260923.pages.dev` in [run 37067587302](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/37067587302). The immediate stable-origin check still observed earlier account assets and stopped. A later HTTP read showed matching account JS/CSS at both the immutable upload and the stable test origin. The verifier now allows bounded stable-origin propagation while still requiring the exact candidate assets, then verifies their actual delivered bytes. It stops on access-denial statuses rather than retrying them. This change does not relax the source-identity criterion.
