# Retained Playground rehearsal upload

Owner: Complete Playground Release Work, BMP task 01a1518f-18dd-7532-b364-705f714f7a5e.

The dashboard's first-upload form did not expose a Preview branch selector, and supported browser upload requires an additional extension file-access grant. This helper uses existing repository Cloudflare credentials on a standard runner in the public repository. It creates no credentials or new paid resources and changes no live project.

The workflow is restricted to this repository's `ops/playground-rehearsal-deploy-20261018` branch. It reuses the original 274-member prepared payload from private draft release asset 655003699. Its ZIP hash and compiled worker hash are fixed. The original CI artifact is independently hash-checked with the recovered provenance guard, copied unchanged. That guard remains check-only; its historical proposed root origin is not relabeled as the actual hosted Preview origin.

The provider guard separately proves the actual dedicated account, project, `rehearsal-disabled` branch, October 1 runtime date, disabled flags/modes, secret binding types, empty frontend resource bindings, and unchanged dedicated Production configuration. Wrangler runs outside the repository so it cannot load the live project's configuration. `--no-bundle` retains the compiled worker bytes. Deployment metadata preserves the original synthetic build commit; the fresh source guard proves its complete tree equals reviewed PR126.

After upload, the workflow requires the provider-issued branch alias, exact backend source/bundle from the real Pages relay, matching entry asset hashes, disabled AI/checkout/delivery responses, and rejection of a foreign Origin. It refuses a second upload when an exact successful rehearsal already exists: inspect and reconcile first.

Run the pure configuration rejection tests from the repository root:

```sh
node --test scripts/test-rehearsal-pages.mjs
```

This proves only the disabled rehearsal. Two-account ownership, TEST checkout/webhook/mail/download/recovery/refund, paid Sol accounting and LIVE commercial approval remain separate gates. Tutorial PR125 is excluded. No tutorial publication, LIVE price, new API budget or paid feature activation is authorized here.
