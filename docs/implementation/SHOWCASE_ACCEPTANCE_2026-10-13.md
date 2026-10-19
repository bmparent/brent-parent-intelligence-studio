# Showcase candidate acceptance — October 13, 2026

Status: browser-only candidate accepted for hosted review; production/cloud/paid/AI/real-sensor promotion remains NO-GO. This append-only candidate record preserves failed attempts as evidence; final receipts below will identify the accepted source/build. Production promotion is not authorized by this report.

## Scope and source reconciliation

The owner requested implementation of the attached Eidos Works handoff in the Works site and relevant `bmparent/eidos` code. The handoff is a specification; its external references and old source/PR observations are not release receipts. No reference demo or earlier paid/account preview was adopted as current acceptance.

The initial working directory was a non-Git source copy. Existing paid-template and template-delivery worktrees had uncommitted work and were left untouched. New site branch `codex/showcase-20261013` starts at PR105 `3053d9556bcca9013e66702b799f9a4bf487f861`; merge `74248d6dde4512a241029caf9fd129e8e2c85471` incorporates public main `4da07a38f445c1db4763f668d56ddbda32927a4a`. Draft site PR107 is stacked on PR105. Its dependency PR102 remains unaccepted.

The reconciled starting source had project schema4, renderer identities and a production-cloud schema1 subset; older README/product-release descriptions are historical. No `docs/implementation/current-state.md` exists in the reconciled checkout. `SHOWCASE_PLAN_2026-10-13.md`, this ledger, current source and dated implementation/release records supply the current state.

Works backend branch `codex/showcase-studio-boundary-20261013` starts at PR72 `952e68ff75da6857e25f249bebd96ea65116e294`. Draft PR74 runtime source `3ebbc4d0e4cfd9b72947b097366e8b1b6fe8b573`; receipt/tooling head `37f4633f236bacae14c5b799becc2d2cea5528f4`. The shared studio boundary matches byte-for-byte, SHA256 `5af285245ece42499a9f05cb5bbbf9a2ef7452ed526523a409ddb06271843e0e`. An older vendored renderer was not silently replaced with the local editor's schema/fonts.

Observatory remains in its actual separate app `apps/sentinel-observatory/live`. Branch `codex/showcase-observatory-20261013`, draft PR75, is stacked on PR73 `00d49ff2e8ef74931503fb7a27046857228d0b04`. Product/proof head `579869d99dbade749f377d3d38d43e94030ef3f9`; original sensor, collector, interpretation and research work is preserved.

## Milestone matrix

| Milestone | Implemented | Local / CI evidence | Hosted / provider evidence | Live decision |
| --- | --- | --- | --- | --- |
| M0 reconciliation | Yes | Exact ancestry, dirty-work preservation, source/production baseline | Production baseline `/playground/` observed with original page editor, no studio selector | No promotion |
| M1 foundation + Effect + Artwork | Yes | Shared schema/history/autosave; real gesture Undo; restore/import; independent page/header/vector/raster outputs; malformed/stale input and failed-write recovery | Paired site tasks and actual HTTP409 refusal verified; studio account format intentionally blocked | NO-GO for cloud/release |
| M2 configurator + private derivative + case study | Local implementation complete; provider acceptance partial | Four original directions; exact files/modules/PNG; verified-base actual family derivation with new hashes and unchanged parent/notices; chapters/light/layers/no-JS | Original samples and private local derivatives do not establish paid entitlement/native/builder/provider acceptance | Paid release NO-GO |
| M3 bounded editing + Layout + Motion | Partial overall; local deterministic scope complete | Shared validation/history; stale/same-turn denial; Structure/Canvas/Responsive; real animation ZIP with independent playback | Hosted AI/model spending not enabled; WebMCP browser registration remains separate | Provider path held |
| M4 Observatory evidence views | Partial overall; evidence views complete | 122 Node cases; 17 local browser checks; canonical parity 954 frames / 41,022 comparisons | Seven actual hosted fixture checks; owner-private candidate; real sensor/model unavailable | Fixture review only |
| M5 guides + complete delivery | Yes | Output/use guides, original sample checklist, receipts/screenshots/exports and draft PRs | Paired preview/readback passed; archive receipt records mounted-copy status | Review candidate only |

