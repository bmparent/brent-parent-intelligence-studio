# Codex Journal — 2026-09-10

# Eidos Works Playground spatial acceptance — 2026-09-10

Status: partial acceptance; production release held. This is the existing scoped hero composition feature, not a general object canvas. InkSoft is excluded following Brent's correction.

## Changes

- Empty description/button slots have independent edit-mode space so handles cannot overlap.
- Mobile handles have a separate row and 44 px minimum height; text remains readable while editing. Try page and standalone exports omit this spacing.
- The React preview synchronizes without waiting for a paint frame, handles iframe load as a ready fallback, and issues a fresh command stamp on each update. This addresses reproduced WebKit stale previews and protects against replay across updates.
- The spatial backend branch now has the existing isolated preview database selector and OFF flags. No new persistent credentials were created. Production and integration branches were not merged or deployed.

Source commits: frontend `6ab8a5a6f3932329a800fb4e0b92e696ef5d248c`; backend `9e13fdda4cf38eeaa1a9e9784483f6900f0bda0e`. Draft PRs: https://github.com/bmparent/brent-parent-intelligence-studio/pull/35 and https://github.com/bmparent/eidos/pull/60.

## Validation

Node 24.14.0 and repository lockfiles were used for npm ci in both isolated checkouts. Frontend checks: typecheck, lint, Playground (43), platform (28), glass (3), analytics (1), Snapshot, full build, Functions build, prerender, editorial, Insights source/dist and URL checks. Backend lint, tests (16 + 49), and build passed. See command JSON/logs for exact execution timing and commits. Remote CI also runs against the final code commits; receipts are recorded separately.

The actual React app was used; the image is a controlled canvas-generated PNG, not a customer photograph. Local engine matrix:

| Engine | Width | Result |
|---|---:|---|
| chromium | 1440 | PASS |
| chromium | 390 | PASS |
| webkit | 1440 | PASS |
| webkit | 390 | PASS |
| firefox | 1440 | PASS |
| firefox | 390 | PASS |

Hosted preview engine matrix:

| Engine | Width | Result |
|---|---:|---|
| chromium | 1440 | PASS |
| chromium | 390 | PASS |
| firefox | 1440 | PASS |
| firefox | 390 | PASS |
| webkit | 1440 | PASS |
| webkit | 390 | PASS |

The UI checks cover all six image placements, Below heading inside the hero, empty slots, and Try page removal of authoring controls. Additional Chromium regressions cover exact Undo/Redo, device autosave/reload, JSON import/download, variations, comparison, Escape in the iframe, pointer cancellation, blur, actual ZIP download, stale uploads after edit/Undo/template/import, foreign-window source, stale stamp, invalid section, duplicate message, and unsupported MIME rejection. Layout edge checks cover a clickable background CTA, long content, explicit mobile placement overrides, section reordering and mobile reset of bounded desktop transforms.

The downloaded ZIP includes index.html, styles.css, tokens.css, script.js, project.json, glass preset and assets/hero.png. Independently served exports passed 12/12 browser/mode checks, covering Chromium/Firefox/WebKit with normal scripting, no JS, restrictive CSP, and reduced motion. No external provider requests or editor handles were observed. CSP intentionally blocks scripts. An initial synthetic PNG was rejected by Firefox; the fixture was replaced with a browser-generated valid PNG and the actual download/recheck was repeated.

## Evidence and failures retained

Full external evidence: `C:/Users/bmpar/SystemDiagnostics/playground-spatial-20260910`. Repo-local receipt folder: `artifacts/playground_spatial_2026_09_10/`. Baseline and final command directories remain separate. Harness failures included ambiguous selectors, mobile tab labels, exact toast matching, Firefox navigation waits, and the initial PNG fixture. WebKit stale previews and overlapping mobile/empty handles prompted source fixes. Do not count earlier failed attempts as successful runs.

All seven portable source/vendor files match exact SHA-256; see vendor-hashes.json. The exporter copied no React components. Build-generated archive source has no semantic Git diff; no purchased archive or order was regenerated in a provider or storage system. The original Destination reset key remains intact. No schema migration or core research behavior changed.

## Remaining gates

- Real hosted account signup/login/change/reset, Google consent/linking and mail delivery require preview credentials.
- Credential browser actions timed out twice; tab recovery returned Debugger unattached. No key/client was created; no action-time approval could be presented.
- Hosted account project reopen, revision restore, expected-head conflicts, cross-owner denial and cloud-load image races remain unverified for schema 3.
- Physical iPhone Safari not run.
- Stripe TEST delivery/refund/dispute not run; no dedicated Playground test credentials.
- AI/image provider evaluation not run; no new bounded-spend authorization under this handoff.
- Native touch dragging and a physical hidden-tab transition remain unverified. Headless Chromium kept document.hidden=false when another tab was foregrounded; emulated touch scrolling, outside-iframe release, text scale and crop/focal preservation passed.

Preview AI, image generation, sales, and this production release remain OFF/held. Existing production studio flags were not modified. Production frontend advanced independently to main commit 1c878b6d5b86cbf3b300406561dfaf95ff57d14f (PR #36, Insights contact-link fix) during this task; this task made no production deployment. The account-health.json recheck reproduces the managed Turnstile cross-frame error in WebKit at both widths; the cause within the challenge remains unresolved. No challenge was bypassed. Desktop WebKit is not physical Safari evidence.

## Proof Logic + Meaning

Goal reached: partial browser and reproducibility acceptance for Eidos Works spatial composition. Previous evidence was an isolated renderer fixture; this run uses the actual React editor, backend CI, and independently served ZIP.

Technical logic: authoring-only slot spacing; load-driven iframe initialization; paint-independent postMessage synchronization; fresh revision stamps; generation guards before applying decoded images; the same versioned portable renderer for preview/export. Exact byte equality is established by SHA256(frontend file) = SHA256(vendor file) for 7/7 modules. One move followed by one Undo restores the prior element order; invalidated upload generations cannot write into the new project.

Meaning: reproducibility is truth that can be revisited. The receipts improve confidence in editing and export behavior without asserting hosted account readiness or new research capability. This strengthens repeatable, explainable product delivery; it does not qualify any Eidos Brain detection or compression claim. Remaining uncertainty is listed above.


## Google Drive archive status
See drive_manifest.json; archive readback is distinct from confirmed cloud synchronization.

## Next work
Resume credential setup using a working browser confirmation UI, then verify real hosted accounts and physical Safari before requesting production release.
