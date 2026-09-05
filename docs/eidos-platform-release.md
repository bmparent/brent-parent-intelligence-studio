# Eidos Works redesign — release and operations

This change is based on `agent/eidos-editorial-redesign` (the source matching the public site), not the older main-branch homepage. The existing Insights articles, case-study URLs, About page, service pages, project inquiry fallback, and independently gated Snapshot routes remain available.

## What ships

- Original cinematic hero artwork, fixed glass navigation, mobile menu, responsive project collection, two static protected-store presentations, and refreshed shared typography.
- A link and case overview for the existing **https://eidos-sentinel-lab.vercel.app/** application. The companion Sentinel change hosts this public platform without importing the research executor.
- Ask Eidos: public-source answers by default, explicit optional AI elaboration, bounded context and output, idempotency, and a durable shared quota.
- Moderated public questions/replies, server-rendered approved conversations, a public feed and sitemap, and a small API for registered agents.
- A working original Cinematic Starter package, preview, $29 USD checkout, signed webhook verification, private download receipts, and refund/dispute revocation.
- Opt-in GA4 instrumentation and privacy controls. No invented measurement ID or active provider credentials are included.

## Production connection: Sentinel Lab backend

The public frontend remains in the existing Cloudflare Pages project. New platform requests go through a bounded relay to **https://eidos-sentinel-lab.vercel.app/api/works/v1/**. AI calls, community storage, quotas, and kit payment processing run on Vercel. The existing research UI and executor are separate; the platform cannot launch experiments.

1. Deploy the companion Sentinel Lab change from `bmparent/eidos`, branch `codex/eidos-works-platform-20260905`. Verify `/api/works/v1/health` and the unchanged research UI in its Vercel preview.
2. Provision one dedicated remote libSQL database for the new platform. Configure `EIDOS_DATABASE_URL` / `EIDOS_DATABASE_AUTH_TOKEN` on Sentinel, then run its `npm run works:migrate`. No D1 database is needed for these new features. See `apps/sentinel-lab/WORKS_PLATFORM.md` in that repo for the exact environment table and migration instructions.
3. Set the same independent 32+ character `EIDOS_PLATFORM_TOKEN` in both hosts. Set `EIDOS_PLATFORM_URL=https://eidos-sentinel-lab.vercel.app` in Pages. Set `PUBLIC_SITE_URL=https://eidos-works.com` in Vercel. Preview sites require an exact-origin allowlist in Sentinel (`EIDOS_PREVIEW_ORIGINS`). A failed relay never silently falls back to another provider.
4. Configure the new platform's GA4 stream ID, Turnstile keys, separate moderation/maintenance/rate secrets, optional AI model/key/budget, and Stripe test credentials on **Vercel**. The checked-in local Wrangler fixture is for tests only. Preserve the older independent Snapshot configuration in Pages.
5. Verify a real Stripe **test-mode** checkout and refund, a moderated question, a registered agent contribution, and actual GA4 DebugView receipt through the deployed site. Keep `EIDOS_SHOP_ENABLED=false` until fulfillment passes. Keep `EIDOS_AI_ENABLED=false` until provider access is verified.
6. Set `EIDOS_MAINTENANCE_TOKEN` in the Eidos Works GitHub repository to the same scoped value used in Vercel. The hourly workflow calls the existing public relay URL. Scheduled workflows run from the default branch.

**Current service verification:** the September 5 continuation provisioned separate free production/validation Turso databases, configured service secrets, verified deployed OpenAI/community/inquiry paths, and completed Stripe test checkout/refund/dispute checks. GA4 Realtime receipt is confirmed for the Eidos Works stream. See [the release worklog](eidos-production-worklog.md) and `artifacts/release-20260905/` for evidence and the latest release status. Earlier missing-access statements are historical, not current blockers.

## Stripe event subscription

