# Eidos Snapshot

Eidos Snapshot is a production-minded Cloudflare Pages Functions MVP for a $5, one-time website concept and recommendation report. A customer submits a public website, pays through Stripe Checkout, and receives a gated report with practical UX, SEO, homepage-structure, and AI-search-readiness recommendations plus one AI-assisted homepage concept image.

The output is a concept and recommendation report. It is not a finished coded website, a full technical SEO audit, a ranking guarantee, or a replacement for project discovery.

## Request flow

1. `POST /api/snapshot/create` validates and stores the intake. It returns an unguessable `requestId` and a separate unguessable `resultToken`.
2. `POST /api/snapshot/checkout` accepts the `requestId` and creates a server-side Stripe Checkout Session.
3. Stripe redirects the browser to `/snapshot/success`, but that redirect does **not** mark the order paid.
4. Stripe signs and sends `checkout.session.completed` to `POST /api/stripe/webhook`.
5. The webhook verifies its HMAC signature, expected amount/currency, session metadata, payment status, and idempotency marker. Only then does it mark the request paid.
6. The first paid `GET /api/snapshot/status?token=RESULT_TOKEN` keeps the browser request open while the internal generator runs, then returns a sanitized status, report, and stored concept image. Later status calls read the stored result. Status does not support lookup by `requestId`.

Generation is intentionally not placed in a post-webhook `waitUntil` task: Cloudflare can end post-response work before a content fetch, structured report, and image generation all finish. Keeping the token-gated status request open avoids taking payment and then depending on a short background lifetime. A future higher-volume version should move this work to Cloudflare Queues or Workflows.

The local payment bypass is the only exception to webhook-confirmed payment. It requires both `SNAPSHOT_DEV_BYPASS_PAYMENT=true` and a request whose hostname is exactly `localhost`, `127.0.0.1`, or `::1`. It cannot activate on `eidos-works.com`, a Pages preview, or any other deployed hostname.

## Cloudflare KV binding

Production requires a KV namespace bound to Pages Functions as `SNAPSHOT_STORE`. The implementation deliberately returns `503` on a deployed hostname if this binding is missing; it will not accept an order while pretending that process-local memory is durable.

Create a namespace with Wrangler or in the Cloudflare dashboard, then add the binding to both Preview and Production for the Eidos Works Pages project:

```bash
npx wrangler kv namespace create SNAPSHOT_STORE
```

Binding name:

```text
SNAPSHOT_STORE
```

The exact dashboard path is **Workers & Pages → Eidos Works Pages project → Settings → Bindings → KV namespace bindings**. Select the namespace created for Snapshot rather than pasting a secret value.

Records use immutable base and stage keys plus result-token and Stripe-event keys. Unpaid requests expire after two days. Paid requests/reports expire after 30 days. Stripe idempotency markers expire after seven days. Stage keys avoid rewriting one KV key during rapid transitions, which respects KV's one-write-per-key-per-second limit.

### Local fallback

When the request hostname is local and `SNAPSHOT_STORE` is absent, the API uses a clearly labeled `memory-dev` adapter. It is only useful for a single local Wrangler process. Data disappears on restart and can disappear when the runtime reloads. It must never be used to test real Stripe payments or represent production persistence.

## Environment variables and secrets

Set secrets in Cloudflare Pages rather than committing `.dev.vars`.

```text
PUBLIC_SITE_URL=https://eidos-works.com
PUBLIC_SNAPSHOT_EMAIL=snapshot@eidos-works.com
VITE_SNAPSHOT_CHECKOUT_ENABLED=false
SNAPSHOT_PUBLIC_ENABLED=false

OPENAI_SNAPSHOT_API_KEY=sk-proj-...
OPENAI_API_KEY=sk-proj-...
OPENAI_TEXT_MODEL=gpt-4.1-mini
OPENAI_IMAGE_MODEL=gpt-image-1

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_SNAPSHOT=price_...
SNAPSHOT_PRICE_CENTS=500

SNAPSHOT_DEV_BYPASS_PAYMENT=false

GOOGLE_APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
COMMAND_CENTER_SHARED_SECRET=long-random-server-side-secret
```

