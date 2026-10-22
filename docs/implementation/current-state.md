# Patched Playground integration — October 22, 2026

The held account/recovery source is reconciled with production security release
`53c25ba` and backend PR90 `77dc718`, using the existing isolated acceptance
database and origin. The new `/account/reset` static build/HTTP checks, full
verification and remaining user/hosted gates are in
[PLAYGROUND_RELEASE_2026-10-22.md](PLAYGROUND_RELEASE_2026-10-22.md).
Production security is deployed separately; no Playground feature activation
or new paid-provider operation is inferred from those receipts.

# Local Playground reliability candidate — October 20, 2026

`fix/playground-saving-account-20261020` is stacked on held site PR131 `82b3ec8`; its paired backend branch starts from PR85 `0f44777`. It adds recoverable local saving, visible account access, image-only download and a default-off account-resume/quota contract. See [the local acceptance record](PLAYGROUND_RECOVERY_2026-10-20.md). No production/provider state or existing owner session changed; hosted account-resume acceptance remains open.

# Implementation baseline — 2026-09-21

## Release cleanup continuation — 2026-10-19

Google signup and reload/session persistence are now passed on the paired
preview; the earlier incomplete-signup text below is historical. Owner MFA/read
access passed on baseline `1bbcab6`, while the owner Worker still needs current
backend routing. The public-only PR114 reconciliation is carried into the held
release candidate. Nineteen obsolete review threads are closed with branches
and evidence preserved; Works source review is consolidated in #131/#85.

A fresh guest template checkout reached Stripe Sandbox (Switchboard developer
1.0.3). No payment was submitted: automatic browser approval review blocked
receipt-address/test-card entry pending explicit approval. Password/reset inbox,
two hosted owners/project isolation, current owner backend and the signed TEST
lifecycle remain open. Production publication is recorded separately on PR114;
this update does not activate the held runtime.

## Current recovery update — 2026-10-19

Network-interrupted source integration is recovered and merged into the held release branches: frontend #134 then #133, resulting account-branch merge `34d2c034ebc3e70c79463323792682b4795728b9`, tree `885a14d3da651e92a198ac9c882ebd2a979eed60`; backend #86 into held #85, merge `944accb1c52d6af708b0f02709f5c819241d33b7`. Seven fresh frontend workflows pass, including full editor/browser run `39291754860`; backend merged-source quality passes. The canonical isolated account preview serves the same tested frontend tree and exact backend `55044733c122067562321b412bd4f1b01b333106` through deployment `dpl_CVJ5ERsLQiigU8BoHC9uc5B7CEwB`. Preview deployment `1396daa7-0e67-4fdf-9fe6-2acad23d06ff` is verified; it is not production.

Fresh local-on-device create/save/reopen/frozen-export download passed in hosted desktop Chromium. Real Google callback verified email and reached the public-username completion step after user takeover; account creation is not complete. Password/reset inbox delivery, two hosted identities/project isolation, authenticated owner/current-backend acceptance and the signed Stripe TEST lifecycle remain open. Stripe connector is LIVE only. Production remains held at site `09cb0b0199c8e6b1f4df3689464cf0fee67e2ae3` / backend `34c3d21509dfa1017705244e0d42a6eb7bc7dff9`; no activation, production upload, migration or LIVE transaction occurred. See [current acceptance](ACCEPTANCE_2026-10-19.md) and [exact source integration receipts](RELEASE_INTEGRATION_2026-10-19.md). Older pointers below retain their original historical scope.

## Current recovery update — 2026-10-13

Brent requested starting today's account/template priorities. The held site #98 and backend #67 are being recovered against current main without rewriting historical receipts. See [ACCEPTANCE_2026-10-13.md](ACCEPTANCE_2026-10-13.md) for exact merge parents, observed canonical account UI, source parity and remaining controlled-identity/provider gates. The final PR receipt identifies the committed pair and any refreshed isolated preview. Production remains NO-GO.

## Current recovery update — 2026-10-06

