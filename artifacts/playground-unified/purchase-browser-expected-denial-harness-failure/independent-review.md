# Independent purchase client review

The review covers exact snapshot/package acceptance, recovery without local browser data, account changes, delayed responses, and preservation of editable drafts. It does not establish a real payment, mail delivery, hosted acceptance, or physical-device acceptance.

## Findings and repairs

- Existing paid retrieval originally called new-checkout capabilities first. That would block a paid download when current merchant/catalog readiness failed. The client now checks the existing signed order directly. Recovery with checkout unavailable passed in Chromium at 1440 and 390 pixels.
- Checkout initially guarded only component mounting. Closing Finish left the component mounted, so a delayed reply could navigate after the draft or approval changed. The client now checks open state, draft identity/revision, approval, terms, and operation generation across awaits. Final rendered delayed-response checks are recorded in the adjacent receipt.
- Changing the capability owner originally retained the earlier owner's accepted/paid display. Owner changes now clear that state; recovery reauthorizes immediately before opening an editable copy.
- `PurchaseRecovery.tsx` collided with `purchaseRecovery.ts` on Windows. The browser loaded the helper instead of the component and rendered blank. The helper is now `purchaseRecoveryClient.ts`. The original browser error and screenshots are retained in `../purchase-browser-windows-import-failure/`.
- The browser and server initially generated different ZIP bytes from the exact same snapshot. Their project and snapshot hashes matched, but `script.js` differed because `pageRuntime.toString()` serialized compiler-specific output. The measured difference was 25,732 bytes in Vite and 26,820 bytes in the independent esbuild bundle. Both manifests and runtime sources are retained in `../purchase-browser-renderer-parity-failure/chromium/1440-deferred-checkout/`. The renderer now consumes canonical checked-in runtime strings; validation keeps the exact archive-hash check.

## Additional evidence

The actual production Next route module was invoked with plain Node and real in-memory SQLite by the backend reviewer. Its frozen ZIP rendered independently in Chromium at 1440 and 390 pixels with no JavaScript error, console warning/error, or network request. The mobile navigation opened and closed through its actual runtime. Evidence: `../compiled-server-runtime-before/receipt.json`. This confirmed runtime behavior while keeping the separate byte-parity failure visible.

The fixture harness blocks every unhandled API request and external URL. Its optional synthetic checkout document is fulfilled locally by Playwright; no request reaches Stripe. Google Fonts CSS is stubbed with an empty stylesheet, so screenshots use existing fallback fonts. IndexedDB reads inspect results; primary project creation, recovery, review, and cancellation use visible controls.

Final acceptance status comes from `receipt.json`, which also identifies the source hashes and browser engines. The earlier failed runs are not acceptance evidence and remain preserved.