`OPENAI_SNAPSHOT_API_KEY` is preferred. If it is absent, Snapshot falls back to the existing `OPENAI_API_KEY`, so adding a dedicated Snapshot key does not require replacing or disabling the key used by the existing Eidos Works feature. Never expose either key through a `VITE_` variable.

`OPENAI_TEXT_MODEL` and `OPENAI_IMAGE_MODEL` are optional; the safe defaults are `gpt-4.1-mini` and `gpt-image-1`.

`VITE_SNAPSHOT_CHECKOUT_ENABLED` is a public, build-time switch, not a secret. Leave it `false` while Stripe or KV is incomplete. After the production checklist passes, set it to `true` in the Cloudflare Pages build environment and redeploy; this exposes the $5 intake button. The server still independently enforces storage, payment, and webhook configuration.

`SNAPSHOT_PUBLIC_ENABLED` is the independent server-side launch gate. On every deployed hostname, `POST /api/snapshot/create` returns `503` unless this is exactly `true`; localhost remains available for testing. Keep both launch flags false until durable fulfillment and abuse controls are configured. This prevents a hidden-but-public API from consuming KV quota before launch.

The two Command Center values are optional server-side secrets. When both are valid, Snapshot posts a `snapshot_order` event after payment is queued and again when the report completes or fails. It sends only the allow-listed operational fields documented in `docs/COMMAND_CENTER.md`, requires an Apps Script response containing `{ "ok": true }`, and treats every timeout/error as non-blocking so Command Center downtime cannot break payment or fulfillment.

For local development, place test values in the ignored `.dev.vars` file. Never use live Stripe credentials with the in-memory fallback.

## Stripe setup

1. In Stripe, create an **Eidos Snapshot** one-time product priced at **$5.00 USD**.
2. Copy its Price ID into `STRIPE_PRICE_ID_SNAPSHOT`. If no Price ID is set, the endpoint creates inline price data using `SNAPSHOT_PRICE_CENTS`, which defaults to `500`.
3. Add a webhook endpoint:

   ```text
   https://eidos-works.com/api/stripe/webhook
   ```

4. Subscribe the endpoint to `checkout.session.completed`.
5. Copy the endpoint signing secret into `STRIPE_WEBHOOK_SECRET`.
6. Set `STRIPE_SECRET_KEY` as a Cloudflare secret.
7. Confirm the configured Stripe price is exactly the same as `SNAPSHOT_PRICE_CENTS`. The webhook rejects a mismatched amount, non-USD currency, non-payment Session, or unpaid Session.

Before it creates a Checkout Session from `STRIPE_PRICE_ID_SNAPSHOT`, the server retrieves that Price from Stripe and verifies that it is active, one-time, USD, and exactly equal to `SNAPSHOT_PRICE_CENTS`. If any check fails, Checkout stops before a payment page is returned. The inline-price fallback applies the same trusted server-side amount directly.

Checkout is considered configured only when both the Stripe secret key and webhook signing secret are present. The client success URL is informational; the status endpoint remains pending until the signed webhook is processed.

Checkout explicitly enables card payments only. That keeps payment confirmation compatible with the deliberate policy that generation is unlocked exclusively by a paid `checkout.session.completed` event. Do not add delayed payment methods without adding and testing their later success-event lifecycle.

If a signed paid webhook somehow disagrees with the expected amount, currency, mode, or Session after those preflight checks, the request is placed in manual review, the customer is told not to pay again, and the webhook returns an error so the failure remains visible in Stripe rather than being silently acknowledged.

### Local payment-free test

Run Pages locally with:

```text
SNAPSHOT_DEV_BYPASS_PAYMENT=true
```

