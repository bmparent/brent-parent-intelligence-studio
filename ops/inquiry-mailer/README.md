# Private studio inquiry delivery

`worker.mjs` is the private Cloudflare Worker `eidos-works-inquiry-mailer`. Pages calls it through the `EIDOS_INQUIRY_MAILER` service binding. It has no public route, workers.dev URL, or preview URL. The existing Apps Script/webhook route remains supported when this binding is absent.

Configure the Worker with `EMAIL` (`send_email`), `STUDIO_TO`, `STUDIO_FROM`, and `INQUIRY_LIMIT` (rate-limit namespace 2090501, three requests per 60 seconds per visitor at each Cloudflare location). The email binding must restrict its destination to the verified studio inbox and its sender to `projects@eidos-works.com`. Keep the private destination in deployment configuration. Cloudflare currently permits free sending to an account's verified destination; this implementation never sends visitor confirmations or arbitrary recipients.

The Pages handler requires a same-origin form submission, validates fields, preserves its honeypot, and forwards the trusted Cloudflare visitor address. The private Worker bounds input to 12 KB, fixes sender and recipient, uses a structured email with the visitor's validated address only as Reply-To, and requires a provider message ID. The browser sees success only after that acknowledgement. Failures retain the prepared email fallback. No form contents or addresses are logged.

Run from the repository root:

```sh
node --import tsx --test scripts/test-inquiries.ts
npm run typecheck
npm run build:functions
```

Automated tests use a fake email binding. Deployed delivery has a separate receipt in `artifacts/release-20260905/inquiry-service-smoke.json`: the labeled preview submission was located in the configured Gmail inbox, with matching inquiry reference and passing SPF/DKIM. This confirms preview delivery; recheck the production path after release.

Deployment sequence: upload the Worker module with these bindings, explicitly disable workers.dev and preview URLs, add the Pages service binding, then redeploy Pages. Preserve existing Pages bindings. Do not enable general outbound email or a paid plan for this destination-only workflow.
