# Account reconciliation — September 12

Status: implemented and controlled-tested; NOT accepted for production account rollout.
The September 12 brief supersedes earlier optional AI budgets and resource-creation
steps: no paid AI, new Google Cloud resources, plans or live Playground sales.

The isolated reconciliation preserves the current direct editor and v4 blocks while
reusing the existing account integration from frontend #34/#35. Conflicts in preview,
workspace guards, schema, glass and editor controls retain the newer production/editor
implementation. Optional AI additions and copied historical evidence were excluded;
original branches and artifacts remain intact. The quota schema generator was reconciled
so a clean build retains its additive image-quota definition.

The account dashboard, password proof/signup/login/reset, secure Google linking,
member/session/agent preservation and owner-aware project protocol reuse the existing
identity model. No parallel identity store was created. Server schema-v4 saves require
`EIDOS_PLAYGROUND_AUTHORING_ENABLED=true`; the hosted default is off and the frontend
keeps advanced formats local-only until paired hosted acceptance. Controlled tests set
this flag explicitly and prove owner isolation, asset hydration and expected-head races.

## Validation and evidence

- Frontend build/typecheck passed. Fifty-two aggregate Playground tests (including account-epoch validation) and 17 focused
  member/relay/cloud tests passed. The new v4 test proves default-off behavior, isolated
  owner hydration, exact historical reads, and one winner from two concurrent saves.
- Backend: 16 JavaScript and 48 TypeScript regressions passed, including real scrypt,
  JOSE validation, Sharp image checks and recovery/session races. Typecheck passed.
  Default Turbopack build cannot follow the reused node_modules junction outside its
  filesystem root. The supported `next build --webpack` build passed; no dependency
  reinstall or research-runtime change was used to work around it.
- Real local Chromium UI: two separate contexts completed signup, explicitly confirmed
  their local proof links, reached dashboards, signed out and signed in again. The first
  saved a project through the editor; the second saw an empty list and received 404 for
  the first owner's project. These are in-memory loopback tests, not hosted identities,
  email delivery, Google consent, or physical-device certification.
- Raw receipts: `C:/Users/bmpar/works-evidence-20260912/accounts-controlled-accepted/`,
  `unit-c-authoring.txt`, `all-c-playground.txt`, `all-c-backend.txt`,
  `build-c-backend-webpack.txt`. Failed attempts are retained with explanations.

## Exact remaining gates

The existing `eidos-pg-preview-20260910.pages.dev/api/public-config` reports accounts,
passwords and Google unavailable. Owner-controlled recipient addresses are still needed
for hosted confirmation/reset and contact delivery checks. Real Google consent needs
an already configured authorized client/callback; creating Google Cloud resources is
outside this brief. Stripe TEST credentials/provider webhook delivery have not been
verified; synthetic signatures and immutable-byte tests are not real Stripe traffic.
No remote migration, account rollout, new provider resource or live sale was performed.

Before any hosted rollout: verify the intended existing bindings and recovery snapshot,
apply only additive Works migrations, match exact frontend/vendor bytes, keep unrelated
provider settings unchanged, then run the required real two-account acceptance. Until
then, this stack remains a reviewable draft separate from accepted editor releases.

## Session-change regression

A nonce-only account epoch now invalidates pending opens, revision previews and save acknowledgments across tabs. Local storage/BroadcastChannel contain no identity or project data. Dashboard requests also reject responses captured under an earlier epoch. Server owner checks remain authoritative. The actual loopback two-tab browser test passed both a delayed A-open/B-signup case and a delayed A-save/B-login case, preserving the exact local document and rejecting cross-owner saves. Evidence: `accounts-switch-final/results.json`; command: `node scripts/verify-works-account-switch.mjs` with the local fixture running. The session-operation allowlist has a focused unit test.

The matching backend package includes 66 source/vendor parity checks, manifests, captured logs, a journal and plain-language analysis under `artifacts/works_accounts_20260912/`. A configured artifact mirror copy succeeded; `drive_manifest.json` records its exact path and files. This is a filesystem mirror receipt, not independent Google Drive cloud-ingestion verification.

## Hosted build and release follow-up

The existing Git integration built backend preview `dpl_7a7gwFdLzvPabFrZ6vp8WwcE6o6n` at `ecd6b51504c4d84f4828b047a3129cd554b67057` successfully using Turbopack. Backend CI run 34713351465 and frontend CI run 34713361884 passed. This supplements the local webpack result without claiming hosted provider acceptance. The account changes remain drafts (#46 frontend, #61 backend). Editor PR44 is separately live at canonical source `6a47244d68c0ff75ecb5665d9155b17cad95d67a`; see the final implementation ledger for production proof and remaining gates.