## Environment and hosted pairing

Pinned protected Works backend: `https://eidos-sentinel-rkhg0orv8-1brentbm-1876s-projects.vercel.app`, deployment `dpl_HJnTcwVPPwj77qebkGZiCoXM9z5L`, runtime source `3ebbc4d`. Same existing isolated `EIDOS_TEMPLATES_TEST` validation database, scoped relay and preview-protection values; no production fallback. Only the new branch Preview settings were configured. Accounts, AI, commerce, newsletter and proactive flags are false; OpenAI/mail/Playground-payment keys are not provisioned. Seven hosted API checks passed, including studio/future/disguised-schema refusal409, invalid relay401, unrelated origin403 and provider-protection redirect. Exact permitted site origin: `https://eidosworks-showcase-20261013.pages.dev`.

Private Observatory review: `https://sentinel-showcase-candidate-20261013.bmparent.chatgpt.site/evidence-fixture`. Separate owner-only Site project `appgprj_6acec3e0cc4c8191899f69048a9e7eb8`, deployment `appgdep_6acec682295c8191ad967510bf5fcf01`, Site source `6342acf48e95acc3c399db117f0e08456bba7a2d`; bundled Worker SHA256 `368ba1729acd3a5dd932227d1717e41026acd3b3bec1c15cda97150dd7befbf4`. Hosted fixtures passed selection/window/view/drawer, phone/reduced-motion/GPU-disabled, source-unavailable and access-denial checks. No sensor DB, inference key or IP relay was copied. Missing storage produces503; unavailable model remains explicit. A disconnected source does not establish zero traffic or an all-clear.

## Tests, failures and receipts

Browser plugin/skill was unavailable. CUA in-app browser acquisition returned `Browser is not available: iab`; existing Playwright tooling was used. Local Chromium145 ran on Windows at1440/390 and1600/390 widths, with reduced motion, touch emulation and GPU-disabled cases. These are browser-width checks, not physical-device or accessibility certification.

Local focused suite:25 cases passed, including preview-route safety. General studio browser: complete task flows at desktop/phone, independent file-URL outputs and no-script fallback passed. Detailed studio suite:15 checks including real full-project replacement during a delayed import, delayed PNG/upload guards, actual IndexedDB failure/backup/recovery, real font axes and keyframe edit/Undo/playback. Template/case suite:11 local flow groups plus explicit bounds/scroll follow-up; Linux CI also passed no-JS prerender content. Source hashes/time/browser context are in each receipt.

Quantitative Artwork comparison at720×960, with uploaded image, weight900/optical size40 and opacity0.42: mean absolute RGB difference0.178/0.069/0.125 on a0–255 scale, alpha difference0. Browser antialiasing creates small nonzero differences; this is not every external SVG viewer.

Failures retained: an initial phone preview had zero height and was fixed; a comparison-only hidden save-status assertion was fixed; imports remounting the shell lost their success notice and were fixed; deferred validation and same-turn stale commands were hardened; cross-format spatial/authoring operations were fixed; Linux caught one invalid Windows-encoded source byte and it was repaired. An optional Pillow-based comparison was replaced by browser Canvas pixels. Earlier local build/lint failures remain in logs and are not claimed as passing results. Linux exact-head browser checks exposed React hydration errors because Vite preview served homepage HTML for slashless directory routes. Preview-only resolution now serves the existing matching index; six slash/slashless production probes and final CI passed without suppressing errors. Hosted canonical redirects were checked by semantic path/query rather than a brittle URL substring.