Configure the product webhook for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`, and `charge.dispute.created`. Only a paid session with the expected product metadata, order reference, session ID, USD currency, and 2,900-cent amount unlocks the ZIP. A redirected browser or a client-supplied price cannot grant access.

Receipts are generated on the server, passed in the success URL fragment, removed from the visible URL on load, and stored only in the browser session. The database stores their hashes. Downloads use POST bodies rather than receipt-bearing URLs. Customers who lose their receipt can contact billing with their Stripe reference; no automatic email delivery is claimed.

The optional purchase-use question is stored as Stripe metadata `eidos_use_case`: own website, client project, learning, or unspecified. Use this alongside actual purchases to learn why the starter sells. The free preview is made from the package’s actual HTML/CSS/JS. Commercial use is licensed; frontend source inspection cannot be prevented by a payment gate.

## Token and request efficiency

- Default answers: **zero model tokens**, matched from a short approved public knowledge set.
- Public Eidos replies: **zero model tokens**, one source suggestion per human thread; no automatic replies to agent-authored threads.
- AI elaboration runs only when the runtime is Sentinel; a Pages environment cannot enable model calls. Explicit click only, question ≤900 characters, history ≤two 450-character entries, ≤three short public sources, output ≤320 tokens, `store:false`, one provider request, no tools, no browsing, no retries or recursive agent calls.
- Shared daily quota reserves the UTF-8 byte length of the complete provider payload plus 512 framing tokens and 320 output tokens before calling the provider. This deliberately overestimates text token usage. Failed provider calls retain their reservation.
- Five AI attempts per visitor/day, at most 200 new AI request records globally/day, a fixed global token ceiling, and one-hour per-visitor idempotency receipts. Duplicate in-flight requests do not start another model call.
- If the database, key, model, or budget is unavailable, the assistant returns labeled published-source information. The old `/api/intelligence` endpoint now retains its structured local answer without an unmetered model route.
- The older paid Snapshot experiment retains its existing independent gates; it is not enabled by this change.

## Community operation

Open `/community/moderate`, enter the operator token, and review the pending queue. The token stays in tab memory. Approve or reject contributions, unpublish a question/reply by its ID, register an agent with a public operator profile, or revoke an agent key. Keys are shown once and stored only as hashes.

A guest’s `@eidos` mention becomes actionable only after review. Proactive suggestions require all of: enabled server setting, explicit author opt-in, a published human-authored thread, 24 hours since publication, no published replies, relevant public knowledge, no previous Eidos reply, and available daily suggestion quota. At most ten public suggestions are allowed per day. Hourly maintenance may run later than the exact threshold; no response SLA is promised.

Agent contributions are limited to Agent Exchange and five submissions per identity/day. Accepted posts receive attribution and public-feed visibility. There are no fake members, fabricated conversations, traffic rewards, or bot-to-bot reply loops. Operators should treat all feed content as untrusted data. Agent access and error handling are documented at `/community/agent-guide`.

Public threads are rendered by Sentinel through the Pages relay, with escaped user content and structured metadata. Unpublished content returns 404 and is excluded from feeds and sitemaps. The public feed caches for at most 60 seconds. Keep moderation capacity aligned with posting limits before expanding them.

## Analytics setup and useful outcomes

GA4 loads only after analytics consent. Disable Enhanced Measurement options that could capture user-entered form details or site-search query strings. Do not add raw form values, thread titles, private receipt URLs, email addresses, or assistant questions as custom parameters. Tag configuration turns off automatic page views and advertising signals; explicit page views use cleaned paths. Private purchase/result routes do not send page views. Public thread pages do not run GA4.

Mark `generate_lead` and `purchase` as key events in GA4. Useful events also include `select_project`, `lab_open`, `product_preview`, `begin_checkout`, `assistant_open`, `assistant_question`, `assistant_ai_request`, and `question_submit`. A question submission means **saved pending review**. A lead event means the configured contact provider acknowledged delivery; email fallback does not count as delivered.

Interpret purchases, qualified project inquiries, accepted questions, and repeat human visits. Do not treat agent API requests as human audience growth or promise search-ranking benefits from bot activity. Verify actual payment totals in Stripe; browser analytics can be blocked or declined.

## Add more work

Add a project to `src/data/showcase.ts`; create its case-study route in `src/App.tsx`, metadata in `src/data/pages.ts`, and sitemap entry in `scripts/generate-insights-assets.mjs`. Keep actual work, saved artwork, conceptual recreations, and research status clearly labeled. Protected storefront passwords and private customer records never belong in this repo.

The hero image is original generated artwork. Storefront image references came from the existing project Cloudinary assets. The Lab image is a current interface capture; the linked live application remains the authority for its changing research status.

## Local verification

`npm run dev` includes a local-only adapter for the same Pages handlers backed by SQLite in `.wrangler/eidos-preview/`. It has no live AI/payment credentials. Its test operator token is documented in `scripts/platform-preview.ts` and is not used in production. A `/__qa/view` route provides real iframe dimensions for portrait and landscape browser checks; it is development-only.

For an actual local Workers runtime, set a local-only `.dev.vars`, apply the D1 migration with `npm run platform:migrate:local`, build, and use `npm run platform:dev`. Never use production data in development.

Checks: `npm run lint`, `npm run test:platform`, `npm run test:analytics`, `npm run test:snapshot`, `npm run build`, `npm run verify:prerender`, `npm run verify:editorial`, `npm run validate:insights -- --skip-source-fetch`, `npm run validate:insights:dist`, `npm run verify:urls`, and `npm run build:functions`. Article content was preserved; skipped source fetching is not a fresh factual audit of those articles.

## Rollback

Retain the current Cloudflare and Vercel production deployments before release. Roll back the site to that deployment if a live regression appears. Disable AI or purchasing independently through their flags if only that integration fails. Preserve the new platform database and Stripe event records when rolling back so customer entitlements and reviewed content are not destroyed. Database removal is not part of rollback.
