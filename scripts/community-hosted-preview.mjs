import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const previewProject = 'eidosworks-test-20260923';
const origin = 'https://' + previewProject + '.pages.dev';
const backend = 'https://eidos-sentinel-asqzjumqv-1brentbm-1876s-projects.vercel.app';
const previousBackend = 'https://eidos-sentinel-ovyj84tjg-1brentbm-1876s-projects.vercel.app';
const output = resolve(process.env.RUNNER_TEMP, 'community-hosted');
await mkdir(output, { recursive: true });
const path = resolve(output, 'receipt.json');
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, stable(value[k])])) : value;
const fingerprint = value => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
const sansRelay = configs => { const c = structuredClone(configs); delete c.production.env_vars.EIDOS_PLATFORM_URL; return c; };
async function api(project, suffix = '', method = 'GET', body) {
  assert.ok(['eidosworks', previewProject].includes(project));
  assert.ok(method === 'GET' || project === previewProject, 'Customer production is read-only');
  assert.ok(process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID);
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(process.env.CLOUDFLARE_ACCOUNT_ID)}/pages/projects/${project}${suffix}`, {
    method, headers: { authorization: 'Bearer ' + process.env.CLOUDFLARE_API_TOKEN, ...(body ? { 'content-type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}), redirect: 'error', signal: AbortSignal.timeout(20000),
  });
  assert.ok(response.ok, `Cloudflare ${method} failed with HTTP ${response.status}; credential-bearing payload omitted`);
  const data = await response.json(); assert.equal(data.success, true); return data.result;
}
const mode = process.argv[2];
if (mode === 'preflight') {
  const [p, production] = await Promise.all([api(previewProject), api('eidosworks')]);
  assert.equal(p.production_branch, 'codex/works-audit-implementation-20260921');
  assert.deepEqual(p.domains, [previewProject + '.pages.dev']);
  assert.equal(p.canonical_deployment.deployment_trigger.metadata.commit_hash, '9120d53d8f27104a9d1903d64bd19af7a54f93c2', 'Shared validation preview changed; do not overwrite concurrent work');
  const relay = p.deployment_configs.production.env_vars.EIDOS_PLATFORM_URL;
  assert.ok(relay && ['secret_text', 'plain_text'].includes(relay.type));
  assert.ok(p.deployment_configs.production.env_vars.EIDOS_PLATFORM_TOKEN);
  assert.ok(p.deployment_configs.production.env_vars.EIDOS_PLATFORM_PREVIEW_BYPASS);
  assert.ok(!relay.value || !relay.value.startsWith('https://') || relay.value === previousBackend, 'Unexpected previous backend');
  const receipt = { time: new Date().toISOString(), siteRevision: process.env.GITHUB_SHA,
    backendRevision: '67fbd9b85ce3c413d18159236dd77eca59a7ff9d', backendOrigin: backend,
    previousDeployment: p.canonical_deployment.id, previousBackend, relayType: relay.type,
    productionConfig: fingerprint(production.deployment_configs), baselineConfig: fingerprint(sansRelay(p.deployment_configs)), status: 'prepared' };
  await writeFile(path, JSON.stringify(receipt, null, 2));
  await api(previewProject, '', 'PATCH', { deployment_configs: { production: { env_vars: { EIDOS_PLATFORM_URL: { type: relay.type, value: backend } } } } });
  const configured = await api(previewProject);
  assert.equal(fingerprint(sansRelay(configured.deployment_configs)), receipt.baselineConfig);
  console.log('Prepared the isolated community preview; saved the prior deployment and relay rollback.');
} else if (mode === 'verify') {
  const receipt = JSON.parse(await readFile(path));
  const p = await api(previewProject);
  assert.equal(p.canonical_deployment.deployment_trigger.metadata.commit_hash, receipt.siteRevision);
  assert.equal(p.canonical_deployment.latest_stage.status, 'success');
  assert.equal(fingerprint(sansRelay(p.deployment_configs)), receipt.baselineConfig);
  const rosterResponse = await fetch(origin + '/api/community/agents', { redirect: 'error', signal: AbortSignal.timeout(30000) });
  assert.equal(rosterResponse.status, 200);
  const roster = await rosterResponse.json();
  assert.equal(roster.agents.filter(a => a.studio).length, 3);
  const id = '9ba4b87a-4fa8-48fd-a2a4-27c15d000001';
  for (const route of ['/api/community/threads?category=agents', '/community/thread/' + id, '/community/feed']) {
    const r = await fetch(origin + route, { redirect: 'error', signal: AbortSignal.timeout(30000) });
    assert.equal(r.status, 200, 'Paired preview route unavailable');
    assert.match(await r.text(), /AI agent|author_type|agent/);
  }
  assert.equal(fingerprint((await api('eidosworks')).deployment_configs), receipt.productionConfig);
  receipt.deploymentId = p.canonical_deployment.id; receipt.deploymentUrl = p.canonical_deployment.url;
  receipt.status = 'paired-http-passed'; receipt.customerProductionUnchanged = true;
  await writeFile(path, JSON.stringify(receipt, null, 2));
  console.log('Real isolated roster, thread list, disclosed thread and JSON feed passed through the frontend/backend relay.');
} else if (mode === 'restore') {
  let receipt;
  try { receipt = JSON.parse(await readFile(path)); } catch { console.log('No preview change receipt; nothing to restore.'); process.exit(0); }
  const p = await api(previewProject);
  assert.equal(fingerprint(sansRelay(p.deployment_configs)), receipt.baselineConfig, 'Preview changed concurrently; stop before restoration');
  assert.ok([receipt.siteRevision, '9120d53d8f27104a9d1903d64bd19af7a54f93c2'].includes(p.canonical_deployment.deployment_trigger.metadata.commit_hash), 'Concurrent preview deployment must not be rolled back');
  await api(previewProject, '', 'PATCH', { deployment_configs: { production: { env_vars: { EIDOS_PLATFORM_URL: { type: receipt.relayType, value: receipt.previousBackend } } } } });
  if (p.canonical_deployment.id !== receipt.previousDeployment) await api(previewProject, '/deployments/' + receipt.previousDeployment + '/rollback', 'POST');
  assert.equal((await api(previewProject)).canonical_deployment.id, receipt.previousDeployment);
  assert.equal(fingerprint((await api('eidosworks')).deployment_configs), receipt.productionConfig);
  receipt.previewRestored = true; await writeFile(path, JSON.stringify(receipt, null, 2));
  console.log('Restored the prior validation preview. Customer production remained unchanged.');
} else throw Error('Use preflight, verify, or restore');
