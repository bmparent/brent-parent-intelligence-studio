# Paid templates — candidate acceptance

Prepared October 10, 2026. This is a review candidate, not authorization for a production release. No LIVE sales, production merge, live price change, subscription, or service purchase is part of this work.

## Starting point and scope

The supplied workspace was not a usable Git checkout. Work is isolated in `codex/paid-templates-20261010`, based on public-site `origin/main` **fb74c4cf00defef23ce3ee96af4e51c350c3e807** and backend `origin/main` **4c746ffccf9249c7ddabd58f839ecb5fcece4fd0**. Existing dirty checkouts and pending recovery work were preserved. The requested `build-eidos-works` and `verify-eidos-works-release` skills were not installed; current repository contracts and checks were used. Historical acceptance records were read from the existing recovery branch, and their held owner/account gates were not treated as new acceptance.

The four original designs have independent page structures, typography, navigation, SVG art, and progressively enhanced interactions. Their fictional content is labeled. Gallery/customer/Disney/DG Promo art was not included. Cinematic Starter remains the same $29 header-and-hero product, with the same URL, approved terms, source, and ownership ledger. The lowercase header “e” is preserved. Eidos Brain engine/research code was untouched.

## Evidence table

| Gate | Current evidence | Status |
| --- | --- | --- |
| Four complete developer products | Five business pages plus legal notes per family; original source/art/config/install/license/support files | Implemented |
| Deterministic buyer packaging | `artifacts/templates/package-report.json`, `package-tests.json`: 766 passing checks; eight current private ZIPs and immutable retained versions | Passed locally and on CI |
| Actual buyer source installation | `source-install-receipt.json`: extracted exact four developer ZIPs, changed business text/art, published local HTTP pages, checked configured inquiry draft; archive hashes unchanged | Local passed |
| Storefront | Collection filters, four detail routes, desktop/phone iframes, edition terms, chooser, private start/recovery, eight edition guides; versioned hosted receipts check paired catalog, private headers and exact public source bytes | Read the final hosted receipt's exact source; prior passes are historical |
| Existing customer regression | `logs/platform-tests-sequential.log`: 35 passing tests, including signed paid access, refunds, out-of-order events, and forbidden downloads | Local passed |
| Storefront contract | `logs/template-tests.log`: four tests; `shop-contract.json`: unavailable defaults, private recovery metadata, no public paid ZIP | Local passed |
| Site build/content/contracts | Historical 6b6ced3 full pass; 12d664f correctly failed the new Switchboard word check. Final exact-head CI/status artifact controls acceptance of later corrections | Final head must pass independently |
| WordPress | Four original ZIPs installed/activated sequentially in one initially clean official browser sandbox, WordPress 7.1.2 / PHP 8.3.33. Native text/image save, WXR setup, five-page navigation, keyboard Details and ordinary action checked. All four final 1.0.1 ZIPs installed/activated in a second fresh runtime, with installed headers and frontend cache versions observed | Bounded native browser evidence; conventional host/plan acceptance incomplete |
| Squarespace 7.1 pilot | Manual Switchboard native-section recipe, CSS/static fallback and optional code. `platform-pilots/browser-receipt.json` contains local isolation/keyboard/phone checks | Local passed; authorized builder installation blocked |
| GoDaddy Websites + Marketing pilot | Switchboard isolated HTML section and iframe harness; distinct from GoDaddy WordPress hosting | Local passed; authorized builder installation blocked |
| Commerce | Actual public UI Stripe Sandbox payment, genuine signed paid event, durable paid/ready order, private API and browser ZIP download with purchased hash, one genuine card decline, actual unpaid expiry, and TEST refund revoking access; immutable old-version regression | Real TEST evidence passed for the recorded source; final refund bookkeeping fix has controlled regression coverage |
| Transactional email | Receipt/recovery delivery code and provider-failure state; no marketing enrollment | Actual delivery blocked until a valid scoped mail binding is available |
| Production decision | Exact paired preview, hosted purchase, platform acceptance, mail, final CI and owner review | NO-GO until material gates pass |

Status is edition-specific. All new public commercial editions remain unavailable. Only explicitly installation-verified developer editions may be enabled for isolated TEST checkout. WordPress and builder pilots remain blocked until their own receipts are accepted.

## Reproduction

Run commands from each repository root. The developer buyer ZIPs require no Eidos service or build pipeline; these commands maintain and verify the catalog itself.

```text
npm ci --no-audit --no-fund
npm run templates:build
npm run test:templates
npm run test:platform
npm run lint
npm run build
npm run verify:prerender
npm run verify:templates
npm run verify:editorial
npm run validate:insights -- --skip-source-fetch
npm run validate:insights:dist
npm run verify:urls
npm run build:functions
python scripts/verify-template-source-install.py
python scripts/verify-template-browser.py --base http://127.0.0.1:5193
node scripts/verify-template-wordpress.mjs
```

