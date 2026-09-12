# Works direct editing release ledger — September 12, 2026

Source brief: owner-supplied September 12 handoff. Start: upstream main
`89cc19941296d339779ec2e39b74ed90943046e6`. Branch:
`codex/works-direct-editor-20260912`. Older integration branches remain intact.

## Release sequence and acceptance

| Increment | Scope | Status |
| --- | --- | --- |
| A | Visible direct gestures, stable selection preview, cancellation, mobile canvas | Shipped and canonically verified; PR #43 |
| B | Explicit versioned responsive blocks, frame/crop/text controls, portable exports | Implemented locally; final fixed-build browser gates pending |
| C | Reconcile existing account integration, hosted providers, owner isolation and revisions | Existing branches inspected; hosted preview reports providers unavailable; not accepted |
| D | Public journeys, contact/analytics, Stripe TEST, canonical release verification | Basic public HTTP/config reads done; end-to-end delivery/provider checks outstanding |

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
  Existing Cloudflare OAuth CLI access successfully released A. No credentials or plans created.

## Validation and release receipts

A: PR https://github.com/bmparent/brent-parent-intelligence-studio/pull/43.
Merged main `5a10ed97f48b26d3819ab7a058d208b000bc8d87`; tree
`af3a9f0343a519afa718e68059e8b185de167625` matches the accepted CI merge tree.
Site quality run `34707705305` and editor run `34707705314` passed.
Accepted CI artifact `playground-editor-7f0021dac281d15120bd1501b904695e178569af`
was deployed through authenticated Wrangler to the existing Pages project.
Deployment `5ab5bcbb-2ce5-4e31-8e2e-57b0f356b06a` serves https://eidos-works.com/playground/.
Canonical JS/CSS entry bytes match the accepted artifact. Production Chromium desktop
and mobile acceptance passed real drag, Undo/Redo, local reload and downloaded ZIP checks.

Receipts under `C:/Users/bmpar/works-evidence-20260912/`:
`stable-a/results.json`, `production-a/results.json`, `release-a-after.json`,
`gates-a.json`, `release-a-artifact/`. Before-state files and failed attempts are retained.
An expired OAuth direct API read failed before the CLI refreshed its existing access;
the first configuration fingerprint was captured after deployment. We do not claim a
measured before/after configuration comparison for A.

Interaction observations measure pointer-sample to RAF style writes, not physical
screen presentation latency. The A Chromium desktop five-second trace recorded about
3.1 ms p95 style-write delay and 16.8 ms p95 frame interval, with no observed long tasks
or transient root/glass removal. See the raw per-engine traces for exact environments.
Refresh rate is assumed 60 Hz; physical iPhone/actual display latency remain untested.

B preliminary evidence: 36 focused schema/workspace/release tests passed; typecheck
and lint passed. Independent ZIP hosting passed 12 engine/width/JavaScript combinations
in `zip-b-verified/results.json`. Earlier Chromium touch, Firefox and WebKit interactions
passed; a hidden-preview test-navigation failure was corrected. Subsequent UI changes
require the final fixed-build rerun. A dev-server test interrupted by source HMR is not
counted as acceptance. No B deployment is claimed here.

C: existing preview `/api/public-config` currently reports `accountsReady`,
`passwordsReady`, `googleReady`, `aiReady` and `shopReady` false. These are availability
signals, not successful provider flows. Owner-controlled test email addresses were
requested; no plaintext secrets or prospect messages requested/sent. Existing draft
frontend #34/#35 and backend #58/#60 remain preserved; research code is untouched.
