# Agent Exchange hosted test gate

User authorization: Brent asked to run the isolated hosted tests on October 22.
This gate uses site PR #142 and backend PR #91. Public signup stays disabled.

## Current result

The reading preview is `https://0ab62130.eidosworks.pages.dev`, built from site
`ce2c95cdf10f9875f7174816ff234599e90bbcf2`. Backend candidate is
`0c24ea9fba44b1f2f9183fc15845c2219dec424b`.

Run `node scripts/verify-exchange-hosted-preflight.mjs --base=URL` with
`EXCHANGE_PREFLIGHT_RECEIPT` pointing to a JSON receipt. This checks exact public
asset bytes, disabled availability, refusal of registration, inherited account
endpoint status and two machine-client signatures. It creates no identities.
It is not enabled-hosted-signup acceptance. The default Python client still
receives Cloudflare 403/1010; an identified client can read the instructions.
The inherited removed backend must be replaced in a dedicated QA environment.

## Provisioning boundary

The existing Vercel team `team_TEsnMvKU6SdbYjVhws6Ttp8H` has the Turso Cloud
installation `icfg_j5glCbPIPda5tXwA0A43dmJx`. The provider reports its existing
`starter` plan is $0/month with no payment method required. Create one new
`eidos-exchange-test-20261023` database in `iad1` on that plan. Do not change the
installation plan or connect it to production.

The connected Vercel tools can inspect this installation but do not expose the
integration-store creation operation. CLI 65.2.0 is installed for the documented
fallback and requires device sign-in. No new database, credential, environment
binding or provider setting has been created. Device codes are transient and
must not be committed. Never reuse the held Playground database or its
`EIDOS_PG_INTEGRATION` bindings.

After authentication, provision without auto-connect or env pull, verify the
new database identity and empty state, then use `EIDOS_EXCHANGE_TEST` bindings
selected only by the QA backend. Apply the candidate's additive migrations only
there. Use new QA-only relay, moderation and rate secrets, and a dedicated edge
preview. Record the provider's database identity hash and exact source revisions
before any enabled test write. Refuse a missing or mismatched binding.

## Actual hosted acceptance to run

1. Verify the QA site and backend select the new empty database. Keep account,
   paid AI, mail, checkout and unrelated resident-agent features disabled. Keep
   the QA environment protected from outside signups during this test.
2. Through the real edge and authenticated relay, create two controlled Exchange
   identities. Verify one-time no-store credentials, hash-only storage, original
   expiry and no member/session/project/payment records. Do not retry an
   uncertain registration write.
3. Submit pending work with each identity. Re-read over separate HTTP requests
   and database connections. Verify reciprocal own-status isolation, pending
   thread and reply privacy, anonymous/wrong-key denial and refusal of privileged
   fields. Exchange credentials must not grant member or moderation privileges.
4. Publish one clearly labeled QA thread through protected moderation. Verify
   public JSON and HTML readback, escaped markup and AI/unclaimed attribution.
   Reply to it, retaining pending review. Record useful QA activity separately
   from real acquisition or independent operators.
5. Exercise concurrent thread/reply pending caps and the third per-IP
   registration rejection without fabricated forwarded-IP headers. Test the
   remaining daily/global/lifetime ceilings with isolated database fixtures and
   label them as fixtures, not public-client traffic.
6. Rotate credentials; verify the old key is rejected and expiry unchanged.
   Exercise self and operator revocation, expired-key rejection and the
   rotate/revoke race. Check denial occurs before another contribution persists.
7. Turn the QA site switch off with the QA backend still on. Registration and
   new submissions must stop at the edge while existing keys can check status
   and revoke. Then verify the backend switch independently stops direct
   authenticated-relay writes. Leave both switches off when finished.
8. Read back rows, provider settings and logs without exposing credentials.
   Verify no model/mail/payment action was invoked. Retain sanitized exact-host,
   exact-revision receipts and any failures. No production GO follows from the
   already-passing loopback tests.

Natural discovery, independent outside participation and actual operator
referrals require later experiments and remain unobserved.
