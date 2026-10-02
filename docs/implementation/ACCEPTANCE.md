# Candidate acceptance and release gates

## Current paired-preview work — 2026-10-02

The paired site draft now incorporates public main through `27a05a3b2cf11b77569811ef98d1877afab028ef`, preserving the candidate account and Playground work alongside the current homepage, service pages and branding. The backend remains `97d806d4d0a7a71575090e10d5e81aca1036b4e4`. Local checks and 76-file contract parity pass. [The October 2 record](ACCEPTANCE_2026-10-02.md) describes the narrowly scoped CI upload to the existing test Pages project and separates exact hosted receipts from still-open consent, ownership, inbox, signed TEST payment and physical-device gates. Production remains NO-GO; the historical sections below describe their own revisions.

## Combined review candidate — 2026-09-27

The site integration combines the audit candidate, security sprint, Playground journey, latest owner console including daily refresh and service directory, and growth-team heads, then merges the current `main` editorial content. The paired backend combines its owner-console and security-sprint heads. See [the September 27 integration record](ACCEPTANCE_2026-09-27.md) for exact parents, local verification and still-open hosted gates. This source combination has **not** been deployed to an isolated paired preview or production. Earlier hosted receipts below belong to different revisions; none may be treated as acceptance of the combined tree.

## Playground entry and handoff candidate — 2026-09-26

The branch `codex/playground-journey-20260926` is stacked on the security sprint's site head `91e3c67eacd47d4d49a86cf3b79fec495a314702` (itself stacked on draft site PR #66). It is a public-site-only source change; no backend, migration, provider setting, price, production deployment, or purchased archive changes are included.

New local workspaces open schema v4 with an element library. dnd-kit supplies keyboard/pointer/touch drag input and drop targets for exact insertion in page structure; the existing sandboxed canvas still handles movement and resizing. A palette click and a canvas drop also add to the current authored area. Existing workspaces keep their schema on open. New-format cloud save is still default-off until paired hosted ownership/reopen acceptance; the status and export make a portable local backup available. Export includes `NEXT-STEPS.md` along with the existing HTML, assets, project JSON and AI handoff. The custom-build inquiry carries only a static source cue and editable note; the actual project ZIP stays on the visitor's device unless they choose to share it. The services index and Digital Experiences page now name the three routes: free Playground design ZIP, separate $29 Cinematic Starter kit, and custom service quoted after discovery.

Local verification: typecheck and production build passed; 26/26 Playground tests, lint and prerender verification passed. The CI workflow now checks the new customer path in a real Chromium desktop/mobile browser alongside the legacy format and three-engine editor checks. Hosted browser, authenticated cloud reopen, inquiry inbox receipt, actual payment, physical touch and production release remain open. This candidate must not change the general release gate above.

Previous hosted release check: [2026-09-26 acceptance record](ACCEPTANCE_2026-09-26.md). It records an earlier isolated pair, exact deployed revisions, the new Stripe TEST checkout and download, and provider-dependent gates still open.

The internal Codex growth-team draft and zero-cash policy are described in [GROWTH_TEAM_2026-09-26.md](GROWTH_TEAM_2026-09-26.md). Its scheduled brief is separate from the hosted owner console, and agent outcomes and a spend ledger are not connected there.

The separate owner console candidate and its connector/security inventory are recorded in [OWNER_CONSOLE.md](OWNER_CONSOLE.md). The exact-host Access app at `owner-preview.eidos-works.com`, owner subject, MFA requirement, paired preview backend, and isolated Worker are configured. Its `workers.dev` route is disabled. Anonymous requests are intercepted by Access. The owner enrolled a TOTP authenticator and signed in; the authenticated hosted browser observed Works data and completed controlled account/work actions with audit history. A read-only check of the connected owner Gmail inbox found a clearly labeled September 24 Eidos Works QA inquiry; the message was not attributable to this exact paired preview, and the console still has no server-side inbox grant. [The owner-console hosted receipt](../../artifacts/implementation/2026-09-24/owner-console-hosted-receipt.json) separates hosted checks from local negative security tests and open gates. The Cloudflare account's shared login domain still carries DG Promo Photos branding; changing it would affect the separate uploader application. This does not change the paired public release decision or close any provider-dependent gate.

The [security sprint candidate](SECURITY_SPRINT_2026-09-25.md) adds owner Access validation/audit, inquiry quotas and enforced static CSP. Its local checks are separate from the September 26 hosted acceptance, which exercised the owner console before these security changes were combined. The combined candidate still needs its own isolated preview verification of Access, quotas, CSP and browser behavior.

