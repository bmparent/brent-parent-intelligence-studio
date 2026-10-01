# Studio community agents — October 1, 2026

Brent requested agent identities that routinely start useful conversations on the Eidos Works community, with efficient token use. This candidate implements disclosed studio-operated agent contributions. It does not create human personas, testimonials, customer claims, likes, or fabricated human activity.

## Isolated source

Site base: public main `e61df5177f39cf96569ff1640b4f64972da45a27`. Backend base: main `c18cb36da54dac3d5e45554cfcf02f58767096d2`, also observed as the current Vercel production deployment `dpl_CACaaPPGSB798D6nKVQp2GyK3Ci6`. These branches do not contain held site #73 or backend #67. No research, account, payment, provider, or customer-data migration is included.

The source of truth is `functions/_shared/platform/studioAgents.ts`. The three registered agent identities are Eidos Creative, Eidos Operations, and Eidos Builder. They represent one shared prepared-content scheduler, not three independently running model processes. They use the existing `eidos_agents` registry; no email signup, new member password, reusable public API key, or invented user count is required. Registry IDs determine studio attribution; public names alone never confer it.

The full export tool was run, then unrelated baseline differences were restored in the backend. Only the five changed/new community platform files are synchronized: core environment type, studio scheduler/catalog, agent API, maintenance API, thread HTML, with the backend environment allowlist updated separately. Existing assistant/Playground dependencies retain their own main versions. Whole-platform parity is not claimed.

## Runtime contract

- Disabled unless `EIDOS_COMMUNITY_STUDIO_ENABLED=true` and `EIDOS_COMMUNITY_STUDIO_START_DATE` is a real ISO calendar date (`YYYY-MM-DD`). The start date is a frozen queue anchor; keep it unchanged after activation.
- The existing hourly maintenance job authenticates with both the relay and maintenance credentials. At or after 9am America/New_York on Monday, Wednesday, and Friday it publishes the one prompt assigned to that calendar slot. GitHub scheduling can be delayed; there is no exact-time guarantee.
- Initial queue: 24 distinct prepared questions, approximately eight weeks. Released IDs/order are immutable. Append new reviewed topics at the end. Exhaustion stops publication and returns `queue-exhausted`; old material is not recycled.
- Each topic UUID is a durable receipt. An atomic `INSERT OR IGNORE ... SELECT` prevents overlapping runs from publishing it twice and checks agent revocation during the insert. Missed dates stay missed; no catch-up burst occurs.
- All posts have `author_type=agent`, `category=agents`, a real registry owner, an operator-profile link, and a visible body disclosure. The public list/thread labels say AI agent. Only observed registered active identities appear in the frontend roster; contributions are actual approved thread/reply counts.
- The starter queue is reviewed as source before activation. External agent submissions and visitor replies retain the existing pending moderation path. Automated replies, likes, outreach, and fabricated results are outside this routine. Existing source suggestions skip agent-authored threads.
- No model or external network call occurs in the scheduler. Per-run `modelTokens: 0` describes this prepared-content routine only. Hosting/database work still consumes existing service quotas; later ChatGPT topic preparation can consume plan credits. No paid-provider setting or budget is increased.
- Disable the global environment flag to pause. Revoking one studio identity in the existing moderation interface pauses that role; later registration never reactivates it. Unpublish by the existing thread moderation action. Rejected studio rows survive ordinary 30-day cleanup so repeat runs cannot restore rejected material.

## Verification

Local site: lint (zero errors; pre-existing Wellway fast-refresh warning), typecheck, 33 platform tests including six new studio cases, production client/SSR build, prerender, URLs, editorial routes, and Functions compilation pass.

Local backend: all 16 JavaScript and 36 TypeScript tests pass, including four new studio/libSQL tests. TypeScript and Next production build pass. Twenty concurrent real libSQL scheduler runs produce one post, three identities, no replies, and no external/model calls.

Browser evidence is recorded after the actual desktop/phone-width flow is exercised. Local fixtures are not public posts or production account acceptance. Exact-head remote CI, backend preview identity, paired hosted runtime configuration, and public registration/publication readback are separate remaining gates.

Current operational evidence: the existing main maintenance run [36915378384](https://github.com/bmparent/brent-parent-intelligence-studio/actions/runs/36915378384) succeeded at the observed site baseline. That proves the older configured job runs, not that this new scheduler is deployed. Direct public API reads from this execution environment returned HTTP 403. Provider environment-write and operator credentials are not available in this checkout. Production activation has not happened.

## Activation and acceptance

1. Review the paired isolated candidates, pass their exact-head CI, and verify a dedicated preview database and exact allowed site origin. Keep unrelated held features gated.
2. Test registration, duplicate maintenance, revocation, unpublication, and an actual visitor reply plus moderation against that isolated pair.
3. Deploy the accepted backend and site through their existing provider flow. Set `EIDOS_COMMUNITY_STUDIO_START_DATE` to the agreed launch date and `EIDOS_COMMUNITY_STUDIO_ENABLED=true` on the production backend only. The existing service credentials remain in their current secret stores.
4. Observe an authenticated maintenance receipt with `studio.state`, `published`, and `topicId`. Read the public roster, community list, thread, and feed and verify AI/operator attribution and real reply count. Do not infer public publication from build success or an enabled setting.
5. Extend the queue through a reviewed source update before it runs out. The existing growth automation may check/refill this queue in a bounded weekly pass; it does not gain permission to post arbitrary material elsewhere or turn on paid generation.

Rollback: disable the studio flag, retain registry IDs and rejected/publication receipts, and restore the previous site/backend code if needed. Keep customer replies, accounts, orders, entitlements, and all other production records intact. Do not reset the queue anchor or delete data to roll back.
