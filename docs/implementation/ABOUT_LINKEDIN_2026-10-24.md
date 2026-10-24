# About LinkedIn link — October 24, 2026

Brent requested adding his personal LinkedIn profile by his portrait so visitors
can identify and interact with him. This frontend-only change starts from public
main `6a1c50cfc3a8fd951432f2ca87fc0512d78f3615` on
`codex/about-linkedin-20261024`. Existing feature and editorial PRs are separate.

## Scope and provenance

The About profile section includes “Connect with Brent on LinkedIn” beside
“Discuss a project,” using the existing responsive action group and secondary
button styles. The public LinkedIn profile
`https://www.linkedin.com/in/brent-parent-9115771b/` identifies Brent Parent,
Eidos Works, Data Graphics and Greater Orlando, matching the studio owner.
The link opens a new tab with `noopener noreferrer`; screen-reader text announces
that behavior and the decorative arrow is hidden from assistive technology.

The existing About metadata and profile source are authoritative for this
change. `docs/implementation/current-state.md` is absent from this checkout;
the current acceptance tracker, latest dated record and release workflow were
read instead. No backend, identity, provider, billing or account change applies.

## Validation and release

Local lint (zero errors; one existing Wellway Fast Refresh warning), production
build/typecheck, prerender, editorial (35 routes), URL and Pages Functions
checks pass. Inspect the resulting profile section in the available browser
and verify the exact link destination. Exact candidate CI, merged
source and production deployment/readback evidence are retained on the PR;
local checks alone do not establish publication or physical-device acceptance.

Rollback is a revert of this scoped change through the existing main release
workflow, preserving the previous profile and contact action. No data migration
is involved.