This is an unreleased Eidos Works implementation candidate. Local tests are evidence for local behavior; they are not production, inbox, device or paid-provider acceptance. The 50-row CSV is the item-level record. Research engine behavior was not changed.

## Implemented

- Source-ranked project catalogue, bounded follow-up context and honest source/AI labels. Fixed the print-shop denial regression; added the kit to the catalogue.
- Password and Google OIDC handlers reconciled with existing member IDs and email links. Account-switch cancellation and verified purchase recovery preserve ownership boundaries.
- Durable checkout attempts, exact purchased archive bytes, guest email recovery and refund/dispute revocation. Historical kit deliveries use the frozen baseline archive rather than a future generated ZIP.
- Three service pages and Insights redesigned with actual Liberty captures, existing verified EmbroideryCalc/Wellway imagery, persistent fictional labels, working production/estimate/operations demos, source-answer exploration, URL search/filter history and long-article contents.
- Paired Playground cloud schema/media validation and bounded AI proposal review/apply/Undo. Both paid AI and authoring activation remain gated. Test-only exports remain test-only.
- Snapshot SQL payment queue, atomic job claims, at-most-one provider stage attempt, reserved daily spend, private object delivery with hash verification, partial-delivery remedy and signed refund/dispute tombstones. Status polling does not generate work. Checkout remains closed.
- Owner-only readiness, aggregate outcomes without prompts/identities, an executable alert check, staged report-only CSP, hosting analytics explanation and approval-gated affiliate component.

## Local verification

- Platform suite: 29 passed.
- Combined catalogue, Playground, cloud/authoring/AI, kit recovery and audit suite: 49 passed.
- Snapshot durable lifecycle: 4 passed, including simultaneous workers, image failure, stale claims, tampered signatures, refund-before-payment and wrong-price payment never queued.
- Wellway: 23 data/evidence/storage tests passed; standalone rebuilt from changed source.
- Backend account/OIDC/image/platform suite: 22 passed before final vendor refresh; final build and focused rerun recorded separately.
- Browser: all three services have no horizontal overflow or broken loaded images at 390/768/980/1440; Insights also passed these layout sizes. Search zero-results/reset/Back, concept interactions and mobile menu Escape/focus return exercised.
- Local built Business Systems sample: LCP 1560 ms, INP 48 ms, CLS .004. This is one unthrottled desktop browser sample. Resizing a viewport is not a new navigation or a physical-device measurement. No field performance claim or agreed performance budget.

## Specific remaining external acceptance

1. Original PERNR embed/source and approved entry/validation/denied/expired captures. The public Disney storefront does not expose that gate. The fictional existing case study is not evidence of its exact production screens.
2. Authorized private Promo intake/queue/QC captures, organizer sorting acceptance, and physical iPhone checks. Existing records prove supplied-byte intake only; sorting was not observed. Private client access and employee rosters must stay private.
3. Owner-approved Friction Review free/paid wording and response expectation; controlled send to the intended inbox and real reset/magic-link delivery. No external message sent in this task.
4. Google client configuration and real consent/login/linking on the paired preview; device-to-device purchase recovery. Local signature/ownership tests do not exercise Google's browser consent or an inbox.
5. The new Stripe TEST checkout, Works paid-order reconciliation, and one archive download passed on the deployed candidate. Exact provider webhook delivery, guest recovery, replay, and TEST refund/dispute revocation remain open; live fulfillment remains a separately authorized charge. Preserve the legacy Replit endpoint until its owner confirms its purpose. Pin an API version only after a real versioned fixture/provider check. Historical orders without an archive association use the frozen baseline v1 package; exact historical bytes cannot be reconstructed from those order records alone. Future orders have an immutable digest association.
6. Hosted new-format save/reopen, AI proposal preview/apply/Undo and purchased export against the paired backend. Approved model/pricing/allowance before paid AI activation. Do not reuse production AI budgets for experiments.
7. Snapshot deployment needs shared SQL/R2 bindings, reviewed worst-case cost reservation, hosted pinned outbound capture, storage lifecycle/retention acceptance and recovery/support policy. The protected proxy now pins validated public IPv4 connections in local source/tests; matching restricted tokens and hosted egress proof are still missing. Capture approval and generation must stay false. Existing KV purchases need explicit migration/recovery before switching storage. No paid launch claim.
8. Native iOS/Android, screen-reader, 200% zoom and GPU fallback acceptance; reduced-motion source tests are separate evidence. Local viewport checks cannot close these gates.
9. Provision an owner alert destination/schedule and prove alert delivery. Current readiness has aggregate HTTP/source outcomes, not confirmed email receipt or provider billing; current runtime Ask Eidos model remains unknown until an authorized protected deployment read.
10. Amazon Associate identity, approved genuinely used products, links/data rights and editorial approval. Component stays absent without approvals. No invented tracking tag, endorsements, prices or revenue.

