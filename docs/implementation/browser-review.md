# Actual browser review

Browser: Codex in-app Chromium on Windows. Built local preview at 127.0.0.1:4173; source storefront visited separately. Viewport resizing is not native-device acceptance.

## Observed interactions

- Production concept: unmatched search gives recoverable empty state; selected job detail and Mark complete update state. Reset restores fictional records.
- Estimate concept: 200 units produces 980 total and 4.90 per unit with the starting fictional inputs. Formula is quantity × material + setup + minutes / 60 × 30; no tax, shipping or quoted margin implied.
- Operations concept: Last week shows 35 intake, 33 completed, +2 backlog. Tuesday shows 8 intake, 7 completed and 3 remaining daily capacity.
- Insights: unmatched query creates a zero-results state and shareable query URL; clear restores articles; Back restores the query and zero-results state. Current lead and secondary stories visibly render.
- Header: Menu opens at mobile width; Escape closes it and returns focus to the toggle. Inspection caught dark sampled branding on the new dark backing; fixed explicit text contrast including forced-colors support and rechecked at a scrolled section.
- All three services and Insights: no horizontal document overflow at 390, 768, 980 and 1440 pixels. Service image checks show no failed loaded images.

## Screenshots and provenance

- public/images/services/liberty-desktop-20260921.png and liberty-mobile-20260921.png: actual approved-public storefront, captured from the InkSoft Liberty URL on September 21. An initial incorrect crop was rejected and replaced after inspection.
- artifacts/implementation/2026-09-21/insights-desktop.png and concept-production-desktop.png: actual built local application.
- generated-concept-reference.png: AI-generated design reference only. Never used as delivered-work evidence. The implementation retains the navy glass palette, muted green selected state, split board/detail arrangement and persistent fictional label. It uses the site's typography and omits inert Settings/Edit-job controls; date filtering and loading/error previews are functional additions.
- Existing Wellway and EmbroideryCalc gallery captures retained with accurate product labels. Wellway data is fictional. No client photo, employee roster or privately authenticated UI was captured.

## Limits

No native iOS/Android, screen-reader, browser zoom or hardware GPU acceptance. Motion respects existing reduced-motion CSS and regression tests passed, but native reduced-motion toggles remain unverified. A single local Business Systems navigation reported LCP 1560 ms, INP 48 ms, CLS .004. The service layout JSON contains metrics from the same navigation while resizing: those repeated values must not be treated as independent mobile performance runs.

The original private PERNR entry/denied/expired states and Promo intake/queue/QC captures remain unavailable. The current public Disney-store home does not expose the PERNR gate. Existing public case-study artwork is explicitly a fictional demonstration, not a recreated private system.
