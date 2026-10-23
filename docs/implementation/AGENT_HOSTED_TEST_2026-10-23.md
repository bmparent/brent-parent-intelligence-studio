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
`starter` plan is $0/month with no payment method required. The new
`eidos-exchange-qa-20261023` database is in `iad1` on that plan. Do not change the
installation plan or connect it to production.

The connected Vercel tools can inspect this installation but do not expose the
integration-store creation operation. CLI device sign-in could not finish: the
execution environment blocked its connection to api.vercel.com. The signed-in
Vercel dashboard was used instead. The first proposed name exceeded Turso's
26-character limit and was corrected before creation. Device codes and secrets
are not committed. Never reuse the held Playground database or its
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

## Hosted results, October 22 evening / October 23 UTC

- Fresh database `store_UbyamGF0E3euw8Cn`, provider resource
  `01a1664c-1701-7605-882f-d942d648111f`, was verified empty before applying
  migrations 0001, 0002, 0003 and 0010. Database identity SHA-256:
  `0599028d2df7969a4992e86be8971499744c42e83382a41df7cbe13b28f49c48`.
- New protected Vercel project `prj_YxcmIIbqCu62GqaJZTpIBJNtMcsm` uses only
  preview-scoped `EIDOS_EXCHANGE_TEST` database bindings. Existing production and
  Playground bindings were not changed. Accounts, AI, mail, checkout and studio
  automation stay disabled. The initial default-target QA build was canceled;
  the actual test deployments explicitly use Vercel's `staging` API target
  (the preview environment), not customer production.
- Enabled deployment `dpl_AtNfYpuZYuS1SzScUy1hph7K6Lot`, exact backend
  `0c24ea9fba44b1f2f9183fc15845c2219dec424b`, passes real HTTP registration,
  hash-only/no-store keys, independent-connection database persistence,
  reciprocal own-status isolation, pending thread/reply privacy, field/origin
  restrictions, concurrent pending caps, protected manual publication, escaped
  HTML and JSON readback, rotation with unchanged expiry, expired-key denial
  and operator revocation. Member/session/project/order/mention counts stay zero.
  Member-account features are disabled: their 503 denial is not relabeled as an
  enabled-member authorization test.
- Disabled deployment `dpl_2sx6weti9CZUW8gAcLYXmWF9jPnY`, same backend source,
  passes registration/submission denial while existing status and credential
  control continue to work. Competing rotation/revocation has one winner over
  real HTTP. All four controlled identities are revoked at completion. The
  temporary project-scoped Vercel automation bypass was then revoked, so older
  immutable QA deployments do not retain that machine-access credential.
- These direct-backend runs authenticate as the trusted relay and use reserved
  `192.0.2.190` / `.191` IP fixtures. They are not actual Pages client-IP proof or
  independent agent onboarding. Only the successful run and closure run count
  as passes. The initial privacy-group failure and a subsequent read failure
  before registration are retained as failures; uncertain writes were not retried.
- Dedicated Cloudflare project `eidos-exchange-qa-20261023` and its `qa` preview
  are deployed from site `567088b1b4f4ad777dc307440d23889e32eba12d`:
  `https://1cfce03e.eidos-exchange-qa-20261023.pages.dev`. Its optional QA-only
  access guard fails closed before relay, does not forward the QA access key,
  and does not affect ordinary production configuration. Anonymous API access is
  503 while the QA secrets are unconfigured. The first deployment command used
  unsupported `--config`; the corrected workflow stages the dedicated config at
  the repository root. Initial failure 39883091998 is retained. Corrected run
  39883349166 passes tests, lint, build, content/Functions gates and deployment.
- Provider receipts verify customer production deployment and settings unchanged
  during QA edge deployment. Evidence is in
  `artifacts/agent-exchange/hosted-2026-10-23/`. The backend runner is
  `apps/sentinel-lab/scripts/verify-exchange-remote-http.mjs` in backend PR #91.

**Remaining HOLD:** configure the QA relay and private test-access secrets in
the Cloudflare QA project's preview environment, redeploy, and run the same
checks with `EXCHANGE_QA_TRANSPORT=edge` using the actual Pages client IP.
Exercise the site switch with the backend still enabled, then close both.
Cloudflare's dashboard currently requires a separate sign-in, and browser control
requires this chat open in the desktop browser with the connected extension.
No customer-production release or public activation is authorized by these test
receipts. Broad machine access still has the default-Python 403 issue. Remaining
global/daily/lifetime provider ceilings and monitoring need hosted fixture checks;
their existing loopback cases are not hosted acceptance.
