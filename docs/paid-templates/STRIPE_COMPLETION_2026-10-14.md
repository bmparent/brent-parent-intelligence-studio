# Stripe completion — October 14, 2026

Brent authorized finishing the existing payment and delivery work and identifying
only actions that still require his access. Production sales remain closed until
the actual hosted TEST purchase and delivery gates pass. No LIVE transaction is
authorized by this verification.

## Prepared and verified

- The connected Eidos Works LIVE merchant is charges/payouts enabled with no
  outstanding requirements; this does not certify a deployment credential.
- Latest site candidate: 3053d9556bcca9013e66702b799f9a4bf487f861. Its finalized
  notices are already versioned in 8 new immutable archives. The earlier PR body
  claiming those notices remained draft is stale.
- Backend continuation: 16a1926d5bbd33cd52bb0c93ee15dd949b1bc698, tree
  3d87e7bfe2ecb2c840e6544ee5f2b2fbad198ddb, identical to the locally tested tree.
  Draft PR76 targets the existing continuation; no production/main merge occurs.
- A Git-only backend deployment omitted the ignored buyer ZIPs. The protected
  complete-file preview dpl_HGmhbcauge8PzmARbYobQoTpzAmw is READY at
  https://eidos-sentinel-fkjjekqbn-1brentbm-1876s-projects.vercel.app. It uses
  only the existing codex/paid-templates-20261010 Preview configuration.
- All 32 archives (8 current, 24 retained) were reconstructed with exact recorded
  SHA-256 and byte counts; no earlier version was overwritten. The actual local
  Next function trace contains all 32 ZIPs. Bundle hash:
  6c59882a4485fc02c2a97a91773d5cf38e3ad6b65340e616ff9db8eb6612a37c.
- The backend build now fails for missing/altered/duplicate/symlink archives.
- The paired frontend pin checks exact source revision, TEST mode, all 8 versions
  and prices, developer-only availability and HTTP400 unsigned-webhook rejection
  before changing any candidate Pages relay. It no longer silently depends on
  stale URL/SHA Actions secrets. Tokens and protection remain server-side.
- Local checks: 811 package assertions; 6 manifest and 6 storefront tests; 35
  site platform tests; 19 MJS and 57 backend TypeScript tests; 2 new preview-pin
  tests; both production builds, typechecks, site lint, prerender, shop-contract
  checks and Functions compilation. The existing Wellway lint advisory remains.

## Evidence ledger

| Requirement | Environment / observation | State |
| --- | --- | --- |
| Current/retained archive integrity | Frozen hashes and local Next function trace: 32/32 | Pass locally |
| Signed payment/replay/recovery/refund authorization behavior | Controlled local provider fixtures, including two-member isolation; no genuine event manufactured | Pass locally only |
| Correct protected source bundle | Vercel READY preview above; exact commit and bundle inventory | Pass for deployment identity |
| Hosted catalog and relay | Workflow 38591500899 passed the exact TEST catalog/source/version/price/availability preflight and HTTP400 unsigned-event check, then deployed the paired Pages candidate | Pass on frozen site source 11e292f / backend 16a1926 |
| Resend Preview binding | Existing candidate Preview branch has no RESEND_API_KEY; key on another preview is not assumed valid or moved | Blocked |
| Genuine TEST paid-event acknowledgement | Connector exposes only LIVE; no new real provider payment or event replay claimed | Pending provider access and mail |
| Receipt/recovery inbox arrival | No actual mail sent by this continuation | Blocked by mail configuration |
| Final TEST refund/replay/access removal | Controlled tests pass; actual final-source provider lifecycle still required | Pending provider access |
| Authenticated buying | Remains disabled; use guest scope until normal two-inbox member acceptance is complete | Out of initial guest release |
| Production release | No LIVE sales activation or production schema change | NO-GO |

## Exact external actions

1. In Resend, create a separate Sending-access key restricted to eidos-works.com.
   Securely bind it as RESEND_API_KEY in Vercel project eidos-sentinel-lab, Preview
   target, Git branch codex/paid-templates-20261010. The intended sender remains
   Eidos Works <papers@eidos-works.com>. Do not change production key scope.
