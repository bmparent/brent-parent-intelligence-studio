# Deployment

## Verified project identity

- Repository: `bmparent/brent-parent-intelligence-studio`
- Production branch: `main`
- Cloudflare Pages project documented by the existing deployment: `eidosworks`
- Public custom domain: `https://eidos-works.com`
- Build output: `dist`

The repository name is historical. The application and domain are Eidos Works. Do not use the separate `bmparent/eidos` research repository for this website and do not make a `.pages.dev` address canonical.

## Build settings

```text
Build command: npm run build
Output directory: dist
Node version: 24
Root directory: /
```

There is intentionally no top-level `404.html`. Cloudflare Pages therefore uses its built-in SPA fallback for dynamic paths such as `/snapshot/result/:resultToken`; the React router renders a clean in-app 404 for unknown paths. Do not add a top-level `404.html` without also preserving that dynamic-result fallback.

## Required production configuration

### Site

- `PUBLIC_SITE_URL=https://eidos-works.com`
- `PUBLIC_CONTACT_EMAIL=hello@eidos-works.com`
- `PUBLIC_PROJECTS_EMAIL=projects@eidos-works.com`
- `PUBLIC_SNAPSHOT_EMAIL=snapshot@eidos-works.com`
- `PUBLIC_BILLING_EMAIL=billing@eidos-works.com`
- `PUBLIC_OPERATOR_EMAIL=bmp@eidos-works.com`
- `PUBLIC_BOOKING_URL` optional; the current site uses direct email and does not require a booking service
- Build variable `VITE_SITE_URL=https://eidos-works.com`

### Snapshot

- KV binding `SNAPSHOT_STORE`
- `OPENAI_SNAPSHOT_API_KEY` preferred; existing `OPENAI_API_KEY` remains a fallback
- `OPENAI_TEXT_MODEL`
- `OPENAI_IMAGE_MODEL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_SNAPSHOT` or `SNAPSHOT_PRICE_CENTS=500`
- `SNAPSHOT_PUBLIC_ENABLED=false` until every Snapshot launch gate passes
- Build variable `VITE_SNAPSHOT_CHECKOUT_ENABLED=false` until every Snapshot launch gate passes

Stripe webhook route: `https://eidos-works.com/api/stripe/webhook`

`SNAPSHOT_DEV_BYPASS_PAYMENT` must be absent or `false` in production. The backend also restricts bypass use to localhost requests.

### Optional Cloudflare provisioning values

`CLOUDFLARE_ACCOUNT_ID`, `D1_DATABASE_ID`, `KV_NAMESPACE_ID`, and `R2_BUCKET` are optional provisioning references, not browser variables. The current runtime uses the named `SNAPSHOT_STORE` KV binding; it does not assume D1 or R2 exists. `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` are reserved for the required pre-launch abuse-control work and should not be set as though Turnstile were already implemented.

### Optional inquiry and Command Center delivery

- `GOOGLE_APPS_SCRIPT_WEBHOOK_URL`
- `COMMAND_CENTER_SHARED_SECRET`
- `CONTACT_WEBHOOK_URL`
- `NOTIFICATION_TO_EMAIL`

## Production checklist

1. Confirm the custom domain is still attached to the correct Pages project.
2. Create/bind `SNAPSHOT_STORE` KV without changing existing bindings.
3. Add the dedicated Snapshot OpenAI key; do not revoke or overwrite the existing site key.
4. Configure Stripe Checkout and verify the signed webhook route.
5. Add durable Queue/Workflow fulfillment, a strong D1/DO/workflow state owner, result-link recovery, Turnstile, and create/checkout rate limits.
6. Run a test-mode $5-equivalent Checkout and confirm a report becomes available only after `checkout.session.completed`.
7. Confirm the private result token cannot be guessed or replaced with a request ID.
8. Run typecheck, lint, build, prerender/URL verification, and responsive browser checks.
9. Deploy the branch preview and review it while both launch flags remain false.
10. Enable both launch flags only after the full checklist in `docs/EIDOS_SNAPSHOT.md` passes, then merge to `main` for production.

## Known MVP constraints

- Snapshot records are retained for 30 days in KV; unpaid requests expire sooner.
- KV stores the generated image only while it stays below the conservative payload limit. Add R2 later if larger images need durable storage.
- There is no outbound email provider. Customers receive the private link in-browser and use `snapshot@eidos-works.com` for support.
- Browser Rendering is not required. When screenshot capture is unavailable, Snapshot uses bounded public HTML and clearly reports that limitation.
- Paid public launch remains blocked until durable fulfillment, state ownership, result-link recovery, Turnstile, and rate limiting are implemented and tested.
