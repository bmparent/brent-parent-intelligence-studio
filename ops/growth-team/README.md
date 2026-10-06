# Eidos Works revenue team

The existing studio manager is now the **Revenue Operator**. Read [the operating contract](OPERATING_CONTRACT.md) for its October 3 standing implementation authority, scope and completion criteria. It resumes [the durable queue](state.json) and records actual actions in [receipts](receipts/). The live daily task is the scheduler; the eight `.codex/agents/*.toml` files are reusable roles, not eight daemons.

| Role | Responsibility |
|---|---|
| studio_manager | Own one offer from evidence through implementation, verified release, demand and measured cash |
| it_dev | Complete scoped technical work and its authorized release; preserve real acceptance gates |
| marketing_ops | Consent, attribution, distribution capacity and measurement |
| sales_diagnostic | Evidence-backed workflow problems and qualified opportunities |
| sales_relationship | Appropriate approaches to already permitted relationships |
| sales_direct | Clear, truthful proposals for qualified opportunities |
| creative_ads | Accurate concepts that support the active offer |
| finance | Cash commitments within the owner-approved ceiling; no creative/company control |

Keep at most two specialists alongside the manager and identify only actors that actually ran. The current budget remains $0 new cash commitments. `finance.mjs` is an unchanged pure policy validator, with tests runnable through `node --test ops/growth-team/finance.test.mjs`; it neither spends nor provisions anything.

The [daily task prompt](daily-brief-prompt.md) replaces the old briefing-only instructions. Preserve the existing daily schedule and unrelated workspace/prospect/inquiry automations. Public run receipts contain no private customers, contacts, banking details or credentials. The private business workbook remains the source for real operating records; missing telemetry remains unknown.
