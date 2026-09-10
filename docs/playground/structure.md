# Flexible pages - explicit version 2

Version 1 imports, IndexedDB autosave and variations continue to validate as version 1. Enable flexible sections is a single undoable upgrade within the current account project. It preserves section IDs, content, fragment links and renderer selection. Replacing with an About or Contact preset detaches like other templates. Frozen order archives remain stored bytes; this change never regenerates an existing purchase.

Version 2 gives each section an immutable ID distinct from its type. It supports 3-16 sections with one header, hero and footer; header/footer stay at the ends. New About, Contact, FAQ, gallery, testimonial and service/pricing blocks use new instance IDs. Cards use unique page-wide IDs, up to twelve per block. New testimonial and pricing cards contain no invented claims. All text and links pass the existing validator and escaped renderer. Unsafe links, repeated IDs and invalid settings are rejected before import/cloud save.

Page structure in the sidebar extends the existing hide/reorder/variation controls. Select a section to edit spacing, alignment, background and inherited mobile overrides. Header navigation supports up to six independent label/destination pairs. Gallery/card images can be selected independently in Media / Brand for crop, fit, focal points and alternative text. Remove affects only the current document. Cards use the same owned storage, quota, hydration and export path as section images.

Publishing notes cover contrast, labels/decorative images, unresolved links, placeholders, empty blocks, long unbroken text and contact integration status. Local browser image decoding adds resolution notes when the export dialog opens. These are bounded checks, not an accessibility certification or a full overflow audit. Actual rendered overflow is tested at 390 and 1440 pixels. Contact is a link design; there is no implied form or commerce backend.

Header exports now include header.html and eidos-header.css with a solid HTML navigation fallback. It remains visible with JavaScript disabled or blocked by CSP; the enhanced component uses isolated shadow styles. A host CSP must permit the generated component styles and intended assets. CMS placement and physical iPhone remain separate, unvalidated gates.

## Validation
Local PASS: 18 Playground tests, typecheck, build, lint, Functions build. Final browser receipts are under C:/Users/bmpar/SystemDiagnostics/playground-20260910/structure. Production NOT RUN; no release authorized. Normal member and payment-provider tests remain separate from local fixtures.

Browser verification found and fixed a saved-state generation race after Undo/Redo, and WebKit Escape handling when pointer clicks do not focus the header toggle. Local desktop/mobile Chromium and Firefox plus desktop WebKit passed actual ZIP, independent-host scroll state 0/4/72/150/3, fixed hit-target dimensions, menu, fragments, no-JS and CSP-blocked fallback. Final WebKit desktop/mobile recheck passed and is recorded separately. These are engine tests, not physical Safari certification.
