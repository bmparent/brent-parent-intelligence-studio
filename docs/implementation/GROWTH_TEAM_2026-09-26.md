# Internal growth team candidate — 2026-09-26

Base: site owner-console draft PR #68, `2c1a23ca7547d5331f8933a204c1d72cae764ef6`. This change stays on a separate draft branch; public `main`, the isolated owner Worker deployment, and paired Sentinel backend are untouched. The public production release remains governed by `ACCEPTANCE.md`.

## Source and authority

- Eight project-scoped Codex specialist roles and a three-thread limit are in `.codex/`.
- The manager triages leads, projects, and campaigns. Finance approves or declines cash requests only. The checked-in company cash ceiling is zero. It cannot be raised by an agent decision.
- A recurring ChatGPT task produces a research/draft brief using the separate self-contained prompt in `ops/growth-team/daily-brief-prompt.md`. Its schedule and success must be confirmed by the task service; a prompt file alone is not a live scheduler.
- The owner console Agents view names this internal roster and explicitly says run telemetry is disconnected. Existing registered community identities are shown separately. The preview Worker is **not** redeployed by this branch.
- No paid provider call, charge, external message, ad launch, public article, site release, new customer account, private CRM export, or production environment edit is part of this candidate.

## Verification and missing acceptance

Local checks: role TOML parse, the finance-policy Node test suite, site typecheck/lint/build, owner Worker dry-run bundle, five owner Worker tests, and a parse of the embedded owner UI module. Record exact results in the PR description after execution. The finance validator is a pure function. A real future paid connector would need an atomic durable reservation, hard provider cap, verified owner-approved ceiling, and post-call reconciliation; no paid adapter is connected now.

The daily task runs in ChatGPT and reports to Brent. Its output is not yet persisted in the private owner database or reflected as a verified agent run in the console. No end-to-end hosted agent execution, CRM ingestion, outbound delivery, ad attribution, or incremental revenue has been observed. Before these features could move into the owner Worker, specify a private data schema and retention, scoped source grants, Access boundaries, a durable finance ledger, and hosted acceptance against validation data.
