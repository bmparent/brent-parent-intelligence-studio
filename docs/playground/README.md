Current product update: see [product-release.md](product-release.md) for the original glass integration, account projects, test checkout configuration, and header exports. The notes below describe the original preview release.

## 2026-09-26 editor journey candidate

New local workspaces start in the responsive block format (schema v4); old saved projects keep their own format until the visitor explicitly upgrades. The visible Add elements library supports click to add, dnd-kit pointer/touch/keyboard dragging to an exact insertion line in Page structure, and desktop canvas drop into the selected authored area. A visitor can select an element on the canvas for text, image, layout and width controls, rearrange existing blocks on the canvas, undo/redo, and preview mobile width. The canvas drop appends to a selected area; use the page structure drop lines or canvas controls for exact order. A browser with no cloud format entitlement continues to save locally only.

The primary free ZIP is the visitor's own page design. It includes standalone HTML/CSS/JS, bundled assets, `project.json`, `AI-HANDOFF.md` and `NEXT-STEPS.md`. A link to `/contact?from=playground#project-form` opens a reviewed, editable project note with no design or image content in the URL. Custom build work is quoted after discovery; the site's separate $29 Cinematic Starter kit is a different product. The free export does not create a WordPress or Squarespace plugin and does not connect a contact form backend in the exported page.

Run `node scripts/verify-playground-journey.mjs` against `npm run preview` with Playwright Chromium installed to check the full local click/drag, Undo/Redo, reload, ZIP and handoff path at desktop and mobile widths. The existing `verify-playground-editor-browser.mjs` also imports an old-format fixture so backward compatibility stays in the browser gates.

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

Publication update: main subsequently received the approved SVG implementation in PRs #24 and #25. Those changes are now merged into this branch. The source is available at `src/lib/liquid-glass/{controller,optics,math}.ts`, `src/components/LiquidGlassSurface.tsx`, and `src/styles/liquid-glass.css`. It is not yet wired into the portable Playground preview/export renderer; integrating it consistently into both is the first follow-up task.

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

Cloud projects and accounts; authenticated purchase entitlements and immutable paid-export revisions; integration of the now-available original SVG optics; component-only and platform-specific exports; additional templates and user testing. The current standalone export is not an InkSoft or CMS embed.
