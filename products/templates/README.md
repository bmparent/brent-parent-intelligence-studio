# Eidos Works template collection

Four original complete site designs, with separate developer-source and native
WordPress editions. Product availability and draft prices live in `catalog.json`.
Candidate files and local checks alone do not authorize a sale or a live release.

| Family | Intended use | Developer signature | Native WordPress alternative |
| --- | --- | --- | --- |
| Switchboard | Service businesses | Problem-to-service selector | Editable expandable service sections |
| Tideglass | Retreats and hospitality | Time-of-day scene control | Editable morning/day/evening sections |
| Matter | Makers and design brands | Material choice and close inspection | Editable material details and image blocks |
| Nightjar | Cultural programs | Program filters and day/night treatment | Editable program cards and event detail sections |

Each developer edition has the five requested pages plus editable legal notes.
Original SVG artwork, complete responsive styles, progressive JavaScript, editable
configuration, installation, rights, asset receipts, and support docs are included.
All pages remain readable and linked when JavaScript is disabled. Optional inquiry
forms prepare local email drafts; they do not send to a backend or confirm a booking.

Each native WordPress edition has `style.css`, `theme.json`, core-block templates,
five insertable block patterns, header/footer parts, ordinary enqueue functions,
optional demo page XML, full GPL text, and installation docs. It does not copy a
whole static website into an HTML block or iframe. Native WordPress signatures
are deliberately simpler than developer JavaScript effects. The edition guide
states the difference. Core blocks can be changed in Site Editor; patterns can
also be inserted into regular pages using the default Page template.

## Maintainer commands

Run from repository root:

```sh
python products/templates/generate-products.py
node scripts/build-template-packages.mjs
node scripts/test-template-packages.mjs
npm run test:templates
```

The generator is optional maintainer tooling; buyers need no Python or build.
It regenerates only the four developer/native WordPress source folders. It does
not overwrite the catalog, builder pilots, acceptance evidence, or GPL COPYING
files. Original SVG artwork is defined in the generator. Update source definitions
there before regeneration so future builds retain changes. The full GPL v2 text
is included in each WordPress folder as `COPYING`, retrieved from GNU's official
license text. Preserve it when distributing the theme.

The packager writes deterministic private ZIPs under
`artifacts/templates/packages/`, adds per-file SHA-256/byte manifests, and copies
developer source files byte for byte to `public/template-demos/<slug>/`. No buyer
ZIP enters public output. WordPress ZIPs have a single theme-slug root directory.
Archive receipts are in `artifacts/templates/package-report.json`; the integrity,
local-link, source-parity, fallback, block-structure, and GPL checks produce
`artifacts/templates/package-tests.json` and `.md`.

Do not mutate an archive after commerce pins its SHA-256/version. Rebuild an
unreleased candidate explicitly and refresh all references and installation
receipts. Version a released product before changing fulfillment bytes.

The catalog also owns market, visual style, tagline, and design direction. The
shop adapter derives its existing display values from those records. Server
commerce configuration remains the authority for price IDs and charged prices.
`templates:build` generates `release-manifest.json` after packaging and guides;
the manifest joins all sixteen edition records, eight private archive hashes,
license/support/asset files, candidate changelogs, and scoped compatibility
receipts. It keeps every edition unavailable and rejects a changed archive hash
for an existing edition/version. It does not automatically accept compatibility
or enable commerce. `test:templates` builds ignored archives before checking
integrity, release metadata, and server-rendered shop behavior on a clean checkout.

The release helper optionally mirrors only final ZIPs and a bounded list of
small proof documents to `EIDOS_PROOF_DRIVE_DIR`, then `EIDOS_ARTIFACT_ROOT`.
It reserves 64 MiB free space and verifies each destination checksum. It never
copies screenshots, browser profiles, credentials, or provider secrets. Local
`artifacts/templates/drive_manifest.json` records absent destinations, capacity
skips, failures, and verified copies; mounted copying does not prove cloud sync.
The observed first Drive attempt failed with ENOSPC and zero verified copies;
`drive_manifest-initial-enospc.json` preserves that failure. Automatic retries to
that same destination stay blocked while the failure receipt is present. Do not
remove the receipt or partial files as routine cleanup; reassess the destination
explicitly before a later archival attempt.

## Commercial boundaries

Developer source uses the included one-finished-website license. Native WordPress
code and original art use GPL-2.0-or-later; commercial terms must not remove GPL
rights. Draft support is 30 days for installation guidance and 90 days for defects
in supplied files. No lifetime updates or response-time SLA is promised.

All sample businesses, stays, material objects, and event programs are fictional.
No customer results, qualifications, inventory, available tickets, accommodation,
emergency dispatch, booking engine, cart, email delivery service, or integration
is fabricated. Replace examples and test any added service before launch.

No stock/customer/Disney/DG Promo artwork, protected store content, proprietary
font, third-party package, or remote script is bundled. Browser, real-device,
WordPress installation/editing, builder-host acceptance, and Stripe TEST commerce
remain separate proof gates. See current compatibility and test receipts for
actual acceptance; keep unverified editions unavailable in the catalog.

## Candidate version transition

The current catalog uses per-edition versions. Four WordPress themes are 1.0.1:
`Update URI` identifies the owned product route and prevents same-slug WordPress.org
update confusion; it does not supply an automatic update service. Their theme
content, blocks, art, settings, and import content are unchanged from 1.0.0.
Nightjar developer 1.0.1 fixes night-color precedence and documents palette editing.
Switchboard, Tideglass, and Matter developer 1.0.0 archives retain their hashes.
Original archives and `*-v1.0.0.json` receipts stay retained. See the version
transition receipt for exact changed files and byte comparisons; all candidates
remain commercially unavailable.
