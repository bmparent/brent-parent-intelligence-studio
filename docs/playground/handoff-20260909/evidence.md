# Reliability verification checkpoint

Scope: partial Change 1 only. Changes 2 (media/brand), 3 (structure) and 4 (AI) are NOT IMPLEMENTED. Production unchanged. No AI calls or real sales enabled.

| Environment | Gate | Status | Evidence / limitation |
|---|---|---|---|
| Local | Workspace identity reducer regressions | PASS | scripts/test-playground-workspace.ts; four tests: A/B undo, detached replacements, late save head, UTF-8 boundary |
| Local | Playground tests | PASS | npm run test:playground: 13/13; six affected tests rerun after adding expectedOwner rejection |
| Local | Platform and glass tests | PASS | npm run test:platform: 26/26; npm run test:glass: 3/3 |
| Local | Frontend build/typecheck/lint | PASS | npm run build; npm run lint |
| Local | Prerender and Pages Functions | PASS | npm run verify:prerender; npm run build:functions |
| Local | Backend tests/typecheck/build | PASS | apps/sentinel-lab: npm run lint; npm test: 16+32 passed; npm run build |
| Local | Chromium/Firefox/WebKit baseline reproduction and changed UI | BLOCKED | Required binaries missing; download failed ENOSPC; installed Edge launch also failed. No successful browser screenshot or reproduction is claimed. |
| Local | Standalone ZIP/header browser checks | NOT RUN | Browser blocker; existing unit ZIP tests passed, which does not establish actual browser download behavior. |
| Preview | Two real member accounts through public relay | BLOCKED | Dedicated inbox identities and normal challenge/email sign-in still required. No sessions minted or auth rows edited. |
| Preview | Stripe-generated checkout delivery/refund/dispute | BLOCKED | Dedicated Playground TEST configuration and legitimate member flow not verified. No provider payment/event IDs or delivery hashes exist. |
| Preview | Deployment verification | NOT RUN | Preview creation pending at this checkpoint. |
| Production | Deployed baseline identification | PASS | Pages c5d2525feb006a07a7ac00e19d2d8c574e220b5c, deployment 5c362fa8-fab1-4419-b3fe-96efb03d614b; Vercel a2da5fd9af21c02573e538fd30aaf7d5c690e457, dpl_8ztuTFv3h34YFuBSjHS31F8Q13aV. Read-only provider inspection. |
| Production | New reliability behavior | NOT RUN | No production release authorized or performed. |
| Production | Physical iPhone Safari / authorized InkSoft host | BLOCKED | Actual device and authorized target environment required. |
| Local | Media/brand, schema v2, optional AI changes | NOT RUN | Disk reports zero free bytes; remaining implementation deferred, not represented as completed. |

Browser attempt receipts and script: C:/Users/bmpar/SystemDiagnostics/playground-20260909/browser-reliability.json and browser-reliability.mjs. These use local intercepted API fixtures, not real authentication.

The first typecheck exposed an Action union narrowing error, fixed by discriminating Undo and Redo separately. The later complete frontend build passed. The initial browser runner had a Windows ESM path error; fixed to file:/// before the missing-binary/ENOSPC blocker. No checks were removed to obtain a pass.

A request to remove only the disposable .next/cache created during this task was rejected by automatic approval review as blocked by policy; no cleanup occurred. Existing user files and production settings were preserved.
