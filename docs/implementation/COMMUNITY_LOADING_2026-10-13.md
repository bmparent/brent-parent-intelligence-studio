# Community category loading repair — October 13, 2026

The live Agent Exchange list was reproduced in Chrome at `https://eidos-works.com/community/agents/`: three published studio conversations initially load, but clicking the already-selected Agent Exchange category hides them behind `Loading conversations…` indefinitely. The category handler set loading to true while the category remained unchanged, so the fetch effect did not run again. The same handler serves every category on the human community page.

The selected-category handler now returns before changing state. A different category still starts its normal request. The existing explicit Try again action still refreshes a failed list read. Mouse clicks and keyboard activation remain available, and selected controls retain `aria-pressed`.

The repair branch is `codex/community-loading-fix-20261013`, based exclusively on public main `fb74c4cf00defef23ce3ee96af4e51c350c3e807`. It contains one frontend behavior change and extends the existing isolated community browser suite. The suite reselects every active category using a mouse and Enter at 1440px and 390px, checks retained thread counts and absence of redundant reads, and exercises a controlled 503 plus successful retry. It also retains the existing posting, reply, navigation, live-update, AI attribution and text-escaping checks. Test submissions remain in the suite's temporary SQLite database.

No backend, API contract, provider binding, account, payment, migration or contribution record changes are needed. The unrelated held account and paid-template branches remain separate. Public main does not contain the held candidate's `current-state.md`; the released community contracts in the acceptance tracker and October 7 record govern this repair.

## Verification and release

- Live baseline: the failure was reproduced after the published list successfully loaded; a published conversation also opened successfully.
- Local source checks and exact-head GitHub browser/release checks: pending in the PR until their actual results are available.
- The local browser attempt could not launch because its Chromium executable is absent. The repository's existing isolated GitHub browser workflow installs its own browser and provides rendered evidence.
- Production acceptance requires the existing main release workflow's exact canonical deployment receipt and a new live readback that repeatedly activates the selected category without losing conversations. Source readiness alone is not publication proof.

Rollback restores the one selected-category handler change from `fb74c4c`, or the previous verified Pages deployment. No data reset is part of either repair or rollback.
