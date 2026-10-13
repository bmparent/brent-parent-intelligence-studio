# Eidos Works security.txt — 2026-10-13

Brent requested configuring security.txt for `eidos-works.com` on Cloudflare.
The canonical endpoint returned HTTP 404 with an HTML error page. Cloudflare's
dashboard rejected Google sign-in with “Unable to sign in. Try again or use your
email and password.” No dashboard setting was changed.

## Scoped implementation

Branch `codex/security-txt-20261013` starts at public main
`fb74c4cf00defef23ce3ee96af4e51c350c3e807`. Cloudflare Pages serves the UTF-8
static file `public/.well-known/security.txt`; `public/_headers` sets its plain
text content type and one-hour public cache lifetime. `/security.txt` redirects
permanently to the standard endpoint. The existing global `nosniff` header applies.

The reporting contact is the published `hello@eidos-works.com` address, confirmed
in the live contact page and site configuration. Preferred language is English;
the file expires on October 1, 2027 at 00:00 UTC and must be reviewed and renewed
before that date. No unverified security alias, encryption key, acknowledgment,
hiring page or disclosure-policy link is advertised. This work does not establish
an inbox-delivery test, bug-bounty program or permission for security testing.

## Validation and release

Validate the built file, expiry, canonical URI, headers and redirect, then run
the existing site build and applicable release checks. Exact candidate SHA, CI,
production deployment and live HTTP readback are recorded on the pull request.
Source preparation alone is not a claim that the endpoint is live.

The change contains no backend, account, payment, database or deployment-workflow
modification and does not merge or accept held Works account/template candidates.
Rollback is a revert of this scoped change, using the existing Pages pipeline;
the starting source/deployment remains the baseline above.

## References

- https://www.rfc-editor.org/rfc/rfc9116.html
- https://developers.cloudflare.com/security-center/infrastructure/security-file/
- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/pages/configuration/redirects/
