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

## Account-origin repair — October 13 follow-up

Brent authorized tracing the pre-sign-in failure and restoring the paired account preview. This change starts from recovered site #98 `3c115b6dd040a42cd6650e1b3cb4b670888cf01f` and retains exact backend #67 `c18b580358dcfeb0b70ba7a045c8f506513f452f`, deployment `dpl_E92pXn87UwWsESL3AGzGFbst2ewe`. Historical October 6 source and deployment identities remain historical receipts; they are not overwritten or newly accepted.

The failing frontend request is `GET /api/members/account`. Pages forwards its actual hostname in `x-eidos-site-origin`; the backend's authenticated dispatcher rejects unrecognized origins with HTTP 403 and `Unrecognized studio origin.` The frontend previously reduced every non-2xx response to `Your account could not load. Please try again.` Read-only Vercel configuration confirms both `PUBLIC_SITE_URL` and `EIDOS_PREVIEW_ORIGINS` are exactly `https://eidosworks-test-20260923.pages.dev`. The immutable `d306ad39` origin is absent. The named configuration owner is `1brentbm-1876` on Vercel project `prj_5aL0COF1DONfPKI4fv25NitAdkOE`; the existing guarded Site #98 workflow owns the Pages relay destination. This is a source/configuration diagnosis, not a captured authenticated production request.

Current evidence distinguishes three observations:

- The real browser reproduced the frozen immutable error and loaded the canonical Create account form with password, Google and email-link methods.
- Existing exact-site workflow [38433119305](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38433119305) passed its provider/asset/contract and anonymous-account boundaries on recovered site `3c115b6`, backend `c18b580`. Its sanitized receipt is preserved as `artifacts/acceptance-20261013/account-origin-before.json`.
- Shell HTTP diagnostics received Cloudflare browser-signature denials on both hosts; direct browser navigation to the JSON endpoint was blocked by the browser client. Those observations do not establish the application response. No user-agent substitution or security change was made.

The repair redirects GET/HEAD navigation for Account, account verification/reset/unsubscribe and Playground from aliases of the single existing isolated Pages project to its canonical account origin before rendering. It preserves the path and query, issues no cookie, and does not redirect POSTs or API requests. Canonical, production, unrelated project and spoofed hostnames retain their behavior. The backend exact-origin guard, OAuth redirect allowlist, relay credentials, isolated database and provider permissions remain intact. The guarded preview verifier now checks these alias redirects and records the canonical account acceptance URL along with exact source and asset identities.

The final PR receipt records the committed repair SHA, isolated deployment and real browser redirect result. The required next controlled steps are password signup/confirmation/reset and Google consent/signup, followed by two-member save/reopen and cross-owner denial. User-controlled credential entry, signup terms and Google consent are still required; no fixture or provider build is counted as their completion.

Read-only branch metadata still shows no branch-scoped `RESEND_API_KEY` for templates #102/#71. This does not establish the absence of a generic Preview variable or a deployed secret; receipt/recovery remains unverified. Account preview mail already has a restricted branch-scoped sending binding. Signed Stripe TEST lifecycle and receipt/recovery are separate gates and remain open until their real outcomes are observed.

### Hosted repair and current provider check

The first repair upload `b2e285ac` at site `43c2e4f3691dd451ff7cf816f1193b01e2d603a7` succeeded. Its workflow [38437990394](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/38437990394) stopped because the immutable alias returned 404 immediately after upload. A subsequent real-browser navigation from that same immutable Account URL redirected to the canonical host and visibly loaded the complete Create account form. The verifier now waits at most 90 seconds for transient 404/503 propagation; it stops immediately on 401/403/429, a rendered nonredirecting alias page, an unexpected destination or a cookie-bearing redirect. These behaviors have separate tests; the final exact repair/upload receipt is recorded on #98.

Read-only schema/provider verification at `2026-10-13T17:24:11.066Z` on diagnostic preview `dpl_7bP5xVYdMKPV6g4x5f1nd35z14bK` passed all 35 tables / 54 objects, quick check and zero foreign-key violations. It confirmed the known isolated database identity at backend `c18b580`. The sanitized receipt is `artifacts/acceptance-20261013/account-origin-schema.json`. The canonical relay still targets `dpl_E92pXn87UwWsESL3AGzGFbst2ewe`; this diagnostic did not change it or the production alias/configuration. Existing records were preserved.

The isolated store has two member rows but zero password records, Google links, sessions, owned projects, orders or Stripe events. Aggregate rows are not proof of completed user identities. Password/Google provider configuration, account mail and the kit TEST key/webhook binding are present. The separate Playground Stripe key and webhook binding are absent. The connected Stripe session exposes only the LIVE Eidos Works account, so that connector cannot run the authorized TEST lifecycle; no LIVE operation was attempted. Test credentials being present on the backend does not prove provider delivery or signed-event acknowledgement.

Local repair verification passes lint, TypeScript, client/SSR build, Functions build, prerender, URL checks, 40 platform tests, seven preview/isolation/verifier tests and 77/77 shared contract files. Password and Google completion, confirmation/reset inbox receipt, two-member hosted ownership, authorized owner console and signed TEST money/recovery remain open. The secure browser flow requires the user to complete account creation and consent; all reachable preparation is finished before that handoff.
