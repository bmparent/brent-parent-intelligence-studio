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
| Personalize an existing developer archive | `/shop/configure` → Buyer-local developer source | Attach your matching original ZIP and verification JSON; build a separate local derivative, inspect its actual family pages, download and open index.html. |
| Understand one original experience | `/work/signal-house` | Keyboard/touch chapters, light, layers, assembly, overview and Playground action; semantic copy remains with scripts disabled. |

Effect reuses the existing original Eidos glass renderer for preview/page/header export; the named approved preset does not modify the public site header. No WebGL or AI provider is required for ordinary editing. Motion starts paused, pauses when hidden, bounds duration to 12 seconds and stage objects to 16. Artwork bounds objects to 48 and dimensions to 1600 pixels. The bundled OFL DM Sans subset supports Latin and punctuation; real axes are weight 100–1000 and optical size 9–40. External SVG software may strip embedded fonts; use PNG for that workflow. Upload only assets you have rights to use.

The configurator's original sample is separate from purchased template archives. Its manifest lists exact generated files beside the actual immutable edition's contents. Native WordPress/builder combinations remain unavailable in this generator, and proposed commercial prices remain draft. Contact output uses an explicitly configured mailto link; actual delivered inquiries require separate evidence.

For a repeating Artwork background, use **Seamless SVG** or **Seamless PNG**. Straight grid uses the saved cell dimensions. Half-drop uses two columns (2 × width, unchanged height) so the selected offset survives horizontal repetition. The ZIP includes seamless.svg and displays that unit in index.html. artwork.svg remains the single design cell; repeat.svg is a 3 × 3 inspection proof. Poster compositions have no seamless export. The largest half-drop unit is3200 ×1600 pixels.

## Buyer-local archive derivation

The second configurator preview personalizes your actual supported developer family files. It never substitutes the original sample renderer. Download the public edition verification JSON in the tool, attach it, then attach your original matching ZIP. Verification compares its complete SHA256 and byte count with frozen candidate metadata before parsing, then checks the original manifest, identity, file set and file hashes. Possession or matching hashes establish integrity; they do not establish purchase, ownership or entitlement.

Choose the actual family pages/native modules and palette/motion options below the upload controls. Site name, main headline/introduction, contact email and artwork come from the common content controls above. Brand/email apply across pages; main headline/artwork apply to Home. Build the private preview after changes; preview navigation retains supported query/fragment destinations. Download the new derivative ZIP and its checksum receipt, extract it, and open index.html independently. Original licenses/support/install/asset notices and the original manifest remain in the new package. DERIVATIVE_INSTALL.md explains changes and limits; the new PACKAGE_MANIFEST.json describes actual output hashes and parent/configuration provenance.

These options share Undo, Save locally, Reopen saved and configuration JSON. Schema3 explicitly migrates schema1/2 configurations. Original ZIP bytes and private derivative bytes are kept only in component memory, excluded from saved JSON/storage, and cleared on family/import/reopen switches or Clear imported source. Reattach the same original ZIP after reopening. Clearing or switching invalidates pending verification/build results. No account, order, checkout, recovery, receipt or server archive is changed. Unsupported historical versions retain their original retrieval path and rights; this adapter never requires repurchase. The derivative grants no additional rights and does not apply the free sample's MIT license to paid source or uploaded artwork.

Current adapters support the four frozen candidate developer editions. WordPress and native hosted builders remain unavailable. A configured contact form prepares a mail-app draft; an unconfigured form is visibly disabled. Neither establishes delivery. Hosted paid entitlement, account isolation, delivered receipt/recovery mail, TEST/LIVE provider and builder-install acceptance remain separate release gates.

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

Additional repo-root browser checks: `node scripts/verify-showcase-persistence-races.mjs`, `node scripts/verify-showcase-seamless.mjs`, `node scripts/verify-showcase-legacy-imports.mjs`, `node scripts/verify-showcase-header.mjs`, and `node scripts/verify-buyer-derivative-browser.mjs`. The buyer check needs the candidate archives generated by `npm run templates:build`; raw licensed inputs/outputs stay in OS temporary storage outside the public evidence folder. Its retained receipts identify hashes, unchanged original notices, exact included files and independent use without distributing paid archives. Native browser-chrome zoom remains unverified in headless testing; the header check records CDP magnification and effective reflow separately.