## Deployment sequence (not executed)

Review paired diffs; apply additive member/cloud/AI schemas to an isolated preview database; deploy backend preview; configure the frontend preview relay; run hosted account/cloud/payment tests; verify compatible hashes and exact preview identities. Keep new AI/authoring/Snapshot flags disabled until their own gates pass. Then request approval for the exact production candidate, deploy backend first and Cloudflare Pages by Direct Upload, verify canonical routes and actual production aliases. The current main-branch Playground workflow performs Direct Upload: merging/pushing main can trigger a production release and must wait for that approval. Draft branch PRs do not run its production step.

Rollback code to the production identities in current-state.md while retaining additive data, members, orders, reservations and archives. Never reset the Wellway ledger. Never reverse a migration by deleting customer rows.

## What the growth snapshot means

The fresh seven-day public-category report has five consented tab/day sessions, 31 page views, one review view, one CTA click, one form start and zero submissions/contact conversions. These are not five unique humans; unmarked QA may be present. Earlier zero snapshots are historical. This tiny sample cannot establish revenue, conversion improvement or affiliate efficacy. See growth-public/report files for the exact receipt.

## Release conflict reconciliation — 2026-09-30

The paired candidate now incorporates current main's editorial voice and studio/contact routing while retaining the release stack. See [the September 30 reconciliation record](ACCEPTANCE_2026-09-30.md) for exact tested trees, shared-source parity, local checks and the browser-verification boundary. The hosted/provider gates below remain open. Production is still **NO-GO**.

## Public-site release acceptance — 2026-09-30

Brent explicitly authorized merging the gallery and other mergeable PRs and taking the result live on September 30. This release starts from production/main `e0f5ca9c0b81542929960aa6ada075f81ad0240b` and extracts public presentation changes from the previously stacked branches. It does not merge the paired implementation candidate in site #73 or backend #67.

### Scope and impact

- Gallery #80: three fictional full-page website concepts, thumbnails, filter/search, reading dialog and customer briefs. No business offers or client outcomes are implied.
- Service showcases #74–76: public project pages and local fictional demonstrations. Their frontend-only dependencies are reviewed separately from the larger paired candidate.
- Quote Desk #79 may merge as isolated, disabled source. Its workflow only tests and dry-builds the separate app. No hosted subscription launch is accepted.
- The production backend, Pages Functions, shared server contract, account flows, payment/provider configuration, feature flags, migrations and private operational data retain the main baseline.

The original stacked heads remain available on backup branches before rebasing. Rebased branches must contain no ancestry from the unaccepted paired candidate. The release must pass local lint/build/editorial/route checks and exact-head GitHub checks before main promotion. Main's existing workflow deploys the verified build to the existing Cloudflare Pages project `eidosworks`; it checks the current main SHA before upload and reads the deployment back.

### Evidence and limitations

Baseline: [main workflow 36651895749](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36651895749) passed, deployed `e0f5ca9`, and verified the production identity and delivered assets. Its upload URL was `https://02b448c0.eidosworks.pages.dev`. The canonical homepage was read in Chromium before this release and showed the previous 18-entry gallery.

Candidate, merged and live checks are recorded in `PUBLIC_RELEASE_2026-09-30.md` as they become available. Local or CI browser widths are not physical-device or assistive-technology acceptance. The larger paired identity, owned cloud reopen, owner security, inbox and Stripe TEST gates remain open on #73/#67; those gates are not accepted by this public presentation release. Quote Desk remains configured for TEST with checkout disabled and requires its own hosted acceptance.

Rollback uses the existing main/deployment baseline above and preserves customer data. No data migration is part of this release.

## Published-gallery reconciliation — 2026-10-01

The paired candidate now incorporates the September 30 public gallery/service release while preserving its published presentation and the held account/payment implementation. See [the October 1 reconciliation record](ACCEPTANCE_2026-10-01.md) for exact source parents, current checks and open gates. Public-release acceptance above does not accept the combined runtime. Production remains **NO-GO** for this paired candidate.

## October 1 storefront gallery follow-up

The current Liberty Christian Prep, MDCA and Disney Junior homepages replace their old cropped references with dated complete captures and full-page reading. Real storefronts retain client-services attribution and live links; fictional concepts retain their separate disclosure. Animated demo source and all other gallery records remain unchanged. Candidate scope, image provenance, current verification and the `7f03936` rollback baseline are recorded in [STOREFRONT_GALLERY_2026-10-01.md](STOREFRONT_GALLERY_2026-10-01.md). The held paired runtime gates above remain open.

