# Design QA — Eidos Works Studio Ledger

## Source and implementation evidence

- Selected source: `artifacts/editorial-redesign-2026-07-11/selected-option-3.png`
- Final implementation: `artifacts/editorial-redesign-2026-07-11/qa/home-desktop-1536x1024-final.png`
- Exact side-by-side comparison: `artifacts/editorial-redesign-2026-07-11/qa/source-vs-home-final.png`
- Focused evidence rail: `artifacts/editorial-redesign-2026-07-11/qa/home-case-rail-verified.png`
- Mobile implementation: `artifacts/editorial-redesign-2026-07-11/qa/home-mobile-390-final-verified.png`
- Desktop comparison state: homepage at 1536 × 1024, top of page, default navigation state.
- Mobile state: homepage at 390 CSS pixels, closed navigation, top of page.

## Comparison history

1. Pass 1 found a P1 layout mismatch: the hero was too tall and the portrait was oversized relative to the reference. The hero grid, portrait sizing, type scale, and vertical padding were tightened.
2. Pass 2 found a P1 image-layout defect: HTML image height attributes overrode the intended evidence-rail aspect ratio and stretched all three case images vertically. Explicit `height: auto` rules were added to the homepage rail and Work index imagery.
3. Pass 3 used a matched 1536 × 1024 viewport and a literal side-by-side comparison. The source hierarchy, editorial rhythm, founder identity, dark evidence rail, and three-case emphasis are preserved without remaining P0, P1, or P2 findings.

## Fidelity surfaces

- Layout: passed. Flat header, founder-led two-column hero, CTA pair, and three-column evidence rail match the chosen direction. The implementation extends the direction into complete service, process, Insights, and contact sections.
- Spacing: passed. Desktop, tablet, and mobile checks found no overlap, clipped sections, fixed-height crop, or horizontal overflow.
- Typography: passed. Newsreader supplies the editorial display voice; the system sans stack handles utility text. Heading order is logical and every verified public route has one H1.
- Color and surfaces: passed. Warm ivory, near-black ink, restrained teal rules, and the dark work rail replace the prior gradient/glass/pill language. Runtime inspection found zero gradient backgrounds and zero backdrop blur on the homepage.
- Imagery: passed. The founder portrait and all three evidence images are real project or safely recreated interface evidence. Final image dimensions render at their intended 4:3 ratio without stretching.
- Icons: passed. The supplied Eidos Works logo is used as a real image asset. The mobile menu is a plain text control; no fabricated CSS/SVG illustration is used.
- Content: passed. Copy identifies Brent, the work, the audience, role boundaries, and next action without unsupported metrics or generalized agency claims.
- Responsiveness: passed at 360, 390, 430, 768, 1024, and 1440 widths. The 390 check measured a 153-pixel H1 and no horizontal overflow.
- Accessibility: passed for the available manual and structural checks. Skip navigation, focus visibility, keyboard menu use, Escape-to-close/focus return, labels, alt text, touch targets, heading order, and semantic landmarks were checked. This is not a claim of complete WCAG conformance.

## Interaction and state checks

- Primary navigation and route links: passed.
- Mobile menu open, first-link focus, Escape close, and focus restoration: passed.
- Contact form local failure/fallback state: passed with visible status and an email alternative.
- PERNR fictional approved state (`EIDOS-1042`): passed.
- PERNR fictional denied state (`NOT-VALID`): passed.
- Browser console: no errors in the final homepage, route, form, and PERNR checks.

## Final result

passed