2. Provide authorized Stripe TEST access through the connected Stripe account
   configuration or secure dashboard sign-in. Both Stripe and Resend currently
   show sign-in pages in this browser. No login credential is requested in chat.

After the key is bound, redeploy the same complete bundle and pin that exact
backend. Exercise a genuine TEST guest purchase, preserve endpoint HTTP2xx, verify
the exact purchased ZIP/hash, receipt inbox arrival, recovery expiry/single-use,
provider replay, and TEST refund/access removal. Reconcile the dated evidence on
the final pair before enabling LIVE sales. Existing failures at two older Pages
webhook destinations are not proof that the current template destination fails;
confirm ownership/use before changing or retiring either legacy destination.

Rollback: return only the isolated candidate relay to its previous pinned backend,
or disable new candidate checkout. Preserve orders, signing secrets, all private
archives and compatible fulfillment/recovery handlers. This continuation changes
no canonical domain, production database, existing order or sold archive.

## Hosted closeout

Frozen tested site source: 11e292f96f7a1c6eb5ff18712bd59a5ca0c96a74
(tree 47dc6eb5d61d4818ea6d620d372dcaed5beda3be). Its locally tested tree is
identical to the connector-created tree. Backend source remains
16a1926d5bbd33cd52bb0c93ee15dd949b1bc698.

- Paid template TEST candidate workflow 38591500899 completed successfully. Its
  required catalog/source/version/price/installation and unsigned-event checks
  passed before routing changed. The canonical deployment was read before and
  after configuration and remained unchanged. Upload completed at
  https://0d1c0c94.eidosworks-templates-test-20261010.pages.dev.
- The connected branch sender is Eidos Works <papers@eidos-works.com>; the
  database binding prefix was read back as EIDOS_TEMPLATES_TEST. No secret value
  was requested. The complete backend returned HTTP200 for its protected health
  route through the authenticated connector.
- Site quality 38591500934, Template commerce readiness 38591500909, Wellway
  acceptance 38591500950 and backend Sentinel Lab quality 38590498703 passed.
- Cloud browser observed Switchboard package version 1.0.3, available only for
  TEST checkout, at
  https://eidosworks-templates-test-20261010.pages.dev/shop/switchboard/.
  Direct raw-JSON navigation was blocked by this browser client; the hosted
  authenticated CI preflight and normal product UI independently succeeded.
- No new Stripe transaction, event resend, refund, receipt email or recovery
  email was submitted. The genuine endpoint-specific paid-event HTTP2xx and
  received-email lifecycle remain blocked, not passed.

This documentation closeout does not change the frozen deployed code or certify
any future documentation-triggered build. Main/production and all LIVE sales
remain unchanged. Both continuation PRs remain draft.

## Scoped mail binding refresh — October 14, 16:02 UTC

Fresh Vercel metadata now includes a Secret `RESEND_API_KEY` on Preview,
branch `codex/paid-templates-20261010`. The separately named
`RESEND_API_KEY_TEMPLATE` is Production-only and is not read by the template
mail adapter. The existing Production key and other branch bindings were
preserved; no credential value was read or copied.

The complete 16a1926d5bbd33cd52bb0c93ee15dd949b1bc698 bundle was redeployed
after the new binding as `dpl_CHrcAbPuTyKDmUKHTC8EFvHbfVEU`, READY at
https://eidos-sentinel-oey0rgtql-1brentbm-1876s-projects.vercel.app.
Its Preview branch, source SHA and target were read back from Vercel.
The reviewed bundle hash/source revision remain unchanged. The paired pin
now selects this deployment. The preview workflow covers both continuation
bases and retains exact hosted catalog and unsigned-webhook preflight.

These observations supersede the earlier missing-key metadata, but do not
establish provider key permissions, sender-domain verification, inbox delivery,
or signed payment acceptance. The storefront refresh and actual guest TEST
receipt/recovery/refund checks remain pending. Production remains closed.