Create an intake and call checkout from `http://localhost`. Checkout will queue generation without Stripe. Set this back to `false` for normal testing. The hostname guard is enforced in code in addition to the environment flag.

## API contracts

### Create

`POST /api/snapshot/create`

```json
{
  "websiteUrl": "https://example.com",
  "businessName": "Example Business",
  "industry": "Home services",
  "primaryGoal": "more leads",
  "stylePreference": "clean premium",
  "biggestIssue": "Customers do not know which service to choose.",
  "email": "owner@example.com",
  "consent": true
}
```

Accepted `primaryGoal` values:

- `more leads`
- `better trust`
- `modernize design`
- `improve storefront conversions`
- `improve local SEO`
- `improve AI/search readiness`

Accepted optional `stylePreference` values:

- `clean premium`
- `bold modern`
- `warm local business`
- `high-end editorial`
- `tech-forward`
- `playful storefront`

Successful response fields include `requestId`, `resultToken`, `status`, `priceCents`, `currency`, and `checkoutConfigured`.

### Checkout

`POST /api/snapshot/checkout`

```json
{
  "requestId": "snap_..."
}
```

The normal response supplies a Stripe-hosted `checkoutUrl`. The server ignores client-provided prices, product names, payment states, email changes, and result tokens.

### Status

`GET /api/snapshot/status?token=RESULT_TOKEN`

Possible statuses are `created`, `checkout_created`, `paid`, `processing`, `complete`, and `failed`. The response omits the submitted email, Stripe payloads, raw HTML, upstream errors, and internal request details. The report and `conceptImage` data URL are returned only when complete.

## Capture and SSRF controls

The intake normalizer accepts only `http` and `https`, removes fragments, adds `https` when a customer enters a bare domain, rejects embedded credentials and nonstandard ports, and blocks local/private/reserved IPv4 and IPv6 literals and local host suffixes.

Before every content fetch and redirect, the generator performs DNS-over-HTTPS preflight checks for public A/AAAA answers. Redirects are manual and capped at three. A single timeout covers both response headers and body streaming. Captures accept only HTML/XHTML, honor a conservative 90 KB byte ceiling, use a bounded single-pass scanner, stop heading/link extraction after fixed counts, and retain only a bounded summary of title, meta description, headings, link labels, and visible text. Raw HTML and private fetch errors are never stored or returned.

Cloudflare Browser Rendering is not assumed because no Browser binding exists in this repo. Every report therefore carries the honest note:

> Screenshot capture was unavailable, so this Snapshot is based on the provided URL and extracted page content.

If a page blocks extraction, the paid job continues from the submitted business details and the note explains that no readable page content was available.

## OpenAI generation

The report uses the Responses API with a strict JSON schema. Captured page text is explicitly treated as untrusted content so instructions embedded in a website are not followed. The renderer receives only normalized, length-limited fields.

Responses requests set `store: false` so the application does not opt into stored response state. Configure the OpenAI project according to the business's data-retention requirements before launch.

The image uses the Image API and depicts a fresh homepage direction with neutral placeholders. It must not copy the submitted site pixel-for-pixel or imply that the design is already live.

The Image API is asked for a medium-quality JPEG at 65% compression rather than a multi-megabyte PNG. Its base64 is retained in the same immutable completed-stage record as its report only when it is at most 900,000 characters (roughly 675 KB binary), and the API rejects an unexpectedly larger image before storage. Keeping report and image in one version prevents cross-pairing if two edge locations ever race, while the tighter limit keeps parsing and result serialization realistic for Cloudflare's included CPU budget. Larger images are omitted with an explicit result-page note. An R2-backed binary image adapter is the appropriate future extension if larger or permanent concepts are required; R2 is not silently assumed in this MVP.

If image generation fails, the structured written report still completes and the result explains that the visual concept was unavailable. If the structured report cannot be generated, the request enters `failed` with a customer-safe support message rather than returning a fabricated report.

