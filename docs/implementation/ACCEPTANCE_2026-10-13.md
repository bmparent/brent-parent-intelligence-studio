# Works paired-candidate recovery — October 13, 2026

Brent requested starting today's Command Center priorities. This continuation recovers the held account candidate against current public main, preserving its account, Playground and private-owner features and the newer accepted Community behavior. Production remains NO-GO pending real identity and provider acceptance.

## Source and recovery

- Starting site #98: `9120d53d8f27104a9d1903d64bd19af7a54f93c2`; current public main merged as a second parent: `fb74c4cf00defef23ce3ee96af4e51c350c3e807`.
- Starting backend #67: `98314f33043f3772642acf64abba3a1db2567752`; current backend main merged as a second parent: `4c746ffccf9249c7ddabd58f839ecb5fcece4fd0`.
- Site conflicts were the Community thread renderer and package scripts. The renderer retains current main's immediate replies, Reply controls, favicon and cache-versioned assets. Package scripts retain both new Community tests and the held Playground journey test.
- The backend's matching thread-renderer conflict is resolved through the canonical site export. All registered shared files and the newly added studio-agent module must match at the final committed pair; parity now checks 77 files rather than silently omitting the new module.
- Historical preview and acceptance receipts retain their original SHAs. Recovery is preparation, not evidence that the previous hosted account or payment gates passed.

## Current hosted observations

| Requirement | Observation | State |
| --- | --- | --- |
| Canonical isolated Account UI | The existing `https://eidosworks-test-20260923.pages.dev/account/` displays Create account, password, Google and email-link methods. | UI available on frozen preview |
| Immutable Pages account URL | The immutable `d306ad39` URL displays an account-load error, while the canonical host works. Account/OAuth origin configuration is pinned to the canonical validation host; use that host for identity acceptance. | Canonical host required; no origin protection relaxed |
| Direct backend content | The authorized Vercel fetch failed with `deployment_authentication_required` after its provider-managed share-link attempt. This did not establish backend health or authorize weakening protection. | Read coverage blocked |
| Password/Google signup, inbox delivery, two-owner persistence and owner console | No new identity was created, consent accepted or message sent in this preparation. These require the controlled user identity and actual inbox observation. | Not tested; remains open |
| Template preview mail | Current `codex/paid-templates-20261010` branch metadata contains no branch-scoped `RESEND_API_KEY`, and its latest observed deployment remains the October 11 exact backend `f9f8cd3`. The unfiltered metadata listing was truncated, so it does not establish complete generic Preview coverage. | Preview key/redeployment still needs verification |
| Stripe TEST lifecycle | LIVE identity evidence does not establish TEST access, Quote Desk product/webhook mapping or signed TEST events/replay/refund/recovery. | Open |

## Verification and rollout

Local site checks passed: platform 37, audit 36, Playground 26, owner console 8 and preview isolation 4 (111 total). Lint, TypeScript/client/SSR build, Functions compilation, prerender, editorial, source/built Insights validation and URL checks pass. The paired backend passed 16 JavaScript and 66 TypeScript checks across the full run and the focused corrected Community rerun, plus TypeScript and Next build. Its remote recovered commit is `c18b580358dcfeb0b70ba7a045c8f506513f452f`; its exact source tree matches the locally tested tree `93ec70533ee6496d282f18398b0855e811aa8d1d`.

The guarded preview workflow is pinned to that backend commit and READY preview deployment `dpl_E92pXn87UwWsESL3AGzGFbst2ewe` at `https://eidos-sentinel-l2sbf8qf1-1brentbm-1876s-projects.vercel.app`. The new exact-site upload must be verified separately; READY is build evidence, not user acceptance.

The final PR receipt records actual local checks, exact source pair and any new preview identity. An isolated preview may be refreshed only through the existing guarded workflow and dedicated database bindings. Keep production, LIVE payments, paid AI, Snapshot and new-format authoring gated.

Real acceptance requires one completed password identity and one completed Google identity; recipient-observed confirmation/reset; save, logout and reopen; cross-owner project/revision denial; authorized owner-console evidence; and signed TEST payment, replay, refund and recovery on the exact candidate. A local fixture pass or READY deployment does not close these gates. Preserve existing records and additive schemas; rollback source is the frozen starting pair above.
