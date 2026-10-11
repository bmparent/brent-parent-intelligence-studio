# Paid templates — draft economics and expansion workflow

Prepared October 10, 2026. This is an operating proposal for the candidate
collection. It does not approve publishing prices, enabling LIVE sales, purchasing
services, new subscriptions, or an automatic release schedule. Provider-backed
sales, costs, margins, conversion, and demand are unknown until measured and
reconciled. TEST payments are evidence, not revenue.

## Offer and proposed prices

The authoritative candidate records are in
[`catalog.json`](../../products/templates/catalog.json), read by the storefront
through [`templateCatalog.ts`](../../src/data/templateCatalog.ts). Backend
products/prices remain server-owned. A public value cannot authorize a charge or
entitlement. New editions remain commercially unavailable until their separate
installation and commerce gates are accepted.

| Offer | Price | Deliverable and boundary |
| --- | ---: | --- |
| Existing Cinematic Starter | $29 USD, one time | Preserve its existing header-and-hero product, URL, buyers, files, one-website license, and approved terms |
| Switchboard, Tideglass, Matter, Nightjar developer source | Draft $99 USD each, one time | Complete five-page static site plus legal-notes page, original art, source/configuration, and guides; code editing required |
| Each family's native WordPress edition | Draft $129 USD each, one time | Editable core-block theme/templates/patterns/styles; release individually after exact clean-install acceptance |
| Squarespace 7.1 existing-site kit | Draft $29 USD each, one time | Manual section/style recipe and optional supported code; Switchboard pilot, remaining families unavailable |
| GoDaddy Websites + Marketing visual add-on | Draft $29 USD each, one time | Embedded visual section; native navigation/contact/booking stay outside; Switchboard pilot, remaining families unavailable |
| Assisted setup | Unknown; no published price | Separately scoped service only after measuring actual installation work |

The brief proposed $79–$129 for complete designs and $19–$39 for visual add-ons.
The chosen draft points fit those bands; they are not proof of optimal pricing.
A static ZIP is not a universal CMS import. Hosting, domains, platform plans,
paid integrations, replacement content, and legal policies cost extra. No hidden
renewal or mandatory Eidos hosting is proposed.

## Unit economics: unknown costs stay unknown

Use USD excluding tax collected on behalf of authorities. Historical fee notes
do not establish fees on the intended current account, method, currency, or
contract. TEST transactions do not measure real settlement fees.

| Input | Current value | Required measurement |
| --- | --- | --- |
| `P`: price excluding collected tax | Draft $99 / $129 / $29; Cinematic unchanged $29 | Server-owned price and actual order/settlement receipt |
| `f`: proportional provider/platform fee | Unknown | Actual provider balance transaction and applicable contract |
| `b`: fixed payment cost per original charge | Unknown | Actual fee receipt, including what is retained after refund |
| `q`: fraction of original revenue refunded | Unknown | Product/version refund ledger including partial refunds |
| `d`: variable delivery cost per original order | Unknown | Storage/egress, email attempts/retries, download/recovery usage |
| `s`: support hours per original order | Unknown | Time entries by edition, issue, and support window |
| `w`: fully costed hourly labor rate | Unknown | Intentional internal rate including actual labor burden; owner time is not free |
| `u`: update/maintenance cost allocated per order | Unknown | Tracked effort and justified allocation; no invented sales denominator |
| `z`: dispute/refund-operation reserve per order | Unknown | Loss/fee/handling receipts; do not count refunded revenue twice |
| `CAC`: acquisition cost per attributable new buyer | Unknown | Attributed acquisition spend/labor divided by verified acquired buyers |
| `o`: other variable cost per order | Unknown | Actual incremental infrastructure/licensing/operating receipts |
| `F`: fixed design/testing/documentation cost | Unknown | Tracked effort and asset/tool cost using a declared allocation |

For conservative planning, charge fees against the original payment unless
provider evidence establishes a refundable fee:

```text
contribution = P*(1-q) - (f*P+b) - d - w*s - u - z - CAC - o
             = P*(1-q-f) - (b+d+w*s+u+z+CAC+o)

floor_price = (b+d+w*s+u+z+CAC+o+M) / (1-q-f), where 1-q-f > 0
break_even_orders = ceil(F/contribution), only when contribution > 0
```

`M` is an intentionally chosen contribution amount. Contribution is before
fixed design cost and unallocated overhead; it is not profit or cash settled.
Neither floor price nor break-even volume can be computed honestly while its
inputs are unknown. Record `null` and a reason instead of assuming zero fees,
no refunds, free owner time, free acquisition, or invented volume. $99, $129,
and $29 are gross draft amounts before costs, not measured margins.

Once records exist, use observed ranges for low/base/high cases. Label any
unobserved scenario assumptions explicitly. Assisted setup must include measured
installation, content replacement, integration reconnection, review, transfer,
and handoff time. Do not promise a fulfillment duration before measuring it.

## Measurement and review

Reuse the existing authoritative purchase/fulfillment ledger. An internal export
should include product, edition, immutable version/hash, TEST/LIVE flag, paid
timestamp, charged amount excluding collected tax, provider fee, refunds,
dispute losses/fees, delivery usage/cost, acquisition attribution, support time,
and reconciliation state. Use opaque internal references. Do not expose customer
emails, payment data, addresses, credentials, or private recovery URLs in public
artifacts. Unknown costs remain `null` with reasons.

Separate support time into installation clarification, actual template defect,
custom design, host/platform issue, and optional integration. That shows whether
to improve a guide, fix source, or scope a separate service. Review by edition
and version after actual records exist; reconcile provider/bank records before
claiming sales or profit. Do not create recurring automation from this proposal.

## Rights, support, updates, and refunds

- Developer source and original builder kits propose one finished commercial
  website, including one client's website and maintenance handoff. Backups and
  staging copies of that website are allowed. Standalone template/asset resale
  and competing-library redistribution are excluded. Each archive contains its
  actual license; future dependencies need separate rights disclosure.
- Native WordPress code and original included art are GPL-2.0-or-later, with full
  license text. Paid packaging/support terms cannot retract GPL use, modification,
  or redistribution rights. Do not apply the developer one-site limit to GPL.
- Draft support is 30 days after purchase for included installation guidance
  and 90 days for reproducible defects in supplied files. Clarify the purchased
  major-version correction promise in final approved checkout terms and keep
  shop/file notices aligned. No unlimited support, lifetime updates, guaranteed
  response time, custom redesign, migration, hosting, platform account support,
  third-party setup, or future major version is included.
