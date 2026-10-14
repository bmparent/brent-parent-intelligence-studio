# Showcase studios — local creative workspace

The existing page editor now offers Effect, Artwork, Layout and Motion studios. Choose Workspace in the toolbar, or use `/playground?studio=effect`, `artwork`, `layout` or `motion`. A query chooses a view in your existing project; it does not discard its contents.

## One project and its history

The explicit, undoable schema5 upgrade adds `studios.version:1` while preserving the renderer and section/object identities. Versions1–4 still import through their original validators. Unknown input leaves the open design intact. The document drives studio controls, alternate previews, local agent operations, device saving and output. Continuous pointer/keyboard slider gestures create one undo entry, including pauses within a drag. Undo/Redo also covers studio changes and imported/restored projects. Local history is bounded to 30 entries; five named variations are saved with the workspace.

Local autosave reports completion after the IndexedDB transaction, rather than after scheduling. Save locally explicitly waits for that transaction; a failed write shows a backup path. Download project JSON for another browser. Import it to reopen all studios and embedded assets. An asynchronous import, upload, save result or PNG export cannot replace a newer document/revision. Variations restore explicitly and are undoable. Effect comparison is read-only: return to your current design before editing/exporting.

Account saving is a separate operation. Schema5 is **local-only** until paired hosted ownership, revision conflict, asset and reopen acceptance is available. Both runtimes reject local studio formats before an older validator can silently discard them. Existing schema1 account projects keep their established gate. This candidate does not enable hosted AI, Snapshot, new paid rights or LIVE sales.

## Start, edit and take the output

| Intended outcome | Start | Output and independent use |
| --- | --- | --- |
| A readable glass surface | Effect → Approved Eidos header / Soft frost / Prism light | Page ZIP: extract and open index.html. Header ZIP: follow README and host example; no-JS solid navigation remains. |
| A repeating tile or poster | Artwork → Pattern example or a composed poster | SVG with embedded licensed variable font; PNG at exact dimensions; ZIP includes editable artwork.json. Full project.json restores every studio. |
| A responsive page | Layout → Structure / Canvas / Responsive | Reorder with arrow buttons; spacing and responsive blocks share section IDs. Export page ZIP. |
| An original animation | Motion → stage objects + timeline | Add position/scale/rotation/opacity keys, pause/reset, save and reopen. Extract the HTML animation ZIP and press Play in index.html. This format is an HTML package. |
| A configured original sample | `/shop/configure` → family, pages, tier/modules | Exact selected files and setup checklist. Upload Artwork Studio's PNG; that same image is embedded in saved JSON, preview and package. |
| Understand one original experience | `/work/signal-house` | Keyboard/touch chapters, light, layers, assembly, overview and Playground action; semantic copy remains with scripts disabled. |

Effect reuses the existing original Eidos glass renderer for preview/page/header export; the named approved preset does not modify the public site header. No WebGL or AI provider is required for ordinary editing. Motion starts paused, pauses when hidden, bounds duration to 12 seconds and stage objects to 16. Artwork bounds objects to 48 and dimensions to 1600 pixels. The bundled OFL DM Sans subset supports Latin and punctuation; real axes are weight 100–1000 and optical size 9–40. External SVG software may strip embedded fonts; use PNG for that workflow. Upload only assets you have rights to use.

The configurator's original sample is separate from purchased template archives. Its manifest lists exact generated files beside the actual immutable edition's contents. Native WordPress/builder combinations remain unavailable in this generator, and proposed commercial prices remain draft. Contact output uses an explicitly configured mailto link; actual delivered inquiries require separate evidence.

## Bounded browser-local operations

Open **Bounded editing & local tools** for precise page properties and a change receipt. Layout changes have review/apply; Undo remains available. This deterministic path works while the hosted AI proposal path is disabled.

`window.eidosPlayground` exposes read, inspect, history, apply, applyStudio, undo, redo, save and export. `read()` returns the complete document plus `documentId` and `revision`. Every mutation/save/export requires that exact envelope. A pending mutation or changed revision is rejected; reread after the visible update. The API grants no server/account access and accepts no arbitrary scripts.

```js
const {documentId, revision, project} = window.eidosPlayground.read();
window.eidosPlayground.applyStudio({documentId, revision,
  operation: {type: 'effect', patch: {frost: 7, edge: 0.35}}});
// After the visible update, reread before undo/save/export.
```

Other bounded operations are artwork-object properties, motion-keyframe properties and section-order changes. They use the same validation/history as controls. `inspect(id)` reads a section or studio object. Unsupported fields, identities, values and stale envelopes fail without overwriting manual work. Browser WebMCP registration and hosted model operation acceptance remain separate, unimplemented extensions; this API is a browser-local integration surface.

## Reproduce validation from repo root

```text
npm ci
npm run test:showcase
npm run lint
npm run build
npm run build:functions
npm run verify:prerender
npm run verify:editorial
npm run verify:urls
```

Browser tooling is installed separately from application dependencies. Set `PLAYWRIGHT_MODULE` to its module path and run `scripts/verify-showcase-browser.mjs`, `verify-showcase-exports.mjs`, `verify-showcase-studio-details.mjs` and `verify-showcase-template-case-browser.mjs` with Node. The default local origin is 127.0.0.1:5178; use the documented `SHOWCASE_BASE`/`SHOWCASE_BASE_URL` environment overrides for a built/hosted candidate. Evidence distinguishes Windows local runs, Linux CI builds, hosted previews, provider acceptance and physical devices.

See the dated implementation plan and acceptance ledger for exact commits, preview identities, tests, screenshots, output archives, failures and unresolved release gates. No physical-device certification or production promotion is implied.
