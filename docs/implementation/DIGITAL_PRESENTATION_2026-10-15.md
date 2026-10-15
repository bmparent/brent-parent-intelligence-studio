# Digital Experiences presentation corrections — October 15, 2026

Brent requested finishing the About thumbnail, Holidays model proportions and
garment logo placement, then verifying mobile. The candidate starts at public
main `8de77210251b9a8d5d3e49e9fa1cf16c2c4624e3` on
`codex/digital-presentation-20261015`. Production acceptance remains open. Current main `b8bfbbc4e6f9dd73c7c899f0b32e829207314b75` was incorporated before browser CI, preserving its indexing repair.

## Result and review decision

- About and both Holidays placements on Digital Experiences use the layered
  storefront composition, replacing the flattened hero/category screenshot.
  The thumbnail omits small category/CTA text already provided by native links.
- Hero pairs retain their intrinsic proportions and reserve a separate center
  column for the title. The phone entrance places copy above the pairs and uses
  the existing portrait boulevard background. Category models use consistent
  2:3 portrait frames with labels outside the artwork.
- Official marks are composed with the people inside a shared SVG viewBox,
  reused by hero, thumbnails, category, collection, product, inspection and bag.
  Chest marks use **wearer's left (viewer right)**, cap/beanie front panels are
  centered, and pants retain the left-thigh placement. This is the proposed
  correction for Brent's review, not a newly claimed approved production spec.
  The optional placement question received no answer in this session.

This is public presentation source only. Existing Data Graphics attribution,
illustrative-product/no-order disclosures and motion controls remain. Other
storefronts use their existing images. No private operational assets, account,
payment, inquiry, backend, provider, commerce or deployment settings change.

## Artwork provenance

Existing public project assets were read from Cloudinary's
`hollywood-studios-shows/holidays-in-hollywood/storefront-assets` folder.
`hih-asset-manifest-v2.md` distinguishes the clean marquee title from the
embroidery marks and specifies separate category people. The clean hero pairs
(`hih-hero-cast-left-clean-v3`, `hih-hero-cast-right-clean-v3`) and the official
cast/crew and cap runtime marks remain those existing assets. Their exact URLs
and reviewable placement coordinates are in `src/data/holidayArtwork.ts`.

Four existing category models were edited with the built-in image tool, preserving
their transparent 1024 × 1536 canvases, identities, poses, clothes and full bodies.
The final assets are in `public/images/storefronts/holidays/`, named
`jackets-clean.webp`, `hoodies-clean.webp`, `headwear-clean.webp` and `pants-clean.webp`.
The generated output was compressed to WebP (quality 92; same dimensions and alpha); no manual raster logo painting is used.
Marks remain the exact supplied images, rather than image-generated lettering.

Prompt set (built-in image tool, `precise-object-edit`, transparent background):

- Jackets: remove only the Holidays chest logo and CAST AND CREW text, restoring
  plain black jacket fabric; preserve the woman's face, hair, body, varsity
  jacket, pose, shoes, lighting, illustration style, full-body composition and
  transparency. No new artwork or marks.
- Hoodies: the same removal/preservation constraints for the male hoodie model,
  retaining the hoodie, pants and shoes.
- Headwear: remove the mark from the beanie plus the chest logo/text, restoring
  plain knit/jacket fabric; preserve the woman's identity, body, beanie, jacket,
  pose, pants, shoes, illustration and transparent full-body composition.
- Pants: remove only the hip logo/text, restoring the black fabric; preserve
  the man's identity, body, top, pants, pose, shoes and transparent composition.

## Verification ledger

The existing Digital Experiences browser gate now covers the affected complete
flow: About → service → holiday entrance → category → item → inspect → demo bag,
plus removal and empty-filter recovery. It records screenshots at 1440, 768, 390
and 320 pixels and checks decoded artwork, source-relative marks, nonoverlapping
hero/title boxes, portrait proportions, reduced/pause motion, no horizontal
overflow and no application runtime errors. Existing keyboard/project-selector
checks remain. GitHub's existing PR browser workflow runs it and retains evidence.

Local TypeScript, lint (zero errors; existing Wellway Fast Refresh warning),
client/SSR build and source syntax checks passed during implementation. Local
Chromium could not launch: the available executable exited with SIGSEGV, while
the runtime browser binary was absent. Browser plugin is not available. Rendered
results must therefore be read from the exact-head CI artifact before claiming
mobile verification. Final CI results and screenshot review belong on the PR.

The first CI browser pass completed the desktop visual/interaction flow but
reported two hydration errors: Vite preview returned homepage SSR HTML for the
extensionless service and case links. Local HTTP readback reproduced this exact
mismatch while slash-suffixed routes returned the correct headings. The local
browser harness now resolves just those clean-path document requests to their
matching prerendered directories, as the production Pages host does. Hosted
verification uses real responses with no adapter. The existing combined browser
step runs the affected Digital Experiences flow first for earlier feedback;
production deployment conditions and commands are unchanged. The initial
screenshots also informed a tighter thumbnail marquee. Analytics is declined
through its real UI before evidence capture, and tall grids are captured card by
card to avoid sticky navigation obscuring the evidence.

Production promotion and canonical readback have not occurred. Physical devices,
screen readers, Safari/iOS and live InkSoft editor/commerce acceptance remain
untested. Nothing here closes the separately held account/payment runtime.

Rollback: revert this isolated source change to the public-main baseline above;
there is no data migration or provider-setting rollback.