Required configured checks run in Site quality: lint, templates, platform, Playground, glass, growth, analytics, Snapshot, client/SSR build, Functions build, prerender, editorial, built Insights and URLs. Existing account/community/shop/public-page regression workflows remain part of final acceptance. No provider mail delivery, LIVE transaction or physical-device claim is made.

## Independent outputs and artifact locations

Repo-local root: `artifacts/showcase/`. `browser-local/` contains actual downloaded Effect/Artwork/Motion ZIPs, complete project JSON, extracted `independent-*/index.html`, independently played animation, fallback and desktop/phone screenshots. `studio-details/` contains uploaded/text/opacity SVG and PNG, pixel comparison, motion source/ZIP, guarded-operation and failed-save evidence. `template-configurator/` contains eight original sample ZIPs/extracted packages and hashes. `template-case-browser/` contains actual UI-generated sample, byte-identical Artwork PNG, JSON reimports, standalone gallery/contact/editorial/motion and case-study evidence. CI receipts retain exact source and compiled-path evidence in separate folders.

To use an output: extract its ZIP; open index.html through `file://`; press Play for Motion; follow ordinary local page links for a configured sample. SVG/PNG can open independently. Reimport project.json to restore the entire Playground, artwork.json/motion.json within the appropriate studio, or configuration.json in the configurator. The complete workspace ZIP appends project.json alongside studio source.

Backend receipts: sibling `showcase-studio-backend-20261013/artifacts/showcase-studio-boundary-20261013/`. Observatory receipts: sibling `showcase-observatory-20261013/artifacts/showcase-observatory-20261013/`. Both include committed journals/analyses/proof logic. Mounted Drive mirrors verified29 Observatory files and10 Works-boundary files under `Eidos_Brain_Proof_Phase/2026-10-13/`; remote synchronization remains unproven. Site archive status will be recorded in `artifacts/showcase/drive_manifest.json`.

## Proof Logic + Meaning

### Goal reached

Local creative-task acceptance and source-aware fixture receipts are passed within their observed environments. The complete hosted site task acceptance is passed for the local-only candidate; cloud/AI/paid/live gates are held. No readiness percentage is invented.

### Previous state

The page editor had shared local history/render/export, but no coherent cross-studio workspace or verified image-to-configured-sample path. Observatory receipts lacked coordinated time/host/event views. Old documentation could be confused with current schema or current deployed acceptance.

### Technical logic utilized

Schema5 adds a typed/versioned local studio payload to the existing document; explicit migrations preserve renderer/object identities. All changes validate before dispatch, gestures share one history frame, and asynchronous results compare document/revision guards. IndexedDB confirmation determines save completion. A fail-closed shared boundary rejects local formats before older cloud validation can drop fields. Preview/output share render logic and packaged assets/fonts. Observatory selection/window filtering, stable-ID deduplication and evidence drawers describe source coverage separately from rule detection and model interpretation.

### Math / scoring logic

```text
apply_allowed = expected_document_id == current_document_id
                AND expected_revision == current_revision
                AND no_mutation_pending
keyframe_value(t) = (1-u)*value(t0) + u*value(t1)
u = (t-t0)/(t1-t0), clamped to [0,1]
pixel_MAE_channel = sum(abs(SVG_pixel - PNG_pixel)) / pixel_count
unique_events = count(unique(stable_source_event_id))
mirror_verified = SHA256(local_file) == SHA256(copied_file)
```

There is no new detection threshold, learning update, compression metric, inference result or commercial performance claim here. Core model behavior is unchanged.

### Philosophical meaning

Reproducibility is truth that can be revisited. Explanation precedes automation: outputs carry editable source and receipts; Observatory displays what was observed and what remains unknown rather than turning a missing sensor into reassurance.

### Why this is better

One reusable document can be edited, undone, reopened, exported and used independently. Stale work and failed saves have explicit handling. An artwork asset reaches a configured package with exact bytes. Source-aware synchronized views make fixtures and missing telemetry inspectable rather than ambiguous.

### How this moves Eidos closer to the north-star goal

