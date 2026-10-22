# Playground release integration — October 22, 2026

The candidate combines held frontend `c095ee888fb76163cad6ea11d373ba566bad569d`
with public production `53c25badc04bccc89bcc8d8d31018b396a3121fe`.
It pairs with [backend PR90](https://github.com/bmparent/eidos/pull/90), exact
`77dc718255317a24338fd8a82a60be2a8f6651bf`, whose full CI passed in
[39833047377](https://github.com/bmparent/eidos/actions/runs/39833047377).
The source uses the patched toolchain and retains production's Wellway source
and matching generated demonstration; unrelated held Wellway refactoring stays
preserved on its original branch.

## Corrections and verification

- Both Miniflare runtime fixtures use the supplied V4 converter. The OAuth test
  still requires both separate secure cookies and the exact manual redirect.
- The reset component and its private metadata already existed, but
  `/account/reset` was absent from the static build list. It now has its own
  built page. The existing build/HTTP index verifier additionally checks its
  HTTP 200, noindex, no-referrer and no-store boundaries.
- All current local site regression/build checks pass on the integrated source;
  the reset-route addition receives its own built/HTTP check before upload.
  Shared source passes 108 files and the separate 18-file delivery graph.
- The reset build, seven indexing regressions, built indexing policy and seven
  isolated-preview guards pass. The local Wrangler HTTP server is blocked by
  `uv_interface_addresses` in this execution environment. Both the editor and
  guarded preview workflows run the real Pages HTTP/privacy check on their
  Ubuntu runner; no local HTTP pass is claimed and no routing assertion is removed.
- The first real Pages HTTP receipt in run 39834589095 confirms reset HTTP 200,
  noindex and no-store, with `strict-origin-when-cross-origin, no-referrer`.
  Its strict single-value verifier was a false failure. Verification now applies
  the W3C last-recognized-policy rule, including an adversarial regression that
  rejects a later unsafe override. Application headers and protections are unchanged.
- Template-commerce run 39834589092 could not install pinned Playwright 1.58.0
  on the floating Ubuntu 26.04 image. Its job now uses Ubuntu 22.04, matching the
  other browser gates; all three engines and every assertion remain required.
- The backend retains Next.js 16.4.2/sharp 0.35.5 with zero known advisories.
  Historical AI tests use their reviewed fixture clock; the actual rate-card
  expiry and all no-I/O budget/expiry protections remain unchanged.

## Selected isolated preview

The existing backend acceptance branch retains its preview-only
`EIDOS_PG_INTEGRATION` database selector. Only ordinary source-attestation
metadata was updated; credentials, database bindings and feature gates were
retained. Deployment `dpl_G8PtNgh7LLG2pBtpxVN4yEVGM97R` is READY at the exact
backend revision above. The canonical frontend acceptance origin remains
`https://eidosworks-test-20260923.pages.dev`, with Google/account redirects tied
to that existing origin. The guarded preview workflow checks source parity and
controlled account flows before accessing upload credentials and changes only
the preview relay URL. Production configuration is fingerprinted read-only.

## Acceptance boundary

The older dated two-member isolation, cloud reopen, quota/history and October 21
private TEST commerce receipts remain preserved. They are not silently repeated
or relabeled as observations of this new source. The existing @bmp session and
two saved TEST projects were observed in the browser before refreshing this pair.

Password-reset submission and invalidation of old sessions require the actual
user-completed credential flow. Hosted readback of the new frontend, remaining
device/accessibility checks and accepted production scope remain open until
their dated observations are added to this record or the PR.
The separate DG/owner-console authentication remains intentionally paused.
No paid AI, new LIVE commerce, Snapshot, increased allowance or production
account-resume activation is claimed or configured here. Preserve all member,
project/history, archive, entitlement and additive-schema records on rollback.

## Recovery follow-through and browser dependency installation

The requested recovery email was observed at 19:38:13Z on October 22, and its
exact canonical isolated-preview fragment link opened the new-password form.
After the user reported completing reset, reloading the previously authenticated
account tab returned the anonymous account form. That old browser session is
therefore no longer accepted. Password sign-in and the post-reset project list
remain pending the user's password entry; no password is read or stored in this
record. The reset and observations concern the deployed pair above, not a new
production release.

Wellway run 39835580117 and same-source retry job 120031490610 both exhausted
the 15-minute job limit while downloading packages from the runner's
`azure.archive.ubuntu.com` mirror, before browser assertions could run. The job
now selects Ubuntu's primary `archive.ubuntu.com` over HTTPS in the Ubuntu 22.04
APT source list before Playwright installs its dependencies. The security
archive, signed-package verification, pinned Playwright 1.58.2, all three
engines, every browser assertion and the job time limit are retained. This is
an installer correction; a successful fresh hosted run is still required.
Ubuntu documents the primary archive and pre-24.04 source-list location at
https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/package-archive/.

The separate security release is live: site PR138 at `53c25ba` passed production
upload/provider/configuration and canonical-domain checks in
[39829450614](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39829450614).
Backend PR89 is deployed at `d01920b`; fresh health returns 200 and anonymous
member access returns 401 with no-store/nosniff/HSTS. Those security receipts do
not constitute activation of the held Playground runtime.
