# Wellway hosted AI service

A private Cloudflare Worker called through the existing Eidos Works Pages project. No Google Cloud service, new paid platform subscription, hosted patient database, device capture or advisor messaging is added.

## Owner configuration

Checked-in configuration disables inference with zero budgets. Use an owner-approved Wrangler login including `account:read user:read pages:write workers_scripts:write`. Wrangler adds its refresh scope automatically.

```sh
node node_modules/wrangler/bin/wrangler.js deploy --config ops/wellway-ai/wrangler.jsonc
node node_modules/wrangler/bin/wrangler.js secret put OPENAI_API_KEY --config ops/wellway-ai/wrangler.jsonc
node node_modules/wrangler/bin/wrangler.js secret put WELLWAY_RATE_SECRET --config ops/wellway-ai/wrangler.jsonc
```

Use secure prompts or a subprocess pipe from an existing environment variable. Never put values in command arguments, logs, the client, GitHub or Drive. The rate secret is random server-side HMAC material; keep it stable across deployments.

Add the Pages **service** binding `WELLWAY_AI` → `eidos-wellway-ai` for the intended environment. Immediately before updating, read `eidosworks` deployment configuration and preserve existing services, variables, compatibility flags and other bindings. The root Wrangler configuration is a local fixture; do not deploy its placeholder bindings.

After explicit budget approval, deploy with the approved values. Launch approval is $1 lifetime and $0.25 per UTC day, without automatic renewal:

```sh
node node_modules/wrangler/bin/wrangler.js deploy --config ops/wellway-ai/wrangler.jsonc --var WELLWAY_AI_ENABLED:true --var WELLWAY_TOTAL_MICRO_USD:1000000 --var WELLWAY_DAILY_MICRO_USD:250000
```

There is no public workers.dev or preview route. Deploy the complete Pages app, including `functions/api/wellway/[[path]].ts`, and verify `/api/wellway/status`. Use fictional records for all inference tests.

## Spending and access controls

One SQLite Durable Object named `wellway-showcase-budget-v1` owns the allowance. Inference runs outside it. An atomic transaction checks global lifetime/daily caps, global 100/day admission, per-network 12/day and three/minute limits, and duplicate IDs before reserving cost. Network addresses and request identifiers are HMAC hashed; no raw address or member content is persisted. Old daily receipts are pruned; lifetime spending remains.

Reservation = `ceil((UTF8_bytes(payload) + 512) × 0.4 + 1200 × 1.6)` micro-USD. It overestimates text input tokens and reserves the maximum output at the snapshot’s [standard price](https://developers.openai.com/api/docs/models/gpt-4.1-mini). Failed, cancelled and incomplete requests retain reservations. This bounds this service’s model usage at that price, not other account applications or provider price changes. Review prices before changing models or relaunching.

Limits: 100,000-byte body; 1,000-character question; six bounded history turns; 240 evidence records; 28 displayed plus 28 comparison days; 1,200 output tokens; 25-second upstream and 32-second client timeouts. Server validation enforces scope/source membership and recomputes summaries. There are no tools or plan-write endpoints.

## Verification and recovery

```sh
node --import tsx --test ops/wellway-ai/ledger.test.ts ops/wellway-ai/runtime.test.ts
```

Tests cover SQLite transactions and restarts, concurrent admission, duplicates, new identities, daily rollover, disabled configuration, a mock provider in the actual Miniflare runtime, body limits and Pages origin/IP handling. Mock tests do not establish successful OpenAI inference.

If status is unavailable, check the feature flag, secrets, positive caps, binding and remaining reservations. Budget exhaustion is expected; guided answers remain available. There is no automatic top-up or reset endpoint.

Disable paid use by redeploying checked-in zero-budget configuration. Roll back the app with the previous complete Pages deployment in the release receipt. Preserve the Durable Object class, namespace, object name and lifetime counter. Never reset storage or rename the object to restore allowance. Increasing the total needs owner approval.

Architecture references: [Pages service bindings](https://developers.cloudflare.com/pages/functions/bindings/), [SQLite Durable Object storage](https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/).
