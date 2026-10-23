# Playground acceptance follow-through — October 23, 2026

This record separates verified Playground save/recovery and editor behavior
from the remaining browser, device and activation gates, while preserving the
current public portfolio releases.

## Evening follow-through — current evidence

This section supersedes the earlier Browser-reconnection dependency below;
it does not relabel historical observations or close untested device gates.

- Source tested in actual connected Chrome: site PR139 `37a0fa6871f6d9740496afb03dcecdecb90d0522`,
  backend PR90 `19d9035957f915a9c1b9112c2c3d633af75272cc`, canonical isolated
  account origin `https://eidosworks-test-20260923.pages.dev`. Backend deployment
  `dpl_3wdJC98cqLDJaa2bRPzDHSYtGEQq` is read back READY with that source.
- All ten workflows on that site head now finish successfully except the
  intentionally skipped optional paid-TEST workflow: nine successes, one skip.
  This includes editor run `40017172802` and exact hosted pair `40017172939`.
- Current public main `2c7dcf3cd6a01d88f23eb1da5d45e876d956f8f9` is integrated
  into the held branch, preserving the new attention essay, Candlelight,
  FNBMD disclosure and profile repair. The only merge conflict is the generated
  Insights report timestamp; it is regenerated. `src/playground`, `functions`
  and `src/lib` have no differences from the manually tested starting head.
  Exact successor CI/provider receipts belong on PR139; this is not a new
  production publication.

| Requirement | Observation / scope | State |
| --- | --- | --- |
| Existing QA project cloud reopen | Observed before the October 23, 23:13:43 UTC checkpoint: fresh tab in the same connected browser/profile opened the existing synthetic `Eidos QA 2026-10-23 · saved` from the real account list | pass, hosted account |
| Save a new revision | Renamed only that synthetic project to `Eidos QA 2026-10-23 · revision follow-through`; UI confirmed `Saved to your account.` | pass, hosted account |
| Preview and recover history | History contained the new revision `124d65fb` and original `728cd225`. Preview retained the current name; explicit restore recovered the old name locally, then Save created a new head while retaining history | pass, hosted account |
| Reload and fresh account reopen | Reload, Continue, explicit account refresh and Open returned the restored QA name and original controlled headline/paragraph | pass, hosted account |
| Frozen review | Prepared local revision 15; visible package identity `0071dbbb9ab530e87d98da1370d4e8f4a4fd2e38f80216cd4b02a7c7898c96b5`, editable source, image and file hashes appear | pass, hosted UI |
| Actual ZIP bytes in this connected browser | Clicked the approved download; Browser did not report its download event. Application console had no errors. Chrome's downloads-manager URL is disallowed by Browser policy; no workaround was attempted | not established; separate hosted download gate added |
| Desktop keyboard | Account opens with Enter; Tab remains in its modal; Escape returns to Account / Sign in. Finish Escape returns to Finish | pass, connected Chrome |
| Editor mobile preview | Actual preview iframe is 375 CSS pixels; document scrollWidth is 375, preserving the recovered content | pass, preview only |
| Phone-width outer UI / reflow | Browser viewport override reported no error but actual width stayed 1482. New isolated hosted acceptance checks 1440, 720, 390 and 320 widths with measured bounds | pending exact CI; not a physical-device result |
| Actual 200% browser zoom | Browser shortcut produced no observed scale/viewport change. A 720-pixel viewport checks reflow only | not tested |
| Physical iOS/Android and screen reader | No actual device or assistive-technology session was available in this task | not tested |

The paired-preview workflow now runs the existing frozen-review suite against
the deployed canonical assets, then an additional hosted four-viewport check.
Both use fresh anonymous browser contexts and synthetic device-only projects.
The existing guard controls config/account reads and blocks every cloud,
payment, mail and AI mutation. The added check downloads the ZIP and separate
hash receipt, independently compares SHA-256/length, reads the ZIP entries and
project name, then compares exact archive bytes after reload. It also checks
keyboard dialog entry/return and outer page/dialog bounds. These observations
are explicitly separate from real-account cloud acceptance above. Screenshots,
receipts and synthetic ZIPs are preserved with the existing CI artifact.

Fresh successor local checks pass: lockfile install, source Insights validation,
lint (existing Wellway Fast Refresh warning), 46 platform cases, 179 Playground
cases, audit suite, seven preview-boundary cases, TypeScript/client/SSR build,
Functions compilation, prerender, editorial, built Insights and URL checks.
Final source/deployed identities and hosted check outcomes are recorded on
PR139 after the branch upload. No failure or assertion is waived.

Account storage still enforces 20 projects, 100 revisions per project,
40,000,000 stored image bytes and 20,000,000 document-history bytes per owner;
these are application limits, not a measurement of provider-wide free space.
No storage allowance, retention/deletion rule, feature flag, paid-provider
budget, LIVE transaction or production binding changes in this follow-through.
Keep the physical-device, screen-reader and actual-zoom gates open, together
with any failed successor CI check. DG owner authentication stays paused.

