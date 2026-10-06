# Public-site release acceptance — 2026-09-30

## October 5 Quote Desk customer-experience follow-up

Brent authorized the next paid-launch work and a customer-perspective walkthrough after Stripe onboarding. The free estimator fixes draft naming, field correction and printed job details; the isolated paid candidate adds sign-in/checkout/billing-outage recovery without opening checkout. The intended merchant and inactive $19/month catalog setup are verified; hosted D1 access returns HTTP 401, the Worker is absent and real email/sandbox acceptance remains blocked. Exact evidence, candidate gates and rollback are recorded in [QUOTE_DESK_CUSTOMER_EXPERIENCE_2026-10-05.md](QUOTE_DESK_CUSTOMER_EXPERIENCE_2026-10-05.md). This work does not accept the held paired account runtime or assert revenue.

Brent explicitly authorized merging the gallery and other mergeable PRs and taking the result live on September 30. This release starts from production/main `e0f5ca9c0b81542929960aa6ada075f81ad0240b` and extracts public presentation changes from the previously stacked branches. It does not merge the paired implementation candidate in site #73 or backend #67.

## Scope and impact

- Gallery #80: three fictional full-page website concepts, thumbnails, filter/search, reading dialog and customer briefs. No business offers or client outcomes are implied.
- Service showcases #74–76: public project pages and local fictional demonstrations. Their frontend-only dependencies are reviewed separately from the larger paired candidate.
- Quote Desk #79 may merge as isolated, disabled source. Its workflow only tests and dry-builds the separate app. No hosted subscription launch is accepted.
- The production backend, Pages Functions, shared server contract, account flows, payment/provider configuration, feature flags, migrations and private operational data retain the main baseline.

The original stacked heads remain available on backup branches before rebasing. Rebased branches must contain no ancestry from the unaccepted paired candidate. The release must pass local lint/build/editorial/route checks and exact-head GitHub checks before main promotion. Main's existing workflow deploys the verified build to the existing Cloudflare Pages project `eidosworks`; it checks the current main SHA before upload and reads the deployment back.

## Evidence and limitations

Baseline: [main workflow 36651895749](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36651895749) passed, deployed `e0f5ca9`, and verified the production identity and delivered assets. Its upload URL was `https://02b448c0.eidosworks.pages.dev`. The canonical homepage was read in Chromium before this release and showed the previous 18-entry gallery.

Candidate, merged and live checks are recorded in `PUBLIC_RELEASE_2026-09-30.md` as they become available. Local or CI browser widths are not physical-device or assistive-technology acceptance. The larger paired identity, owned cloud reopen, owner security, inbox and Stripe TEST gates remain open on #73/#67; those gates are not accepted by this public presentation release. Quote Desk remains configured for TEST with checkout disabled and requires its own hosted acceptance.

Rollback uses the existing main/deployment baseline above and preserves customer data. No data migration is part of this release.

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

## October 6 contact service-selection correction

This narrow candidate starts from public main `5b88d3017c7dca30855d224775048cca9f2c1982` after the Quote Desk willingness-to-pay update. A campaign visitor who selected another service still saw required embroidery/price questions and submitted their answers as part of an unrelated project note. Campaign arrival now determines only the untouched service/discovery defaults; the current service determines the survey, required controls, prompt, text limit, button and inquiry/email-fallback contents. Selecting Quote Desk manually also uses the same feedback form. Campaign attribution remains governed by the existing consent rules.

The existing desktop/390px Quote Desk browser gate now covers empty-survey switching away and back, every unrelated service, exclusion of retained survey answers from project payloads/email fallback, restoration of feedback answers, preserved campaign attribution and explicit discovery choice, ordinary contact entry, and manual Quote Desk selection. All inquiry and growth submissions in these checks are intercepted synthetic responses; no public inquiry or email is sent.

Local lint (zero errors; existing Wellway warning), 27 platform, 22 Playground, 14 growth, 1 analytics and 6 glass tests, Snapshot smoke checks, TypeScript/client/SSR build, prerender, editorial, source/built article validation URL checks and Pages Functions compilation pass. Article source fetching is skipped because no article content changes. Local Chromium cannot open its required process socket in this execution environment; rendered verification is performed by the existing exact-head GitHub browser workflow and recorded on the draft PR. Final exact-head CI results are recorded there before claiming readiness.

No provider configuration, backend, credentials, billing, deployment workflow or held runtime #73/#67 changes are included. This draft does not authorize merge or deployment. Source rollback is the public-main baseline above; no data migration is involved.
