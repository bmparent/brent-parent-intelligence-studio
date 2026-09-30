# Works release conflict reconciliation — 2026-09-30

**Decision: source reconciliation verified locally; NO-GO for production and no merge to main.** This record adds evidence to the September 27 integration record without replacing its history or closing hosted/provider gates.

## Exact candidate

- Site code commit: `b37ae1a975f1d7de3012dc0925047d73503091b2`; tested tree `7e78c273846bfd2de9c7d33fd362b954d5894418`
- Site merge parents: release `ff7a076e1335d528224e94536c994b5438c35d39` and current main `e0f5ca9c0b81542929960aa6ada075f81ad0240b`
- Paired backend: `97d806d4d0a7a71575090e10d5e81aca1036b4e4`; tested tree `243ebb81c09ce21f46cce5e433c780dca9e502a1`; parent `21880a6a58fd2964bc16aba276eee884c79e1357`
- Review destinations remain [site draft #73](https://github.com/bmparent/brent-parent-intelligence-studio/pull/73) and [backend draft #67](https://github.com/bmparent/eidos/pull/67). A later documentation-only commit may wrap the site code commit above.
- The site now contains main's editorial voice (#77) and About/studio/contact routing (#78), while retaining the integrated audit, security, Playground, growth, owner refresh and directory work. Stacked service branches #74–76 are not modified.

## Resolution

The assistant prompt retains the release's uncertainty, no-categorical-denial and unverified-photo-sorting safeguards and adopts the new Eidos Works contact wording. Community HTML retains the explicit no-AI-call source disclosure and adopts the About navigation label.

The automatic merge exposed two related verifier failures: feature-added custom-build links still said Ask Brent, and the About route was missing from the approved-platform-page set after main moved the service families there. The service/Playground links, browser assertions and exported NEXT-STEPS.md now use Eidos Works; the existing approved platform evidence is allowed on About. A regression assertion checks the exported contact copy. Regenerated growth paths remove the redirected /services route.

Only four backend vendor files change: functions/_shared/platform/knowledge.ts, functions/api/assistant.ts, functions/community/thread/[id].ts and src/playground/export.ts. No research code, runtime binding, workflow, migration, payment setting or feature flag changes.

## Evidence ledger

| Requirement | Observation | Environment / state |
| --- | --- | --- |
| Source integration | Both latest source parents are preserved in the site merge. No force push or main update. | Local exact trees / pass |
| Shared contract | 76/76 source/vendor files match; trees above match the locally tested trees byte-for-byte. | Local working files and committed blobs / pass |
| Site compilation | ESLint, TypeScript, Vite client/SSR production build and Pages Functions build pass. | Local / pass |
| Site behavior | Platform 29, audit 36, Playground 26, growth 13, growth finance 7, owner console 8, analytics 1 and glass 6 tests pass; Snapshot smoke and Worker typecheck pass. | Local / pass |
| Editorial and routes | Insights editorial regression, source validation with source fetching disabled, prerender, editorial (34 routes), 17 published articles' dist validation and URL checks pass. No article content changed in this reconciliation. | Local / pass |
| Backend | TypeScript lint, 16 JavaScript tests, 60 TypeScript tests and Next production build pass on the four-file vendor refresh. | Local / pass |
| Browser verification | Local Playwright engine installation returned invalid/truncated browser archives. Browser execution was not possible here. Existing Playground and Wellway PR workflows provide the exact-head remote browser evidence; use their latest runs, not historical green checks. | Local browser / blocked; remote results recorded on the PR |
| Hosted preview | Existing backend branch deployments are Vercel previews. The latest observed production deployment before this change is main c18cb36 at dpl_CACaaPPGSB798D6nKVQp2GyK3Ci6. No new isolated site/backend pair or runtime acceptance is established by this source fix. | Provider metadata read only; paired runtime / not tested |

## Release boundary

The feature-branch GitHub workflows run checks; production upload remains conditional on main. Vercel may automatically build the backend feature branch as a preview. Neither a preview build nor green CI proves paired runtime acceptance.

Keep the existing hosted gates open: isolated paired source/database/bindings and additive migrations; owner Access, wrong-owner, expired-session, CSRF, replay and inquiry inbox receipt; Google consent and two-account owned save/reopen; Stripe TEST signed event, replay, recovery and refund; physical-device and assistive-technology acceptance. Paid AI, new-format cloud authoring, Snapshot and LIVE payments remain gated. No merge, auto-merge or production deployment is authorized by this conflict-resolution task.

## Browser CI follow-through

On site head ca28f43, [Playground run 36751094180](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36751094180) passed the editor scenarios in Chromium, Firefox and WebKit at desktop/mobile widths and the desktop customer journey. The mobile journey then timed out when clicking Your page immediately after a palette drag. The installed dnd-kit AbstractPointerSensor retains its document click-suppression listener for 50 ms after pointerup; the verifier now waits 100 ms for that intentional cleanup before the next panel click. This changes test synchronization only. Site quality, Wellway acceptance and backend CI passed; the new site head requires its own complete browser run.