## Candidate and retained production

- The starting frontend is PR139 `838ab7028e6e38c99b9612207079ee2f6b50b9fd`,
  paired with backend PR90 `5570f8c18fb34fd8f15d1d8fb372ef6b7411d50c`.
- Public main `1dc832378b9c00272f88d3c9247a3d95fc72a1a5` is merged into the
  candidate, preserving the Candlelight reconstruction and FNBMD disclosure.
  Conflicts retain both routes, both metadata entries and both acceptance
  records; the sitemap is regenerated with both Candlelight and Signal House.
- This merge does not change Playground source or its paired backend. The
  108-file paired contract comparison passes. The exact final commit and its
  new workflow/deployment results belong on PR139; the prior passing runs below
  are not silently relabeled as tests of this new commit.
- Production remains public main `1dc8323` / backend `d01920b`. No production
  account, new-format cloud, paid AI, LIVE commerce or Snapshot flag is enabled
  by this follow-through. Retain additive data and immutable archive history
  on rollback; do not delete accounts or projects to roll back code.

## Current automated evidence

The final starting-source editor run [39890704665](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/39890704665)
passes. The seven companion workflows also pass: Site quality, Wellway,
Community studio, Works isolated paired preview, Playground purchase readiness,
Template commerce readiness and Works account paired contract. The optional
Paid template TEST candidate run is skipped, not counted as a pass.

This supersedes the earlier pending hidden-dialog acknowledgement and its failed
parent run. Earlier failures and their artifacts remain historical evidence.
No assertion or timeout was removed to obtain the passing final result.

After integrating current public main, a fresh lockfile install, 108-file paired
comparison, lint, 179 Playground tests, TypeScript/client/SSR build, Pages
Functions build, prerender, editorial, built Insights and URL checks pass.
Lint retains its existing Wellway Fast Refresh warning. Real rendered checks
of the final integrated source remain CI/hosted observations, not a claimed
local-browser result from this container.

## Actual connected Chrome observations

The existing isolated acceptance preview retained its authenticated session and
original device project. A separate synthetic QA project was created so that
acceptance did not edit the original design.

- Creating the named starter retains its supplied name and artwork.
- Renaming the synthetic project, waiting for the device-save status,
  reloading and continuing reopens that saved name.
- Selecting the headline and then the adjacent introduction paragraph works
  without the formerly obstructing toolbar. The selection inspector identifies
  the intended element.
- A paragraph edit commits on field blur, as the control specifies. Actual
  Undo restores the original paragraph; Redo restores the QA paragraph.
- The native tour opens and Escape dismisses it with a bounded hidden-state
  acknowledgement; the QA project remains present.
- The existing account session loads its earlier TEST projects.
  Explicit Refresh account projects discovers the preview capability and
  storage allowance; it does not activate production storage.
- Import into my account succeeds for the separate QA project. The actual
  interface reports `Saved to your account.` and lists that project as open.
  This is one small synthetic QA project in the existing isolated account.

The Browser connection then reported that the originating conversation context
was unavailable, before a fresh cloud reopen/revision recovery and the new
responsive/keyboard follow-through could be completed. Do not claim those
remaining October 23 steps passed or substitute a different browser session.
Resume the same preview and QA project after Browser reconnection. The earlier
October 22 reset, old-session rejection, password/Google login, own cloud reopen,
reciprocal member isolation and Undo/Redo observations retain their original
date and source scope; the October 21 private signed TEST commerce cycle also
remains passed and must not be repeated from an obsolete checklist.

## FNBMD public release

[PR145](https://github.com/bmparent/brent-parent-intelligence-studio/pull/145)
is released at public main `1dc8323`. Production workflow 39978671065 attempt 2
passes the complete existing gate, upload, exact production readback and
canonical/indexing checks. Connected Chrome directly confirmed the small
`Concept for FNBMD · Not live.` paragraph in the public Work gallery, with
the concept destination link and retained captures. The failed first attempt
and unchanged-source successful retry remain distinct.

## Remaining release gate

1. Reconnect Browser to this conversation and finish the same synthetic QA
   project's actual cloud reopen, revision recovery and export/readback.
2. Complete the remaining current hosted keyboard/responsive checks; record
   physical iOS/Android, screen-reader and 200% zoom results separately.
3. Observe the exact integrated commit's CI, immutable paired deployment and
   canonical preview readback before recording accept/hold/revise for that
   exact pair and intended production scope.
4. Keep the separate DG owner-authentication pause. Do not repeat the passed
   purchase, enable a paid model or LIVE transaction, increase a budget, or
   change production flags from this acceptance record.

Agent Exchange and resident-host activation remain separate, pending the
actual-edge lifecycle and host acceptance recorded in their own candidate PRs.
