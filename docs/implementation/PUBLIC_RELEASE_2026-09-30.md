# Authorized public release — 2026-09-30

Recorded 2026-09-30T22:36:30.462592+00:00. Brent requested merging the gallery and other compatible PRs and taking the result live. This is an independently reviewed public release, starting from main/production e0f5ca9c0b81542929960aa6ada075f81ad0240b.

## Included source

| PR | Public change | Rebased head / integration receipt |
| --- | --- | --- |
| #80 | Three full-page fictional website concepts, enlarged reading, filter/search and briefs | 70774e59b4df164fae4d505e30ebd2b923daaeb0 |
| #74 | Digital Experiences project showcase and starting paths | dcb04405148d49798f896e23ff30fb73ea67c7c6 / merge a6887231a922f05da14f212bfca11de11beeddc5 |
| #75 | Business Systems cases and local fictional applications | 9fe738f8c7a8925e6dd369069e7fc0c8db8e3e72 / merge 3f5c4f08469589974c934b6c3950394e86470c0c |
| #76 | Intelligent Systems cases and three public source examples | b805761b03738a4f88aa19272912c7be3a04da18 / merge 87a2b020e12694c342c0dd00692a58c657348a1c |
| #79 | Isolated Quote Desk candidate source; TEST, checkout disabled, no root runtime route | 251abbb50cfd2e359ba56ea0641019a7273265fd / merge 6da9ef205c58469a24689e212586b6816c8b9740 |

Integrated code head: 6da9ef205c58469a24689e212586b6816c8b9740; code tree: 140adaaa7ef38c4bfc1990e1579478d276f77423. The locally reviewed source and staged tree exactly match that remote integrated tree. This follow-up adds the evidence record and replaces superseded PR browser runs; main uploads remain serial. The final PR head and production merge get their own checks and provider/browser readback before live acceptance is claimed. See the current #80 description and linked final workflow for that receipt.

Original stacked branches are preserved at codex/backup-pr80-20260930-84fc539, codex/backup-pr74-20260930-087685f, codex/backup-pr75-20260930-359704b, and codex/backup-pr76-20260930-6f25162. No unaccepted paired ancestry is introduced on main by the rebased public commits.

## Independent impact analysis

The deployed public delta consists of frontend presentation, static concept assets, frontend-only fictional interactions, metadata, generated canonical growth paths, and verification/acceptance records. DigitalStartingPaths and ConceptApplications are extracted pure frontend dependencies. SupportedAnswerDemo uses three public examples directly, with visible source links and no provider or backend request; it does not depend on the paired server catalogue. Intelligent Systems copy accurately describes the existing assistant, without claiming the unreleased context/reset behavior.

The root Pages build does not host apps/quote-desk. Its worker config retains TEST, checkout=false, workers_dev=false and a placeholder isolated-preview database ID. Its PR workflow runs tests and a dry build only. Merging this source does not deploy an app, send email, create D1, subscribe a user, change a provider, or establish revenue.

Git diff confirms that Pages Functions, migrations, Snapshot migrations, root package/lockfile, response headers, account UI, assistant handlers, and Playground source match the previous main baseline. Production backend remains unchanged. Public content is therefore releasable separately from site #73/backend #67; their identity, owned cloud reopen, owner/security, inbox and Stripe TEST acceptance remain open. Site #4 retains conflicts and stale legacy routes. Backend #59 remains an independently gated research candidate.

## Evidence ledger

| Requirement | Observation | Environment / state |
| --- | --- | --- |
| Baseline source/host | Main e0f5ca9; workflow 36651895749 deployed and verified the canonical deployment/entry assets. Canonical homepage showed 18 previews before this release. | Provider workflow + Chromium / pass |
| Source equality and containment | Each published rebased tree matches the local stage. Integrated local/remote code tree is 140adaaa. Protected runtime paths retain main bytes. | Local Git + connected GitHub / pass |
| Build and content | ESLint (zero errors, existing Wellway fast-refresh warning), TypeScript, client/SSR production build, prerender, editorial (34 routes), URLs, and 17 source/built articles with external fetching disabled passed. No article content changed. | Local combined public source / pass |
| Gallery interaction | Concepts filter shows three; native preview shows fictional/AI disclosure and brief; full-size mode and Escape/Close focus return observed. | Supervised Chromium 1363 × 936 / pass |
| Responsive gallery | Actual Work page in 390 × 844 iframe: 375-pixel document width; full-size image 793 pixels in a 334-pixel scroll region; document width stays 375 pixels. Loaded image confirmed. | Responsive Chromium / pass |
| Service interaction | Digital featured-project selection, Business estimator update (quantity 200 → materials 200 × $4.50 and $980 total), Intelligent question selection/source links, and no document overflow observed. Digital phone-width composition visually reviewed. | Supervised Chromium / pass |
| Quote Desk source | 7 estimator + 16 ownership/billing lifecycle + 4 revenue-evidence tests pass; Wrangler dry build succeeds with TEST/checkout=false. Provider calls in tests are fixtures. | Local exact #79 source / pass |
| Remote checks | Rebased Site quality and Wellway checks pass. Complete combined-head browser, Quote Desk and main production checks are required next; results belong to their exact heads. | GitHub / in progress at recording |
| Live new source | Await successful main upload, exact deployment identity, canonical gallery and affected-page readback. No new production acceptance is claimed in this pre-promotion record. | Production / not tested at recording |
| Physical/assistive checks | Actual iPhone/Android, screen reader, 200% zoom and low-power behavior retain prior evidence limits. | Not tested |

The transient responsive-review harness is removed before publication. Gallery concepts remain labeled fictional and generated. Private case studies use sanitized existing public images or local diagrams.

## Rollback

Source baseline e0f5ca9c0b81542929960aa6ada075f81ad0240b, observed uploaded URL https://02b448c0.eidosworks.pages.dev, workflow https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36651895749. Roll back public code/build identity through the existing verified deployment flow; preserve all customer data, accounts, archives and budgets. No data migration or new provider activation occurs in this release.
