# Eidos Quote Desk — recurring product candidate

This is a separate, self-serve embroidery quoting workspace. It is **not a verified revenue stream** and has not been deployed or activated for LIVE payment. Keep checkout disabled until the exact hosted payment and ownership journey is accepted.

The proposed plan is $19/month for up to 500 saved quotes/presets, cross-device access, sequential capacity planning, printable estimates and data export. The free estimator runs entirely in the visitor's browser. No model calls, physical service, manual provisioning or custom consulting is included. Pricing and willingness to pay remain hypotheses.

## Run locally

Use Node 24 and the committed lockfile:

```bash
npm ci --no-audit --no-fund
npm test
npm run build
npm run preview
```

`preview` serves the calculator at localhost:4178 and deliberately reports sign-in/checkout unavailable. It is a visual preview, not a simulated paid account. `build` is a Wrangler dry run and does not publish. Tests execute the real SQLite schema, the Stripe SDK signature verifier, and fixture provider calls; they do not prove a Stripe transaction or hosted D1 operation.

For actual local Worker/D1 testing, replace the preview database placeholder only with its real isolated database ID, apply `migrations/0001_quote_desk.sql` locally, set secrets in ignored `.dev.vars`, and run `npm run dev`. Do not substitute a production database.

## Isolated hosted setup

1. Choose the correct Eidos Works Stripe account. The connection inspected during this task exposed an unnamed account with charges/payouts disabled, no payout bank, no live products/charges/subscriptions and an unsubmitted business profile. This is an account-scoped observation; a different owner account may exist. Connect that account if appropriate. Complete real owner verification and payout onboarding personally; do not invent business identity, tax or bank details.
2. Provision an isolated Cloudflare Worker and D1 database for this app. Cloudflare connector discovery returned no available match in this environment, and no deployment credential is available locally. `workers_dev` is disabled by default; attach an intended preview route. Prefer `quote.eidos-works.com` for a separately accepted launch.
3. Apply the additive app migration to the isolated database. Existing Works databases, account IDs, ledgers, drafts #73/#67 and research code are unaffected.
4. Use an existing Stripe sandbox for an existing integration, or a separate sandbox for a new integration. The only app connection exposed in this task was LIVE; no sandbox provider transaction was attempted. Create a **sandbox** Product and monthly Price: USD 1900 cents, interval month, interval count 1. No tiers, coupon, trial or annual contract are required initially.
5. Store `STRIPE_RESTRICTED_KEY` as a Worker secret (`rk_` prefix) with only required API permissions. Set `STRIPE_PRICE_ID`, `STRIPE_ACCOUNT_ID`, `STRIPE_PORTAL_CONFIGURATION_ID` and `STRIPE_WEBHOOK_SECRET` for the same account/environment. The SDK is pinned to 22.6.0 / API 2026-08-26.dahlia; revalidate provider fixtures before upgrades.
   The checkout gate retrieves the current account explicitly, expands its payout destinations and matches its ID to `STRIPE_ACCOUNT_ID`. LIVE checkout additionally requires submitted account details, charges and payouts enabled, no disabled/due/past-due/pending-verification requirements, and at least one bank payout destination. A configured ID or enabled UI switch cannot bypass those checks.
6. Configure the Customer Portal with payment-method updates and subscription cancellation **at period end** enabled. The checkout readiness gate reads this configuration; an ID alone cannot open checkout. Hosted cancellation and payment-method recovery still need an actual test.
7. Register `/api/webhook`, pinned to the same API version, for checkout completed/async-payment-succeeded/expired; subscription created/updated/deleted/paused/resumed; invoice paid/payment-failed/finalization-failed; charge refunded/dispute-created; actionable early-fraud-warning events. Verify signed delivery/replay before activation.
8. Use the verified transactional sender, Resend secret and Turnstile keys for this app's hostname. Configure `QUOTE_SITE_ORIGIN` explicitly and a random `QUOTE_RATE_SECRET` of at least 32 characters. Do not broaden another app's Access policy or replace DG Promo branding. The app sends requested sign-in emails only; it has no campaign sender.
9. Keep `QUOTE_ENVIRONMENT=test` and `QUOTE_CHECKOUT_ENABLED=false` while validating. Enable test checkout only after its matched bindings and public terms are configured. Set LIVE only after separate acceptance of actual LIVE funds, delivery, recovery, cancellation and settlement. No self-payment or test card counts as customer revenue.
10. Review applicable digital-product/subscription tax treatment and required registrations before LIVE launch. This candidate does not enable `automatic_tax`: enabling that flag without an active registration would not establish tax collection. Configure tax deliberately, verify it at checkout, and update the public terms from launch-candidate wording before opening sales.

## Required launch evidence

Record exact source SHA, Worker version, route, database/environment and provider IDs privately. Required checks:

- Real email login on desktop and phone; link expiry/replay; cross-device recovery; two owners with saves/reopen and denied cross-owner operations.
- Real sandbox Checkout → signed event → paid access → saved quote; duplicate requests, different-device parallel attempts, async payment delay, webhook retry and out-of-order delivery.
- Failed renewal blocks new saves while export/deletion remain available; normal cancellation ends at period end; full refund/dispute ends access and future billing.
- Account deletion expires open checkout URLs, cancels owned product subscriptions and removes only that account. A retained Stripe-customer tombstone fences late subscriptions after deletion. Hosted provider-race behavior still needs verification; late captured funds may need a reviewed refund.
- Provider outage leaves unsaved estimates usable. No credentials, raw card data or unrelated customer data appear in client assets/logs.
- Apply the same migration to real preview D1; exercise quotas/caps and daily cleanup. The migration passed on an isolated local D1 database through Wrangler. Hosted D1 operation is untested; ownership/lifecycle tests use real SQLite.
- Verify intended hostname, TLS, CSP, keyboard focus, phone layout, reduced motion, and printed output. Local browser results are recorded in the PR separately; physical devices remain untested.

The product is not ready for a paid public release until these checks have receipts.

## Low-upkeep operation

Stripe manages renewal and retry policy. Signed webhooks update access; paid saves reconcile canonical provider state. Email links manage sign-in/recovery without passwords. Per-account checkout locks prevent parallel open purchases; idempotency parameters persist across provider-response loss. Record revisions reject stale writes. A daily cleanup deletes expired login links/sessions/quotas, retaining saved records until owner deletion. Customer export stays available after subscription expiry. No paid AI, external campaign send or ad purchase is implemented.

Initial bounds: 500 saved records/account, 5 checkout requests/account/day, 60 billing checks/account/hour, 100 sign-in emails/day, 5 sign-in emails/address/day and 10/IP/day. Change bounds from observed need and cost receipts. Hosting/email fees and support time remain unknown until measured. Monitor failed webhooks, email failures, billing errors, disputes and D1 capacity before expanding acquisition.

## Revenue verification

See `../../docs/revenue/REVENUE_PROGRAM_2026-09-29.md` and `revenue-gate.mjs`. Verify actual attributed provider receipts and bank settlement against real expenses. The structured checker cannot authenticate a fabricated ledger; fixture passes are never business evidence. Review the latest eight closed weeks in America/New_York, using settled net cash rather than promised MRR. Keep prepaid annual cash, tax liabilities, capital transfers, self-payments and test money out of the recurring-cash proof.

The provider read on October 4, 2026 still found the only connected LIVE account incomplete: account details were not submitted, charges and payouts were disabled, no payout bank was attached, and the product, subscription, charge, payout and balance-transaction lists were empty. The local Cloudflare CLI was also unauthenticated and no Quote Desk provider variables were available. No provider setting was changed; owner identity and banking remain an owner-only dependency.
