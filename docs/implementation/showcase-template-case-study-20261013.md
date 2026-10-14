# Template configuration and Signal House candidate — October 13, 2026

This milestone extends the existing catalog and public Digital Experiences journey. It does not modify paid archives, prices, edition identities, licenses, entitlements, checkout, recovery, account storage, or production release flags.

## Template configuration

Route: `/shop/configure`, optionally `?family=switchboard|tideglass|matter|nightjar`.

One typed, versioned configuration drives the original static sample preview, exact page/module compatibility, included-file list, standalone package, source JSON, and associated catalog edition. A local history preserves undo/redo, restores, resets, and imports. Consecutive text edits in one focus gesture share an undo entry. JSON validation runs before import or export; malformed, unsupported, or stale edition input cannot replace open work. A revision guard rejects imports that resolve after a newer edit.

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

`PACKAGE_MANIFEST.json` lists exact payload paths and byte counts, configuration, edition association, contact mechanism, font dependency, and its self-exclusion scope. `README.md` carries the setup checklist and distinction from the paid archive. Original SVG artwork is packaged locally.

## Signal House interactive case study

Route: `/work/signal-house`. Linked from Digital Experiences and the work page. Original public vector image: `/images/case-studies/signal-house.svg`.

This is a clearly labeled original Eidos-owned concept, not private employer/customer work or a claimed client commission. One SVG house/water/landscape composition remains coherent across Imagery, Light, Interface, and Assembly chapters. Keyboard/touch range inputs change light and layer separation. Checkboxes hide visible layers. A return control restores the complete overview. Optional gentle motion starts only on request; reduced motion overrides it. All chapters, semantic headings, disclosures, default illustration, and final actions are prerendered. No WebGL dependency is present.

Final actions open the existing Playground Effect Studio deep link, a Tideglass sample configuration, or inquiry route. The site’s existing header and lowercase e mark are preserved.

## Focused validation

Repo-root command: `node --import tsx --test scripts/test-template-configurator.ts`.

The focused suite covers exact catalog association, immutable source preservation, all supported page subsets and module combinations across four families, local dependency completeness, preview/export composition parity, invalid/stale/version/platform rejection, prerequisite removal, escaping, and contact honesty. Root integration additionally owns lint/typecheck/build, hosted previews, independent browser ZIP acceptance, mobile/reduced-motion checks, screenshots, and the shared acceptance ledger.

## Acceptance boundaries

Implemented: local configuration/preview/export, typed compatibility, exact local file inventory, separate paid-version inventory, local history/save/reopen/import, original interactive public case study, setup guides and discovery.

Unit test and browser results must be recorded from the exact candidate. A visual preview does not establish paid fulfillment, historical purchase retrieval, provider mail delivery, two-account isolation, hosted cloud-format compatibility, WordPress editor acceptance, Squarespace installation, GoDaddy installation, physical-device performance, or accessibility certification. These retain their existing status and gates. Commerce was not changed, so no new checkout/webhook test is represented as performed here.
