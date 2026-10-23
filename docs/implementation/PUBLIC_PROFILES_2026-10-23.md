# Public profile repair — October 23, 2026

Brent reported that public-profile links show “That page does not exist” and
requested public work, posts and replies. The observed canonical request
`/members/bmparent` returned 308 `Location: /private-app`; following it delivered
the global 404 UI. The `/members/*` rewrite targeted `/private-app.html`, which
Pages cleans to another URL. Its target now uses the clean `/private-app` path
while retaining the requested profile URL.

The previous profile component only searched the eight-result member directory
and displayed an account type/date. The exact-profile directory read now returns
only an enabled member's public identity and independently paginated published
posts/replies. Activity matches immutable owner IDs, never display-name text.
Replies also require a published parent. New member profile links come from the
server's identity join in community lists, static thread bylines and refreshed
replies. Guest display names do not acquire an account link.

“Shared work & ideas” means work the member chose to describe in a public
community post. Private Playground documents, saved reading, email, sessions,
keys, inbox and ownership IDs are excluded. This repair does not create a
project-publishing permission or expose anyone's saved files. Reading public
activity remains available when new sign-in or email delivery is disabled.

## Candidate and verification

- Site base: public main `1dc832378b9c00272f88d3c9247a3d95fc72a1a5`.
- Backend base: main `d01920b`; exact full SHA is on the paired repair PR.
- Branches: site `fix/public-profiles-20261023`, backend
  `fix/works-public-profiles-20261023`.
- Four changed shared modules are exported identically to the backend. Broader
  preexisting Playground/vendor drift remains outside this isolated pair;
  export-generated unrelated changes were removed before validation.
- Local: fresh lockfile installs, site lint (existing Wellway warning only),
  37 platform cases including profile ownership/privacy/pagination, site
  TypeScript/client/SSR build, 35-route prerender/editorial checks, source/built
  Insights validation, URL checks and Functions compilation pass. Backend
  typecheck, existing tests/build and a new real-libSQL authenticated relay
  profile/disabled-account check pass.
- Local browser connection returned a Chat API HTTP 401 before navigation.
  Cloud Browser reproduced the public community, but its local preview URL
  was blocked by the browser client. Local Wrangler cannot start because the
  runtime denies interface enumeration. Rendered profile and real Pages-router
  checks therefore run in existing isolated GitHub browser workflows. Their
  exact results and screenshots must be read before release is claimed.

## Release and rollback

Release the compatible backend first and verify the actual production relay
target before the frontend. No migration, provider model/mail/payment call,
account flag, new permission, budget increase or external message is needed.
Preserve the separate held Playground, Agent discovery and resident-host
candidates. Record the exact paired deployments and live direct-link/refresh
observations on the PRs. A member that exists only in the isolated acceptance
database does not thereby exist in production.

Rollback restores the preceding Pages deployment and relay target, plus the
backend baseline as needed. Accounts, posts, replies, projects and entitlements
remain intact; there are no data deletions or reverse migrations.
