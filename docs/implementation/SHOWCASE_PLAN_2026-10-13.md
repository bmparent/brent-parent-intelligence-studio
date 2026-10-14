# Showcase implementation candidate — October 13, 2026

This implements the owner's request to extend Playground and its useful outputs. The attached handoff is the scope specification; external showcase examples are references, not evidence that Eidos has passed acceptance.

## Reconciliation and ancestry

- Site: `bmparent/brent-parent-intelligence-studio`, branch `codex/showcase-20261013`, isolated checkout. Starts at template-readiness PR105 `3053d9556bcca9013e66702b799f9a4bf487f861`, with `origin/main` `4da07a38f445c1db4763f668d56ddbda32927a4a` merged. PR105 depends on draft PR102 `d0657f0fa645f877596176a57904b78525cb90a8`.
- Shared backend dependency: draft PR72 `952e68ff75da6857e25f249bebd96ea65116e294`, itself on draft PR71. Shared changes will have their own isolated checkout.
- Observatory: separate application `apps/sentinel-observatory/live` in `bmparent/eidos`, stacked on PR73 `00d49ff2e8ef74931503fb7a27046857228d0b04`. Do not fold research/training or assistant code into the Works bundle.
- Existing paid-template and template-delivery checkouts contain uncommitted work. They are left intact.
- Source is schema4 with legacy formats1–3; `releaseBoundary.ts` restricts cloud to the accepted schema1 subset. Old README/product-release schema descriptions are historical.
- The actual current-state file will be recorded if present; the handoff's unverified path is not treated as existing.

## Dependency-aware milestones

| Milestone | Work | Required acceptance |
| --- | --- | --- |
| M0 | Reconcile source, contracts, deployment and instructions | Record exact ancestry, modes and preserved boundaries |
| M1 | Shared document/history/save; Effect and Artwork studios | Edit, continuous gesture undo, restore, save/reopen, import validation, independent exports/fallback |
| M2 | Configurator and interactive original case study | Matching configuration/preview/package, real included features, keyboard/reduced motion |
| M3 | Bounded operations, synchronized Layout, Motion | Stale guards, common history, matching views, independent animation |
| M4 | Observatory coordinated evidence views | Selected window/event across views; explicit source states; dedupe; model outage preserves facts |
| M5 | Guides, acceptance evidence, paired previews and draft PRs | Exact source/build receipts, usable exports/screenshots, per-scope readiness |

M1/M3 studios use `Project.studios` with versioned validation and the existing `useProject` store; no second persistence system. Schema5 is explicitly local-only. Effect uses original glass and the shared page/header renderer. Layout uses existing sections/authoring. Agent operations are bounded local commands; hosted AI stays governed by its existing feature flags and budget.

M2 and M4 proceed independently while the shared foundation is built. Provider-backed paths remain blocked until exact hosted evidence exists; that does not block browser-only studios.

## Validation and delivery

Run focused schema/history/export tests, then configured lint/typecheck/Playground/glass/platform/build/Functions/prerender/editorial/URL gates as applicable. Test desktop and narrow width, keyboard, reduced motion, storage failure, project-switch races, safe imports and independently opened output. Record browser/runtime context and console failures. Browser plugin is absent; initial CUA in-app browser acquisition returned `Browser is not available: iab`; use repository Playwright workflow where available.

No LIVE payments, canonical promotion, changes to approved prices, release gate removal, or mutation of purchased archives. Isolated previews and draft PRs are authorized by the owner's request. Readiness is per milestone and environment; source/build success alone never establishes provider or production acceptance.

## Current status

Implementation in progress. Acceptance receipts will be written to `artifacts/showcase/` and a dated acceptance record. Production promotion is not authorized by this candidate.