- Preserve the existing approved [Eidos Works terms](https://eidos-works.com/terms/)
  and refund policy. This document introduces no new refund deadline or blanket
  no-refund rule. Missing files, duplicate charges, and defects use the established
  billing route. A refund test does not establish all refund eligibility. Rights
  that cannot be excluded under applicable law remain intact.
- Revocation must prevent future authorized retrieval/recovery in the applicable
  refund/dispute state. It cannot reclaim downloaded files, remotely disable an
  installed website, or remove rights already granted by its applicable license.
- Purchased archives stay immutable. State whether an update is a correction,
  compatible maintenance release, or separate major edition. Do not silently
  replace bytes associated with an existing order, edition, version, and hash.

## Add a product without rewriting the storefront

The shared foundation is the versioned catalog, edition-specific files, common
collection/detail/guide/recovery views, and private backend fulfillment. New
design recipes can have different markup and interactions; the storefront must
not turn expansion into recolors. Platform adapters remain separately accepted.

1. Write an audience/task brief: primary visitor action, reading/content needs,
   device/language needs, ordinary navigation, and actually available data and
   integrations. Research first-party comparable demos and record differences
   without copying assets, claims, or code.
2. Add a unique slug/name and edition IDs to `products/templates/catalog.json`:
   useful summary, five-page plan, signature, palette, draft price, source path,
   package path, guide, license/support terms, and availability. New editions
   start unavailable. State complete source site, native theme, manual kit, or
   visual add-on accurately; missing editions must not claim a package exists.
3. Add files under `products/templates/<slug>/<platform>/`. The current generator
   is optional maintainer tooling for four families; extend its recipe if useful.
   Packaging discovers catalog `sourcePath` entries. Supply complete pages,
   editable configuration, static fallback, original licensed assets, metadata,
   `INSTALL.md`, `LICENSE.txt`, `ASSETS.md`, and `SUPPORT.md`.
4. Add a short visual-recipe entry in `src/data/templateCatalog.ts` when collection
   art needs one. Product copy/prices/availability stay in the catalog. This is a
   data-adapter addition, not a shop/detail component rewrite. Extend route/SEO
   metadata through the existing path and verify generated routes/canonicals.
5. From repository root, package source and generate its public guide:

   ```sh
   node scripts/build-template-packages.mjs
   node scripts/build-template-guides.mjs
   node scripts/test-template-packages.mjs
   node --import tsx --test scripts/test-template-shop.ts
   npm run typecheck
   npm run lint
   npm run build
   npm run verify:prerender
   node scripts/verify-template-shop.mjs
   python scripts/verify-template-browser.py --base http://127.0.0.1:5190
   ```

   Start the normal repository preview at the specified URL before browser checks.
   Initial package/browser contracts deliberately expect four families; expand
   those explicit scope assertions for the next product without weakening hash,
   isolation, fallback, or availability checks.
6. Follow the buyer's exact guide in a clean declared platform/version/plan.
   Change business copy and imagery, publish a test page, and verify its main
   action. A ZIP parse or standalone render is not platform installation. Record
   installation method, editable fields, effect differences, dependencies,
   limitations, archive hash, evidence, and acceptance status.
7. Add the server-owned edition/version/price mapping to the paired backend.
   Pin private archive hash/bytes and preserve existing identities and ledger.
   Test success, unpaid/abandoned/failed/delayed outcomes, duplicate events,
   ownership isolation, forbidden download, expired-link recovery, applicable
   refund/dispute revocation, and transactional email. Distinguish real Stripe
   TEST receipts from local fixtures and marketing consent.
8. Freeze the candidate and retain package/build/browser/install/commerce/email
   receipts. Prepare paired preview and exact rollback targets. Release only the
   eligible edition after explicit production approval. This handoff authorizes
   neither LIVE activation nor changing existing customers' terms.

For a second version, allocate a new immutable version/archive location; keep the
old order mapping and bytes. Add changelog, compatibility changes, and explicit
update eligibility. Packaging and release metadata derive the validated version
from each edition, with `1.0.0` as the initial-version fallback. An edition ID
identifies the product/platform; a new immutable version needs its own archive
path. Never replace bytes at an existing edition/version location.
Retest affected source/platform/commerce gates. Price changes require approved
server-owned records, never a client override. No weekly auto-publication or new
subscription is implied.

## Nine-market expansion backlog

This order is an implementation proposal based on useful reuse and integration
risk, not measured demand, audience size, or likely sales. Finish current gates
before expanding. Every brief must differentiate navigation and visitor needs.

| Priority | Market | Visitor task and navigation | Distinct design/interaction | Dependency and rationale |
| --- | --- | --- | --- | --- |
| 1 | Professional services | Understand expertise, scope, working process, and consultation path; service-first navigation | Calm document-like structure, topic-to-service guide, clear qualification limits | Reuses inquiry/native-block foundations; verify credentials and avoid invented client outcomes |
| 2 | Restaurants | Find readable menu, location, access, hours, and reservation/order destination; persistent menu/visit links | Menu-led typography and daypart exploration with ordinary categories | Reuses hospitality content; verify menu/hours and any reservation/order integration |
| 3 | Creators | Discover actual work, formats, licensing/contact, and verified support/buy links; work/archive-first navigation | Expressive index, media/format exploration, useful captions | Reuses maker/culture structure; requires media rights and no fake audience or earnings |
| 4 | Nonprofits | Understand mission, programs, participation, and verified donation route; program/help-first navigation | Accessible plain-language stories and action-specific pathways | Verify impact/credentials; donation/receipt handling and tax-status claims need separate proof |
| 5 | Local attractions | Plan a visit using confirmed access, openings, closures, and ticket destinations; visit-first navigation | Place-led original map/illustration and activity selector | Reuses stay/event patterns; confirm geographic/access facts and ticket flow, no invented safety advice |
| 6 | Wellness | Understand real service, practitioner scope, access, privacy, and booking; appointment/service-first navigation | Quiet readable treatment and session-format explorer | Avoid medical outcome claims and sensitive health-data intake; verify booking/privacy route |
| 7 | Multilingual businesses | Select language explicitly and reach equivalent services/contact; visible language navigation everywhere | Parallel script-aware layouts, translated navigation, direction-aware controls | Requires real translation review, metadata/form parity, and RTL checks where relevant; machine output alone is not acceptance |
| 8 | Technical startups | Understand supported product capabilities, docs, pricing assumptions, and actual demo/contact; task/docs-first navigation | Clear system diagrams and capability explorer tied to factual docs | Needs new information architecture; verify integration/security/performance claims, static demo is not operating SaaS |
| 9 | Real estate | Explore accurate property facts, location, disclosures, and viewing inquiry; property/search-first navigation | Detail-first comparison, large original plans, ordinary listing links | Higher feed/rights/jurisdiction complexity; verify listing rights, availability, fair presentation, and real feed behavior |

Interview intended operators and measure editing/install effort before changing
the order. Requests for native commerce, live feeds, sensitive forms, mapping,
translation, and booking stay outside the promise until implemented and tested.
The backlog is not a publication commitment. Prefer fewer useful complete
designs to many near-identical skins.

## Evidence and limits

See [`products/templates/README.md`](../../products/templates/README.md) for source
architecture, `artifacts/templates/package-report.json` for archive hashes/bytes,
`artifacts/templates/package-tests.json` for package integrity, separate browser
and installation receipts, and [`platform-research.md`](platform-research.md) for
documented platform routes and access gaps.

This proposal contains no verified sales, refund frequency, current provider fee,
support average, CAC, unit margin, setup price, or demand ranking. It does not
assert that an edition has passed installation, purchase, delivery, or production
acceptance. Those claims require their own current receipts.

## Release manifest and archive status

`products/templates/catalog.json` owns market/style/tagline/design-direction
metadata; the frontend adapter derives the existing display strings from it.
`npm run templates:build` builds packages/guides and generates the joined
`products/templates/release-manifest.json`. It records all editions, the eight
current versioned archive checksums, licenses, draft support windows, original asset
receipts, candidate change notes, and scoped compatibility evidence. Provider
price IDs are intentionally null here because server commerce owns those values.
The manifest and all edition availability records remain unavailable.

The checksum mirror is optional and bounded to final ZIPs and small proof docs.
Its first configured `G:\My Drive` attempt reported sufficient capacity, then
returned ENOSPC for every copy: zero copies were checksum-verified. The failure
is retained in `artifacts/templates/drive_manifest-initial-enospc.json`; the
current `drive_manifest.json` records later capacity measurements and skips.
Automatic retries to the failed destination are suppressed. No screenshots,
browser profiles, source photos, provider configuration, or secrets are mirrored.
Mounted-file verification would still leave remote cloud synchronization unproven.

The four WordPress candidates use version 1.0.1 to set an owned `Update URI`
identifier and avoid WordPress.org same-slug update confusion. It is not an
automatic update service. Nightjar developer 1.0.1 fixes night-palette precedence
and documents day/night color editing. The other three developer 1.0.0 archives
remain byte-identical. Original 1.0.0 ZIPs and receipts are retained; evidence for
old-byte native edits and final-byte replacement checks must remain distinct.