This strengthens **runs reproducibly**, **monitors internal/source state** and **explains incidents** for the goal of a self-monitoring streaming intelligence codec. It does not prove new stream learning, compression advantage, anomaly precision or real-world security outcomes.

### Evidence

This ledger, plan, schema/history/export tests, local/CI browser receipts, independent outputs, shared-boundary parity, hosted backend API receipts, private Observatory fixture evidence, proof journals, progress ledger and checksum mirrors.

### Remaining uncertainty

Schema5 hosted ownership/two-account/reopen/asset acceptance is unavailable while that format and account flags remain disabled. Hosted AI/model identifiers/spend/provider execution have not been enabled. The first preview lacked purchased-source personalization; the follow-up below adds a private local derivative of user-supplied verified candidate source. Hosted derivative fulfillment/ownership remains absent; immutable paid products retain their gates, rights and bytes. Native hosted builder installation/mail/receipt/fulfillment and LIVE acceptance are not established by these outputs. Actual candidate sensor/model/collector execution and physical-device performance remain unproven. Python proof has one existing Windows symlink-privilege block (WinError1314);27 other cases passed. Native browser-chrome zoom is not verified in headless testing; CDP magnification and effective reflow are recorded separately. No GPU/browser family/accessibility certification is implied by Chromium fixture checks.

## Backlog and rollback

Next bounded gates: paired cloud ownership/revision/reopen work; configured hosted AI/budget acceptance; purchased-edition configuration through explicit immutable derivative identity; authorized native/builder installation and delivered-mail evidence; actual sensor and model bindings with source provenance; optional WebMCP registration after browser support/contracts are verified. The exact hosted local-only candidate has passed the readback recorded below. Broader unrelated showcase applications are outside this delivery.

Source rollback is the explicit site PR105/main ancestry above, backend PR72, and Observatory PR73. Preview rollback removes or reverts only the new isolated preview identities/branch settings; no production deployment, purchased archive, account database or core model migration is involved. Existing working trees and draft PRs remain intact.

## End-of-task summary fields

1. Files: studio schema/project/history/UI/render/export helpers; shared cloud boundary; configurator/case/discovery/metadata; meaningful tests/browser tooling/guides/receipts. Exact diff is PR107/74/75.
2. Core behavior: unchanged.
3. Tests: focused/local/CI/hosted scopes listed above; blocked/missing evidence remains explicit.
4. Commands: repo-root configured quality scripts and four browser scripts; exact backend commands in their journals.
5. Artifacts: generated locally, including real ZIP/PNG/SVG/JSON/HTML outputs and failures.
6. Local folder: artifacts/showcase plus separate backend/Observatory roots.
7. Drive: backend/Observatory checksum copies passed; site archive status recorded in its manifest; remote sync unproven.
8. Plain-language analysis: this report plus separate backend/Observatory analysis files.
9. Journal: separate proof journals committed; site journal written in docs/implementation/SHOWCASE_JOURNAL_2026-10-13.md.
10. Limits: provider/account/paid/sensor/device acceptance explicitly unproven.
11. Follow-ups: backlog above, not silently implemented or accepted.
12. Proof Logic + Meaning: included.
13. Logic/math: revision guards, interpolation, pixel MAE, deduplication and checksums.
14. Meaning: revisitable truth and explanation before automation.
15. Improvement: complete portable tasks and clearer source/evidence boundaries.
16. North-star connection: reproducibility, monitoring and explanation.
17. Receipts: linked paths and exact identities above.
18. Remaining uncertainty: stated explicitly; hosted local-only review accepted; release/provider gates remain NO-GO.

## Historical accepted site runtime and readback — a4d4219

Accepted application source/build: `a4d4219569d6a4c2112bb55b0bebb39ae29be138`. Immutable Pages URL: https://0ca368fb.eidosworks-showcase-20261013.pages.dev. Paired alias for complete tasks and API origin: https://eidosworks-showcase-20261013.pages.dev. Backend remains protected runtime `3ebbc4d` at the pinned URL above. Direct immutable URLs are static build receipts; the exact approved backend browser origin is the alias.

