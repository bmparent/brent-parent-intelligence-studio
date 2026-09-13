# Validation and limits — September 12, 2026

## Implemented and locally verified

- Recovered PR #45 on top of current main, then compared the later Drive source ZIP. Its eight source deltas were recovered; the unavailable `efa364b` commit object is not claimed as verified. The ZIP SHA-256 is `b420ae052647028e2d94bbf89b1fb5b858f8dc9d80e61f551fbeaabf30bed119`.
- Preserved Wellway’s logo, typography, colors, layout, portraits and local workflows. Adapted the approved `eidos-edge-light-v5` optics to actual surface dimensions, with bounded native refraction, moving rim highlights, inert layers and frosted fallbacks.
- Added dated evidence and provenance for all three metrics across 7/14/28-day windows and comparison periods. Server validation recomputes averages and rejects malformed scope, dates, units and references.
- Added private hosted AI integration, a shared durable spending ledger, bounded requests, pinned model, structured citations, conversation continuity and explicit guided/live states. Runtime tests use a mock provider, not paid inference.
- Visit drafts follow the selected agenda and explored topics. Excluded context stays out of preparation, follow-up requests, saved references and exported visit briefs. Drafts persist across closing, reopening and navigation. Approval remains separate.
- Restored browser focus consistently on WebKit, protected unsaved form edits, added save/error states, and validated malformed draft backups. No media API is called.

## Checks performed

| Check | Result |
| --- | --- |
| Data, evidence, quota and Worker runtime | 24 tests passed: 10 original data, 8 evidence/workflow, 4 SQLite ledger and 2 runtime/relay tests |
| DOM workflows | Passed check-in, charts, plan edits, imports, backups, profiles, visit, follow-up and approval |
| Loopback server | Passed static app, disabled AI, origin rejection, path confinement; no paid call |
| Actual browser workflows | Passed Chromium at 1440, 768, 390 and 360px; WebKit at 390px; Firefox at 1440px |
| Browser AI states | Passed mocked retry, continuity, cancellation, stale-response rejection after closing, scoped preparation/drafts and separate approval |
| Glass | Verified actual canvas pixel change on pointer input, approved preset, native refraction, non-intercepting layers, forced colors and reduced motion |
| Enlarged content and constrained forms | 200% CSS zoom and 420px-high viewport form checks passed |
| Lint | Zero errors; existing Fast Refresh advisory for provider/hook co-location remains |
| App and site build | TypeScript, Vite, standalone generation, site build and complete Pages Functions build passed |
| Prerender metadata, editorial, generated Insights, URL gates | Passed; no editorial content changed |
| Gallery | Passed homepage position, Tools search/filter, real preview, Escape/close, new-tab app destination and existing storefront routes |

The local Vite preview serves a fallback homepage at extensionless subpage URLs; using its directory URLs removed false hydration errors. The existing live site had no corresponding errors. Production clean URLs are verified separately after release.

The initial browser script used the wrong long-month selector; correcting it matched the actual abbreviated date labels. A development reload interrupted one WebKit run; accepted runs use the built app. The subsequent WebKit focus failure was reproduced and fixed. The initial metadata gate found no static heading/canonical/Open Graph URL in the standalone app; those were added to its source template without weakening the site verifier.

These are Windows browser-engine and headless test results. They do not certify physical iPhone/Safari, an actual on-screen keyboard, screen-reader conformance, real provider accounts, or medical suitability. The keyboard check constrains the visual viewport; hardware testing remains unperformed.

## Hosted status and owner step

The model catalogue returned the account-supported `gpt-4.1-mini-2025-04-14`; current official docs confirm Responses and structured-output support. The owner approved up to $1 total, capped at $0.25 per UTC day with no automatic renewal.

No paid inference has been performed in this release work yet. The saved Cloudflare login permits Pages publishing but lacks Workers scripts permission. The OAuth attempt expired while owner sign-in remained pending. To enable hosted AI, complete the scoped Wrangler authorization, deploy the private Worker and secrets, attach its service binding while preserving existing settings, enable the approved caps, and perform fictional-record live checks. Exact commands and controls are in `ops/wellway-ai/README.md`.

Until then `/api/wellway/status` fails closed and the app offers clearly labeled guided answers. Provider connections, portraits-as-video, the advisor, camera and microphone remain simulated. The perspective switch is not authentication; storage is browser-local.

## Evidence

Local release artifacts: `C:/Users/bmpar/wellway-release-evidence-20260912/`. Accepted screenshots and workflow receipts are under `browser-accepted/`; quota/runtime output is `functional-final.txt`; glass evidence is `glass-results.json`; source recovery and safe hosting configuration receipts are saved alongside release logs. Final publication and Drive mirror receipts are appended to the release report.
