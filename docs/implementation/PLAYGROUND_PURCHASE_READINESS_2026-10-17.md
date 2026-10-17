# Playground purchase readiness — October 17, 2026

## Source and isolation

Frontend starting source: `9352f4bd440227d677633d52c182e1b80515c25d` (pending PR #111). Backend payment evidence source: `6f7a29350ed8837ba86ce5d26603bfd674ef2c0e` (PR #78). Neither the canonical production site nor the connected TEST deployment is changed by this work. This source fix is independent of AI activation and visual-editor changes.

## New safety correction

Checkout refreshes authenticated capabilities before dispatch. Previously a refreshed server price could differ from the price displayed when terms were accepted. The client now compares reviewed and refreshed owner, product, edition, version, archive identity, currency and price. A changed price stops before checkout dispatch, replaces displayed details, clears acceptance and challenge, and requires another explicit acceptance. Both increases and decreases require review. Unavailable or mismatched editions still fail closed. This guard does not invent a new price or change the server-owned catalog. The final Stripe checkout remains the payment total review; this client check is not a server-side immutable quote contract.

## What is already established

The backend's `docs/playground-connected-test-20261015.md` records the genuine $99 USD TEST purchase, two owned-account isolation, exact approved and original archive bytes, actual receipt and recovery inbox arrival, single-use recovery, $1 TEST allowance, genuine refund and access revocation. The accepted-mail race correction preserves a provider-accepted receipt. These are historical hosted receipts on their recorded revisions, not newly rerun transactions and not revenue. The refunded allowance is zero/frozen, and no LIVE AI allowance is promised.

A fresh October 17 read-only Stripe account retrieval confirms Eidos Works account `acct_1Rj03gKC8pRG5Tr9`, business URL `https://eidos-works.com`, charges and payouts enabled, no currently due requirements, and no disabled reason. The connector exposes only LIVE context. This is merchant readiness, not proof of the deployed credential, pricing approval, or TEST webhook acknowledgement.

## Exact remaining implementation boundary

Ordinary template purchases already have guarded LIVE mode in `templateShop.ts`: canonical origin, real challenge, LIVE credential, expected account, mail readiness, edition availability and archive checks. The approved-page attachment path has additional explicit TEST boundaries:

- `projectDelivery.ts` permits TEST only and blocks production origins; reads/inserts bind TEST mode
- Snapshot and order schema CHECK constraints allow only TEST; retained rows must not be rewritten or relabeled
- `projectDeliveryOrders.ts` binds TEST mode and requires a `cs_test_` session for approved-page bytes
- `templateShop.ts` capability is TEST-only; attached checkout and attached signed payment reject LIVE
- `purchaseClient.ts` accepts TEST capability and accepted-delivery modes only; `FinishPurchase.tsx` labels TEST consistently

A production attachment implementation needs an additive, reviewed migration/storage plan preserving all immutable TEST snapshots and order bindings, mode-bound reads, session/event/account matching for both modes, customer recovery after disabling new sales, and refund/dispute revocation. It must be paired/exported to the backend and tested across mode-confusion, two owners, amount/currency, duplicate and reordered events, immutable versions, receipt races, recovery replay and revoked downloads. Do not loosen only the frontend validator, edit historical migration checks in place, or set a flag and call this complete. Existing gates remain closed in this patch.

## User-facing purchase path and existing terms

Prepare frozen revision → choose matching parent developer edition → inspect server price/version → approve the reviewed local page → confirm authenticated purchase availability → save exact reviewed snapshot → read existing edition terms → complete verification → Stripe checkout → explicitly check server status → download original and approved page separately. A return redirect alone grants nothing. Hosting, domains, ongoing services, forms and third-party services remain separate. Existing `/shop/template-terms` refers to the approved `/terms` refund policy and billing support; refund/revocation prevents future retrieval and cannot reclaim downloaded files. This patch makes no new license, refund, support-duration or LIVE price commitment.

## Remaining external evidence and owner decisions

1. In the existing Stripe TEST dashboard, inspect endpoint `we_1UQym7KC8pRG5Tr9lcIO9qKu` for the recorded genuine checkout's event and capture that endpoint's HTTP 2xx delivery acknowledgement. The event's aggregate pending-webhook count and app-paid state do not identify an individual endpoint acknowledgement. Do not create another payment or refund to obtain this evidence. The available connector cannot read the TEST context.
2. Approve the final production purchase terms/prices and whether approved-page attachment is part of that offer. Existing $99 TEST evidence alone is not a LIVE commercial decision.
3. After the paired production attachment implementation and acceptance, explicitly approve production binding/deployment. Verify exact LIVE account binding without revealing credentials; preserve rollback and disabled new-sales controls. AI funding/activation remains separate.

## New verification

- 19 focused purchase-client/recovery tests passed, including price increases/decreases and zero dispatch after a changed price
- Full Playground suite: 111 passed, 0 failed
- TypeScript and production client/SSR build: passed
- Lint: zero errors, one pre-existing Wellway fast-refresh warning
- New 390px controlled browser scenario checks updated displayed price, cleared terms, no checkout until renewed consent, then exactly one intercepted checkout; not executed here because the browser executable is absent and this environment has prior browser-launch restrictions; CI browser execution remains pending
- No provider charge/refund, schema mutation, feature-flag change, credential operation, TEST repin or deployment performed
