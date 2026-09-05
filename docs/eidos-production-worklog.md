# Eidos Works production release â€” September 5, 2026

## Acceptance plan

1. Inspect PRs, production sources, service access, existing allocations, and rollback references.
2. Configure durable Sentinel storage and authenticated Pages relay while preserving Snapshot and research execution.
3. Verify GA4 stream ownership, consent, event privacy, navigation, and actual receipt.
4. Verify bounded OpenAI elaboration and source-only fallback before enabling AI.
5. Complete Stripe test checkout, delivery, duplicate events, and revocation before live purchasing.
6. Exercise moderation, agent keys, persistence, feeds, maintenance, and inquiry delivery.
7. Run required checks on final revisions, merge, deploy backend then website, and verify production.
8. Save receipts and update the release handoff with actual active features and unresolved dependencies.

## Initial state

- Website PR #6: `819ce6e4c35ad44846efe1c3ec7f1421c3146c2a`, open, mergeable, Site quality passing.
- Backend PR #37: `9a2caa7b7afeebb8bfadd4c67f8e614d156485ca`, open, mergeable, Sentinel Lab quality and Vercel checks passing.
- Website branch contains `agent/eidos-editorial-redesign` (ancestry verified).
- Isolated worktrees created; unrelated dirty worktrees retained without edits.
- Vercel connector reads team/projects successfully. Browser initially requires sign-in for Vercel and Cloudflare.
- Existing Stripe test credential authenticated successfully; saved live credential returned HTTP 401.
- Existing Cloudflare OAuth access token returned HTTP 403; CLI refresh remains to be attempted.
- Google Analytics browser opened an existing property; stream ownership is not yet verified.
- Existing OpenAI environment credential found; live validation remains pending.

No production release or integration activation is claimed by these initial checks.

## Verified implementation and service findings

- Cloudflare connector installed and authenticated. Production project is `eidosworks`, a direct-upload project on branch `main`; the similarly named other project is not the production domain.
- Rollback: Cloudflare deployment `eeddf874-7035-4718-8fe7-4c734aed486c`, URL `https://eeddf874.eidosworks.pages.dev`, source metadata `9f7c781` with dirty flag from the prior deployment. Source is retained, not reconstructed from that metadata.
- The production Pages project currently has no configured environment variables or database bindings. Existing research Vercel variables were inspected by name only and preserved.
- Cloudflare D1 has only an unrelated Printavo allocation. Vercel has no existing connected database. Turso is available through its marketplace and matches the supplied libSQL adapter; new marketplace terms await account-owner acceptance.
- GA4 discovery found only an Eidos Brain property (`526595939`) with an empty-URL stream. That stream is not verified for Eidos Works and was not repurposed. A separate Eidos Works property was created in the existing account with New York reporting time and USD currency; stream setup continues.
- Analytics now records explicit client navigation once and resumes after consent is granted again without a reload. Automatic Google page views remain disabled. Bot user-agent classification is heuristic; agent API traffic never emits browser conversions.
- The previous consent UI already reloaded after consent was granted again; the improvement removes that reload and directly restores tracking. The initial progress note overstated this as entirely broken.
- One real `gpt-4.1-nano-2025-04-14` Responses request passed: input 221, output 40, total 261 tokens; conservative reservation 2,037 tokens. Duplicate suppression and zero-budget/missing-storage fallback passed. This used in-memory test storage, not deployed persistence. Evidence is in the companion repository's `artifacts/works-release-20260905/ai-provider-smoke.json`.
- Official model documentation lists $0.10 input / $0.40 output per million tokens and Responses support: https://developers.openai.com/api/docs/models/gpt-4.1-nano . The observed request corresponds to approximately $0.0000381 at those uncached text rates, not a provider billing receipt.
- Clean installs, website platform tests (12), analytics test, Snapshot smoke, website build and verification commands passed; Lab tests (21), typecheck, and production build passed. Final revisions must be rechecked after remaining edits.
- Starter package generation now normalizes text newlines so Windows and Linux create the same ZIP payload.


