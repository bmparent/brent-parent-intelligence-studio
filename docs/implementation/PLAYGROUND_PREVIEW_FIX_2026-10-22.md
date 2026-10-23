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

The next run, `39868354375`, completed the frame flow at seven of nine
engine/width combinations. Chromium/WebKit at 320px revealed a real editor
overlap: the floating selected-container toolbar covered the header's Menu
button. Its retained failure screenshots show the obstruction; this is not
accepted as a passing mobile result. Toolbar placement now avoids the sticky
header, with a focused geometry regression and an actual menu-overlap browser
assertion. Frozen isolation is checked on the explicitly identified frozen
frame. All other required editor sub-suites passed in that failed run; the
final combined-source run must still pass before closing verification.

Template run `39868354319` exhausted its unchanged 20-minute limit while
downloading browser dependencies from the runner's Azure Ubuntu mirror; no
browser assertion ran. Use the existing Wellway primary-archive correction
for this job too, retaining signed packages, the security archive, Ubuntu
22.04, pinned Playwright 1.58.0, all three engines and every assertion.

The toolbar follow-up refreshes the exact backend vendor copies and the separate
18-file delivery manifest at `49a53b2ea61f46d8a6ba61ec350c3a5c4d1d9eec`.
Both shared inventories match. Standalone page/composition runtime bytes are
unchanged; the updated literal is editor-only. Backend local typecheck, full
JavaScript/181-TypeScript-test suites and production build pass. The acceptance
preview retains its existing isolated database, accounts and TEST-only flags;
only the source attestation is advanced. Final hosted/CI receipts remain on the
paired PRs, separate from earlier dated account/provider acceptance.

That backend revision is READY as `dpl_5pcFyLyuDSfB7ZbvfiomiSQfm7aX` on the
existing acceptance branch. The frontend's exact-revision contract and preview
relay now select this immutable backend; no production target was selected.

The runner log also identifies `file:/etc/apt/apt-mirrors.txt`: editing only
`sources.list` did not change its selected Azure mirror. GitHub's [image
configuration](https://github.com/actions/runner-images/blob/main/images/ubuntu/scripts/build/configure-apt-sources.sh)
uses a priority mirror list. The scoped browser jobs now share a helper that
replaces only the Azure endpoint in direct, mirror-list and deb822 source files.
Repository suites, existing priorities/security fallback, signed-package checks,
pinned browser versions, time limits and required assertions are retained.
This follow-through changes CI setup only; the deployed application bytes and
backend revision above are unchanged. Exact final workflow receipts remain on
PR139, separate from the observed 320px repair on deployment `30cd6f11`.

## Final editor check follow-through

Run `39872676296` completed with all nine complete frame cases passing, including
the 320px Menu obstruction regression. Its separate controlled AI review suite
timed out at the selection acknowledgement after a manually mapped pointer
click in all nine engine/width cases. Later full-site stages were skipped; this
run is failed acceptance and does not authorize production.

The AI harness now clicks the different text element through its actionable
iframe locator, which performs scrolling, stability and obstruction checks
together. It retains the exact selected-node, stale-quote, disabled-confirmation
and saved-document assertions, every engine/width and the original timeout.
The editor workflow runs this regression first so a failure is reported before
the long editor matrix; every existing release check remains required. This
follow-through changes verification only. Application/runtime bytes, the paired
backend, provider settings, saved projects and frozen archives are unchanged.
Fresh CI must establish whether the locator correction resolves the failure;
its exact receipt and any remaining defects belong to PR139.
