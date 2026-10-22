import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, appendFile } from 'node:fs/promises';
const token = process.env.CLOUDFLARE_API_TOKEN, account = process.env.CLOUDFLARE_ACCOUNT_ID;
assert.ok(token && account, 'Existing Pages deployment credentials are unavailable.');
const endpoint = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/pages/projects/eidosworks`;
async function api(suffix = '') {
  const response = await fetch(endpoint + suffix, { headers: { authorization: 'Bearer ' + token } });
  assert.ok(response.ok, 'Pages metadata read failed.');
  const data = await response.json(); assert.equal(data.success, true); return data.result;
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}
const project = await api();
assert.equal(project.production_branch, 'main');
assert.ok(project.domains.includes('eidos-works.com'));
const fingerprint = createHash('sha256').update(JSON.stringify(stable(project.deployment_configs))).digest('hex');
const path = process.env.RUNNER_TEMP + '/pilot-preview.json';
if (process.argv[2] === 'before') {
  await writeFile(path, JSON.stringify({ siteRevision: process.env.GITHUB_SHA, productionDeploymentId: project.canonical_deployment?.id, configFingerprint: fingerprint, observedAt: new Date().toISOString() }, null, 2));
} else {
  const before = JSON.parse(await readFile(path, 'utf8'));
  assert.equal(fingerprint, before.configFingerprint, 'Provider settings changed during this preview.');
  assert.equal(project.canonical_deployment?.id, before.productionDeploymentId, 'Production changed during the preview; inspect its independent deployment before reporting.');
  const log = await readFile(process.env.RUNNER_TEMP + '/pilot-upload.log', 'utf8');
  const url = log.match(/https:\/\/[a-f0-9]{8}\.eidosworks\.pages\.dev/)?.[0];
  assert.ok(url, 'The immutable preview URL was not returned.');
  const deployments = await api('/deployments');
  const deployment = deployments.find(item => item.url === url);
  assert.ok(deployment, 'The exact preview deployment was not returned by the provider.');
  assert.equal(deployment.environment, 'preview');
  assert.equal(deployment.deployment_trigger?.metadata?.commit_hash, process.env.GITHUB_SHA);
  assert.equal(deployment.latest_stage?.status, 'success');
  for (const file of ['community/agents/index.html', 'community/agent-challenge.json', 'agent-exchange-starter.mjs', 'agent-exchange-demo/index.html']) {
    const route = file.endsWith('/index.html') ? file.slice(0, -10) : file;
    const response = await fetch(url + '/' + route);
    assert.ok(response.ok, 'The preview route is unavailable: ' + route);
    const served = await response.text(), expected = await readFile('dist/' + file, 'utf8');
    if (file.endsWith('.html')) assert.ok(served.includes(file.includes('agent-exchange-demo') ? 'Fixed practice fixture' : 'Find one keyboard issue.'), 'The preview HTML does not contain the candidate.');
    else assert.equal(served, expected, 'The preview artifact differs: ' + file);
  }
  await writeFile(path, JSON.stringify({ ...before, previewUrl: url, previewDeploymentId: deployment.id, configUnchanged: true, productionUnchanged: true, verifiedAt: new Date().toISOString() }, null, 2));
  await appendFile(process.env.GITHUB_ENV, 'PILOT_BASE_URL=' + url + '\n');
  console.log('Verified exact pilot preview: ' + url);
}