All six exact-head site workflows passed: Site quality38491493065; Showcase preview38491492928; Playground editor release38491492945; Template commerce readiness38491492921; Community studio acceptance38491492931; Wellway acceptance38491492929. CI repeats25 focused cases, main studio tasks at1440/390, three independent file-URL outputs/fallback,15 detailed studio probes, and the configurator/case suite including no-JS prerender.

Actual hosted alias tasks passed at1440/390: edit/long-gesture Undo/bounded visible effect change/Undo, variation, local transaction/save/reload/reopen, valid/invalid project JSON, stale commands, palette/override/duplicate/layer/alternate views, Structure/Canvas/Responsive, Motion save/reopen and animation download. The hosted downloads were extracted and opened independently. Hosted configurator/case tasks also passed, including Artwork PNG exact bytes and keyboard/touch/reduced motion. Its local-dist no-JS check is not-tested on that Windows run; separate actual-hosted no-JS and Linux compiled-dist no-JS checks passed.

Eight final hosted readback checks passed in hosted/paired-acceptance.json: correct prerender on three clean routes/noindex; public config200 with accountsReady/aiReady/shopReady false; schema5, disguised schema1+studios and future schema return409/local backup notice; actual JavaScript-disabled phone case-study retains story/scene/action. Alias and immutable compiled JS/CSS were fetched and matched by SHA256. Canonical production deployment ID remained `5ddd3dd8-9cb2-489b-8ea7-bd7320a0f74c` before and after upload.

One measured hosted navigation (Windows Chromium headless, GPU disabled,1440x1000, reduced motion) reached visible Effect Studio in1379ms; DOMContentLoaded360.4ms, responseEnd166.2ms. This is one environment-dependent observation, not a general performance claim.

Candidate decision: **GO for isolated local-only studio/original-sample/private-fixture review; NO-GO for canonical promotion, schema5 account saving, hosted AI, paid release, native/builder compatibility or real sensor/model claims.** No approved commercial price or purchased archive was changed. Final delivery-only commits may add guides/test tooling/receipts; runtime identity above remains the exact tested application until a newer deployment receipt explicitly supersedes it.

## Historical accepted runtime receipt — 2026-10-14 UTC / October 13 Eastern

This section supersedes the previous accepted runtime identity while preserving its successful history. Final deployed source: `24b7a985b186f81901df78d8e41a531ec5b8579c`. Immutable preview: https://54d4e19d.eidosworks-showcase-20261013.pages.dev. Use https://eidosworks-showcase-20261013.pages.dev for the permitted paired API origin. Backend runtime, isolated validation database, disabled provider modes and unchanged canonical deployment ID remain exactly as recorded above.

All six workflows passed on this exact source: [Showcase isolated preview38492966288](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38492966288), [Site quality38492966281](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38492966281), [Playground editor release38492966263](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38492966263), [Community38492966273](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38492966273), [Template commerce38492966249](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38492966249), and [Wellway38492966270](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38492966270). The editor job passed its three-engine/two-width browser checks and full site gates; its main-only production upload/readback steps were correctly skipped. These passing jobs do not establish delivery of live mail or live payments.

The new Showcase job repeated complete studio tasks, independent Effect/Artwork/Motion packages,15 detailed studio checks and the configurator/case suite including compiled no-JS content. Final actual-hosted readback passed eight checks at `2026-10-14T01:01:45.798Z`; alias/immutable compiled CSS/JS hashes match. Evidence: `artifacts/showcase/ci-24b7a98/`, `final-ci-status.json`, `hosted-preview.json`, `hosted/paired-acceptance.json`, `browser-hosted/`, and `hosted/effect-studio-desktop.png`.

The final single navigation reached visible Effect Studio in1441ms; DOMContentLoaded476.6ms, responseEnd253.2ms, Windows Chromium headless1440x1000, GPU disabled, reduced motion. This supersedes the previous measurement as the final observation; both are individual environment-dependent samples, not benchmarks.

