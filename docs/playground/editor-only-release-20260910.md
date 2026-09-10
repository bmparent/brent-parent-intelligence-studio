# Editor-only release — 2026-09-10

Brent explicitly requested diagnosing the stalled release, fixing the drag-and-drop availability problem and shipping the updates.

## Root cause

Frontend #35 and backend #60 were draft PRs targeting other held integration branches. Frontend #34 also had a merge conflict against main. Production main was 1c878b6d5b86cbf3b300406561dfaf95ff57d14f, while the spatial frontend head was 1b2c4cc3ef745505188c7670e91fba0692b7b3e4. No production deployment of that stack occurred. The spatial feature was also opt-in inside Hero controls, so discoverability needed improvement.

## Release boundary

This branch starts from production main and imports only the frontend Playground subtree from the spatial head. It does NOT merge the account integration, change functions, migrations, environment variables, providers, paid delivery, research, or the backend repository. It preserves current production content, including the Insights contact fix. Original PRs and branches remain intact.

The release exposes a Drag & drop entry and one-step hero-image upload. The existing validated spatial renderer, image placements, section ordering, mobile settings, local autosave, Undo/Redo, JSON and free ZIP exports are included. Existing projects stay in their original format until explicit upgrade/upload. This remains scoped hero composition and structured sections, not a general object canvas.

The legacy production cloud protocol remains for legacy-shaped schema-1 projects. New media fields and schema 2/3 documents are blocked in the UI before any cloud-write request; a visible notice explains local-only saving and portable backups. No schema stripping or silent downgrade is permitted. Late legacy cloud opens are generation-guarded. The new AI UI is not mounted and makes no configuration/provider requests. Existing production purchase-history code is retained without changing flags or generating archives.

## Acceptance required for THIS release

Run the unchanged Site quality workflow plus the added local-editor tests and cloud-format-boundary tests. Exercise the actual React app at desktop/mobile widths: discover the entry, enable composition, upload a valid image, move content, Undo/Redo, reload, export/reimport, and verify the local-only notice. A passing older-branch receipt is not a passing receipt for this release. Do not claim a production deployment until the production branch/deployment and delivered app are checked.

Hosted signup/reset/Google/Turnstile, new cloud ownership/reopen/revisions, Stripe TEST and AI evaluation stay with the original held integration, rather than being declared passed. Physical iPhone/native-touch acceptance remains unverified unless separately recorded. InkSoft is excluded.
