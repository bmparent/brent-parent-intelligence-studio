# Pending Playground regression reconciliation — October 17, 2026

This isolated preparation starts from PR111 `fbfd3631d2caac5c274d83ccaf1e7cd0985399c8`. It ports only the local editor defects fixed and browser-verified in released PR117: outgoing-document autosave before import/restore, document-specific variations, awaited import/legacy account opening, gesture keyboard focus and narrow floating-toolbar placement. AI proposal, purchase, recovery, provider configuration, preview pins and original archives are preserved.

The new actual-hook tests and runtime focus/geometry test pass. TypeScript, all 110 pending-stack Playground tests and lint pass (one existing Wellway Fast Refresh warning). Test-generated catalog/manifest changes were discarded; they are not part of the patch. This prepared branch has not been published or browser-verified as a new integrated TEST candidate. No inference/count calls, payments, refunds, credentials or hosted changes were made.

## Reconciliation findings

- Backend main `34c3d21509dfa1017705244e0d42a6eb7bc7dff9` is already represented in PR78 `6f7a29350ed8837ba86ce5d26603bfd674ef2c0e`: a non-mutating merge simulation is clean and produces the identical PR78 tree `15f0673f49b19d87711ea0edde4a7ea6ec4e845d`. No guard cherry-pick is required.
- Frontend main `4b9c3a54708cc9b636316897b60f2ce724b93e53` merged wholesale into PR111 has 19 conflicts, including workflow, package scripts, entry UI and tests. Do not resolve by blindly choosing either side: released main intentionally removes paid entry points while the isolated TEST stack preserves them.
- PR111 and PR78 remain draft with unchanged remote heads. Their existing hosted TEST deployment pins and accepted TEST transaction evidence remain intact.

## Next bounded step

Review/publish this targeted patch as a child of PR111, then run exact integrated browser CI before advancing the isolated TEST candidate. This does not justify merging the broad stack to main or changing production flags. Human/device acceptance remains open; headless WebKit does not establish physical Safari acceptance.

Other remaining gates are external: settled count-fee evidence (prior cost CSV zero was inconclusive), funded signed-in model-quality acceptance, exact Stripe TEST endpoint acknowledgement via the authenticated dashboard, customer review and LIVE pricing/funding decisions. Preserve existing pessimistic count liability and do not repeat accepted TEST purchases/refunds. No new provider call is needed for this regression patch.

Production receipt: https://github.com/bmparent/brent-parent-intelligence-studio/pull/117 and https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39052566555 . Successful authoritative CI production verification is distinct from the optional extra terminal canonical HTTP probe, which returned 403 and was not retried.

The child CI carries the released three-engine/three-width browser harness, deterministic starter-focus/frame sampling fixes, and context-wide no-provider/no-cloud-write guard. The sole guard difference is that retained TEST UI is permitted to exist; all network dispatch remains forbidden during local-flow checks. The existing mocked AI proposal UI suite remains separate. Production deployment remains conditioned on push to main, and hosted TEST publication remains manually dispatched with unchanged pins.
