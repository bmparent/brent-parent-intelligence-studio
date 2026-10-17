# Local editor release — October 17, 2026

## Scope and ancestry

This isolated release starts at frontend main `c20d9cc7a5d62c4bf2b22573daf5044fca8eb4ff`. It extracts local authoring from stacked candidate PR111 `fbfd3631d2caac5c274d83ccaf1e7cd0985399c8`, including the required studio dependencies from its ancestry, without merging that stack or replacing newer public-site work.

Included: explicit starters, per-document local persistence, responsive content/layout/brand editing, artwork and motion tools, shared Undo/Redo, local JSON backups, and frozen independently runnable page ZIPs with source and file hashes. Advanced studios remain local and share project history. Optional parent-edition references are inert provenance; they establish neither purchase nor license and fetch no archive.

Excluded: hosted AI entry points, checkout/purchase/return/recovery UI, new provider routes, commerce enablement, migrations, provider credentials, TEST configuration and source-candidate evidence payloads. Existing legacy account projects keep their current behavior. New-format cloud saving remains disabled. The direct Pages Functions API rejects schema 5+ and disguised studio fields before authentication/database use; the paired backend guard is isolated in [backend PR80](https://github.com/bmparent/eidos/pull/80), based on backend main `4c746ffccf9249c7ddabd58f839ecb5fcece4fd0`.

Import/restore now saves the outgoing document before changing identities, retaining its latest edits after reload. Variations follow their document through import, Undo and Redo. Six deterministic actual-hook regression tests cover successful, failed, stale and concurrent replacement paths.

## Verification and release conditions

Local package installation, TypeScript, 97 editor/unit tests (including independent Python ZIP inspection and direct HTTP/database-boundary tests), lint, client/SSR build, Pages Functions compilation, platform/growth/analytics/glass/Snapshot tests, indexing policy, prerender/editorial/source and built Insights validation and URL checks pass on the integrated candidate. Lint retains the existing Wellway Fast Refresh warning.

Local browser launch is restricted by the execution environment; it is not claimed as passing. The existing GitHub release workflow must pass on the exact proposed head, including Chromium, Firefox and WebKit at desktop, 390px and 320px widths, persistence/import/undo/cancellation, frozen export and no-provider-call assertions, plus retained public-site gates. CI observations do not establish physical-device Safari, assistive-technology or unfamiliar-user acceptance.

Keep the release PR draft until exact-head checks pass. Main promotion uses the existing serial Cloudflare Pages workflow; never publish an older source head or bypass its preflight. Publication requires readback of the deployed commit, delivered assets, canonical host and editor flows. CI and production receipts remain on the PR/workflow artifacts so adding status-only documentation does not trigger another deployment.

## Rollback and remaining gates

Rollback is the previous frontend main/deployment above, with the prior backend source above if its guard needs rollback. No database or customer-data migration occurs. Existing paid-feature AI funding/model-quality and LIVE-commerce gates remain open and disabled; no provider purchase or TEST transaction is needed to verify local editing/export.
