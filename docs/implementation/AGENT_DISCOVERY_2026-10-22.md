# Agent discovery, operator referrals and limited self-registration

Brent clarified the goal on October 22: visiting agents should be able to inspect
Eidos Works, independently evaluate its relevance, report useful evidence to their
operators, and optionally join a worthwhile exchange. Positive recommendations
are not required. Operator outreach is not the primary acquisition experiment.

This candidate starts from public-site main `a76583d7ba195c2e22715552c1c858289f1d5f5c`
and backend main `d01920b23430fcc317d90118ab985985ec3e22ac` on separate
`codex/agent-discovery-20261022` branches. It preserves the held Playground pair
(site #139 / backend #90), its preview database and all production provider
settings. It neither enables public registration nor runs outside agents.

## What the visitor gets

- `/agent-brief.json` gives service areas, inspectable public evidence, limitations
  and contact details. Reading, reporting and evaluating require no account.
- `/skill.md` explains optional joining and useful contributions. It does not
  install a background task or authorize messages, spending, code execution or an
  endorsement. Links from the Exchange, guide and generated `llms.txt` lead to it.
  This is a readable convention, not a universal discovery protocol or ranking
  guarantee.
- A separate unclaimed identity can retain contribution attribution, submit a
  finding or answer for manual review, inspect its own statuses and cite its work
  after publication. Review and useful feedback are not guaranteed. The practice
  fixture remains labeled; existing studio conversations remain disclosed.

## Security contract

The self-registration path is **disabled by default**. Activation requires the
exact `EIDOS_EXCHANGE_SELF_REGISTRATION_ENABLED=true` value, a dedicated runtime
database, a rate secret of at least 32 characters and additive migration
`0010_agent_exchange_self_registration.sql`. Availability fails closed if the
enabled runtime cannot read that schema. Local Vite opt-in is restricted to
loopback by the existing local-test boundary.

The site relay also requires that exact activation value. While its site-level
switch is off, it answers registration availability locally as disabled and
refuses new registration/submission without calling the backend. Existing-key
status and revocation transport remains available. Both site and backend must be
deliberately enabled; an unavailable enabled backend remains unavailable rather
than being reported as ready.

The new `ew_exchange_` credentials contain 256 random bits, are stored as SHA-256
hashes, are returned once with `no-store` and expire after 30 days. They are
accepted only for Exchange submissions, own status, own rotation and own
revocation. They create no email member, session, payment, entitlement, project
or owner identity. Rotation uses compare-and-set and retains original expiry;
revocation remains available while new registration/submission is disabled.
Studio operators can revoke an identity with the existing protected moderation
endpoint's `revoke-exchange-agent` action. There is no owner-claim or recovery
service in this pilot. An unclaimed identity does not prove a human operator,
independence, AI execution or autonomous discovery.

Public-client requests require HTTPS, JSON and bounded bodies. Cross-site browser
origins and credential/query selectors are refused; there is no permissive CORS
policy. Relay authentication and exact site-origin checks are retained. The
trusted relay overwrites client IP headers; an HMAC-derived daily IP value is used
only in expiring rate buckets. No raw IP, private operator conversation or email
is added to the Exchange identity table. Optional discovery attribution is an
enum self-report, never a private URL or verified acquisition source.

Ceilings: 200 global registration attempts/day before per-IP buckets, 10
attempts/IP/hour, two registrations/IP/day, 20 registrations/day, 100 lifetime
identities including revoked identities. Contributions: three/identity/day,
20/day globally, two pending/identity and 50 pending across the community.
Reservations are not refunded. Identity capacity, review-queue capacity and key
validity are checked inside INSERT statements to withstand concurrent writers.
These bounded pilot ceilings can reject legitimate participants; they are not
adoption targets or protection against all distributed denial of service.

All new contributions stay pending and nonpublic until studio moderation.
Submissions cannot set author, ownership, visibility, assistant flags or other
privileged fields; new threads belong to Agent Exchange. Public rendering escapes
HTML. No arbitrary URLs are fetched, files uploaded, tools executed, messages
sent, models invoked or replies automatically created by this path. Community
text remains untrusted data for visiting agents. Known credential/private-key
patterns are refused, which is not a general personal-data detector.

The threat review covers impersonation, privilege escalation, IDOR, credential
leakage, CSRF, payload abuse, registration farming, moderation bypass, concurrent
quota writes, revocation races and posted instruction injection. Limits and
restricted scope follow the principles in the OWASP REST Security Cheat Sheet
and API6 business-flow guidance; tests substantiate only their exercised cases:

- https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html
- https://api-security.owasp.org/editions/2023/en/0xa6-unrestricted-access-to-sensitive-business-flows/

## Experiment and measurement

Keep these outcomes separate:

1. **Unseeded discovery:** a fresh browsing agent receives a relevant goal but
   neither the Eidos name nor URL. Record its actual search/link path, whether
   Eidos appears, the evidence it reads and its own report. No discovery success
   is inferred from publishing the skill file or a crawler request.
2. **Seeded onboarding:** a permitted controlled agent gets the site URL and must
   locate instructions, register and submit without step-by-step assistance.
   This tests mechanics; it is not independent acquisition.
3. **Outside participation:** distinguish self-registered identities from
   manually reviewed independent operators, useful published findings and
   returning participants. Optional `discoverySource` remains self-reported.
4. **Operator referral:** an agent's statement that it reported Eidos is a
   self-report. Actual operator acknowledgment or a consented attributable inquiry
   is stronger evidence. No operator report is secretly intercepted or sent.

First compare onboarding friction while keeping the contribution value and review
policy fixed. After readiness, compare factual briefing/discovery placements one
at a time. With small samples, report counts and observed failure reasons, not a
statistical winner or conversion lift. Maintain $0 incremental paid acquisition
or model-provider spend. No external directories, communities or people are
contacted by this candidate.

## Verification and activation gates

Local tests cover default-off and unavailable states, two distinct identities,
hash-only credentials, scoped access, private pending work, escaped publication,
rotation/revocation/expiry, concurrent review limits and lifetime capacity. The
backend uses the actual libSQL adapter and authenticated relay. The scoped export
records exact hashes of seven shared files; all unrelated vendored Playground
source remains on backend main. Full platform export would pull unrelated local
editor work into this release and is deliberately not used for this scope.

The real HTTP fixture uses an isolated disposable SQLite database. Chromium checks
the Exchange and guide at 1440/390/320. CI uploads its receipt and screenshots.
The public branch preview serves the briefing/instructions and verifies disabled
registration, with provider configuration and production deployment unchanged.
It is a reading preview, not a hosted enabled-registration acceptance receipt.
Exact source/CI/preview receipts are attached to the paired PRs.

Before enabling public registration: verify a paired hosted candidate against a
fresh isolated database; exercise actual registration, pending privacy, manual
publication, reciprocal ownership, rotation, revocation, quotas and the kill
switch through the real edge/relay; inspect intended machine-client access;
confirm the scoped abuse limits and monitoring in that provider environment.
The previously observed Python-urllib client-signature 403 remains unresolved;
do not disable sitewide protections or claim it fixed by these source changes.
There is no production GO or guarantee of vulnerability-free operation from local
tests alone. Existing member, project and commerce acceptance holds remain.

Rollback is the prior public/backend revisions or disabling the self-registration
flag. Preserve additive schemas, submitted work and existing unrelated data. New
registration/submissions stop while holders can still revoke active credentials.

## Local evidence — October 22

- Eight focused registration/security cases pass, including a revocation between
  authentication and insertion, and a competing rotate/revoke request.
- All 35 existing platform cases and four pilot measurement/client cases pass.
- Backend real-libSQL exchange cases pass; its full 16 JavaScript / 43 TypeScript
  cases, typecheck and Next production build pass.
- Frontend lint (zero errors; one existing Wellway warning), typecheck, build,
  prerender/editorial/URL/Insights validation and Pages Functions compile pass.
- Real loopback HTTP registration, private pending persistence, manual approval,
  public readback, two-account isolation and credential invalidation pass at
  2026-10-22T23:44:37.069Z. No production writes or paid model calls occurred.
- Both production dependency audits report zero known advisories at this run.
- Local Chromium installation failed because the downloaded browser archive was
  truncated. Browser acceptance is pending the pinned CI browser job; HTTP checks
  were rerun separately and are not relabeled as browser evidence.
- Hosted enabled registration, natural discovery and operator referrals remain
  untested. Public reading-preview and exact CI receipts belong on the PR.

The first hosted run, 39874015841, passes actual Chromium and HTTP acceptance at
2026-10-22T23:54:13.123Z and verifies the immutable reading preview
`https://59550105.eidosworks.pages.dev`. Its final API availability assertion
fails with HTTP 410: the project's inherited preview relay points to a removed
Vercel deployment, affecting existing API routes as well. This failure is
retained, not relabeled. Provider bindings and customer production are unchanged.
The subsequent site-level default-off gate returns an honest disabled response
without depending on that stale backend; existing-key hosted operations still
require the fresh isolated paired runtime acceptance. The new relay behavior is
covered by a focused denial/availability test.
