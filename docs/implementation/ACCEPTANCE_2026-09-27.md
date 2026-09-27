# Combined Eidos Works review candidate — 2026-09-27

**Decision: NO-GO for production and no merge to `main`.** This record covers source integration, local tests and integrated PR CI. The combined site/backend candidate has no hosted paired deployment or provider transaction. The [September 26 hosted acceptance](ACCEPTANCE_2026-09-26.md) is evidence for its own earlier site, backend and Worker revisions only.

## Source and release boundary

| Component | Integrated source | Production baseline |
| --- | --- | --- |
| Site | Parents: Playground journey `adb7a1de13b2c28487730a1ea269778fcd70ae84`, growth/owner console `49f1baf22072064036de0f458d13cedca0e0e949`, and site `main` `c8f5d89a57f90bf817157326df5ad5f4ec403c48`. The first parent contains security sprint `91e3c67` and audit #66; the second contains owner console #68 and growth #71. | `main` at `c8f5d89a57f90bf817157326df5ad5f4ec403c48`. The public site returned HTTP 200 on September 27; its Cloudflare deployment/source identity was not independently read in this task. |
| Backend | Parents: owner console `1bbcab6bf1e2483d8a769bf12534039c397a994d` and security sprint `6a602f80c892e88474d52369e0c172f08292b132`. The former contains audit backend #63. The site exporter refreshed the backend's `src/playground/export.ts` vendor copy. | Vercel's `eidos-sentinel-lab.vercel.app` production alias resolves to deployment `dpl_8ztuTFv3h34YFuBSjHS31F8Q13aV`, source `a2da5fd9af21c02573e538fd30aaf7d5c690e457` on `main`, READY. |

Site and backend Git worktrees were clean before integration. All branch merges were performed in isolated worktrees. The site merge conflict with current `main` affected only an editorial generation timestamp; the later `main` report and both article records were retained. The sibling-branch conflicts in `ACCEPTANCE.md` and the Playground browser assertion were resolved to preserve both feature descriptions and the current format-specific cloud-save warning. No production alias, database, secret, Access policy, email, live charge, article publication or provider budget was changed.

## Evidence ledger

| Requirement | Observation | Environment and state |
| --- | --- | --- |
| Shared Works contract | `scripts/verify-paired-contract.mjs` matched 76/76 source/vendor files after exporting the one stale Playground handoff file. | Local combined working trees — **pass**. Runtime compatibility still requires hosted checks. |
| Site code | Typecheck, ESLint, Vite client/SSR build, prerender, Pages Functions build, URL and prerender verification passed. | Local combined site — **pass**. Build generators touched only the tracked latest-generation timestamp; restore that timestamp before publishing. |
| Site behavior | Audit 36/36, platform 29/29, Playground 26/26, growth 13/13, owner-console 5/5, finance 7/7 and analytics 1/1 passed. | Local combined site — **pass**. These do not exercise a live OAuth provider, inbox or payment webhook. |
| Backend code and behavior | TypeScript lint, Next production build, JavaScript 16/16 and TypeScript 60/60 tests passed. | Local combined backend — **pass**. No preview backend deployed from this combination. |
| Browser and accessibility | [Integrated Playground CI](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36351961881) passed actual React editor acceptance in Chromium, Firefox and WebKit at desktop and mobile widths, plus growth desktop/mobile acceptance. The cloud browser could not reach this workspace's local `127.0.0.1` preview (`ERR_BLOCKED_BY_CLIENT`); Vite preview also failed this host's network-interface enumeration. | Integrated CI browser — **pass**. Hosted paired browser, actual zoom, screen reader and physical touch — **not tested**. |
| Integrated CI and backend preview | [Site quality](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36351961899), [Wellway acceptance](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36351961895), Playground editor CI above and [backend quality](https://github.com/bmparent/eidos/actions/runs/36351941145) all passed on the integrated GitHub heads. Vercel reports backend deployment `dpl_eZdXVfe3ScXMcju2rYCKADzCmsyp` READY at source `5d0696a7fe44b3b30729cc4c27885e0f02aad1f8`. | GitHub CI and backend build — **pass**. Backend preview is not yet paired with an integrated Pages deployment or accepted database/bindings. |
| Owner security and inquiry | Signed Access, Turnstile/quota and audit code are present in the combination. Migrations and matching scoped preview bindings have not been applied to a new paired preview. | Hosted combined security — **not tested**. Keep all owner and inquiry release claims scoped to the earlier September 26 preview. |
| Accounts, Playground and money | September 26 passed one Stripe TEST payment, ledger reconciliation and archive download on an earlier pair. Personal Google consent, two-account cloud reopen, exact signed event receipt, guest recovery and refund/dispute remain open. | Combined hosted pair — **not tested**. No LIVE payment or paid AI activation. |

## Next acceptance sequence

1. Draft [site #73](https://github.com/bmparent/brent-parent-intelligence-studio/pull/73) and [backend #67](https://github.com/bmparent/eidos/pull/67) have exact local/GitHub tree parity and integrated CI. Retain the currently deployed revisions as rollback targets.
2. Deploy a **new isolated pair**, apply additive preview migrations and configure only the scoped Access, growth DB, Turnstile and relay bindings needed for that pair. Verify exact runtime source, database/environment and disabled paid flags before testing.
3. Exercise anonymous/wrong-owner/expired JWT and CSRF denial, audit retention, one controlled inquiry with provider and inbox receipt, two distinct real test accounts with owned save/reopen, Google consent/recovery, and Stripe TEST event/replay/download/recovery/refund. Record provider receipts separately from browser observations.
4. Check phone and desktop interaction, keyboard, actual zoom/screen reader and physical touch. Keep Snapshot capture/generation, paid AI and authoring disabled until their independent gates pass.

Do not merge the draft PRs into `main` while these gates are open: the site `main` workflow can deploy production. Preserve account IDs, ledgers, archives and additive migrations on any rollback.
