# Buyer-local derivative peer review — 2026-10-13

The source and static output review passed for the source module hashes recorded in `actual-base-subsets.json`. This review makes no release, ownership or entitlement decision.

## Executed evidence

Run from the repository root:

```text
node --import tsx artifacts/showcase/buyer-review/review-actual-bases.mjs
node --import tsx --test scripts/test-buyer-derivative.ts
```

- All four actual frozen developer archive identities passed the production pin verifier.
- All 64 Home-required page subsets passed with optional native modules and motion disabled.
- 3,728 local references had no missing file or fragment target.
- 256 retained HTML previews generated in memory with all CSS, script, image and CSS URL dependencies present.
- 448 checks found no disabled native module controls left in retained HTML.
- Every variant preserved original LICENSE.txt, SUPPORT.md, ASSETS.md, INSTALL.md and script.js bytes. The original package manifest was retained as BASE_PACKAGE_MANIFEST.json. Original archive hashes remained unchanged.
- Seven focused derivative unit tests passed. The log is `unit-test-output.txt`.
- No raw paid source, archive, derivative output, customer data or credentials were written by this review helper.

## Resolved source findings

1. Clear or source replacement during asynchronous work previously could admit a late result. The component now increments a local operation generation for metadata, archive, build, Clear and unmount. Async completions require both the current generation/alive state and the parent configuration revision. Preview freshness also requires its recorded generation/revision, and downloads require the captured completion guard.
2. Native local links previously lost their query or fragment in the private preview. The bridge now carries a validated `{ file, search, hash }` destination, retains search on same-page fragment links, adapts query reads only within srcDoc, and scrolls to the actual fragment target. Exported original family handlers remain unchanged.

No additional material transform, immutable-parent, licensing or source-disclosure issue was found in the reviewed actual-family paths.

## Acceptance limits

This is an in-memory static output and source review. The browser QA agent separately owns delayed asynchronous Clear/source-replacement regression checks and actual native inquiry/fragment preview/export parity. These browser gates are not marked passed by this receipt. This review does not prove sent email, provider hosting, native builder support, physical-device behavior, payment, entitlement or commercial release. Existing release boundaries remain held.
