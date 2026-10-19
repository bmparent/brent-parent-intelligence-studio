# Accepted tutorial: isolated rehearsal update

This operational branch updates only the dedicated disabled Pages Preview after PR128's complete exact-source CI succeeds. It bases on the previously successful operational PR127; it does not merge the tutorial into main, alter PR125 or publish to eidos-works.com.

The new source lock preserves the new GitHub artifact's actual producer merge commit, reviewed head, complete equal source tree, job/run/attempt, digest and byte size. It also requires the four successful exact-candidate checks, the eight-file accepted source change and the unchanged Functions tree. The original recovery guard and original artifact locks remain unchanged. The source checker is pure and cannot deploy.

The payload takes static files from that new verified CI artifact. It reuses only the four hash-pinned retained overlay members, including the byte-identical compiled worker. Reuse is valid because the Functions tree remains 842b305a5eb9a4644fa32aa22e969574cce20cbd. The inventory distinguishes new CI static bytes from the unchanged overlay; it does not relabel the original artifact.

Before upload, provider readback must prove account ae4f6116c302b50dd1efe0e6a65caaf9, project eidosworks-playground-rehearsal-20261017, branch rehearsal-disabled, no custom domains, exact disabled configuration, no unexpected resource bindings and exact known successful predecessor a8158d15-afbb-4da3-ae48-3d7dacfd22e7. Pending, unknown or duplicate attempts fail closed. The same Actions concurrency group serializes this and the original upload workflow. A failed or uncertain upload must be reconciled before another attempt.

Post-upload acceptance requires the new provider-issued Preview deployment, correct branch alias, unchanged configuration/Production identity, exact new entry-asset hashes, backend f16bd3a and bundle 9c214c5, all readiness flags false, empty GA and disabled-route/foreign-origin failures through the real hosted relay. Browser acceptance then checks the actual new app separately. No account, AI, shop or mail flag is enabled.

## Validation

From repository root:

```
node --test scripts/test-rehearsal-pages.mjs scripts/test-rehearsal-update-predecessor.mjs scripts/test-rehearsal-update-runtime.mjs scripts/test-rehearsal-tutorial-source.mjs
```

The source tests use explicitly constructed negative controls. Deployment uses fresh authenticated GET-only GitHub metadata and hashes the complete actual artifact. Local fixtures do not substitute for that readback.

Official Wrangler 4.151.1 is installed outside the checkout with the retained successful deployment lockfile. Upload uses --no-bundle so compiled worker bytes are preserved, the fixed project/branch and the actual new producer commit. Actions permissions remain contents/read and actions/read. Only existing repository deployment secrets are used, after the source and safety checks pass.

## Rollback

Keep the original 274-member payload, a8158d15 immutable deployment and all new receipts. Do not delete either deployment, change the database, enable paid flags or revoke the reused project-wide bypass. If the new branch deployment fails acceptance, stop new operations and reconcile its provider status. The original immutable frontend remains available for manual comparison. Restoring the branch requires a separately recorded upload of the original exact payload after checking the now-current predecessor and original source/artifact identity; do not rerun either upload workflow blindly or change a lock to make it pass. This branch deliberately offers no force/retry or automatic rollback path.

TEST accounts/commerce require a distinct owner-approved stage. Existing TEST challenge and mail restrictions are not loosened here. No new inference budget, persistent access, LIVE price or production release is granted.
