# Playground implementation and verification receipt - September 10, 2026

Status: code and local/anonymous-preview verification are complete for the four draft change sets. The original end-to-end release gate is partial: normal-member, real Stripe TEST, bounded real AI, physical iPhone and authorized CMS checks remain separately blocked or not run. No production release, live sale or public AI spend occurred.

## Reviewable changes and exact preview revisions

The changes are stacked in order, with one frontend PR and one matching shared-code/backend PR per change. Each PR compares against the previous change. Code snapshots below are the exact verified deployment revisions; later documentation-only commits may advance review heads without changing these deployed code claims.

| Change | Frontend PR / deployed SHA | Frontend preview | Backend PR / deployed SHA | Backend preview |
|---|---|---|---|---|
| Reliability and verification | [#28](https://github.com/bmparent/brent-parent-intelligence-studio/pull/28) / `cfe9682a3a341ec56ca1c53a8431f84922e5c1d8` | [Open](https://c62ec1f4.eidosworks.pages.dev/playground/) | [#54](https://github.com/bmparent/eidos/pull/54) / `4032aa7b172453e472fd73ba1544b5b26c1c1e0e` | [Open](https://eidos-sentinel-4ukuispb2-1brentbm-1876s-projects.vercel.app) |
| Media and branding | [#31](https://github.com/bmparent/brent-parent-intelligence-studio/pull/31) / `3eb26fa1efc09a7416b55728a957dd2c2b690822` | [Open](https://6d88bdf7.eidosworks.pages.dev/playground/) | [#55](https://github.com/bmparent/eidos/pull/55) / `92ec804ff6953edcdcce6419022c336dbf108c5b` | [Open](https://eidos-sentinel-4z27ygpu4-1brentbm-1876s-projects.vercel.app) |
| Flexible pages | [#32](https://github.com/bmparent/brent-parent-intelligence-studio/pull/32) / `cfdb58f98324bca2e3f22bd6b5be844b0ebc4cb9` | [Open](https://8dbced92.eidosworks.pages.dev/playground/) | [#56](https://github.com/bmparent/eidos/pull/56) / `0aa5417e3be827910775e32e6157562f85f8da01` | [Open](https://eidos-sentinel-d3vajrtgg-1brentbm-1876s-projects.vercel.app) |
| Optional bounded AI | [#33](https://github.com/bmparent/brent-parent-intelligence-studio/pull/33) / `39ba1fa2de678e2e7012427c5500ee67792111a6` | [Open](https://733dc787.eidosworks.pages.dev/playground/) | [#57](https://github.com/bmparent/eidos/pull/57) / `96cff975478ed32fb806436ca8b694ded03aec2b` | [Open](https://eidos-sentinel-q2cnixfly-1brentbm-1876s-projects.vercel.app) |

Frontend source: bmparent/brent-parent-intelligence-studio, isolated worktree `C:/Users/bmpar/codex-worktrees/playground-reliability-20260909`. Backend: bmparent/eidos, `C:/Users/bmpar/codex-worktrees/playground-backend-20260909`. Original working copies and unrelated uncommitted work were preserved. Shared files were exported with the source repository script and verified against 54 vendored files. No research engine, shop/Snapshot payment integration, mail service or unrelated assistant budget was changed.

Current production remains Cloudflare `5c362fa8-fab1-4419-b3fe-96efb03d614b`, SHA `c5d2525feb006a07a7ac00e19d2d8c574e220b5c`, and Vercel `dpl_8ztuTFv3h34YFuBSjHS31F8Q13aV`, SHA `a2da5fd9af21c02573e538fd30aaf7d5c690e457`. Public URL: https://eidos-works.com/playground/. These are verified provider metadata and anonymous availability claims only.

## What changed and practical limits

- Reliability: workspace history now carries the account save target; unrelated replacements detach. Generation guards reject late results. Cloud/document preflight preserves local work and free exports. Local save status tracks the current edit generation.
- Media: visible Media / Brand entry, image replacement/thumbs/drop picker, logo/hero/background/card placement, fit/crop/focal/mobile/tint/alt/decorative controls and editable/lockable brand values. Palette sampling stays local. Server raster decoding and additive atomic owner quotas use existing infrastructure. Original full-resolution files are not retained; source hashes identify processed bytes. A separate large asset library is assessed and deferred, not represented as implemented.
- Structure: explicit version-2 upgrade with stable block/card instance IDs, About and Contact presets, FAQ/gallery/testimonials/service cards, navigation destinations and section/mobile settings. Version-1 documents retain renderer selection. Testimonial/business claims remain user supplied; Contact is a design/link, not an implicitly connected form. Publishing notes are bounded checks, not accessibility certification. Header archives now include a solid HTML/CSS fallback.
- AI: default-off strict operations, reviewable diff and one undoable Apply, owner/base-state checks, separate monetary ledger and atomic reservations, idempotency/concurrency/kill controls, direct one-draft Image API adapter. No arbitrary executable output or uploaded customer image is sent. Real model choice, costs and cache behavior await evaluation. The 20-second provider/24-second relay window can leave long image calls unknown; resolve latency/reconciliation and reservation bounds before image enablement. Manual editing works with all AI disabled.

Details: [media](media-brand.md), [structure](structure.md), [AI controls and pending evaluation](optional-ai.md), [release configuration](product-release.md).

## Commands and results

Run from the relevant repository root. Existing package scripts were used; no checks were removed.

| Command | Result |
|---|---|
| `npm run test:playground` | PASS, 24 tests at final combined code |
| `npm run test:platform` | PASS, 26 tests |
| `npm run test:glass` | PASS, 3 tests |
| `npm run test:analytics` | PASS, 1 test |
| `npm run build` | PASS, includes typecheck/client/SSR/prerender |
| `npm run typecheck`; `npm run lint`; `npm run build:functions` | PASS |
| `npm --prefix apps/sentinel-lab run lint` | PASS |
| `npm --prefix apps/sentinel-lab test` | PASS, 16 JS + 35 TS = 51 tests |
| `npm --prefix apps/sentinel-lab run build` | PASS |
| `node scripts/export-sentinel-platform.mjs <existing Sentinel app path>` | PASS, followed by source/vendor hash comparison |
| `npx wrangler pages deploy dist --project-name eidosworks --branch <validation branch> --commit-hash <full SHA> --commit-dirty=true` | PASS, four previews, exact SHAs above; generated build timestamps explain dirty flag |
| External Playwright scripts in artifact folder | PASS final relevant reruns; see matrix and preserved initial failures |
| `node --import tsx --test --test-name-pattern="Frozen checkout" <artifact>/frozen-receipt.test.ts` | PASS, hash-producing signed synthetic fixture |
| `node --import tsx --test --test-name-pattern="Synthetic expired" <artifact>/dispute-receipt.test.ts` | PASS, additional signed synthetic lifecycle fixtures |

Media-stage checks passed 15 Playground and 49 backend tests; structure-stage checks passed 18 Playground tests. Final combined suite counts above include the later AI additions. All eight code heads had successful GitHub quality checks; exact run/job URLs are in frontend-prs.json and backend-prs.json. Unrelated Snapshot/editorial publication workflows were not invoked as publishing tasks.

## Evidence matrix

All browser identities below are controlled fixtures or fresh anonymous contexts. No credential/session trace is included. Paths are relative to the local artifact folders named below.

| Scope | Status | Gate | Evidence / limitation |
|---|---|---|---|
| Local | PASS | Code and source/vendor parity | 54 shared files; zero mismatches; source-vendor-parity.json. Refresh through scripts/export-sentinel-platform.mjs; base SQL LF normalization follows that script. |
| Local | FAIL | Original save-identity bug reproduced | Sep09 browser-reliability.json: Chromium/Firefox/WebKit open A, open B, Undo A, then Save targets B on production baseline c5d2525. Expected failure preserved. |
| Local | PASS | Save identity fix and replacement semantics | Same three engines on fixed code; save targets A. Workspace unit tests cover Undo/Redo, import/template/variation detachment and late save acknowledgment. |
| Local | PASS | Recovery and late writes | recovery-recheck.json: Chromium, intercepted alice/bob API fixtures; 409 two-tab preservation, network failure, expired session, account switch, revision preview/restore, Save as new, late cloud open/import/image decode. No external authentication. |
| Local | PASS | Media and brand editor | media-browser.json: anonymous controlled Fixture Studio, Chromium/Firefox/WebKit at 1440/390; transparent image upload, fit/zoom/decorative/brand edits, autosave/reload and actual ZIPs. |
| Local | PASS | Raster validation and asset quotas | Backend actual Sharp PNG decode/mismatched MIME/truncated/excessive dimensions; local missing-decoder and atomic 40 MB owner quota rollback; local API ownership/card hydration tests. |
| Local | PASS | Version-2 flexible blocks and archives | 18 structure-stage Playground tests; structure/browser.json and structure/webkit-recheck.json, all three engines at 1440/390; two independent gallery blocks, cards, upload, Undo/Redo/reload and standalone page ZIP. |
| Local | PASS | Header installed in unrelated host | structure receipts: actual downloaded header ZIP; original renderer; solid 0/4px, glass 72/150px, reverse 3px; fixed hit-target widths; menu/Escape/fragments; host CSS isolation; no-JS and CSP script-blocked fallback; reduced-motion reload. This is engine testing, not physical Safari. |
| Local | PASS | Strict AI operations and admission | Six AI unit/mock tests, two backend provider transport tests; ai-browser.json, Chromium/Firefox/WebKit with intercepted alice API; three mocked proposals each, Apply/Undo/stale/late response handling, zero automatic cloud saves. |
| Local | PASS | Frozen delivery and synthetic payment states | frozen-delivery.json + frozen-fixture.zip: owned local signup fixture, cs_test_fixture, evt_paid, project edited after checkout, frozen/delivered SHA-256 identical. synthetic-payment-scenarios.json and dispute-delivery.json: signature, amount, duplicate, cross-owner, pending/expired/failed, refund/dispute tombstones and earlier-success replay. All provider calls mocked. |
| Local | PASS | Final applicable checks | Frontend build/typecheck/lint/Functions build; 24 Playground + 26 platform + 3 glass + 1 analytics tests. Backend lint, 51 tests, build. frontend-prs.json/backend-prs.json contain successful GitHub quality checks for all eight code heads. |
| Preview | PASS | Frontend deployments and anonymous availability | deployments-final.json and http-checks.json: existing eidosworks project, four recorded full SHAs and HTTP 200, CF-Ray IDs. No new cloud project. |
| Preview | PASS | Deployed editing/reload/free export with AI disabled | preview/browser.json desktop and preview/mobile-recheck.json mobile: Chromium/Firefox/WebKit 1440/390, fresh anonymous contexts, latest combined preview 733dc787; local name edit/reload, actual ZIP/hash, zero /api/playground/ai requests. Screenshots contain controlled fixtures. |
| Preview | PASS | Backend builds deployed | Four existing-project Vercel deployments READY at recorded SHAs. This establishes build/deployment availability, not authenticated handler execution. |
| Preview | BLOCKED | Integrated authenticated member verification | Pages preview still targets existing ckvdvep3j validation backend, not the four new protected backend builds. Dedicated controlled normal-member identities were not supplied; no account sessions minted, challenges bypassed or global preview bindings changed. Matching isolated backend configuration/migrations and legitimate two-account sign-in are required. |
| Production | PASS | Existing release unchanged and publicly available | Cloudflare canonical deployment 5c362fa8 at c5d2525; Vercel production dpl_8ztuTFv3h34YFuBSjHS31F8Q13aV at a2da5fd9. Anonymous public GET HTTP 200; CF-Ray a38f29519e1d95d2-MIA. No claim of authenticated production behavior. |
| Production | NOT RUN | Release new code or migrations | No merge, production deployment, migration, real sales or public AI enablement authorized or performed. |
| Preview | BLOCKED | Normal-member save/sign-out/sign-in and fresh-device reopen | Requires dedicated controlled accounts and isolated matching relay/backend. Exact images/content, cross-owner project/revision/asset/order access, session expiry and two-tab 409 through actual relay remain external gates. |
| Preview | BLOCKED | Stripe-generated TEST checkout and webhook delivery | Dedicated Playground key, webhook secret and amount absent in safely inspected Vercel preview/production env metadata and local env. Separate sk_test key + matching dedicated endpoint secret + 100-cent amount required; preserve existing shop. No real checkout/session/event ID exists in this receipt. |
| Preview | NOT RUN | Stripe endpoint API compatibility and real refund/dispute/frozen ZIP | Pinned 2026-08-26.dahlia retained; endpoint compatibility and six event subscriptions unverified. Real paid checkout-to-order association, provider idempotency, actual public raw-body/signature relay, refunded/disputed payment and frozen paid-download hash remain unproven. Synthetic rows above do not substitute. |
| Local | PASS | Read-only AI model catalogue | Existing scoped server credential used only for GET /v1/models; gpt-5-mini, gpt-image-2.5-flare and gpt-image-2.5-sunburst listed. No key created and no inference call made. This is access discovery, not a model evaluation. |
| Preview | BLOCKED | Real bounded text/image provider evaluation | No test budget authorized. Proposed ceiling USD 2.00 needs an explicit decision before any calls. Compare bounded text candidates and one low-quality draft per current Image 2.5 model; record actual usage/cost/cache/latency, pin winner, verify worst-case reservation. Public controls remain off. |
| Preview | NOT RUN | Physical iPhone Safari | No physical device/provider used. Photo-library orientation, touch cancellation, rotation/address-bar viewport, reduced motion, reload, download/share and glass fallback remain manual/device-provider gates. No pixel-identical refraction claim. |
| Preview | NOT RUN | InkSoft and other CMS installation | No authorized customer target tested or changed. Embed/CSS placement, sanitation/CSP, existing headers/admin controls, asset paths/navigation/style isolation remain unvalidated. |

## Archive identity

Local frozen order `38542fa1-661f-477f-ac91-8757ab49511f`, revision `ceb9046f-251a-4108-89bb-07c3fe859d8a`, mock session `cs_test_fixture` and signed synthetic event `evt_paid`: frozen ZIP and owner-delivered ZIP both SHA-256 `221656d19bd5ad7f487ee91bb3052186ed805f8dcdb498d63bfbec0576e5c451` (45823 bytes). The project was edited after checkout creation. The test also denies the other owner and verifies refund revocation and later-success denial. This is local immutable-byte evidence, not provider-generated delivery.

Actual free preview downloads and standalone/header archives each have SHA-256 hashes in the browser JSON receipts and artifact manifest. Browser image encoders can produce different ZIP hashes; this does not weaken the per-order frozen-byte invariant and is not a claim of identical rendering.

## Preserved failures and their resolution

- The original cloud identity reproduction failed as expected before the fix; that failure remains in its baseline receipt.
- Browser verification exposed an Undo/Redo local-save acknowledgment race and WebKit Escape behavior. Code was corrected; final targeted engine checks passed.
- Initial mobile preview checks incorrectly required a deliberately hidden sidebar save indicator to be visible. The corrected harness checks persisted state and explicitly opens the sidebar; all three mobile reruns passed. Initial FAIL rows remain in preview/browser.json.
- A revision-picker test used an exact accessible label that included option text; the corrected selector passed all eight recovery cases. Initial failures remain in recovery-browser.json; recovery-recheck.json is the final run.
- Two reliability preview uploads failed with ECONNRESET. A bounded retry preferring IPv4 completed and provider metadata confirms c62ec1f4. Earlier preview 9823df81 with literal HEAD metadata and the earlier media deployment are superseded and are not used as exact source receipts.
- Vercel CLI inspection initially hit a local npm-cache EPERM; an isolated Codex npm cache allowed read-only env inspection. Only binding names/presence were retained. No dedicated EIDOS_PLAYGROUND settings were configured in preview or production.

## Artifact locations and remaining actions

Primary local evidence: `C:/Users/bmpar/SystemDiagnostics/playground-20260910`; baseline/reproduction evidence: `C:/Users/bmpar/SystemDiagnostics/playground-20260909`. Repo-local backend metadata: `artifacts/playground_2026_09_10/`. The file manifest records size/SHA-256 and drive_manifest.json records the actual mirror outcome. Screenshots, browser scripts and ZIPs remain outside committed source.

Remaining external actions are narrow: supply two controlled test-member sign-ins and finish a matching isolated relay/backend configuration; supply a separate Stripe TEST key and correct destination secret through the existing secret manager, set 100 cents, verify the pinned endpoint version and six subscriptions, then perform provider-generated checkout/refund/dispute and frozen download checks; explicitly decide a total AI validation budget (proposed ceiling USD 2.00, not approved); provide a physical iPhone/device-provider and authorized CMS target. Public release, live sale price/terms and public AI spending need their own deliberate approval. No blocked test is counted as passed.

Artifact copy result: **PASS** for 104 files copied to the configured mounted Drive at `G:/My Drive/Eidos_Brain_Proof_Phase/2026-09-10/playground-implementation-1439`, with matching read-back SHA-256 hashes and no skipped files. Remote Drive synchronization was not independently verified. The mirrored receipt is the evidence snapshot before this documentation-only copy-result addendum.
