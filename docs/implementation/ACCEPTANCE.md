# Public-site release acceptance — 2026-09-30

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
