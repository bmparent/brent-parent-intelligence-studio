# Intelligent Systems page candidate — 2026-09-29

## Stack and scope

This page is stacked on the reviewed Business Systems draft PR #75, which is stacked on Digital Experiences #74 and the Works integration draft #73. It changes the public `/services/intelligent-systems` presentation and its browser check. No backend, provider budget, payment, email, Google Workspace, or production configuration changes are included.

## Project evidence and claim boundaries

| Project | Public visual | What the page can say | What it does not establish |
| --- | --- | --- | --- |
| Wellway | Existing public `wellway-journey.webp` capture and `/demos/wellway/` | Fictional reflection workspace with check-ins, journey view, editable plan, and bounded optional assistance; 23 local data, evidence, and storage tests passed again. | Clinical effectiveness, diagnosis, treatment, emergency care, real patient data, or a live provider acceptance result. |
| Ask Eidos | Source-flow diagram made from text, plus the existing source-answer demo | The published project catalogue produces source links without an AI request; 13 catalogue tests passed; the browser check verifies selection, links, reset, and focus. | Current hosted model identity, paired provider behavior, broad answer quality, or permission to send private information. |
| Sentinel Lab | Existing public `sentinel-lab.webp` research-interface capture and `/lab` | A separate research application displays experiment and evidence status for inspection. | Scientific qualification, field performance, a customer security result, or autonomous action on behalf of a visitor. |

The Wellway and Sentinel captures were already present in the public site assets. No new customer or private operational images are used. Ask Eidos has no approved screenshot in this checkout, so the diagram is labeled as a flow and the existing interactive source-answer demo is the behavioral example.

## Verification

- `npm run lint` and `npm run build` passed; the build includes TypeScript, client and SSR bundles, and prerender generation.
- `npm run verify:prerender`, `npm run verify:urls`, `npm run verify:editorial`, `node scripts/validate-insights.mjs --skip-source-fetch`, and `npm run validate:insights:dist` passed. The draft-safe Insights check and built validation covered 17 published articles; no article content changed.
- The source-fetching `npm run validate:insights -- --skip-source-fetch` invocation on Windows did not forward the flag and timed out resolving two `w3.org` references. The direct draft-safe command passed. A trusted source-fetching run remains open when DNS access is available.
- `npm --prefix apps/wellway test` passed 23/23. `node --import tsx --test scripts/test-assistant-catalogue.ts` passed 13/13.
- Built local preview at `http://127.0.0.1:4173`, Chromium with Playwright 1.58.2: the new page passed at 1440 × 900 and 390 × 900 for page identity, three projects, project links, keyboard focus, source-answer selection and links, Ask Eidos dialog open/reset/Escape/focus return, reduced-motion emulation, loaded images, no client errors, and no horizontal overflow. A blocked Sentinel image produced readable fallback text. The first-viewport header and fixed assistant trigger do not cover the hero title or project links.
- The Business Systems browser check passed again at both widths after its own fixes, including the computed dark-panel CTA text color. The Digital Experiences browser check also passed at both widths, including its own keyboard, touch, focus, image, contrast, and reduced-motion checks.

Built-preview full-page captures: [Intelligent Systems desktop](screenshots/intelligent-systems-1440.png), [Intelligent Systems phone](screenshots/intelligent-systems-390.png), [Business Systems desktop](screenshots/business-systems-1440.png), and [Business Systems phone](screenshots/business-systems-390.png). The screenshots are local Chromium viewport emulation, not physical-device evidence.

## Remaining checks and release boundary

Review in an independently accessible exact-branch Works hosted preview. Physical iPhone/Android touch, zoom, screen reader, low-power behavior, and provider-backed flows remain unaccepted. The paired Works release is **NO-GO** until its separate hosted site/backend, identity, account, inbox, owner, and Stripe TEST gates are complete. Keep this PR and its bases draft; do not merge to `main` or deploy production as a page-only shortcut.
