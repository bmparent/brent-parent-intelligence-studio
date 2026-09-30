# Eidos Works recurring revenue program

**State: implementation candidate; revenue goal NOT VERIFIED.** Prepared September 29, 2026, America/New_York. Provider observations were read after midnight UTC September 30.

## Offer and rationale

Eidos Quote Desk: a $19/month self-serve workspace for small embroidery shops. It provides saved quotes, reusable machine/cost presets, sequential job-capacity planning, printable estimates and portable records. A free estimator lets prospective buyers inspect the model before payment. Automated billing, account access, recovery, cancellation and export are implemented in the isolated app candidate. They are not yet accepted on a hosted provider pair.

Use one practical niche and one recurring task first. Brent has relevant embroidery production experience and existing studio proof; no proprietary DG client data, employee records, logos, service savings or customer endorsements are included. Existing free calculators make a simple stitch-count calculator a weak paid offer. The paid hypothesis is repeat workflow and durable records, not access to arithmetic.

First-party market context checked: [Printavo pricing](https://www.printavo.com/pricing/) lists $109/month Lite and $244/month Standard; [DecoNetwork pricing](https://www.deconetwork.com/pricing/) lists broader garment-decoration plans beginning at $239/month. These are more comprehensive products and **not** evidence that anyone will buy this narrower offer. Their prices must not be used to claim equivalent features or guaranteed savings.

## Verified baseline and limits

| Area | Observed evidence | Meaning |
|---|---|---|
| Available Stripe account | LIVE context; business profile unsubmitted; charges false, payouts false; no linked payout account | Payments cannot launch through this account. Its intended Eidos Works ownership needs confirmation. |
| Account catalog and revenue | Complete unpaginated LIVE product, charge and subscription lists were empty | Zero observed live charges or subscriptions **in this connected account**; not a claim about every possible business account. |
| Workbook | Current native workbook and saved snapshot show Finance not configured; no revenue/cost/cash records; GA4 not linked | Monthly expenses and net coverage are unknown. A blank is not a zero. |
| Billing-email search | Targeted 60-day provider invoice/receipt search returned marketing mail only | No corroborating expense total was found in that bounded search. This is not a complete invoice audit. |
| Site integration | Draft #73/#67 still have open exact-revision hosted gates | The new app is separate; this work does not authorize or satisfy those gates. |
| New product | Quote model, isolated Worker, email sign-in/recovery, Checkout/Portal lifecycle, owner-scoped saves, export, cancellation and deletion exist locally | Product source is real; paid launch and customer demand remain unverified. |

## Local implementation validation

- All 27 tests passed: seven independent estimate/capacity checks, sixteen ownership/billing lifecycle checks, and four revenue-evidence checks. Stripe calls in lifecycle tests are fixtures; signatures use the actual Stripe SDK.
- The Worker completed a non-publishing dry build. The additive migration executed successfully on an isolated local D1 database through Wrangler; no remote database was created or modified.
- Chromium checks passed at 1440 × 1000 and 390 × 844 with the app's content security policy. Editing quantity changed the quote, changing margin respected the requested floor, the workspace opened, unconfigured sign-in stayed disabled, and both layouts had no horizontal overflow or console/page errors.
- These checks do not establish real email delivery, hosted payment/access, physical-device behavior, customer demand, or earned income.

## Economics: assumptions, not receipts

[Stripe standard US pricing](https://stripe.com/pricing) showed 2.9% + $0.30 per successful domestic-card transaction. [Stripe Billing pricing](https://stripe.com/billing/pricing) showed 0.7% of Billing volume on pay as you go. With those rates, a $19 monthly payment leaves **$18.016** after estimated provider fees. This excludes hosting, email, refunds/disputes, tax, owner time, currency conversion and other payment-method differences. Actual fee receipts supersede the model.

| Paying subscribers | Gross monthly billings | Estimated amount after these provider fees |
|---:|---:|---:|
| 10 | $190 | $180.16 |
| 20 | $380 | $360.32 |
| 35 | $665 | $630.56 |
| 50 | $950 | $900.80 |
| 100 | $1,900 | $1,801.60 |

For planning, customers needed = ceiling((actual monthly expenses × 1.25) / $18.016), before adding incremental product costs. Example budgets of $250, $500 and $1,000 imply at least 18, 35 and 70 subscribers respectively. These are scenarios; Eidos Works' actual expense total is missing.

Monthly subscription renewals can produce weekly cash when customer anniversaries are distributed. They do not guarantee daily sales, weekly deposits or uninterrupted income. Settled cash and bank timing must be measured directly. A provider payout schedule moves earned funds; it does not create earnings.

## Completion evidence

Proposed evidence standard, encoded in `eidos_recurring_revenue_gate_v1`:

1. Real LIVE payments from at least 10 independent customers; exclude owner/team/test transactions.
2. At least five distinct customers successfully renew. An initial purchase alone does not prove recurrence.
3. Eight consecutive **closed** Monday–Sunday weeks in America/New_York, each with complete product-attributed provider records and bank reconciliation. Include fees, refunds and disputes; exclude taxes held, loans/capital and unrelated products.
4. Each week's settled net customer receipts cover actual operating expenses plus a 25% reserve. Do not replace missing expense coverage with estimates or zeros.
5. Measured operating/support upkeep is no more than 60 minutes in each week after initial setup, and no physical service or recurring custom-delivery obligation is needed.

This is an evidence threshold for evaluating the user goal, not a forecast or a promise. If receipts pass, report the observed period and limits; future retention is still uncertain. Do not quietly lower the standard to call an unsuccessful offer complete.

## Acquisition and demand test

Start with the free estimator and a clear paid-workspace comparison. The first success metric is a verified independent paid subscriber, followed by a renewal and retained usage. Prioritize a useful embroidery quotation guide linked to the working calculator, an honest 90-second walkthrough, approved profile links and relevant communities that permit self-promotion. Prepare any external post or email as a reviewable draft; this task has not sent outreach or posted to a community. Keep paid acquisition at the existing $0 ceiling.

Do not multiply unproven products. After a real hosted payment path is accepted, observe qualified visits and paid starts for four weeks. If there are 100 qualified visitors and no paying customer, investigate audience/offer/price before adding more features. If fewer than 100 qualified visits are observed, distribution remains untested. Do not treat QA visits or broad sessions as qualified traffic. If people subscribe but do not renew, inspect useful saved-job behavior and explicit feedback. $19 is an initial pricing hypothesis, not the revenue-maximizing price.

The existing $29 Cinematic Starter may provide supplementary one-time sales after its own payment gates pass. It does not replace recurring-income verification. Ads and affiliate links lack verified traffic/approval and are not a near-term expense-coverage assumption. No speculative trading, client guarantee, paid campaign, new paid provider contract or copied private customer asset was used.

## Next executable steps

1. Confirm/connect the intended Stripe account and complete its real identity/payout onboarding. The bank and identity step requires Brent's own information.
2. Bind an isolated Worker/D1, sandbox Stripe price/webhook/Portal, verified transactional sender and Turnstile. Run the hosted acceptance sequence in the app README.
3. Verify one actual independent LIVE purchase, self-service access/recovery/cancellation and settlement, then open acquisition. Update the launch-candidate public terms and review applicable tax registration/collection first.
4. Enter complete real business expenses and opening cash into the current workbook. Reconcile product payments and processing fees without double counting cash.
5. Review the revenue and retention evidence regularly; carry progress in the existing growth cycle so no parallel reminder pile is needed. Automatic reviews cannot approve identity, produce customers on demand or make a failed payment path acceptable.

**Still open:** exact hosted deployment, hosted D1 operation, inbox receipts, sandbox provider journey, LIVE customer payment, demand, recurring renewals, bank settlement, complete expenses, physical-device checks and measured upkeep.
