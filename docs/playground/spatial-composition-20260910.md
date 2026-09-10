# Spatial composition — implementation and acceptance boundary

## Scope

This is a follow-up to frontend PR #34, not a replacement for its account release. Base frontend commit: `baa3d034f140686437e337d645c33ee5c575fc1b`. Backend baseline: `81f8b2e8c9876e59720712be780bb8b2c17c7785` from PR #58. Neither existing branch, production configuration, credential, payment flag nor research executor is changed by this work.

The first implementation focuses on hero composition and page-section reordering, not a general-purpose nested design canvas.

## Implemented

Select Hero and enable spatial composition. Existing version 1 and 2 projects remain unchanged until this undoable upgrade to schema 3. Content, stable IDs, media slots, crop settings, brand settings and selected glass renderer are retained. Schema 3 requires validated composition data on exactly the existing hero. Unsupported fields, versions, duplicate element identities and non-finite/out-of-range settings are rejected.

The hero image can sit behind the text, beside it on either side, above/below the whole content, or inside the text sequence. Separate Behind text and Below heading shortcuts make the original reported distinction explicit. Heading, description, button and image have labeled drag handles and non-drag order controls. Whole page sections can be reordered in the sidebar; header/footer remain pinned.

Native PNG/JPEG/WebP drops use the existing image decoder, size limits, source identity and owned media path. The preview bridge accepts only its own iframe, the active document revision and one command per gesture. Workspace-generation guards reject an upload completed after the user edits/replaces/undoes the document. Dropping outside, Escape, pointer cancellation, focus loss and hidden-page cleanup cancel active gestures. Browser testing caught and fixed Escape cancellation when focus remained in the outer page.

Settings include mobile image-placement overrides, alignment, spacing, content width, overlay, image opacity/blur, bounded offsets, rotation and scale. Desktop transforms reset on phones; left/right images stack by default. Copy stays in the chosen DOM reading order. Background images cannot intercept the CTA. An overlay is not an automatic contrast guarantee; a publishing note requires review over the actual image.

The same versioned renderer drives preview and export. Authoring handles/runtime are omitted from ordinary standalone export scripts. Images remain in the original media slots, so storage quota/ownership and export packaging reuse the established path. Frozen purchased archives are not regenerated. The vendor exporter includes every new portable dependency. No new npm dependencies are added. Existing optional AI content operations retain composition; unsupported legacy AI hero-layout fields fail explicitly rather than appearing to change an inactive layout. Natural-language spatial editing is not enabled.

## Verification performed here

- 16 portable Node tests passed: schema validation, old-project preservation, placements, mobile overrides, ordering, media-slot conservation, renderer CSS/markup and legacy AI compatibility.
- Strict TypeScript 5.8.3 compilation passed for those portable modules/tests with DOM libraries and no-unused checks. This is NOT the repository's complete TypeScript 6 application check.
- Syntax/transpilation checks passed for 11 changed TS/TSX modules.
- 17 isolated Chromium browser checks passed: six placements at 1440 and 390 pixels, no horizontal overflow, one image node, background layering, inline order, one-command drag, Escape/pointer cancellation, structured file-drop receipt and unsupported MIME rejection. No page errors were observed in that fixture.
- Desktop/mobile screenshots were visually reviewed. The fixture uses the actual composition renderer and runtime, a synthetic image and minimal surrounding CSS. It is NOT the complete React application, deployed site, original glass renderer, real mobile Safari or a hosted-account test.

The Browser plugin was not available; Python Playwright used the installed system Chromium. GitHub reads/writes worked, but direct container GitHub DNS/network access failed. The working container therefore held selected source modules, not a complete installed repository. Existing files reconstructed for editing were checked against their original Git blob hashes before changes.

## Required before release

Run the complete repository CI, including the three new full-renderer/export/history integration tests, then the paired backend tests/build and source/vendor hash comparison. Verify real React controls and iframe state transitions, async upload races, native/touch drag, long/empty content, increased text size, changed mobile placement, save/reload/reopen, conflicts, cross-owner isolation and actual downloaded ZIPs. Test desktop Chromium/Firefox/WebKit and physical iPhone Safari.

Preview frontend and backend must agree on schema 3 before hosted cloud-save tests. An older backend correctly rejects a v3 document; it must not be made to strip composition silently. Keep all old projects and original release stacks intact.

Credential approvals, real hosted password/Google/recovery acceptance and the managed WebKit Turnstile cross-frame error are still separate pending gates. Stripe TEST, physical iPhone, actual authorized InkSoft demo and provider/image reconciliation remain separate. No live payments or public AI spending should be enabled by this editor change.

Deferred: arbitrary nested nodes and cross-section element transfer; additional independent hero images/logos/decorations; unrestricted foreground/z-index canvas; per-object resize boxes; parallax; natural-language composition commands. Do not represent these as implemented or silently expand this release into a canvas rewrite.
