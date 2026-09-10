import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const token = process.env.CLOUDFLARE_API_TOKEN;
const account = process.env.CLOUDFLARE_ACCOUNT_ID;
assert.ok(token && account, 'The existing Cloudflare deployment credentials are required.');
const receiptPath = path.join(process.env.RUNNER_TEMP || '/tmp', 'pg-pages-receipt.json');
async function project() {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/pages/projects/eidosworks`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(response.ok, true, 'Cloudflare project metadata could not be read.');
  const body = await response.json();
  assert.equal(body.success, true, 'Cloudflare did not confirm the existing project.');
  return body.result;
}
function identity(value) {
  assert.equal(value.production_branch, 'main', 'Unexpected production branch; do not change provider configuration.');
  assert.ok(value.domains.includes('eidos-works.com'), 'The custom domain is not attached to the expected project.');
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}
function fingerprint(value) {
  return createHash('sha256').update(JSON.stringify(stable(value.deployment_configs || {}))).digest('hex');
}
const current = await project();
identity(current);
if (process.argv[2] === 'preflight') {
  const receipt = { commit: process.env.GITHUB_SHA, configFingerprint: fingerprint(current), domains: current.domains, productionBranch: current.production_branch, checkedAt: new Date().toISOString() };
  await writeFile(receiptPath, JSON.stringify(receipt, null, 2));
  console.log('Existing Pages identity verified. Configuration is unchanged; no credential values are recorded.');
} else {
  const before = JSON.parse(await readFile(receiptPath, 'utf8'));
  assert.equal(fingerprint(current), before.configFingerprint, 'Pages configuration changed during deployment; inspect before claiming success.');
  const end = Date.now() + 180000;
  const local = await readFile('dist/playground/index.html', 'utf8');
  const assets = [...local.matchAll(/(?:src|href)="(\/assets\/[^" ]+\.(?:js|css))"/g)].map(match => match[1]);
  assert.ok(assets.length > 0, 'Built Playground entry assets were not found.');
  let verified = false;
  while (Date.now() < end) {
    const response = await fetch(`https://eidos-works.com/playground/?release=${encodeURIComponent(before.commit)}`, { cache: 'no-store' });
    const delivered = await response.text();
    if (response.ok && new URL(response.url).pathname.replace(/\/$/, '') === '/playground' && assets.every(asset => delivered.includes(asset))) { verified = true; break; }
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  assert.ok(verified, 'The custom domain has not delivered this exact build yet.');
  const after = await project();
  identity(after);
  assert.equal(fingerprint(after), before.configFingerprint, 'Provider configuration drifted.');
  const deployment = after.canonical_deployment;
  assert.equal(deployment?.deployment_trigger?.metadata?.commit_hash, before.commit, 'Production deployment commit does not match the verified source.');
  await writeFile(receiptPath, JSON.stringify({ ...before, verifiedAt: new Date().toISOString(), deploymentId: deployment.id, deliveredEntryAssets: assets, configUnchanged: true }, null, 2));
  console.log('Production commit and delivered entry assets verified; provider configuration unchanged.');
}