## Security and operational notes

- Request JSON is content-type checked and byte limited.
- All customer fields are allow-listed and length limited.
- Result tokens use 32 cryptographically random bytes and cannot be replaced by request IDs in status lookups.
- Stripe signatures use Web Crypto HMAC-SHA256, constant-time comparison, and a five-minute timestamp tolerance.
- Webhook event IDs are persisted for idempotency.
- Webhook processing is also state-idempotent: repeated valid completion events only re-assert the same paid state and never launch generation from the webhook.
- Payment is never inferred from query parameters, the success redirect, client state, or a checkout API response.
- Upstream Stripe/OpenAI bodies, secrets, raw page content, and private exception messages are never returned or logged.
- API responses use `no-store`, `nosniff`, and `noindex` headers.
- Add Cloudflare Turnstile and create/checkout rate limiting before public launch to prevent unpaid-intake spam from consuming the included KV allowance. Generation remains webhook-gated, but storage and Stripe Session creation still need availability protection.

## Known MVP launch gates

The implementation is safe to deploy with `SNAPSHOT_PUBLIC_ENABLED=false` and `VITE_SNAPSHOT_CHECKOUT_ENABLED=false`. Do not switch both flags on for paid public traffic until these operational gaps are closed and tested:

- Fulfillment currently begins when the private result/status request sees a webhook-confirmed paid state. Add a durable Cloudflare Queue or Workflow consumer—and outbound result-link recovery—so a customer closing the Stripe tab cannot strand a paid order.
- KV stage keys respect the one-write-per-key-per-second rule, but KV remains eventually consistent and is not a cross-region transaction/lock service. Move mutable fulfillment ownership to D1, Durable Objects, or Workflows before multi-region/high-volume launch.
- Add Turnstile and a Cloudflare rate limit for create/checkout before enabling the public server gate; otherwise automated unpaid requests can consume the free KV write allowance.
- DNS preflight, comprehensive non-global IP blocking, redirect revalidation, and Cloudflare's own egress controls substantially reduce SSRF risk, but DNS preflight cannot pin the later `fetch()` connection address. A stricter threat model should use a capture service/egress layer that validates and pins the destination or keep remote capture disabled.

These are explicit launch gates, not hidden production capabilities. The customer-facing site intentionally keeps checkout unavailable until the flags and checklist say otherwise.

## Production checklist

- [ ] `SNAPSHOT_STORE` is bound in both Preview and Production.
- [ ] A dedicated `OPENAI_SNAPSHOT_API_KEY` is configured, or the existing `OPENAI_API_KEY` remains valid.
- [ ] Text and image model access has been confirmed for the selected OpenAI project.
- [ ] OpenAI organization verification is complete if the selected GPT Image model requires it.
- [ ] The Stripe product is a one-time $5.00 USD price.
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_PRICE_ID_SNAPSHOT` are configured.
- [ ] The webhook endpoint receives only `checkout.session.completed` and passes a Stripe test event.
- [ ] `SNAPSHOT_PRICE_CENTS=500` matches Stripe.
- [ ] `PUBLIC_SITE_URL=https://eidos-works.com`.
- [ ] `SNAPSHOT_DEV_BYPASS_PAYMENT=false` (or unset) in every deployed environment.
- [ ] Durable queue/workflow fulfillment and result-link recovery are implemented and tested.
- [ ] Turnstile plus create/checkout rate limiting are active.
- [ ] The chosen durable state owner prevents duplicate generation across edge locations.
- [ ] A full test order progresses from `created` → `checkout_created` → `paid`/`processing` → `complete`.
- [ ] The result route fetches status only with the `resultToken` and handles the screenshot/image notes gracefully.
- [ ] Only after the checks above pass, `SNAPSHOT_PUBLIC_ENABLED=true` and `VITE_SNAPSHOT_CHECKOUT_ENABLED=true` are set for production and the site is redeployed.
