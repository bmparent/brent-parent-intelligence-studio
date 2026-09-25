# Eidos Works isolated release acceptance — 2026-09-25

**Current decision: NO-GO for public release.** This is a progress receipt for the configured isolated TEST preview. It does not replace the September 23 acceptance gates, approve a production merge, or authorize a LIVE transaction.

## Exact preview and source

| Component | Observed identity | Evidence and limit |
| --- | --- | --- |
| Public acceptance site | `https://eidosworks-test-20260923.pages.dev`; Pages deployment `e1b9aaa8-20c2-4d15-ad7d-3f0dff30cc97`; site source `1eb234490a57dac72cf8d78f8bee7a62c54a0dad` | Direct Upload to the existing isolated project's own production branch; project has no public Eidos custom domain. Wrangler marked the build dirty because its generators rewrite tracked source artifacts. |
| Owner console | `https://owner-preview.eidos-works.com`; Worker version `79c76601-bec9-4ffa-9925-6ecfae75ba5e` at 100% | Worker now probes the configured isolated site hostname. The separately named `eidosworks-candidate-20260923` project has no account/relay bindings and is not an acceptance target. |
| Owner backend | Vercel deployment `dpl_21aLSjr1CRpVdSghVyNFWi2kFzBJ`; source `f690429fc29b59211e94a4e9b279c304693bb36d` | Owner console authenticated read observed healthy Works database and TEST store mode. The isolated public site's exact relay target was not exposed by a non-secret provider read in this run; retain the earlier paired-backend receipt as historical evidence, not a fresh claim. |

## Checks completed this continuation

- The deployed public root returned HTTP 200. `/api/public-config` reported `communityReady`, `accountsReady`, `passwordsReady`, `googleReady`, `aiReady`, and `shopReady` true; `localTest` false. This checks configuration, not a completed account or payment.
- The Eidos Works Community Google Auth Platform web client already contains the exact `https://eidosworks-test-20260923.pages.dev/api/members/google` callback alongside the production callback. A fresh isolated-site Google start returned an authorization URL with that callback; Google's response was HTTP 200 and did not contain `redirect_uri_mismatch`. Personal consent and an Eidos session remain unverified.
- A fresh hosted Chromium run on the deployed site passed 26/26 public route and interaction checks at 390, 768, and 1440 CSS pixels with reduced motion. This is viewport emulation; it does not satisfy a physical-phone or screen-reader gate.
- Repo-root `npm run build`, `npm run verify:prerender`, `npm run test:audit` (32/32), and `npm run test:owner-console` (5/5) passed. The owner Worker was uploaded with `--keep-vars` and deployed through Wrangler versions without changing its custom-domain trigger.

## Open gates

1. A person must complete Google sign-in/consent and any Turnstile or account-terms step in the visible isolated Account tab. Then test password, email links, account switching, identity linking, and cross-account data boundaries with controlled identities and actual inbox receipts.
2. Run a new Stripe TEST browser checkout, provider-signed webhook, archive download/digest, guest recovery, replay, refund and dispute revocation on this exact preview. The connected Stripe app required reauthentication and the dashboard required the owner's SMS code at this checkpoint. No new purchase was claimed.
3. Accept authenticated Playground save/reopen, media ownership, proposal preview/apply/Undo, export entitlement, and interrupted paid request. Paid AI and authoring remain off pending a bounded test allowance and commercial acceptance.
4. Exercise an actual phone, 200% browser zoom, and a screen reader. The hosted viewport result is supporting evidence only.
5. Resolve Snapshot's DNS-to-fetch rebinding gap with a verified pinned outbound path; approve conservative provider cost ceiling, shared D1/R2 migration and lifecycle, existing KV order recovery, support/retention policy, and signed TEST fulfillment before enabling generation or orders. Snapshot remains off.

## Safety and scope

Neither draft PR was merged, the production `eidos-works.com` Pages alias was not switched, and no LIVE payment was attempted. The DG Promo Photos application and Access policies were untouched. The shared Cloudflare Zero Trust login slug is not the owner console's brand or application hostname.