Serve `dist` at port 5193 for the built browser check. Python Playwright is test tooling, not a buyer dependency. The candidate workflow pins it and provisions three browser engines on CI. Low local memory caused child-process/driver failures; those attempts are retained as failures, and a sequential platform run passed all 35 tests. Tests were corrected for encoded mailto recipients, Firefox/WebKit cached responses, lazy images, and a navigation race. These harness repairs did not waive product checks. Visual review separately found and fixed real Nightjar phone clipping/menu contrast and storefront preview/text contrast defects.

## Platform and buyer boundaries

See `platform-research.md`, `platform-install-evidence.json`, and each packaged INSTALL.md. WordPress core blocks use documented native Details alternatives to developer-only effects. Self-hosted PHP/MySQL, WordPress.com plans, and provider-hosted native installation are separate gates. Squarespace is a manual existing-site kit, not ZIP import or an observed automatic starter transfer. GoDaddy Websites + Marketing receives a visual add-on, not a native theme. Platform costs and integration connections are separate. No prepared starter, assisted-setup time, real cart, ticket inventory, booking confirmation, field performance, or accessibility certification is asserted.

The WordPress browser baseline shares pages/media across four sequential theme activations. It is not four independent clean installations. Native Save and changed frontend content were observed, but the outer Playground reported Autosave failed; export/restart durability was not established. The contact action resolves to the explicit demo placeholder, without opening a mail client or sending mail. Minimum declared WordPress 6.6 / PHP 8.1 and physical devices were not separately tested.

## Version correction and evidence preservation

Four WordPress editions advance to 1.0.1 with an explicit Update URI after a same-slug WordPress.org update notice was observed. This identifier does not implement an automatic update service. The change is limited to identity/cache metadata and version documentation; unchanged templates, patterns, assets, styles and WXR content retain their baseline proof with that limitation stated. `wordpress-install-external/browser-ui-receipt.json` establishes that all four exact new ZIPs installed/activated and their visible native headers/default frontend were checked in a second fresh browser runtime. Native content edits were not repeated on the new metadata versions.

Nightjar developer 1.0.1 corrects a real night-mode contrast defect caused by configured inline day colors taking precedence over the dark palette. At that transition, the other three developer 1.0.0 archives remained byte-identical. Version-transition receipts preserve before/after archive and file evidence; prior manifests, ZIPs and native UI receipts remain available. Existing paid orders keep their purchased version/hash rather than silently moving to a newer ZIP. Checkout availability also requires advertised and server-owned price/version agreement.

Nightjar developer 1.0.2 corrected an oversized desktop headline that split an ordinary word in WebKit and Chromium. A further check at 641px found the minimum desktop font still split that word just above the phone breakpoint. Version 1.0.3 reduces only that minimum to 2.7rem; the phone rule and large desktop scale are unchanged. The current package report records its exact bytes and hash. Exact buyer installation is repeated on the final ZIP. Seven other current archives are unchanged. All prior packages, transition and installation receipts remain preserved. Normal-word range checks cover original homepages separately from long-copy stress, including the 641px boundary.

The recovery widget now requests the `recovery` verification action expected by its server endpoint. The earlier `checkout` action was masked by official TEST-key behavior. A rendered options-only spy checks checkout/recovery action wiring without issuing tokens, invoking callbacks or submitting purchases/recovery. It does not establish production bot-protection acceptance.

The new normal-word assertion then caught an existing Switchboard desktop defect in Chromium, Firefox and WebKit: `conversation.` split across lines. Candidate 12d664f failed browser workflow 38104163542 and correctly skipped configuration/upload. Switchboard developer 1.0.1 corrects its heading scale in a separate immutable version. Its actual TEST purchase remains tied to preserved 1.0.0 bytes. The other seven current archives are unchanged by this correction. Failed CI evidence is retained; the newer exact head requires the entire workflow again.

The 8d3d608 candidate CI passed all static, package, platform and three-engine browser gates and deployed the isolated Pages preview. Corrected source 6b6ced37da71c374482fa9ce9aa7cb567f394ba5 subsequently passed the full workflow 38102463829 and redeployed the same isolated project. New computed night-mode contrast and mismatched catalog-version/price checks supplement screenshot review. Hosted checks then confirmed the exact e20b backend revision, current version/price records, private headers, edition guides, public developer file hashes and absence of the private ZIP from static hosting. Subsequent reporting-only heads must retain their own workflow receipts.

## Private fulfillment and rollback

Paid ZIPs are excluded from Git/static deployment and copied to private immutable backend storage. Public demos use the same developer source bytes. A download needs a paid order and a short-lived token; the database holds edition/version/hash/owner snapshots. Recovery is enumeration-safe, expiring, single-use, and rotates the receipt. Refund/dispute revocation blocks future access and cannot reclaim already downloaded files. TEST Turnstile configuration is explicitly scoped to the isolated candidate and is not production challenge acceptance.

