import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const previewProject = 'eidosworks-test-20260923';
export const previewOrigin = `https://${previewProject}.pages.dev`;
export const previewBranch = 'codex/works-audit-implementation-20260921';
export const backendRevision = '97d806d4d0a7a71575090e10d5e81aca1036b4e4';
export const backendOrigin = 'https://eidos-sentinel-ixfp83azz-1brentbm-1876s-projects.vercel.app';

export function requireIsolatedProject(project) {
  assert.equal(project.name, previewProject, 'Refusing an unexpected Pages project.');
  assert.equal(project.production_branch, previewBranch, 'The validation project branch changed.');
  assert.deepEqual([...project.domains].sort(), [`${previewProject}.pages.dev`], 'The validation project must have no customer/custom domain.');
  assert.ok(project.deployment_configs?.production?.env_vars?.EIDOS_PLATFORM_TOKEN, 'The existing validation relay credential is missing.');
  assert.ok(project.deployment_configs?.production?.env_vars?.EIDOS_PLATFORM_PREVIEW_BYPASS, 'The existing protected-preview relay binding is missing.');
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}
export function fingerprint(value) {
  return createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
}
export function withoutRelayUrl(configs) {
  const copy = structuredClone(configs);
  if (copy.production?.env_vars) delete copy.production.env_vars.EIDOS_PLATFORM_URL;
  return copy;
}

