# Template configuration and Signal House candidate — October 13, 2026

This milestone extends the existing catalog and public Digital Experiences journey. It does not modify paid archives, prices, edition identities, licenses, entitlements, checkout, recovery, account storage, or production release flags.

## Template configuration

Route: `/shop/configure`, optionally `?family=switchboard|tideglass|matter|nightjar`.

One typed, versioned configuration drives the original static sample preview, exact page/module compatibility, included-file list, standalone package, source JSON, and associated catalog edition. Schema 2 carries optional project-owned PNG artwork. Schema 1 imports explicitly migrate to schema 2 with no artwork. A local history preserves undo/redo, restores, resets, and imports. Consecutive text edits in one focus gesture share an undo entry. JSON validation runs before import or export; malformed, unsupported, or stale edition input cannot replace open work. A revision guard rejects imports and image uploads that resolve after a newer edit.

The generated sample is separate original code/artwork, with an explicitly scoped MIT license. It is freely usable on its own and cannot grant access to any paid package. The paid edition is read from the unchanged catalog and exact-version file list. Both file lists are visible. The paid archive remains immutable and is not rebuilt or personalized by sample options.

Pages: Home (required), Landing, Contact, Blog/article, Gallery. Essential includes the selected static pages and local artwork. Expressive permits gallery category/filter/lightbox (Gallery required), optional entrance motion with an explicit pause toggle and reduced-motion fallback, and editorial reading layout (Article required). Incompatible selections are disabled and explicitly reconciled when their prerequisite is removed. Unknown imported combinations fail rather than being silently accepted.

Only portable static sample output is available in this configurator. WordPress native theme and builder choices are disabled with explanations and links to actual editions. No builder installation claim is made. Prices remain the existing proposed catalog prices; sample feature tiers are not paid price tiers.

### Complete local task and output guide

1. Choose a family and selected pages; edit site text. Select Expressive to enable compatible modules.
2. Use Undo/Redo and compare. Save locally, change something, and Reopen saved. Undo also restores work from before a reopen.
3. Download JSON for backup or use Import JSON on another browser. Local saving writes a browser storage transaction with visible saved/failed status; it is not account saving.
4. Download ZIP, extract it, and open `index.html` directly in a browser. Use its navigation to open every selected page. No external service, key, font, build, or CDN is needed.
5. When Gallery module is selected, try category filtering, inspect a study, close with Escape, and verify focus returns to its opener. When Motion is selected, pause and resume; system reduced motion takes priority.
6. If Contact is included, configure a plain email address. It uses `mailto`, with accurate unconfigured and delivery-unverified messages. An inbox receipt is a separate acceptance gate.
7. Edit exported source directly or reimport `configuration.json` and export again. Re-exporting replaces hand edits. Upload all files together to static hosting after checking links and target devices.

### Use Artwork Studio output in a configuration

Export a PNG from Artwork Studio, open Your artwork in the configurator, and upload that file. Add an accurate image description. The configuration owns the embedded image; preview, local save, JSON backup/reimport, and the ZIP use the same bytes. Remove or replace is undoable. The main study on each page uses the uploaded artwork, and Gallery retains the remaining original studies.

PNG validation checks its signature, complete chunk structure, CRC integrity, nonzero dimensions, a maximum of 4096 pixels per side/16 million pixels, and a 2 MB byte limit. Browser upload and JSON import also decode the image before attachment. Remote URLs and SVG uploads are refused. JSON including its image is bounded to 3 MB. A pending upload/import cannot overwrite a newer configuration. A full browser storage quota remains a visible failed-save state; JSON backup remains available. User artwork keeps its own rights and is excluded from the generated source's MIT grant.

`PACKAGE_MANIFEST.json` lists exact payload paths and byte counts, configuration, edition association, contact mechanism, font dependency, and its self-exclusion scope. `README.md` carries the setup checklist and distinction from the paid archive. Original SVG artwork is packaged locally.

## Signal House interactive case study

Route: `/work/signal-house`. Linked from Digital Experiences and the work page. Original public vector image: `/images/case-studies/signal-house.svg`.

This is a clearly labeled original Eidos-owned concept, not private employer/customer work or a claimed client commission. One SVG house/water/landscape composition remains coherent across Imagery, Light, Interface, and Assembly chapters. Keyboard/touch range inputs change light and layer separation. Checkboxes hide visible layers. A return control restores the complete overview. Optional gentle motion starts only on request; reduced motion overrides it. All chapters, semantic headings, disclosures, default illustration, and final actions are prerendered. No WebGL dependency is present.

Final actions open the existing Playground Effect Studio deep link, a Tideglass sample configuration, or inquiry route. The site’s existing header and lowercase e mark are preserved.

## Focused validation

Repo-root command: `node --import tsx --test scripts/test-template-configurator.ts`.

The focused suite covers exact catalog association, immutable source preservation, all supported page subsets and module combinations across four families, local dependency completeness, preview/export composition parity, invalid/stale/version/platform rejection, prerequisite removal, escaping, and contact honesty. Root integration additionally owns lint/typecheck/build, hosted previews, independent browser ZIP acceptance, mobile/reduced-motion checks, screenshots, and the shared acceptance ledger.

### Observed local acceptance

`artifacts/showcase/template-case-browser/receipt.json` records Chromium 145.0.7632.6 at 1440×1000 and 390×844, exact source-file SHA-256 values, source base commit, screenshots, and downloaded archive integrity. Eleven complete flows passed: edit/history/local save/reopen/reload; exact independent ZIP; gallery filters/lightbox/Escape/focus return; JSON and artwork import guards; visible quota failure; all four family previews; chapter/keyboard/layer/light/return/final action; reduced motion; and mobile touch emulation. No console/page errors or horizontal overflow were observed.

The Artwork Studio PNG button generated `artwork-from-playground.png` (41,203 bytes, SHA-256 `d06ab57ba0eb1d24bf2fbf9724b22df3dcce8e222e4358bd78216342016c9445`). It was attached through the configurator UI, restored through undo/redo and JSON import, and compared byte-for-byte with `assets/artwork.png` in the UI-downloaded package opened via `file://`. The independent output made no remote requests. The PNG source, downloaded ZIP, extracted package, and screenshots are in the same artifact folder.

No-JavaScript prerender acceptance was not run in that development-server receipt because the current built route was not present yet. It remains a distinct root build/preview check. Browser touch emulation is not physical-device acceptance. Initial selector and SVG-inspection test-probe failures were corrected; timestamped receipts retain the later run history.

## Acceptance boundaries

Implemented: local configuration/preview/export, typed compatibility, exact local file inventory, separate paid-version inventory, local history/save/reopen/import, original interactive public case study, setup guides and discovery.

Unit test and browser results must be recorded from the exact candidate. A visual preview does not establish paid fulfillment, historical purchase retrieval, provider mail delivery, two-account isolation, hosted cloud-format compatibility, WordPress editor acceptance, Squarespace installation, GoDaddy installation, physical-device performance, or accessibility certification. These retain their existing status and gates. Commerce was not changed, so no new checkout/webhook test is represented as performed here.
