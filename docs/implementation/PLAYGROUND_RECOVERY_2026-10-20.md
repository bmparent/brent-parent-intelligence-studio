# Playground recovery and account access — October 20, 2026

## Candidate and integration

This bounded change is stacked on held site PR131, `82b3ec85476aff7217b179c23e514d741bd2100c`, on `fix/playground-saving-account-20261020`. Its paired backend branch is `fix/playground-resume-quota-20261020`, based on held PR85 `0f44777604e9cec56c04e0dd00efe130b3b6469b`. Integrate both into their held account-release branches; neither PR targets production main. The final PRs identify the exact committed heads. Original owner/Stripe worktrees, sessions and provider settings are outside this change.

The reported saving message has multiple possible causes. No customer's browser database was inspected, and these repairs do not establish that customer's specific cause.

The tested backend commit is `740ae31f163e701242c846d284a6868413109d64`; the read-only paired-contract workflow pins that source and includes this candidate branch. Deployment workflows and backend runtime pins are unchanged.

## Behavior

- Startup reads settle independently. A broken catalogue does not hide a valid current project. Null summaries and missing/invalid dates do not crash sorting.
- Variations validate independently. Unreadable work is exposed as recovery data. Before any replacement of an unreadable current/project record, IndexedDB archives the exact original in the same transaction. An archive or write failure aborts the transaction. Nothing clears customer storage or deletes malformed records.
- Read/format recovery and write failure have separate states. Retry preserves in-memory edits. A successful write clears the write error only after transaction completion; recovery records remain available. JSON project backup and raw recovery download have distinct labels.
- Account / Sign in is visible from the start screen, editor and specialized studios. The established password/email form runs over the mounted editor. Google completes in the established account page in a separate tab; unsaved work prompts a backup choice. Escape/Back returns focus, and login/logout/session changes retain the project and Undo history.
- An empty device can open an account project without first persisting an unexplained starter. Account sign-in alone never claims the project is account-saved.
- Download images & logos produces a deduplicated image-only ZIP containing the optimized images used in the project. It does not include page/project files or claim to contain original upload bytes. Project JSON remains the editable backup.

## Bounded account resume contract — inactive

Account discovery requires a reported owner. Current formats require `resumeProtocol: 1` plus `resumeSaveEnabled: true`; missing capabilities fail closed. Saves use `intent: resume` and `expectedOwner`. The backend accepts this only with the new `EIDOS_PLAYGROUND_RESUME_ENABLED=true` binding, which has **not** been configured. Ordinary new-format cloud authoring, paid AI, checkout and delivery boundaries remain independent and unchanged.

The contract reuses the existing projects/revisions/deduplicated image tables. Proposed limits retain 2,000,000 UTF-8 bytes per incoming project, 1.35 MB per decoded image, 40,000,000 stored base64 image bytes per owner, 20 projects and 100 revisions per project. The added owner document-history ceiling is 20,000,000 UTF-8 bytes after image extraction. The resulting admitted image/document payload is at most 60 MB per owner, excluding database overhead. No paid tier, bucket, credential or provider change is introduced. Global account growth/cost policy still needs review before activation.

An additive SQLite trigger checks history bytes and revision count inside the write transaction. Competing requests cannot both consume the last bytes; a rejected request rolls back its project, revision and new assets. Older over-limit records remain readable and are never pruned. Usage is computed by owner and reported alongside limits.

## Local evidence

| Requirement | Observation | State |
| --- | --- | --- |
| Persistence/legacy/import/export/ownership regressions | Full Playground suite: 175 passed before the added commit-indicator assertion; final focused hook tests include that assertion | pass locally |
| Real browser IndexedDB recovery | 19 Chromium checks: malformed summary/variation/current, exact raw archival, failed write/read, retry, reload, JSON and image ZIP | pass locally |
| Account/empty-device/keyboard/mobile | Seven Chromium checks with controlled local account responses; login/logout/Undo, empty-device open, missing capability, backup before Google, 1440/390px and focus return | pass locally |
| SQLite/libSQL ownership and admission | Pages tests plus real in-memory libSQL dispatch; owner isolation, full-history rollback, concurrent last-byte admission and no orphan project | pass locally |
| Required source checks | Site lint/typecheck/client + SSR + prerender build/Functions compile; backend typecheck and webpack production build | pass locally |
| Shared source | 108 registered files and separate 18-file delivery graph match | pass locally |
| Full backend suite | JS: 19 pass, one skip; TS: 174 pass and six temp-Git fixtures fail in sandbox temp. Those same six pass using standard TEMP/TMP set to the permitted task-specific Temp directory; assertions/source unchanged | environment-only fixture failures resolved by focused rerun |

Browser and parity receipts are in `artifacts/implementation/2026-10-20/playground-reliability/`. Browser plugin was unavailable, so the repository's isolated Playwright workflow was used. Screenshots remain in the task's Temp evidence folder; visual review corrected dialog contrast. Initial Windows checkout line-ending differences were normalized locally; historical migration bytes were not changed in Git. Generated build reports/debug logs are excluded from the commits and preserved locally.

## Open acceptance and rollback

This is implemented and locally tested, **not hosted/provider/live verified**. No preview or production deployment, database migration execution, account-resume activation, real login/email, payment or AI call was performed. Before enabling resume, deploy the exact pair to an isolated database and verify two controlled hosted owners, current-format save/reopen/export, quota responses, session change and empty-device resume. Real Google consent/inbox and physical-device/screen-reader acceptance remain their existing gates. No release gate changes to pass from these local results.

Rollback uses the held parent revisions above and preserves all additive tables/triggers, images, projects, revisions and recovery records. No destructive cleanup is part of rollback. The backend candidate's own Git deployment exclusion prevents an automatic preview for this branch; production configuration is unchanged.