Current public main is `a6faf20fbedffda38f01f3052a3df9a8d541c4b4` after authorized #97 merge; its own production workflow determines delivered status. Interactive recovery owner: Eidos. Use successor `codex/works-paired-recovery-20261006` for the held account/Playground/owner candidate, preserving original #73 at `6a6ff2a5e2c8a2a25649813b9d512a5b08619a5e`. Backend #67 remains `97d806d4d0a7a71575090e10d5e81aca1036b4e4`. Current checks, exact-pair CI/preview requirements and remaining gates are in [ACCEPTANCE_2026-10-06.md](ACCEPTANCE_2026-10-06.md). The dated baseline below is retained as history, not current production evidence.

This is the Works website implementation, not an Eidos Brain benchmark. Research behavior is untouched.

## Reconciled source and deployment

- Frontend origin/main: af22c30182984134b5ec1418ed4ffc547f2541c5, freshly fetched. Cloudflare Pages lists production deployment 71b8beae-59b0-48c6-950b-0ee1df6e5c4c at this source. Canonical business-systems page inspected in the real browser.
- Backend origin/main: a2da5fd9af21c02573e538fd30aaf7d5c690e457, freshly fetched. Vercel resolved eidos-sentinel-lab.vercel.app to dpl_8ztuTFv3h34YFuBSjHS31F8Q13aV at that exact source. Newer Agent Lab previews are not production.
- Wellway independent Worker: eidos-wellway-ai, deployment 22de55aa-f048-4306-95a9-93ec31666c75, version cbb9b22f-be49-4d8c-8336-077a26948e19 at 100%. Read-only live status confirms gpt-4.1-mini-2025-04-14, total allowance 1,000,000 microUSD and daily 250,000 microUSD; observed remaining 885,039 lifetime and 238,766 daily. These are a timestamped snapshot, not a future balance. No ledger reset or allowance increase. Receipt: artifacts/implementation/2026-09-21/wellway-live-status.json.
- Initial folder is not Git. Older live/repo and research checkouts contain unrelated changes. Work is isolated in works-audit-frontend-20260921 and works-audit-backend-20260921; existing worktrees remain untouched.

## Confirmed defects and reusable work

The current assistant selected regex entries in declaration order and lacked Promo, Wellway, embroidery and PERNR facts. UI omitted history. Legacy guidance claimed a provider failure despite no provider call. These are repaired in the candidate, not production.

Existing account drafts (frontend codex/works-accounts-reconcile-20260912; backend codex/works-accounts-backend-20260912) contain password/OIDC and owner-safe cloud work. Selected source is being reconciled against current main, preserving current editor/model and editorial content. Historical tests are not counted as current acceptance.

Promo source reviewed at the existing dg-promo-photo-uploader checkout. Intake, queue and original supplied-byte handling are documented; automatic organizer sorting was not observed in the saved 2026-09-20 check. Public claims retain this limit. Private employee data and endpoints are excluded from the catalogue.

## Runtime limits

Ask Eidos source controls remain five enhanced attempts per visitor/day, 200 global requests/day, configurable 20,000 default reserved tokens/day, 320 output tokens, no automatic retries. Actual runtime model/override values remain unverified. No budget, price or production configuration has been changed.

## Rollout and rollback

Prepare additive migrations and backend first. Verify exact catalogue/handler and editor dependency parity, then preview the frontend against that backend. Do not enable new-format cloud access until owner/reopen tests pass on the pair. Keep legacy schema support and existing member IDs, orders and entitlements. Production rollback targets are the deployments above; do not reverse additive data migrations or destroy new accounts to roll back code.

No production deployment, live financial transaction, public post or external email has been performed by this implementation task.
# Playground preview reliability correction — October 22, 2026

The isolated candidate adds the [CSP-compatible frame correction and recovery
regression](PLAYGROUND_PREVIEW_FIX_2026-10-22.md) after reproducing Brent's nested
walkthrough report. Backend `77dc718` and production `53c25ba` / `d01920b` are
unchanged. Exact-source rendered CI and hosted results belong to PR139.
