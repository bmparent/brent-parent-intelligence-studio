import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const dir = 'artifacts/insights/runs/2026-09-11-evening-strategy';
const auth = await readFile(`${process.env.APPDATA}/xdg.config/.wrangler/config/default.toml`, 'utf8');
const token = process.env.CLOUDFLARE_API_TOKEN || auth.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
assert.ok(token, 'Existing authenticated Wrangler credentials required');
const response = await fetch('https://api.cloudflare.com/client/v4/accounts/ae4f6116c302b50dd1efe0e6a65caaf9/pages/projects/eidosworks', { headers: { Authorization: `Bearer ${token}` } });
assert.ok(response.ok, `Provider metadata HTTP ${response.status}`);
const payload = await response.json();
assert.ok(payload.success);
const p = payload.result;
assert.equal(p.production_branch, 'main');
assert.ok(p.domains.includes('eidos-works.com'));
function stable(v) {
  if (Array.isArray(v)) return v.map(stable);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(k => [k, stable(v[k])]));
  return v;
}
const receipt = {
  checkedAt: new Date().toISOString(),
  configFingerprint: createHash('sha256').update(JSON.stringify(stable(p.deployment_configs))).digest('hex'),
  productionBranch: p.production_branch,
  domains: p.domains,
  sourceType: p.source?.type ?? 'direct-upload',
  deploymentId: p.canonical_deployment?.id,
  commit: p.canonical_deployment?.deployment_trigger?.metadata?.commit_hash,
  status: p.canonical_deployment?.latest_stage?.status
};
const phase = process.argv[2] || 'before';
assert.ok(['before', 'preupload', 'after'].includes(phase));
if (phase !== 'before') {
  const before = JSON.parse(await readFile(`${dir}/provider-before.json`, 'utf8'));
  assert.equal(receipt.configFingerprint, before.configFingerprint, 'Provider configuration changed');
  receipt.configUnchanged = true;
}
await writeFile(`${dir}/provider-${phase}.json`, JSON.stringify(receipt, null, 2) + '\n');
console.log(JSON.stringify(receipt));
