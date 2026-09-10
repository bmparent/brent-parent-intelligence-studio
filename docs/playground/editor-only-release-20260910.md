# Editor-only release — 2026-09-10

Brent requested diagnosing the stalled release, fixing drag-and-drop availability and shipping the updates.

## Root cause

Frontend #35 and backend #60 were drafts targeting other held integration branches. Frontend #34 also had a conflict against main. Production main was 1c878b6d5b86cbf3b300406561dfaf95ff57d14f, while the spatial frontend head was 1b2c4cc3ef745505188c7670e91fba0692b7b3e4. No production deployment of that stack occurred. Composition was opt-in inside Hero controls and needed a more discoverable entry.

## Release boundary

This branch starts from production main and imports the frontend Playground subtree from the spatial head. It does not merge accounts, change migrations, environment variables, providers, paid delivery, research, or the backend repository. It preserves production content including the Insights contact fix. Original PRs remain intact.

The visible Drag & drop entry and one-step hero-image upload expose the existing validated spatial renderer, six placements, section order, flexible blocks/cards, local autosave, Undo/Redo and free JSON/ZIP exports. Existing designs retain their format until explicit upgrade/upload. This is scoped hero composition and structured sections, not a general object canvas.

Legacy-shaped schema-1 projects retain the production cloud protocol. New media and schema 2/3 documents are blocked by the UI with a visible local-only notice. Because Pages Functions imports the editor validator, the existing saveProject handler also has an explicit format guard before database access. This is the only server behavior change; it does not add new cloud capabilities or migrations. No schema stripping or silent downgrade is allowed. Legacy cloud async loads are generation-guarded. The new AI UI is not mounted and makes no provider/configuration requests. Existing purchase history code remains unchanged.

## Acceptance for this exact release

Run the unchanged Site quality workflow and added editor-release tests, including the server/client format boundary. The browser workflow uses pinned Playwright installed only in runner temporary storage, not repository dependencies. It tests the built React app in Chromium, Firefox and WebKit at 1440/390 widths; it exercises the visible entry, upload, six placements, desktop pointer drag/mobile order controls, exact Undo/Redo, local reload, real ZIP download and Try page. Screenshots and failure evidence are retained as workflow artifacts, never committed. A prior branch's pass does not count as this branch passing.

Do not call this deployed until the production branch/deployment and delivered app are checked. Hosted signup/reset/Google/Turnstile, newer cloud ownership/reopen/revisions, Stripe TEST and AI evaluation stay with the held integration. Physical iPhone and native touch remain unverified unless separately recorded. InkSoft is excluded.