## October 1 service-copy candidate

The service build-story update was initially checked on public main `7f03936366016f8bd005f2e3740896759e930889`, then rebased onto `435be02b30f1d983e19b9e915c665ebc38a56668` to preserve the storefront gallery refresh, on `codex/service-build-details-20261001`. It adds source-grounded stack and implementation notes to Digital Experiences, all five existing storefront reconstructions, the Business Systems concept applications, and the Wellway/Ask Eidos Intelligent Systems examples. Page metadata and Service JSON-LD describe those visible services. The copy format for future completed projects is in `docs/service-case-study-copy.md`.

The source and browser checks for this candidate do not close the held #73/#67 provider or account gates. The public changes have no backend, account, payment, provider, migration, or private-data dependency. Acceptance requires lint/typecheck, production build, existing route/editorial checks, desktop and phone-width browser checks, and exact-head CI. Source rollback is the latest public-main SHA above; production state must be read back separately before publication is claimed.

## October 1 homepage candidate

An illustrated services invitation moves above Selected work, which now features Jingle Bell, Jingle BAM!, Wellway, Holidays in Hollywood and Nighttime Spectaculars. The candidate began at main `435be02` and incorporated current main `8aec889` after #83 merged, preserving the gallery refresh and service build stories. Scope, public asset provenance, desktop/responsive navigation evidence and the local Wellway HTTP limitation are recorded in [HOMEPAGE_SERVICES_2026-10-01.md](HOMEPAGE_SERVICES_2026-10-01.md). Its PR tracks exact-head CI and production promotion separately. The existing runtime acceptance gates remain open.

## October 2 studio branding

The branding update starts from public main `cf7f791db84aa886b3e1064dfc28345579f18225` and aligns favicon, previews, Organization logo, gallery assets, Playground, Quote Desk and article-card branding with the current header's lowercase e. Source scope, local checks, desktop/phone-width browser evidence, release readback requirements and rollback are recorded in [BRANDING_2026-10-02.md](BRANDING_2026-10-02.md). This public presentation change does not accept the held paired runtime. A third-party advertising draft may retain its selected image and requires regeneration or manual upload.

## October 2 section numbering update

Brent requested removing the numbering of sections throughout Eidos Works. Branch `codex/remove-section-numbering-20261002` starts at public main `2f403a936f0737fa5d8b3f4f3e2ba9833537ed72`. It removes decorative section, service, project, option and benefit indexes from the homepage, portfolio, service pages/overview, contact, Friction Review, Snapshot landing/report sections and account introduction. Number-only elements are removed from rendered HTML, and affected navigation/service/foundation grids close the former number columns. Titles, project disclosures, arrows, destinations and existing fragment IDs remain intact. Ordered process/build instructions, form progression, prices, data and structured-data positions retain their meaning.

Local lint has zero errors and the existing Wellway fast-refresh advisory. TypeScript, client/SSR production build, prerender, editorial checks for 34 routes, source/built article validation, URL checks and Snapshot validation/signature smoke checks pass. Cloud Browser reads the canonical baseline; this session's internal preview URL returns `ERR_BLOCKED_BY_CLIENT`, and the local Playwright browser executable is unavailable. The existing exact-head CI provides desktop and 390-pixel service interaction/image/layout checks before merge. CI and post-release canonical readback are recorded on the PR; publication is not claimed by this pre-release record. No browser environment or repository browser dependency changes are included.

The existing main workflow builds and verifies the source, deploys to the established Cloudflare Pages project and reads back the exact production identity. Rollback is public-main `2f403a9`. This change has no backend, provider, payment, migration or account-behavior change and does not accept the held paired-runtime gates.

## October 2 creative homepage folio

Brent approved the paper-collage homepage widget direction and requested implementation. The scoped candidate begins at public main `24ea6e5d25d16ff7014e32cedce9444b197c6082`. Six generated illustrations, responsive WebP sources, native service text/links and the warm-paper folio replace the previous widget art. The existing three service families, destinations, fragment ID and section-numbering removal are preserved. Local build, route, editorial and visual checks are recorded in [HOMEPAGE_FOLIO_2026-10-02.md](HOMEPAGE_FOLIO_2026-10-02.md) and the root design QA report. Exact-head CI and production readback are recorded on the PR before publication is claimed. Rollback is the baseline above. The existing held runtime gates remain open.
