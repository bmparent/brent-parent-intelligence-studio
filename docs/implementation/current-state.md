# Implementation baseline — 2026-09-21

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
