# Eidos Playground

A client-only visual editor at `/playground`, linked from the Eidos Works footer. This preview release is free and does not add a payment flow or claim cloud project storage.

## What works

- Landing, homepage, and portfolio compositions with six reusable sections.
- Live content and design editing, palettes, typography, spacing, section order and visibility.
- Desktop and 390px page previews; responsive editor panels on small screens.
- Edit mode selects sections; visitor mode runs navigation and scroll interactions.
- Versioned glass settings with a solid-to-frosted scroll transition and spring-driven canvas edge light.
- Undo/redo, local IndexedDB autosave, five named variations, restore/compare, JSON import/export.
- PNG, JPEG, and WebP uploads, resized and re-encoded before storage. Images remain embedded in project JSON and become local asset files in ZIP exports.
- Standalone HTML/CSS/JS export, exact project settings, CSS tokens, source preset, integration instructions, and a design-specific AI handoff.

## Architecture

`model.ts` owns the schema, validation, defaults, palettes, link policy, and publishing checks. `renderer.ts`, `pageStyles.ts`, and the self-contained `pageRuntime` function supply both the sandboxed preview and standalone export. The iframe has script permission only; message handlers check the sender window. User copy is escaped, CSS values are constrained, and imported URLs and image types are validated.

`storage.ts` owns IndexedDB transactions and image processing. `useProject.ts` owns bounded history and autosave state. The saved indicator changes only after transaction completion; unsaved work prompts before navigation. `export.ts` packages local assets with a dependency-free ZIP STORE writer and CRC-32 checksums.

Projects pin schema version 1 and renderer `eidos-portable-glass-1.0.0`. Unknown versions are rejected without replacing the open project. Ship an explicit migration or a compatible renderer before accepting future versions.

The unchanged `approved-glass-preset.json` is the approved reference. The original SVG displacement controller was not present in the source repository or glass-named branches when this was built. The current renderer is a separately identified frosted-backdrop/canvas approximation. It does not claim identical live SVG refraction or native Apple rendering. Real iPhone/Safari verification remains outstanding.

## Run and verify

- `npm ci`
- `npm run dev`
- Open `/playground`.
- `npm run test:playground`
- `npm run lint`
- `npm run build`
- `npm run verify:prerender`

The existing quality workflow includes the new Playground tests. No runtime dependencies were added.

## Browser verification performed

The production bundle was tested in clean headless Chromium at 1536×1024 and 390×844. Checks covered hydration without page errors; content edits and undo/redo; reopening saved content and uploaded images; snapshot restore/compare; hide/show and reorder; invalid link draft protection; mobile navigation; scroll material state; an actual ZIP download and CRC verification; standalone exported HTML, scripts, and image loading; and project JSON reimport. Reduced-motion emulation was exercised. The connected browser separately verified preview controls, persisted edits, and mobile section navigation.

## Next release

Cloud projects and accounts; authenticated purchase entitlements and immutable paid-export revisions; original SVG optics integration when source becomes available; component-only and platform-specific exports; additional templates and user testing. The current standalone export is not an InkSoft or CMS embed.
