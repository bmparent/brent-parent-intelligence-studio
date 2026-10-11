# Paid templates — candidate acceptance

Prepared October 10, 2026. This is a review candidate, not authorization for a production release. No LIVE sales, production merge, live price change, subscription, or service purchase is part of this work.

## Starting point and scope

The supplied workspace was not a usable Git checkout. Work is isolated in `codex/paid-templates-20261010`, based on public-site `origin/main` **fb74c4cf00defef23ce3ee96af4e51c350c3e807** and backend `origin/main` **4c746ffccf9249c7ddabd58f839ecb5fcece4fd0**. Existing dirty checkouts and pending recovery work were preserved. The requested `build-eidos-works` and `verify-eidos-works-release` skills were not installed; current repository contracts and checks were used. Historical acceptance records were read from the existing recovery branch, and their held owner/account gates were not treated as new acceptance.

The four original designs have independent page structures, typography, navigation, SVG art, and progressively enhanced interactions. Their fictional content is labeled. Gallery/customer/Disney/DG Promo art was not included. Cinematic Starter remains the same $29 header-and-hero product, with the same URL, approved terms, source, and ownership ledger. The lowercase header “e” is preserved. Eidos Brain engine/research code was untouched.

## Evidence table

| Gate | Current evidence | Status |
| --- | --- | --- |
| Four complete developer products | Five business pages plus legal notes per family; original source/art/config/install/license/support files | Implemented |
| Deterministic buyer packaging | `artifacts/templates/package-report.json`, `package-tests.json`: 765 passing checks; eight private ZIPs | Local passed |
| Actual buyer source installation | `source-install-receipt.json`: extracted exact four developer ZIPs, changed business text/art, published local HTTP pages, checked configured inquiry draft; archive hashes unchanged | Local passed |
| Storefront | Collection filters, four detail routes, desktop/phone iframes, edition terms, chooser, private start/recovery, eight edition guides | Implemented; final hosted check pending |
| Existing customer regression | `logs/platform-tests-sequential.log`: 35 passing tests, including signed paid access, refunds, out-of-order events, and forbidden downloads | Local passed |
| Storefront contract | `logs/template-tests.log`: four tests; `shop-contract.json`: unavailable defaults, private recovery metadata, no public paid ZIP | Local passed |
| Site build/content/contracts | `logs/site-build.log`, `prerender.log`, `editorial.log`, `content-source.log`, `content-dist.log`, `urls.log` | Local passed before final small UI fixes; CI must verify exact head |
| WordPress | Four native core-block theme ZIPs, GPL notices and demo setup; runtime/edit/publish evidence in `platform-install-evidence.json` | Gate pending; never infer installation from valid ZIPs |
| Squarespace 7.1 pilot | Manual Switchboard native-section recipe, CSS/static fallback and optional code. `platform-pilots/browser-receipt.json` contains local isolation/keyboard/phone checks | Local passed; authorized builder installation blocked |
| GoDaddy Websites + Marketing pilot | Switchboard isolated HTML section and iframe harness; distinct from GoDaddy WordPress hosting | Local passed; authorized builder installation blocked |
| Commerce | Server-owned IDs/prices/version, existing identity/order ledger, signed TEST webhooks, paid-only expiring download, recovery and revocation tests | Backend receipts govern; hosted Stripe proof pending |
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

## Private fulfillment and rollback

Paid ZIPs are excluded from Git/static deployment and copied to private immutable backend storage. Public demos use the same developer source bytes. A download needs a paid order and a short-lived token; the database holds edition/version/hash/owner snapshots. Recovery is enumeration-safe, expiring, single-use, and rotates the receipt. Refund/dispute revocation blocks future access and cannot reclaim already downloaded files. TEST Turnstile configuration is explicitly scoped to the isolated candidate and is not production challenge acceptance.

The candidate Pages project is `eidosworks-templates-test-20261010`, with no custom domains. Its workflow is restricted to this repository's candidate branch and gates upload on tests. `preview-configuration.json` records the site/backend SHAs and verifies the canonical deployment did not change during configuration. The backend uses the existing validation database; additive migration receipts must preserve the six prior orders. No production schema or deployment is changed. Rollback means disabling the candidate feature flag/relay or reverting only the candidate deployment; never alter canonical routing or delete existing orders.

## Commercial and expansion proposal

`product-operations.md` records draft $99 source / $129 WordPress / $29 visual-kit prices, bounded support/update terms, GPL rights, unknown unit costs and a nine-market backlog. It also documents the next-product/version workflow. No price is claimed market-optimal; TEST payments are not revenue. Future archives receive new immutable versions. There is no auto-publication schedule.

## Remaining acceptance

Finish the exact paired hosted preview; successful and failed/abandoned TEST checkout; real signed delivery; duplicate/reordered events; buyer isolation; expired receipt/recovery; refund/revocation; provider-confirmed receipt/recovery mail to the authorized inbox. Finish all four clean WordPress installations and native content editing. Install the two pilots in authorized builder editors with observed plans, published phone pages, and verified actions. Inspect final CI receipts and screenshots before considering production. The requested production decision remains separate from this handoff.
