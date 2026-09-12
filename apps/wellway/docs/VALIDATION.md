# Validation and limits

## Completed

- Production TypeScript compilation and Vite/standalone builds.
- Ten data tests: missing-data averages, source precedence, idempotent ingestion, quoted CSV parsing, invalid dates/units/values, same-day check-in replacement, fictional time advancement, advisor approval, disconnect history preservation, and backup schema validation.
- Full DOM integration: check-in → source inspection/table → plan editing/completion → advisor draft editing/approval → sample import/disconnect → CSV preview/cancel/commit with an invalid row held out → malformed and valid backup restore → guided answer → tour dismissal → persisted reload.
- The test found and fixed an advisor editing issue: clearing a draft now leaves it blank and disables approval instead of restoring the original text.
- The chart measures its available width and uses a corresponding SVG viewBox so mobile labels do not shrink with a desktop-sized chart.
- The official wordmark is embedded in both desktop and mobile interfaces; all required fonts are local.
- Local server checks passed for static response, unconfigured-AI behavior, origin rejection, and path confinement. No live API request was made.
- The repository ESLint rules report zero errors and one advisory warning about co-locating the provider and its hook for Fast Refresh.

## Browser and visual acceptance remain outstanding

The built-in Cloud Browser rejected the local loopback URL and then explicitly blocked the local-file URL. No alternate browser surface or navigation workaround was used. DOM tests were used as a non-browser verification path. They do not establish pointer/touch behavior, layout fidelity, mobile rendering, or accessibility conformance.

A non-browser HTML layout proof was inspected, but its renderer does not faithfully support the app's screen CSS. It is not a browser screenshot and is not approved as a gallery thumbnail. No claim of browser-verified visual fidelity is made.

Before making the public gallery entry live, open the standalone app in Chrome, Safari, and a mobile browser; check 1536×1024, 1024×768, 390×844, 360×800, and 200% text zoom. Confirm readable charts, no horizontal overflow, keyboard focus, modal dismissal, check-in persistence, CSV preview/confirmation, backup download/restore, advisor propagation, and reduced motion. Capture the real Today screen for the gallery's full image and thumbnail.

## Live systems

No live AI call, real provider connection, user authentication, patient dataset, or production cloud deployment was used. The optional OpenAI adapter is implemented but still needs account-specific live evaluation. Local guided answers and advisor drafts are explicitly labeled as rule-based demonstrations.
