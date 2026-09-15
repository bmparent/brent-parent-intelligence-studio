# Wellway showcase boundaries

This is an independent Eidos Works concept using fictional records and a browser-local workspace. Do not enter real health information. The notice cannot detect or prevent sensitive entry. Perspective switching is not authentication. Visits, device controls, provider connections and advisor actions are simulations. No HIPAA certification or clinical suitability is claimed.

## Implemented controls

- Validated versioned JSON backups and CSV records; overlapping observations remain inspectable without summing duplicate daily values.
- Unreadable saved data is preserved before starting sample records. If preservation fails, automatic writes pause. Manual exports remain available.
- Draft edits persist; approval is a deliberate separate action. A note without plan permission cannot rewrite an activity. Rejected drafts remain inspectable locally.
- The hosted AI architecture keeps credentials on the private Worker, uses bounded structured requests, recomputes aggregates, validates citation membership and checks numeric claims against cited measurements. These checks do not prove full semantic correctness. Imported text remains untrusted.
- AI defaults off. A single Durable Object reserves cost atomically under the existing $1 lifetime and $0.25 UTC-day ceilings; failures retain reservations. No additional allowance is authorized by this release.
- No media capture, real messaging, session replay, patient database or clinical monitoring is added. Local storage is not encrypted patient storage. `store:false` is not zero provider retention.

See VALIDATION.md for tests actually run and deployment status. Code and mocked tests alone do not establish a working hosted integration.

## Separate requirements before real healthcare use

Real operation requires qualified privacy, security and clinical review; an appropriate legal basis and vendor/service agreements; real authentication and MFA; server-enforced roles and tenant isolation; protected patient storage and verified authorization on every request; tamper-resistant audit records; retention, export and deletion policies; encryption and managed key rotation; tested backup/recovery; incident response and breach procedures; monitoring without content leakage; provider retention review; accessibility and physical-device testing; and clinically reviewed escalation and content boundaries.

Each requires implementation and evidence in its own production project. This document is not an assessment, certification, or permission to collect patient information.
