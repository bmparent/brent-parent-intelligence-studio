# Full-page portfolio concepts — 2026-09-30

## Candidate and scope

Branch: `codex/portfolio-concepts-20260930`, based on the current paired site review branch `codex/works-paired-integration-20260927` at `665c7062d47f398ff484ec73c690478ca1a6e5cb`. This is a gallery-only addition to that review candidate. The service-page branches #74–76 remain independent and can incorporate this addition through their normal integration.

The homepage's compact gallery and `/work#site-gallery` now lead with three complete fictional business website mockups. Existing gallery entries remain available. The full gallery has 21 previews, a Concepts filter, and search by title, description, industry, or customer goal. The mockups are static images, not newly implemented businesses, booking engines, shops, or service providers.

## Design and asset provenance

Brent supplied https://foxpointwd.com/portfolio/ as a presentation reference. Its tall, uncropped website images inspired the full-page presentation. The reference portfolio and the existing public Eidos Works homepage were inspected in the browser and attached as image references to the built-in Image Gen calls. No Foxpoint client assets, copy, or branding were incorporated.

All three original mockups were created with the built-in Image Gen tool. The common prompt direction requested a single complete flat desktop webpage, from navigation to footer, with Eidos Works' cinematic imagery, restrained navigation, editorial type, and purposeful spacing. Requested design dimensions were 1440 × 3600; actual output sizes are recorded below. No artificial enlargement was used in the stored originals. WebP conversion and 640-pixel thumbnails preserve the whole composition.

| Concept | Prompt direction / customer goal | Actual full image | Full / thumbnail bytes |
| --- | --- | --- | --- |
| Stillwater House | A fictional lakeside retreat: sunrise hero, room choices, local experiences, and consistent booking prompts. Headline: “A slower kind of stay.” | 793 × 1983 | 337714 / 196818 |
| Canopy Home | A fictional exterior home-care business: architectural hero, clear services, and a three-step estimate path. Headline: “Care for the place you call home.” | 795 × 1977 | 353494 / 200346 |
| Form & Field | A fictional homewares shop: sculptural product photography, an asymmetric collection feature, category paths, and a materials story. Headline: “Objects with a little soul.” | 793 × 1983 | 239278 / 136794 |

Assets: `public/images/site-gallery/{stillwater-house,canopy-home,form-and-field}-concept.webp`, plus the matching `-concept-thumb.webp` files. The thumbnail payload totals 533958 bytes. Full images load only when their preview is opened.

Cards visibly say “Fictional design concept.” The preview also discloses “AI-generated mockup” and explains that the businesses and offers are imagined. Generated photographs are illustrative. No customer relationship, measured results, reviews, licenses, availability, financial outcome, or operational offer is claimed. The design brief and contact link are ordinary accessible text outside the image.

## Interaction and verification

The new full-page images are not cropped by the existing 4:3 thumbnail rule. At phone widths the concept cards span the grid. Opening a concept gives a native dialog, a scrollable image, a full-size/fit-to-width toggle, customer-goal and design-approach notes, and a link to the existing contact route. Escape and Close return focus to the opening control. Existing app links and saved-reference previews retain their behavior.

- PASS: `npm run lint`, `npm run typecheck`, `npm run build`, `npm run verify:prerender`, `npm run verify:editorial`, `npm run verify:urls`, and `git diff --check`.
- The editorial button-density verifier now recognizes thumbnail buttons as part of the same gallery browsing surface as Preview buttons. Its limit on non-gallery buttons remains 10.
- Local supervised Chromium preview at 1363 × 936 CSS pixels: meaningful Work page, three loaded full-page thumbnails, Concepts filter (3), industry search (1), empty state (0), reset (21), native preview, full-size toggle, scrolling through the image to its footer, Escape/focus return, and no document overflow were observed. Browser screenshots were visually reviewed.
- Responsive review used the actual Work page inside a 390 × 844 CSS-pixel iframe, with 375 pixels of document content width after the scrollbar. The concept cards occupy one full-width column. The preview loaded; full-size mode displayed the 793-pixel image in a 334-pixel scroll region without overflowing the page. Scrolling reached the image footer. This is responsive desktop-browser evidence, not physical-phone or touch acceptance.
- Browser logs observed errors from the browser extension's metadata bridge, not Eidos Works application errors. No framework overlay was observed. The temporary responsive-review harness is excluded from source and build output.

## Authorized public release

The original draft was stacked on site #73. Brent subsequently authorized merge and production release. The gallery is rebased onto main `e0f5ca9c0b81542929960aa6ada075f81ad0240b`, excluding the paired implementation and its unaccepted runtime changes. See ACCEPTANCE.md and PUBLIC_RELEASE_2026-09-30.md for the independent public-release impact analysis and exact candidate/live evidence. The original source and browser observations above retain their historical scope; the new combined candidate receives fresh checks.
