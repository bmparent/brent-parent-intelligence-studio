# Quote Desk customer experience and paid-launch readiness — October 5, 2026

Brent authorized continuing the Quote Desk paid launch after resolving Stripe onboarding, including acting as a customer to identify and repair friction. The candidate starts from public main `9acb459618b530913d409add874b2f0c156d8661`. It preserves the gallery, other products and held account-runtime drafts #73/#67.

## Customer findings and changes

The canonical free estimator was exercised in Cloud Browser with a named 60-hat job, then reloaded and given an invalid quantity. The estimate changed correctly, but reload restored the sample name instead of the customer's job name, and validation reported an internal field key with no correction control. Inspection of print styles found that the input form was hidden without another printed representation of job details or assumptions.

- Preserve the job name with the numeric draft; continue reading the previous draft format and tolerate denied/full storage.
- Put readable validation beside the invalid field, use displayed percentage ranges, identify it for assistive technology and offer a control that focuses it. Invalid results remain cleared and printing remains disabled until correction.
- Include job name, quantity, stitch count, heads and all 23 assumptions in the internal printed estimate. Costs, gross profit, tax exclusions and planning limitations remain visible; this is an internal planning estimate, not a customer invoice.
- Respect reduced motion for scripted scrolling.
- Recover an expired/used sign-in link by returning to the fresh-email form. Report cancelled checkout explicitly, preserve the draft and offer a billing-status refresh after payment return.
- Preserve authenticated read/export access during provider billing failure. Access is unknown, not paid; new saves still reconcile the provider and fail closed. Hide a new subscription during that unknown state.
- Preserve checkout retry identifiers in memory when session storage is denied. Existing server locks and provider idempotency still control duplicate purchases.
- Require Customer Portal payment-method updates as well as end-of-period cancellation before checkout can open.

## Current provider evidence

The intended LIVE Stripe connection named **Eidos Works** was confirmed on October 5. Its account read showed submitted details, charges and payouts enabled, no due/past-due/pending-verification requirements or disabled reason, and a payout bank. No identity or bank details are stored here. The inactive Quote Desk Product and its USD 1900 monthly Price were created and read back; the Price is exclusive of applicable tax. No Payment Link, LIVE Checkout Session, charge, refund or subscription was created.

A read-only hosting check ran at source `a957310c2e216e9edeb192e51f2552ea97d9e300` in [GitHub run 37363628846](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/37363628846). It used the existing deployment secrets without exposing values or changing resources. The existing `eidosworks` Pages project was present, the separate Quote Desk Worker was absent, the isolated D1 listing returned **HTTP 401**, and no Resend/mail-from/Turnstile binding names were present in the Pages production configuration. Worker read access does not establish deployment write access. This session has no provider credentials locally and its Stripe connector exposes only LIVE.

## Acceptance ledger

| Gate | Current result | Evidence / limit |
| --- | --- | --- |
| Intended LIVE merchant onboarding | PASS | Account-scoped Stripe read, October 5; owner account choice confirmed |
| Quote Desk $19/month catalog setup | PASS, inactive product | Product/Price write and readback; no purchase or activation |
| Calculation, ownership, signed-event fixtures, renewal/refund/deletion, recovery gate | PASS locally | 30 tests; real SQLite schema and SDK signatures, fixture provider calls |
| Root lint/typecheck/build and static route checks | Pending exact candidate checks | CI and production readback recorded on the PR before release |
| Free estimator desktop/phone-width interaction and print | Pending exact candidate browser checks | 1440/390 widths; healthy/denied/full storage; not physical devices |
| Workspace recovery UI | Pending exact candidate browser checks | Controlled local API responses; not hosted account/payment acceptance |
| Isolated hosted D1 / Worker | BLOCKED | No Worker; D1 read denied with HTTP 401; migration not applied remotely |
| Real email / two-owner hosted sign-in | BLOCKED | No accepted sender/Turnstile bindings for the separate app |
| Real sandbox Checkout, signed fulfillment, recovery/cancel/refund | BLOCKED | No sandbox connection or matched runtime secrets; no provider transaction attempted |
| LIVE payments, independent customer revenue and settlement | NOT TESTED | Product remains inactive; checkout disabled |
| Physical devices / assistive technology | NOT TESTED | Browser widths and accessibility attributes are narrower evidence |

The local browser install returned truncated archives in this execution environment. Browser validation therefore uses the existing isolated GitHub Actions browser workflow and canonical Cloud Browser readback. It does not route around a browser security warning or host a blocked harness.

## Remaining setup, in order

1. Provide a scoped Cloudflare deployment credential with the necessary isolated Worker/D1 access through repository/provider secrets. Do not paste credentials into chat. Provision only `eidos-quote-desk-preview`, apply the additive migration and read back the intended binding, version, HTTPS route and CSP.
2. Connect a Stripe sandbox and configure that sandbox's restricted API key, Product/Price, Customer Portal and signed webhook endpoint. Keep sandbox and LIVE identities/keys separate. The LIVE catalog entry above is not a sandbox binding.
3. Configure the verified transactional sender, Resend secret, Turnstile keys for the app hostname, explicit site origin and random rate-limit secret in the app's provider environment. Sign-in email is transactional; no prospect mail is authorized by this task.
4. Exercise actual hosted login, saves/reopen, two-owner denial, sandbox checkout/fulfillment, duplicate/out-of-order delivery, renewal failure, export, normal cancellation and refund/deletion races. Record provider IDs privately.
5. Review applicable tax configuration and final subscription terms before opening LIVE sales. Any actual LIVE charge/refund requires separate explicit transaction authorization. Customer payment and renewal evidence remain separate from source and fixture passes.

Public release scope is the free estimator's presentation/recovery improvements. The separate paid candidate remains gated. Rollback is public main `9acb459` and the prior successful Pages deployment; no schema migration or customer-data change is part of the static release.