async function main(mode) {
  assert.ok(['preflight', 'verify'].includes(mode), 'Use preflight or verify.');
  assert.match(process.env.GITHUB_SHA || '', /^[a-f0-9]{40}$/, 'An exact candidate commit is required.');
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  assert.ok(account && token, 'The existing deployment credentials are unavailable.');
  const output = resolve(process.env.RUNNER_TEMP || '/tmp', 'works-paired-preview');
  await mkdir(output, { recursive: true });
  const receiptPath = resolve(output, 'receipt.json');
  async function project(name, method = 'GET', body) {
    assert.ok([previewProject, 'eidosworks'].includes(name), 'Unapproved metadata target.');
    assert.ok(method === 'GET' || (name === previewProject && method === 'PATCH'), 'Production writes are forbidden.');
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/pages/projects/${name}`, {
      method, redirect: 'error', signal: AbortSignal.timeout(20000),
      headers: { authorization: `Bearer ${token}`, ...(body ? { 'content-type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    assert.ok(response.ok, `Cloudflare ${method} ${name} failed with HTTP ${response.status}; no response values are logged.`);
    const value = await response.json();
    assert.equal(value.success, true, 'Cloudflare did not confirm the operation.');
    return value.result;
  }
  const isolated = await project(previewProject);
  requireIsolatedProject(isolated);
  const production = await project('eidosworks');
  assert.ok(production.domains.includes('eidos-works.com'), 'Production baseline identity could not be established.');

  if (mode === 'preflight') {
    const before = fingerprint(withoutRelayUrl(isolated.deployment_configs));
    const previousRelay = isolated.deployment_configs.production.env_vars.EIDOS_PLATFORM_URL;
    assert.ok(previousRelay && /^https:\/\/[^/]+\.vercel\.app\/?$/.test(previousRelay.value || ''), 'The current relay URL cannot be safely preserved; configure it through the provider.');
    if (previousRelay.value.replace(/\/$/, '') !== backendOrigin) {
      // PATCH only this ordinary URL; absent variable keys are retained by the
      // provider. Credentials, databases, mailer and Access bindings stay intact.
      await project(previewProject, 'PATCH', { deployment_configs: { production: { env_vars: {
        EIDOS_PLATFORM_URL: { type: 'plain_text', value: backendOrigin },
      } } } });
    }
    const configured = await project(previewProject);
    requireIsolatedProject(configured);
    assert.equal(fingerprint(withoutRelayUrl(configured.deployment_configs)), before, 'A binding other than the preview relay URL changed. Stop before deployment.');
    assert.equal(configured.deployment_configs.production.env_vars.EIDOS_PLATFORM_URL.value.replace(/\/$/, ''), backendOrigin, 'The immutable paired backend is not configured.');
    const productionAfter = await project('eidosworks');
    assert.equal(fingerprint(productionAfter.deployment_configs), fingerprint(production.deployment_configs), 'Production configuration changed; inspect before continuing.');
    await writeFile(receiptPath, JSON.stringify({
      checkedAt: new Date().toISOString(), siteRevision: process.env.GITHUB_SHA,
      backendRevision, backendOrigin, previewOrigin, previewProject, previewBranch,
      projectId: isolated.id, previousPreviewDeploymentId: isolated.canonical_deployment?.id || null,
      previousRelayOrigin: previousRelay.value, previewConfigFingerprint: fingerprint(configured.deployment_configs),
      productionConfigFingerprint: fingerprint(productionAfter.deployment_configs),
      productionDeploymentId: productionAfter.canonical_deployment?.id || null,
      productionRevision: productionAfter.canonical_deployment?.deployment_trigger?.metadata?.commit_hash || null,
      bindingPresence: {
        inquiryMailer: Boolean(configured.deployment_configs.production.service_bindings?.EIDOS_INQUIRY_MAILER),
        growthDatabase: Boolean(configured.deployment_configs.production.d1_databases?.EIDOS_GROWTH_DB),
      },
      acceptance: 'deployment preparation only; identity, ownership, signed TEST payment and delivery remain open',
    }, null, 2) + '\n');
    console.log('Verified the isolated test project and immutable backend relay. Production was read only; no credential values were recorded.');
    return;
  }

  const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
  assert.equal(receipt.siteRevision, process.env.GITHUB_SHA);
  assert.equal(fingerprint(isolated.deployment_configs), receipt.previewConfigFingerprint, 'Preview bindings drifted after preflight.');
  assert.equal(fingerprint(production.deployment_configs), receipt.productionConfigFingerprint, 'Production bindings drifted.');
  let latest = isolated;
  const deadline = Date.now() + 180000;
  while (Date.now() < deadline) {
    requireIsolatedProject(latest);
    assert.equal(fingerprint(latest.deployment_configs), receipt.previewConfigFingerprint, 'Preview bindings drifted during upload.');
    const deployment = latest.canonical_deployment;
    if (deployment?.deployment_trigger?.metadata?.commit_hash === receipt.siteRevision && deployment.latest_stage?.status === 'success') break;
    await new Promise(done => setTimeout(done, 3000));
    latest = await project(previewProject);
  }
  const deployment = latest.canonical_deployment;
  assert.equal(deployment?.deployment_trigger?.metadata?.commit_hash, receipt.siteRevision, 'The exact preview commit has not been deployed.');
  assert.equal(deployment.latest_stage?.status, 'success', 'The isolated upload did not succeed.');
  const localHtml = await readFile('dist/account/index.html', 'utf8');
  const entryAssets = [...localHtml.matchAll(/(?:src|href)="(\/assets\/[^" ]+\.(?:js|css))"/g)].map(match => match[1]);
  assert.ok(entryAssets.length, 'No built account assets were found.');
  const accountResponse = await fetch(`${previewOrigin}/account/?candidate=${receipt.siteRevision}`, { redirect: 'error', signal: AbortSignal.timeout(20000) });
  const accountHtml = await accountResponse.text();
  assert.equal(accountResponse.status, 200, 'The preview account page is unavailable.');
  assert.ok(entryAssets.every(asset => accountHtml.includes(asset)), 'The preview is serving a different account build.');
  const configResponse = await fetch(`${previewOrigin}/api/public-config`, { redirect: 'error', signal: AbortSignal.timeout(30000) });
  assert.equal(configResponse.status, 200, 'The paired public configuration could not be read.');
  const config = await configResponse.json();
  assert.equal(config.localTest, false, 'Hosted fixture bypass must never be enabled.');
  assert.equal(config.accountsReady, true, 'The paired accounts are not configured.');
  assert.equal(config.passwordsReady, true, 'The paired password service is not configured.');
  assert.equal(config.googleReady, true, 'The paired Google service is not configured.');
  const checks = [];
  for (const [name, route, options, allowed] of [
    ['anonymous account access', '/api/members/account', {}, [200]],
    ['unsigned owner readiness', '/api/operations/readiness', {}, [401, 403]],
    ['forged owner assertion', '/api/operations/readiness', { headers: { 'cf-access-jwt-assertion': 'invalid-qa-assertion' } }, [401, 403]],
    ['wrong-origin logout', '/api/members/auth', { method: 'POST', headers: { origin: 'https://unrelated.example', 'content-type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) }, [403]],
    ['unsigned kit event', '/api/shop/webhook', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: 'works-paired-unsigned-qa', type: 'checkout.session.completed' }) }, [400, 503]],
  ]) {
    const response = await fetch(previewOrigin + route, { ...options, redirect: 'error', signal: AbortSignal.timeout(30000) });
    assert.ok(allowed.includes(response.status), `${name} returned unexpected HTTP ${response.status}.`);
    if (name === 'anonymous account access') assert.equal((await response.json()).member, null, 'An anonymous request exposed a member.');
    else await response.body?.cancel();
    checks.push({ name, status: response.status, meaning: name === 'unsigned kit event' && response.status === 503 ? 'not configured; not signed-payment acceptance' : 'HTTP boundary observation only' });
  }
  await writeFile(receiptPath, JSON.stringify({ ...receipt, verifiedAt: new Date().toISOString(),
    deploymentId: deployment.id, deploymentUrl: deployment.url, deliveredAccountAssets: entryAssets,
    configuredFeatures: { accounts: config.accountsReady, passwords: config.passwordsReady, google: config.googleReady, shop: config.shopReady, localTest: config.localTest },
    checks, productionConfigUnchanged: true,
    acceptance: 'exact frontend upload and paired HTTP boundaries verified; real consent, two-owner reopen, inbox and signed TEST lifecycle remain open',
  }, null, 2) + '\n');
  console.log('Exact isolated frontend upload, paired account configuration and anonymous/owner/origin/event boundaries verified. Provider and user acceptance remain separate.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main(process.argv[2]);
