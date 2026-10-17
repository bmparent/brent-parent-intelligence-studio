# Stop waiting and late responses — October 15, 2026

The broader CI run for `4bce117514260a0280d8e554d9a42fc0f135704e` passed the repaired selection checks, then failed both WebKit viewports while waiting for the Stop waiting message. Product code previously relied on the network promise rejecting when aborted; a late response could instead replace the stopped state.

A deterministic fixture now holds a generation response and deliberately ignores its browser abort signal. The old built UI reproduced the failure in Chromium: its stopped message never appeared. The before receipt and log remain in `ai-ui-stop-late-before/` and `continuation-final-validation/ai-ui-stop-late-before.log`.

`AIAssist.tsx` now races local work against its own abort event, removes that listener after completion, and releases the local busy state independently of transport cancellation. Stop immediately records the unknown-action message/latch. Generation checks its captured signal before accepting a response, so a late response cannot clear the latch or expose a proposal. Only an explicit read of the existing action status resolves that uncertainty. This does not cancel upstream work, waive a charge or release a server reservation.

The final built-browser matrix passed **120 checks across three engines and two widths**, including an immediate enabled status control while the response was still held, delivery of that response after Stop, the preserved unknown latch, disabled repeat confirmation and one status read with no extra generation. No source changed during the run. Focused source/client tests passed 22 checks; focused ESLint and the build/typecheck passed. The server ledger, provider adapter, shared renderer and original paid archives did not change.

Receipts: `artifacts/playground-unified/ai-ui-stop-late-verified/receipt.json`, `continuation-final-validation/ai-ui-stop-late-verified.log`, `stop-late-source-tests.log`, and `stop-late-final-build.log`. Failed CI log and downloaded browser evidence remain in `broader-ci-second-failure.log` and `ci-continuation-second-release/browser/`.

All account/provider/charge responses in this regression are fixtures. Actual provider usage, authenticated TEST ownership, signed payment/inbox acceptance and physical devices remain unproven. The fresh committed CI run is the final hosted acceptance gate for this fix.
