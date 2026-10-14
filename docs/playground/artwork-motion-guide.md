# Artwork and Motion Studio output guide

Both studios belong to the open Playground project. Their data, palette, uploads and keyframes use the existing project history and device autosave. Save a named variation with the workspace controls, edit, Undo, and restore that variation. A complete project JSON backup restores all studios. Account saving retains the existing cloud-format gate until paired hosted ownership and reopen checks pass; device saving does not establish account acceptance.

## Artwork: make, save and reuse

1. Start from Pattern example or one of the editorial, botanical or orbit posters. Select a mark in the canvas or Objects list. Add original geometric marks, text or a PNG/JPEG/WebP upload.
2. Change Linked palette colors. Linked marks update together; choose Object override to give one mark its own color. Its override survives subsequent palette changes.
3. Use X/Y, size, rotation, scale and opacity sliders. Keyboard arrows work on every slider. Duplicate preserves appearance with a new ID. Layer back/forward changes actual export order.
4. Check two or more objects in the object list and choose Group selected. Moving, rotating and scaling any group member adjusts its group. Color/text changes remain local. Ungroup restores separate transforms.
5. Tile/Design, Repeat proof and Objects read the same source. Tile wraps across every edge; poster clips at the page edge. Repeat proof shows a 3 × 3 arrangement. Half-drop offsets alternate columns, so use repeat.svg or the same half-drop arrangement instead of repeating artwork.svg as a plain grid.
6. Download SVG/PNG or the artwork ZIP. Extract the ZIP and open index.html or artwork.svg directly. The SVG contains the exact font and image bytes. PNG retains canvas dimensions and selected transparency. Import artwork.json through the studio to continue editing; malformed input preserves the open design. Root workspace export additionally includes the complete project.json.

SVG viewers and design applications differ in support for embedded fonts. Use PNG in software that strips them. Font loading is reported in the output guide. Empty text intentionally draws nothing; long lines fit the canvas. Large amounts of text still need editorial judgement at the final size.

## Motion: keyframe and play independently

1. Start with the original bloom/text study. Press Play, Pause or Reset. Select an object in the stage/list; choose a keyframe chip to select its time.
2. Scrub to a new time. Add/update a keyframe or change X/Y, scale, rotation or opacity to create one there. Values interpolate linearly between keys and hold before the first/after the last key.
3. Duplicate, layer or remove objects. Upload images through the project guard. Edit text and its real variable-font axes. Duration is bounded to 1–12 seconds and preserves relative keyframe timing. Playback speed is 0.25–2×.
4. Save and reopen the entire project or download/import motion.json. Download animation ZIP, extract it, open index.html and press Play. Use its own Pause, Reset, Time and Speed controls without Eidos, an account, a build, a CDN or network.

The delivered format is a self-contained HTML browser animation package. It is not GIF, WebM or a video file. Playback requires JavaScript; disabled JavaScript retains the first frame. It begins paused, including reduced-motion mode, and pauses in a hidden browser tab. Static hosting or iframe integration must allow its inline script/style and embedded font/image data. Those host-specific permissions and physical-device performance remain separate acceptance checks.

## Font, content and upload limits

DM Sans is licensed under SIL Open Font License 1.1. `public/fonts/artwork/OFL.txt` preserves the license; every studio ZIP includes it. The Latin/punctuation subset preserves the original font's actual axes: `wght` 100–1000 and `opsz` 9–40. These controls use real variable axes, not synthetic CSS width or slant. Unsupported scripts are rejected with an explanation rather than silently switching to an unbundled font. Original font source and subset hash are captured in `studioFont.json` and `public/fonts/artwork/README.md`.

Artwork supports 48 objects, Motion 16 objects and 32 keys per object. Canvas sides are 192–1600 pixels. Text supports 300 characters. Uploads use the existing image validation/resize pipeline (PNG/JPEG/WebP; 8 MB input, 16 megapixels, bounded embedded output). Only upload images you have rights to use. Upload/import/PNG completion checks its initiating document/revision; switching or editing the project invalidates obsolete work.

## Verification

Run from the repository root:

```sh
node --import tsx --test scripts/test-playground-studios.ts
npm run typecheck
npm run lint
```

The studio tests cover schema rejection, source roundtrips, stable identities/group duplication, palette overrides, transparent/dimension/repeat SVG output, empty/long text, font hashes/axes/license, motion interpolation and duration changes, duplicate-key rejection and self-contained safe export source. Browser acceptance separately checks actual typography/PNG parity, complete save/reopen/Undo tasks, independent HTML playback, responsive keyboard/touch controls and preview hosting. Unit tests do not establish hosted ownership, physical-device or provider acceptance.
