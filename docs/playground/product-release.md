# Playground product release

September 10 implementation status: the reliability, media, flexible-page and optional-AI changes are stacked draft PRs with preview deployments. They are not a production release. Exact deployed commits, checks and remaining external gates are in [the implementation receipt](implementation-handoff-20260910.md).

The free preview remains available at `/playground`. PR #26 shipped the local editor. This release adds the original glass engine, account projects, test-mode export checkout infrastructure, and a standalone header component.

New projects pin `eidos-original-glass-2.0.0`. Existing schema-version-1 documents remain supported; the draft flexible-page change adds an explicit version-2 upgrade and About/Contact presets with stable section instance IDs. Existing `eidos-portable-glass-1.0.0` projects keep their renderer until the user explicitly chooses Upgrade to original glass; undo reverses that choice. Preview and page exports bundle the original controller, optics, surface markup and CSS. The approved defaults remain solid through 4px and fully glass at 72px. The final mask-composite ordering from PR #25 is retained. Unsupported native refraction uses the existing frosted fallback.

Account projects use the existing Eidos email-member session and Sentinel libSQL adapter. All project, revision, asset and purchase reads are owner-scoped. Save creates an immutable revision with an expected-head check in one transaction. A simultaneous stale save returns 409 without replacing the newer revision. Opening history does not modify the stored head until Save. Save as new creates an independent project. Uploaded images are stored by owner and content hash and hydrated when reopening; local exploration and JSON export remain available when cloud access fails.

Cloud limits during preview: 20 projects per account, 100 revisions per project, 2 MB per document. These are service limits, not a paid plan. Cloud saves are explicit; the local IndexedDB indicator does not claim a cloud save. Copy or restore is undoable locally.

`0003_playground.sql` is additive and idempotent. The existing migration command can apply it, and authenticated Playground operations initialize only this schema transactionally on the existing database. Initialization failure returns an error and retries on a later request. No hosting, bindings, earlier tables, relay credentials or research configuration are replaced.

## Test checkout configuration

No approved Playground sales price was found. Live sales are deliberately unavailable: the new checkout rejects live Stripe keys. Configure only on the existing Sentinel project:

- `EIDOS_PLAYGROUND_STRIPE_KEY`: separate `sk_test_` key for the existing Stripe account.
- `EIDOS_PLAYGROUND_WEBHOOK_SECRET`: signing secret for `/api/playground/webhook` on Eidos Works.
- `EIDOS_PLAYGROUND_TEST_PRICE_CENTS`: explicit test amount in USD (50–100000 cents); this does not approve a live price.

Use Stripe API version `2026-08-26.dahlia` for the new endpoint. Subscribe to checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, checkout.session.expired, charge.refunded and charge.dispute.created. Keep existing shop and Snapshot webhook configuration unchanged.

Checkout freezes the actual ZIP bytes for an owned revision before contacting Stripe. Retries use an owner-scoped request ID and Stripe idempotency key. Signed events must match the session, order, currency, amount and test mode. Delayed payments remain pending. Success-page query strings grant nothing. Downloads require an authenticated owner and a paid, unrevoked order. Refund/dispute tombstones prevent later duplicate success events from regranting access. Purchase history reports the server state and permits refreshing after checkout. Free exports stay available throughout the preview.

Before live sales: approve the actual USD price and terms, implement a deliberate live-mode configuration change, and verify real Stripe test checkout plus webhook delivery in the configured environment. Local mocked-payment tests do not establish that external configuration works.

## Exports and browser coverage

Page ZIPs use the same renderer as the preview. Header ZIPs include a Shadow DOM custom element, a host-page example, project JSON and installation instructions. The draft structural change adds header.html and a solid CSS/HTML navigation fallback for disabled or blocked JavaScript. The enhanced component requires JavaScript and follows window scrolling. Include one header per page and test host CSP and fragment destinations. InkSoft and CMS packages remain separate, unvalidated integrations.

Local Chromium, Firefox and WebKit engine checks cover save/reopen, upload/reload, actual ZIP download, independent exported page and header operation, scroll thresholds in both directions, and mobile menu/Escape. Deployed-preview anonymous editing/reload/export checks also passed at desktop and mobile widths in these engines. Local server fixtures cover ownership, stale saves, libSQL concurrency, revision restore, immutable payment delivery, delayed/duplicate events and refund/dispute revocation. Physical Safari/iPhone and real member/Stripe delivery verification remain outstanding. Production release evidence must be recorded separately from local checks.

Optional AI is described in [optional-ai.md](optional-ai.md). Its UI, server admission and separate database control all default off. No provider inference test, public spend or image generation was enabled. Additive migrations 0004 (owned image quota) and 0005 (isolated AI ledger) accompany their backend drafts; no production migration was run in this handoff.
