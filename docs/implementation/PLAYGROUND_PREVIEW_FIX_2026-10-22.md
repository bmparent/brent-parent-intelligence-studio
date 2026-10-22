# Playground preview and misleading recovery warnings — October 22, 2026

Brent reported the walkthrough appearing inside his design, with an apparent
device-saving warning. On the canonical isolated preview, the outer editor held
his project and showed a confirmed device-save status. Its canvas had navigated
to `/playground/#contact`, where a second Playground start screen attempted to
read storage inside an opaque-origin sandbox. The same saved project reopened
in a separate ordinary tab. The actual tutorial dialog was not open.

A normal contact-link click reproduced the nested application. The deployed
application CSP disallows inline scripts; the `srcdoc` preview inherited it.
Consequently the preview runtime, including selection and link interception,
never initialized. Earlier Vite browser acceptance did not enforce the deployed
header. This invalidates an inference of hosted canvas readiness from that
earlier local browser pass; the historical receipts retain their stated scope.

## Correction

- Retain the public application CSP unchanged. A dedicated Pages Function serves
  an empty preview shell with a fresh per-response script nonce, opaque-origin
  sandbox, no network/forms/workers/child frames, noindex and private/no-store.
  It reads no request body, account, cookie, project, provider or database.
- The owning editor sends the existing local HTML only through the matching
  frame window and random channel. The shell opens once, preserves exact script
  bytes, rejects external scripts, and applies the nonce without eval. The
  existing validated project/runtime message boundary remains in place.
- Both the editor canvas and frozen Finish review use the shell. Old frozen
  packages retain their actual stored script bytes, hashes and download bytes;
  they are not regenerated with the current renderer to make a preview work.
- A shell-level link guard prevents navigation even if the project runtime
  fails. Frame failures offer a scoped reload while keeping the editor,
  document, local save target and Undo history mounted. Reload waits for the
  runtime handshake before sending current content/selection again.
- Vite browser acceptance now uses the actual application CSP and the actual
  frame response handler. Controlled account fixtures serve the same handler.
  A new three-engine/three-width regression exercises a failed load and retry,
  editing/visitor contact links, direct text editing, tutorial dismissal,
  frozen runtime execution/isolation and device reopen. Existing full editor,
  gesture, persistence, media, account and immutable-export suites remain.

## Evidence and remaining boundary

Local typecheck, build, lint (zero errors; one existing Wellway Fast Refresh
warning), all 179 Playground tests, focused runtime/frame tests, Pages Functions
build and prerender verification pass. The frame tests check fresh nonces,
opaque/no-network policy, exact regenerated source, one-time parent/channel
authorization and original script bytes. The unchanged standalone renderer and
archive parity tests pass.

The container's Vite wildcard bind encounters the recorded
`uv_interface_addresses` environment error, and the connected browser cannot
resolve its local development host. New rendered acceptance therefore belongs
to exact-source CI and the subsequent hosted preview, not an invented local
browser result. Their final receipts are recorded on frontend PR139.

This correction is based on frontend `6b2559c` and retains backend PR90
`77dc718255317a24338fd8a82a60be2a8f6651bf` and the existing isolated database.
Production remains on site `53c25ba` / backend `d01920b`; no account, project,
history, archive, entitlement, schema, credential or feature flag is changed.
Paid AI, new LIVE commerce, external cloud integrations and new editor features
remain deferred. Physical-device/accessibility acceptance and the separate
paused DG owner login keep their existing scope.

## Interrupted verification follow-through

The first current-source editor run, `39854491459`, passed the failed-frame
recovery check at all nine engine/width combinations and the entire new frame
flow at 1440px in all three engines. Its new 390px/320px frame cases attempted
to click the collapsed navigation before opening its Menu control. The other
required editor sub-suites passed; later full-site stages were skipped after
the frame suite failed. This is retained as failed acceptance, not a pass.

The follow-through opens the actual navigation toggle when visible before
clicking the same contact link in editing, visitor Preview and frozen review.
All three engines, widths, isolation, reload, save/reopen and runtime-error
assertions remain; header selection is now explicitly checked as well.

Current public main `a76583d7ba195c2e22715552c1c858289f1d5f5c` adds the
independent Agent Exchange pilot. Merge it into this held candidate, retaining
both acceptance entries and every quality suite. Backend `77dc718` is unchanged.
Final combined-source CI, hosted deployment identity and browser observations
are recorded on PR139; no production release is inferred from this merge.
