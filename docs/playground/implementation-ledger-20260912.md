# Works direct editing release ledger — September 12, 2026

Source brief: owner-supplied September 12 handoff. Start: upstream main
`89cc19941296d339779ec2e39b74ed90943046e6`. Branch:
`codex/works-direct-editor-20260912`. Older integration branches remain intact.

## Release sequence and acceptance

| Increment | Scope | Status |
| --- | --- | --- |
| A | Visible direct gestures, stable selection preview, cancellation, mobile canvas | In progress |
| B | Explicit versioned responsive blocks, frame/crop/text controls, portable exports | Pending |
| C | Reconcile existing account integration, hosted providers, owner isolation and revisions | Pending |
| D | Public journeys, contact/analytics, Stripe TEST, canonical release verification | Pending |

Each increment requires applicable unit, real interaction, compatibility and production
evidence. A local pass is not deployment, hosted-provider or physical-device acceptance.
No paid AI, live Playground sales, new plans/resources, research changes or destructive
data migration are authorized. Historical archives and unrelated checkout changes stay intact.

## Baseline and environment

- Windows; Node v24.14.0; npm 11.9.0. Node 24 matches CI.
- Existing dependency directory reused through a junction; no installation or lockfile change.
- Browser plugin not available; existing bundled Playwright used, as permitted by the brief.
- Evidence outside source: `C:/Users/bmpar/works-evidence-20260912/`.
- Before-state browser flow: Playground → explicit composition upgrade → synthetic image →
  move → Undo/Redo → local reload → actual JSON/ZIP → Try.
- Source inspection confirms percentage-band targets, absent drag ghost, detached image
  handle, mobile authoring padding and selection-triggered whole-root replacement.
  These findings do not establish measured production frame rate.
- Repository Actions secret names inspected: Cloudflare deployment secrets absent.
  Existing authenticated CLI availability and production revision remain to be verified.

## Validation and release receipts

Pending. Record failures as well as successful checks. Keep raw performance observations
separate from proposed 60 Hz/two-frame p95 and 50 ms freeze targets.
