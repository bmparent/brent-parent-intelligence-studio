# Google identity disclosure and transient credential cleanup — isolated candidate

Prepared October 19, 2026 for the existing #131/#85 release owner. Integration,
exact integrated-head CI, hosted acceptance and deployment are pending. This
record accepts only the local patch checks below; no previous CI receipt is
carried onto this patch.

## Source and duplicate-fix check

- Site base: `52d9db5e8056832b9d386123be19604ad0a06639` (PR131; tree `ae8e9e583dcb1d77737acaf92538d0b8a577da67`).
- Backend base: `944accb1c52d6af708b0f02709f5c819241d33b7` (PR85; tree `fb25dd006ce7de71c6035f19591114d84868f005`).
- Site advanced from the requested audit reference `83ef5eeb2b8dfd61179cda45be3616b0c7ce11a3`; the three account/privacy components and maintenance handler were unchanged between those two site revisions. Both gaps remained in the current heads. PR refs were re-read before editing and packaging.
- Work is in isolated detached checkouts; no release branch, remote ref, database, runtime setting or migration was changed. Preserve the owner's current pair and all existing work.

## Observed behavior and patch

`functions/api/members/google.ts` requests only `openid email`. Server exchange
and `googleIdentity.ts` validate identity; the Google subject links to the member
ID and the verified email supplies a new account's email. Existing-account
linking retains its email, username and projects. State, PKCE, nonce, browser
binding, signature, issuer, audience, expiry and verified-email checks remain
unchanged. The final Google test asserts the exact minimal scope string.

AccountAccess and MemberWorkspace now display an explanation immediately before
the Google action with a direct `/privacy#google-signin` link. The privacy section
explains optional identity processing, server exchange, persistent linking,
transient expiry and maintenance, and the existing manual contact route. It
makes no promise of self-service deletion, fixed persistent-identity retention,
or automatic revocation handling. Whole-account deletion and Google unlink are
still unimplemented and remain explicit gaps.

Maintenance adds three expiry-only statements inside the existing account gate:
`eidos_member_auth_tokens`, `eidos_member_oauth_flows` and
`eidos_member_google_signup`, using `expires <= cutoff` because admission requires
`expires > now`. Expired signup/reset proofs (including pending password hashes),
abandoned/consumed flows (including verifier/nonce), and signup tickets
(email/subject) are eligible. Unexpired rows remain even when consumed=1 or 2;
consumed alone must not remove an active transaction's proof. This patch does
not add a new retention period or delete linked identities, members, password
credentials, keys, reading history, projects, orders, archives or payment events.
It requires the already-existing credentials migration 0006 when accounts are
enabled; it does not apply it. Expiry is not proof of physical removal: the
authorized maintenance job must actually run with the account gate enabled.

## Local acceptance evidence

Evidence bundle: `google-policy-delivery/evidence` beside the isolated checkouts.
All database tests use memory-only SQLite/libSQL and synthetic identities.

- Regression first failed on the original handler because expired rows remained.
- Frontend platform suite: 44 passed; lint, TypeScript/client/SSR/prerender build, Pages Functions compilation, prerender/editorial/URL checks, and source/built article validation passed. Article source fetching was skipped because article content is unchanged.
- Backend: local full suite 20 JavaScript + 179 TypeScript tests passed; typecheck and Next production build passed. The final strengthened Google/cleanup tests also passed 4/4 after the earlier full run; the delivery bundle includes the final full-suite receipt separately.
- Cleanup tests exercise expiry-minus-one, exact expiry and expiry-plus-one across consumed=0/1/2 and both signup/reset purposes, unauthorized and accounts-disabled requests, and repeat maintenance. Persistent Google/member/password/key/bookmark and payment/event/revocation rows remain identical. The real libSQL adapter is exercised.
- The Google behavior test runs maintenance before the real handler's callback, between callback and username completion, and after completion, then validates the retained signed-in member. Token exchange is mocked locally; cryptographic validation tests still exercise signed JWTs.
- Shared source: 107/107 files match. The independent 18-file delivery/proposal graph also passes. The recursive exporter overwrites the graph's two deliberate adapters; those two files were restored to the exact backend base and the independent check rerun. No adapter change is included.
- Browser: installed Playwright/Chromium, localhost only, synthetic API responses, external requests blocked. At 1440×1000 and 390×844, anonymous Google entry and authenticated linking show the adjacent disclosure; the Google action exercises its guarded local error state, and the privacy link reaches the new section. No overflow, blank page, framework overlay or page runtime exception. Screenshots and reproducible script are in the bundle.
- Browser console has expected errors for blocked external resources and an existing duplicate React key warning: baseline MemberPages.tsx lines 102–103 give sibling MemberWorkspace and MemberSecurity the same username key. That file is unchanged. Console cleanliness is not claimed. Browser plugin was unavailable.
- Builds retain existing bundle-size/dynamic-import warnings; no new build error.

## Policy scope and remaining gates

[Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy)
requires accurate, accessible disclosure and minimum permissions and includes
Google Sign-In. The retrieved page says last updated February 15, 2024.
[Google Workspace user data and developer policy](https://developers.google.com/workspace/workspace-api-user-data-developer-policy)
adds obligations for Workspace developer data access and contextual agentic
consent; its retrieved footer says September 3, 2026. These sources do not
independently establish an October 12 revision date. The observed login has no
Gmail/Drive scopes; do not treat it as reading Workspace content or certify
blanket policy compliance. Sources were retrieved October 19, 2026.

The release owner must integrate both patches, rerun exact integrated-source
checks/parity, and verify the published disclosure and actual Google consent/
linking on the selected paired preview. OAuth consent-screen privacy URL,
registered origins/redirects, actual maintenance scheduling/access and database
migration state are admin verification gaps; none was modified or certified.
Manual correction/removal handling needs an operational owner and a separately
reviewed whole-account deletion/unlink lifecycle. The existing password/reset
inbox, two hosted members/project isolation, current owner-backend pairing and
signed Stripe TEST acceptance gates remain as recorded in current acceptance.
No hosted cleanup, real record deletion, credential/OAuth change, terms
acceptance, provider activation, spend, push, merge or deployment occurred.
