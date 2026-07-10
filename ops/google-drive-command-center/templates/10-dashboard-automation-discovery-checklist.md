# Dashboard / Automation Discovery Checklist

## Decision first

- [ ] Name the decision, handoff, or recurring task this system should improve.
- [ ] Identify the person accountable for the outcome.
- [ ] Record the current frequency, effort, delay, and error/rework rate.
- [ ] Define a measurable better state and how it will be observed.

## Current workflow

- Trigger:
- People/roles:
- Source systems:
- Steps and handoffs:
- Outputs:
- Exceptions:
- Current workaround:

## Data inventory

| Field/data | Source of truth | Owner | Update frequency | Sensitivity | Quality issue |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |

- [ ] Stable identifiers and duplicate rules are known.
- [ ] Required historical depth and retention are defined.
- [ ] Permissions, consent, customer data, and secrets are classified.
- [ ] API/export/webhook access and rate limits are verified.

## Dashboard requirements

- [ ] Each metric maps to a decision or next action.
- [ ] Formula, source, time zone, refresh cadence, and owner are documented.
- [ ] Empty, delayed, partial, and conflicting data states are designed.
- [ ] Filters/drill-downs match real questions instead of adding decoration.
- [ ] Mobile/read-only/export needs are clear.

## Automation requirements

- [ ] Trigger, validation, transformation, destination, and success receipt are explicit.
- [ ] Idempotency/deduplication key is defined.
- [ ] Retry, timeout, rate limit, and partial-failure behavior are defined.
- [ ] Human approval is retained for consequential or ambiguous actions.
- [ ] Logs avoid secrets and unnecessary sensitive data.
- [ ] Manual fallback and rollback are documented.

## Architecture decision

- Proposed low-cost components:
- Why they fit:
- Alternatives considered:
- Recurring cost:
- Security boundary:
- Known limitation:

## Acceptance tests

| Scenario | Input | Expected result | Evidence |
| --- | --- | --- | --- |
| Happy path |  |  |  |
| Duplicate |  |  |  |
| Invalid input |  |  |  |
| Dependency failure |  |  |  |
| Manual recovery |  |  |  |

## Ownership after launch

- Operational owner:
- Technical owner:
- Alert destination:
- Review cadence:
- Decommission/export plan:
