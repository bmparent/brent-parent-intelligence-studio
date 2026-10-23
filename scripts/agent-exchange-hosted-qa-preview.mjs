import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

const account = process.env.CLOUDFLARE_ACCOUNT_ID, token = process.env.CLOUDFLARE_API_TOKEN;
assert.ok(account && token, 'Existing Pages credentials required');
const projectName = 'eidos-exchange-qa-20261023';
async function api(project, suffix = '', method = 'GET', body) {
  assert.ok(['eidosworks', projectName].includes(project));
  assert.ok(method === 'GET' || project === projectName, 'Never mutate customer production');
  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/pages/projects`;
  const response = await fetch(url + (method === 'POST' && !suffix ? '' : '/' + project + suffix), {
    method, headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}), redirect: 'error', signal: AbortSignal.timeout(20000),
  });
  if (response.status === 404 && method === 'GET') return null;
  assert.ok(response.ok, 'QA provider operation failed; credentials/provider body omitted');
  const data = await response.json(); assert.equal(data.success, true); return data.result;
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}
const production = await api('eidosworks');
assert.equal(production.production_branch, 'main');
const fingerprint = createHash('sha256').update(JSON.stringify(stable(production.deployment_configs))).digest('hex');
const path = process.env.RUNNER_TEMP + '/exchange-qa-preview.json';
if (process.argv[2] === 'before') {
  await writeFile(path, JSON.stringify({ source: process.env.GITHUB_SHA, productionDeploymentId: production.canonical_deployment?.id,
    productionConfigFingerprint: fingerprint, time: new Date().toISOString() }, null, 2));
  if (!await api(projectName)) await api(projectName, '', 'POST', { name: projectName, production_branch: 'main' });
  const qa = await api(projectName);
  assert.equal(qa.name, projectName); assert.equal(qa.production_branch, 'main');
} else {
  const before = JSON.parse(await readFile(path, 'utf8'));
  assert.equal(before.productionDeploymentId, production.canonical_deployment?.id, 'Customer production changed independently; inspect before proceeding');
  assert.equal(before.productionConfigFingerprint, fingerprint, 'Customer provider configuration changed; inspect before proceeding');
  const deployments = await api(projectName, '/deployments');
  const exact = deployments.find(d => d.environment === 'preview' && d.deployment_trigger?.metadata?.commit_hash === process.env.GITHUB_SHA && d.latest_stage?.status === 'success');
  assert.ok(exact, 'Exact QA preview not found');
  const denied = await fetch('https://qa.' + projectName + '.pages.dev/api/community/agent-registration', { redirect: 'error' });
  assert.ok([401, 503].includes(denied.status), 'Unauthenticated QA access must be denied');
  await denied.arrayBuffer();
  await writeFile(path, JSON.stringify({ ...before, verifiedAt: new Date().toISOString(), previewUrl: exact.url,
    previewDeploymentId: exact.id, baseUrl: 'https://qa.' + projectName + '.pages.dev',
    unauthenticatedStatus: denied.status, productionUnchanged: true, productionConfigUnchanged: true }, null, 2));
  console.log('Verified protected QA edge preview: ' + exact.url);
}
