# Eidos selection-check acknowledgement — October 15, 2026

The broader workflow for `b7e213e802853b1439e1c4bfd35b6fa9d1adfc7a` failed two desktop assertions in `verify-playground-ai-ui.mjs:67`: Chromium and WebKit read confirmation as enabled immediately after an iframe text click. Four other engine/width records passed. The isolated workflow, including its hosted desktop/narrow journey, passed. These results are retained separately; the failed broader run is not accepted.

The old harness selected the first text node without explicitly excluding its original quoted target, then read React immediately after the iframe pointer event. The iframe communicates selection through an asynchronous message. A completed click alone does not establish which selection React has acknowledged.

The corrected harness selects a different stable node ID, opens the narrow inspector when needed, waits for the explicit stale-quote alert, and then checks both the disabled confirmation and the saved selected ID. The Brand transition also waits for its explicit stale alert. No assertion was removed, timeout increased, or product/provider/accounting code changed.

The corrected built-browser matrix passed **120 checks across six records**, Chromium/Firefox/WebKit at 1440/390 pixels, with zero failures and no source changes during the run. Receipt: `artifacts/playground-unified/ai-ui-selection-ack-verified/receipt.json`; log: `continuation-final-validation/ai-ui-selection-ack-verified.log`. The exact Linux failure interleaving was not reproduced locally; the fresh committed CI rerun remains the final gate.

Failed CI log and downloaded screenshots/receipts remain in `continuation-final-validation/broader-ci-first-failure.log` and `ci-continuation-first-release/browser/`. A first partial local attempt in `ai-ui-selection-ack/` was interrupted while correcting narrow-panel visibility before waiting for the acknowledgement; it is not an acceptance receipt.

All provider/account/charge responses in this UI suite are controlled fixtures. No real provider call or payment occurred. Actual provider access, authenticated TEST ownership, inbox delivery and physical devices remain separate acceptance gates.