## Deployed validation — 2026-09-05

The earlier access limitations were resolved. The user approved the marketplace/Turso terms; two free Starter databases were provisioned, with separate production and preview credentials. Both additive migrations passed. Production remote storage survived a fresh child process; three clients making 30 atomic reservations respected the cap and a failed batch rolled back.

The correct Pages project is `eidosworks` (direct upload, production branch `main`). The current validation alias is https://release-validation-20260905.eidosworks.pages.dev . Its Sentinel backend is deployment `dpl_BrSbWbWMCedjFdMvBJ9sbnDu4Zut`, source `9a2caa7b7afeebb8bfadd4c67f8e614d156485ca`. Authentication, exact origins and signatures are enforced. A Vercel project-scoped automation credential is used only for the protected preview relay.

Cloudflare rejected `redirect: error` despite Node tests passing. The relay now uses supported manual redirects and rejects every 3xx before returning Location or following it. A real Workers runtime regression test passes. The actual deployed public configuration and API routes now return successfully.

GA4 account `386114675`, Eidos Works property `552876683`, production web stream `15725877773`, measurement ID `G-8N7Y7EM4CS`. Enhanced Measurement is off. Authenticated Realtime showed actual page views, `question_submit`, and a later test `purchase`. Preview traffic carries `traffic_type=qa` and debug mode. These are QA receipts, not revenue. No tag existed before consent or after decline; grant and regrant used one tag. Tests cover navigation deduplication and private-data exclusions.

The deployed assistant returned source mode without a reservation, then one explicitly enhanced answer with a 2,060-token conservative reservation. Its duplicate returned identically with no additional reservation. The earlier direct provider receipt reports 221 input / 40 output / 261 total tokens. Model: `gpt-4.1-nano-2025-04-14`; 320 maximum output tokens, five visitor attempts/day, one request/no retry, 20,000 shared daily reserved tokens. Production enable flags have been configured for the next deployment.

A real guest question and reply passed Turnstile. Pending records remained private; approved records and one source-based @eidos reply appeared on the page/feed/sitemap. Unpublishing removed the test records from public views. A registered agent received five submissions/day, a 429 on the sixth, one approved contribution, and 401 after revocation. Synthetic aged fixtures against remote validation storage verified opt-in, 24-hour eligibility, bot-loop prevention, and the ten-suggestion daily ceiling. The repository maintenance secret is configured for the hourly workflow.

Stripe TEST checkout charged 2,900 cents USD in test mode. The paid webhook granted the ZIP (6,012 bytes, SHA-256 `c5723e4908f8aff386f50ec41c59dfa673a8e4280c46f2eed2399e30ee5f7988`); all five documented files passed ZIP integrity. An API-retrieved Stripe event, locally re-signed with the test endpoint secret, left one event row and the original fulfillment unchanged. A real test refund and a separate test dispute each caused download 403. The canceled/unpaid session also received 403. All payment evidence is test mode; there is no production revenue claim.

A private Cloudflare email Worker is bound to Pages. A labeled inquiry reached the configured studio Gmail inbox with the same provider receipt; SPF and DKIM passed. The Worker has no public route/workers.dev URL, fixes the destination and sender, checks reply addresses, and applies a rate limit. See `ops/inquiry-mailer/README.md` and `artifacts/release-20260905/inquiry-service-smoke.json`.

Final website verification: 17 platform tests, one analytics test, Snapshot smoke, lint, build, prerender, editorial, Insights distribution, URL checks, and Functions compilation all passed. Lab: 21 tests, lint/typecheck and build passed. A reply acknowledgement regression discovered in browser checks was fixed and covered by a focused test.

Release is still pending at this checkpoint. Live Stripe restricted-key creation requires completion of its email verification; Chrome reported an extension popup blocking the Gmail tab, and the user was asked to dismiss it. Production deployment, final responsive checks and final Drive receipts will be recorded in the release handoff after completion.