The application decision remains **GO_ISOLATED_REVIEW_ONLY** and **production NO-GO**. Docs/artifact-only receipt commits after24b7a98 do not replace its deployed runtime identity. Full handoff release remains partial for the exact missing account/AI/paid/native/real-sensor scopes in the matrix. No core model behavior changed. Site evidence is mirrored append-only when available; `drive_manifest.json` is authoritative for copied counts/path/checksums. Mounted readback cannot establish remote synchronization.

## Follow-up audit implementation and proof

The final scope review found that original samples alone did not fulfill the buildable purchased-source configuration requirement. That was unfinished engineering, rather than wholly a provider dependency. Private local archive derivation is now implemented in `e5524b356e2bd065066c18053039d371d0022709`. It verifies public frozen candidate SHA256/byte counts, safe ZIP records and each embedded manifest entry before adapting real family HTML/CSS/configuration. Supported versions: Switchboard1.0.3, Tideglass1.0.2, Matter1.0.2 and Nightjar1.0.5, developer editions only. Original ZIP/notices/native handlers remain unchanged; a separately identified local derivative has actual output hashes, parent/configuration provenance and explicit no-entitlement status. No server fulfillment or historical retrieval was changed. Source/query/fragment preview adaptation is distinct from exported original handlers. Component operation generations/alive guards supplement configuration revisions so Clear and source replacement invalidate pending work.

The same review caught a delayed IndexedDB opening that could let an obsolete project write after a newer project had saved. Commit `27c1f59f8af231733aca625627993addd4f06794` checks freshness after acquisition, immediately before the write transaction, and guards completion. Three actual delayed manual/autosave/variation tests prove newer data survives reload. The commit also completes independent header destinations and keyboard focus; four browser checks cover downloaded header navigation, phone Menu/Escape and no-JS fallback, plus honestly scoped magnification/reflow.

Commit `41cfde211757a66c963d51fbdfb534a628ab0731` adds a true two-column half-drop SVG/PNG repeat unit. The three-column inspection proof cannot serve as that rectangular repeat unit. Downloaded SVG repetition across four columns had zero channel MAE against the selected pattern; PNG maximum channel MAE0.785 on0–255, alpha0.042. An incorrect single-cell-grid negative control differed by up to32.118. Five browser legacy import cases cover formats1–4 and both renderer identities, exact downloaded source before migration, explicit schema5 upgrade, identity/content preservation and save/reopen.

Focused `npm run test:showcase` passed37 cases. Independent actual-base review passed64 page variants,3728 local references,256 in-memory previews and448 disabled-module checks, with no missing references or changed notice/native-handler bytes. Source hashes, environment, exact root command and safe metadata receipts are under `artifacts/showcase/buyer-review/`; paid input/output ZIPs are excluded. Browser proof and subsequent exact frozen-source CI/deployment must be read from their own new receipts rather than inherited from24b7a98. Native zoom, entitlement, hosted provider and actual sensor acceptance remain distinct.

Additional logic:

```text
write_allowed_after_database_open = captured_generation == current_generation
source_result_allowed = component_alive AND captured_source_generation == current_source_generation
                        AND captured_configuration_revision == current_configuration_revision
base_integrity = SHA256(uploaded_zip) == pinned_sha256 AND uploaded_bytes == pinned_bytes
                 AND every_manifest_file_hash_matches
derivative_id = SHA256(generator_version || base_sha256 || configuration_sha256)[0:20]
half_drop_rectangular_period = (2 * cell_width, cell_height)
```

This improves the previous state by testing disk contents and independent family outputs, rather than relying on save notices or attractive free samples. The philosophical principle remains revisitable truth: preserve originals, identify derivatives honestly, and make claims at the scope actually observed. It strengthens reproducibility and inspectable explanation without changing Brain/Sentinel model behavior or proving new learning/compression/detection outcomes.
