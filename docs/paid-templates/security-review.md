# Paid-template payment and relay review

Scope: candidate-only static review of the synced site `functions/_middleware.ts`, shop endpoint wrappers, `templateShop.ts`/`templateCatalog.ts`, and the backend candidate's actual `apps/sentinel-lab/lib/works/dispatch.ts`, `templateArchives.ts`, database adapter, vendor shop modules and focused tests. No production state, credentials, or account settings changed.

The reviewed paths enforce a server-side TEST key/feature/edition gate for new checkout, fixed product/edition/version/price snapshots, Stripe TEST session and hostname validation, raw-body signed webhooks, order/session/amount/currency matching, a durable payment ledger before retriable receipt mail, refund revocation, hashed receipts/recovery/download capabilities, expiry, one-time recovery rotation, and cross-member rejection. Guest access intentionally uses a high-entropy bearer receipt. The private archive adapter restricts the key shape, checks containment under the private directory, and hashes the actual bytes. Downloads compare that hash to the purchased snapshot and return private/no-store.

The relay authenticates its internal token with timing-safe comparison, accepts exact site-origin entries, forwards a limited cookie/header set, rejects redirects before exposing Location, and returns no-store with generic transport failures. No concrete credential leak, unauthenticated archive access, cross-member access, or LIVE checkout path was identified in this bounded review.

Two observations were fixed by the backend owner: delayed `checkout.session.async_payment_failed` now writes a durable failed-payment ledger and presents a failed state, with a later paid event unable to resurrect it; the production-host exclusion now covers `eidos-works.com` and every subdomain, including `www`. Static review of the corrected logic found no further issue. This does not imply either condition was exploited.

The final backend suite passed 65 tests (16 MJS + 49 TypeScript), including eleven focused template tests, two-member isolation, recovery replay, refund-before-paid, mail failure/retry, byte mismatch, server-price tampering, official-public-TEST Turnstile validation, old-version archive retention after catalog advancement, shared-webhook revocation reconciliation, and existing Cinematic ZIP regression. Final typecheck also passed. Logs are copied into `artifacts/templates/backend/final-tests.log` and `final-typecheck.log`; versioned receipts name the exact source. Those test runs are the backend agent's evidence, not independently rerun here. Actual hosted TEST purchase/download/refund/decline evidence is separately recorded and does not establish email delivery, LIVE payments, or production acceptance. Candidate rollout must apply the template migration before shared shop code, including refund handling.

The frontend now requires the server-owned edition version and price to match its displayed package before presenting TEST checkout. Private start state explicitly distinguishes paid entitlement from failed receipt mail. The local packager compares existing ZIP bytes before writing and uses exclusive creation for new archives; it refuses same-path mutation. These checks do not replace server-side order/price/hash enforcement.

Actual TEST payment and refund exposed a shared-validation-webhook race: the older handler could record the refund globally and revoke the main order before the new handler reconciled template fulfillment. Download access was already denied by the refunded order. The final webhook change verifies the signature first, identifies the template through its stored payment intent, rejects LIVE events for that known template, and repeats only the idempotent revocation path despite the shared dedupe entry. Its focused eleven-test regression covers both refund and dispute, repeated replay, unrelated payment/metadata isolation, original order snapshot preservation and still-unexpired token rejection. The genuine provider refund and controlled replay receipts remain separately labeled; no event payload was presented as new provider evidence.

The recovery frontend now requests the server's expected `recovery` Turnstile action. An options-only rendered spy checks checkout and recovery wiring without callbacks, tokens or submissions. Official public TEST keys do not prove production bot-protection acceptance. Actual transactional mail remains blocked, while paid access and the failed-mail UI were observed in the hosted TEST purchase.

The current version-only backend follow-up retains all sixteen previous archive hashes and adds eight current ZIPs, for twenty-four private archives. Focused retention coverage now checks every previous product/edition snapshot across all eight editions. No webhook behavior changed in that follow-up. Frontend catalog pins were copied from the same backend source.

One genuine TEST refund retry was requested with the official Stripe CLI using the existing authorized TEST configuration. Stripe returned the same TEST event and exit status zero. The original order was already refunded/revoked immediately before retry; afterwards it remained revoked with its purchased snapshot preserved and download denied. The initial correction's cause is unknown. No endpoint-specific HTTP delivery receipt was available, so the CLI acknowledgement is not reported as a delivery response or causal repair.

Mail configuration was checked using environment metadata without decrypting values. The candidate lacks a valid scoped receipt/recovery provider binding; the existing sensitive key is production-only and was not copied or read. A subsequent official Vercel CLI63.1.2 metadata-only query verified the exact project/team and returned zero team shared environment variables, with pagination count0 and no next page. There is no existing shared preview mail reference to attach. `mail-shared-inventory.json` records that result. Actual inbox delivery, expired-link recovery via delivered email, and authenticated hosted two-member acceptance remain open. Guest receipts are bearer capabilities; a cross-order token check establishes order binding, not authenticated identity isolation.

## Delayed receipt-mail retry correction

A subsequent audit found that the stable receipt-mail token's original
30-minute expiry survived every retry. If delivery failed for more than that
window, the first successful retry could send an already-expired link. The new
regression reproduced that failure before the source correction.

Receipt-mail retries now extend only the matching order's unused stable token
to at least 30 minutes after the attempt. The email text, token and provider
idempotency key stay identical. The SQL update requires `used=0` and matching
order identity, and never shortens an existing expiry. Consumed tokens remain
consumed even on a later receipt retry; they require the ordinary fresh recovery
route. Random user-requested recovery tokens retain their existing expiry and
single-use policy. Payment verification, refund revocation, archive bytes and
the retry-on-mail-failure acknowledgement policy are unchanged.

Two controlled regressions advance the clock by 31 minutes: one verifies that
the legitimate mail retry renews an unused link, rotates the receipt once and
rejects replay; the other verifies that a consumed link is never revived.
These are local fixtures, not delivered-mail or hosted-provider proof. New
source/deployment/test receipts must be read separately from the frozen
4593b4d/d66ed7c handoff and its earlier real TEST transactions.