The candidate Pages project is `eidosworks-templates-test-20261010`, with no custom domains. Its workflow is restricted to this repository's candidate branch and gates upload on tests. `preview-configuration.json` records the site/backend SHAs and verifies the canonical deployment did not change during configuration. The backend uses the existing validation database; additive migration receipts must preserve the six prior orders. No production schema or deployment is changed. Rollback means disabling the candidate feature flag/relay or reverting only the candidate deployment; never alter canonical routing or delete existing orders.

Prior verified pairing snapshot: site source `6b6ced37da71c374482fa9ce9aa7cb567f394ba5`, protected backend source `e20b6207ad2f80e1497b83ece56e66c316dc5124`, bundle `b10fa5afe2852d8eda9d036355c6f1ea7c51466021fdf38ca6b66392fe5565e0`, deployment `dpl_9ir2CuvDxvyLApHYzm22jSdyiQPo`. Actual paid/refund/decline observations belong to that recorded backend source. The site origin is `https://eidosworks-templates-test-20261010.pages.dev`. The existing validation database is `eidos-works-validation-vercel-icfg-j5glcbpipda5txwa0a43dmjx.aws-us-east-1.turso.io`. Draft site PR #102 and backend PR #71 both target main and remain unmerged. The final guarded configuration/CI/hosted receipts capture the exact newer site/backend sources deployed by that run; a later manifest does not retroactively move historical evidence to new source.

Final protected backend source is `9bb328b5b90b66fdbad4c3a70a7c9997accfd06f`, bundle `75c0652872c9f8e91913e580ca51ade2a95729ff4267d3ea1d14ed4f2af070b7`, deployment `dpl_BvDduBrE4TvK7pjNEZbRCp9yHDRg`, origin `https://eidos-sentinel-pmb8qllat-1brentbm-1876s-projects.vercel.app`. READY, authenticated exact-source catalog, anonymous protection, four current TEST developer versions, unavailable native/builder editions, negative controls and the original refunded order's denied access were verified. Sixteen private archives retain eight current and eight previous versions. All 119 uploaded tracked files match committed Git blobs; the 16 ignored private archives have separate frozen hashes. Evidence-only dirty paths do not change runtime provenance. The final site workflow must configure this exact protected origin/source and verify its own head before upload; its generated receipt is the authority for the final site SHA.

## Artifact mirror

The initial mounted Drive copy failed ENOSPC; its receipt and subsequent capacity skip are preserved. One later authorized retry measured 7,901,392,896 free bytes against a 512 MiB reserve and checksum-verified 41 allowlisted files / 644,418 bytes, including all eight current ZIPs. Destination: `G:\My Drive\Eidos_Works_Paid_Templates\2026-10-11\authorized-final-e3e85caf3af0`. The receipt is `artifacts/templates/drive_manifest-authorized-retry.json`. Remote cloud synchronization is unconfirmed. Later CI/payment/report receipts are retained locally and are not automatically included in that completed mirror snapshot. Private screenshots, profiles, test photos and provider configuration were excluded.

## Commercial and expansion proposal

`product-operations.md` records draft $99 source / $129 WordPress / $29 visual-kit prices, bounded support/update terms, GPL rights, unknown unit costs and a nine-market backlog. It also documents the next-product/version workflow. No price is claimed market-optimal; TEST payments are not revenue. Future archives receive new immutable versions. There is no auto-publication schedule.

## Remaining acceptance

The actual Switchboard TEST payment, genuine signed paid delivery, private archive hash and refund/access revocation are observed. The refund exposed a secondary fulfillment-field race across retained validation hooks; access was already denied. The narrow fix lets a signed known-template TEST refund/dispute reconcile its side table even when an older handler recorded the event first. Regression coverage checks duplicate replay, stored payment-intent ownership, LIVE rejection, unrelated-payment isolation, still-unexpired download denial and no late-payment revival. This controlled replay is distinct from the original genuine provider refund. On the final protected source, the original order remains refunded and download returns 403; its historical secondary field still says ready because no genuine provider replay was available. No event was forged/re-signed or manual database correction presented as provider proof.

One actual ordinary card decline produced the genuine `payment_intent.payment_failed` event with `card_declined` / `generic_decline`; the session remained unpaid, the ledger pending, and no download was granted. That retryable state is intentionally different from terminal asynchronous failure. The unpaid TEST session was then expired. An earlier abandoned TEST session independently expired unpaid and generated its genuine expiry event. Duplicate/reordered events, terminal delayed outcomes, two-buyer isolation and expired-link recovery retain controlled fixture coverage, with no real delayed-method or delivered recovery-email claim. Provider-confirmed receipt/recovery mail to the authorized inbox remains blocked by the missing valid scoped preview mail binding. Conventional PHP/MySQL hosting, minimum versions, separate clean WordPress instances, restart persistence and WordPress.com plans remain unproven. Install the two pilots in authorized builder editors with observed plans, published phone pages and verified actions. Missing builder access and mail credentials prevent full acceptance. The production decision remains NO-GO and separate from this handoff.
