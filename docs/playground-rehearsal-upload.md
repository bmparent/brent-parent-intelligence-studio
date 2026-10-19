# Retained Playground rehearsal upload

Owner: Complete Playground Release Work, BMP task 01a1518f-18dd-7532-b364-705f714f7a5e.

The dashboard's first-upload form did not expose a Preview branch selector, and supported browser upload requires an additional extension file-access grant. This helper uses existing repository Cloudflare credentials on a standard runner in the public repository. It creates no credentials or new paid resources and changes no live project.

The workflow is restricted to this repository's `ops/playground-rehearsal-deploy-20261018` branch. The original prepared ZIP remains intact locally and in private draft asset 655003699 with its original checksum. GitHub's read-only workflow token cannot fetch that draft asset. Instead, 270 unchanged members come from the original CI artifact and four already-prepared overlay files (`_headers`, `_routes.json`, `_worker.js`, `robots.txt`) come from the small retained overlay archive in this PR. Every one of the 274 file hashes must match a checksum-pinned inventory of the original prepared ZIP. The original archives remain byte-for-byte unchanged; only their deployable members are assembled. No source is rebuilt or relabeled.

The original CI artifact is independently hash-checked with the recovered provenance guard, copied unchanged. That guard remains check-only; its historical proposed root origin is not relabeled as the actual hosted Preview origin. The overlay contains public application code and routing/indexing configuration, with no credentials or customer projects. This path grants no broader GitHub token permission and does not publish the private draft release.

The provider guard separately proves the actual dedicated account, project, `rehearsal-disabled` branch, October 1 runtime date, disabled flags/modes, secret binding types, empty frontend resource bindings, and unchanged dedicated Production configuration. Wrangler runs outside the repository so it cannot load the live project's configuration. `--no-bundle` retains the compiled worker bytes. Deployment metadata preserves the original synthetic build commit; the fresh source guard proves its complete tree equals reviewed PR126.

After upload, the workflow requires the provider-issued branch alias, exact backend source/bundle from the real Pages relay, matching entry asset hashes, disabled AI/checkout/delivery responses, and rejection of a foreign Origin. It refuses a second upload when an exact successful rehearsal already exists: inspect and reconcile first.

Run the pure configuration rejection tests from the repository root:

```sh
node --test scripts/test-rehearsal-pages.mjs
```

This proves only the disabled rehearsal. Two-account ownership, TEST checkout/webhook/mail/download/recovery/refund, paid Sol accounting and LIVE commercial approval remain separate gates. Tutorial PR125 is excluded. No tutorial publication, LIVE price, new API budget or paid feature activation is authorized here.
