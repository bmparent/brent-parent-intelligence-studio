import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
const directory = await mkdtemp(join(tmpdir(), 'eidos-host-acceptance-'));
const base = 'http://127.0.0.1:4401';
const out = process.env.HOST_EVIDENCE_DIR;
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4401', '--strictPort'], {
  env: { ...process.env, EIDOS_PREVIEW_DB_PATH: join(directory, 'host.sqlite'), EIDOS_PREVIEW_EXCHANGE_HOST: 'true', EIDOS_PREVIEW_EXCHANGE_REGISTRATION: 'true' }, stdio: ['ignore', 'ignore', 'pipe'],
});
let errors = '', browser;
server.stderr.on('data', chunk => { errors = (errors + chunk.toString()).slice(-1200); });
async function call(path, data, key, extra = {}) {
  return fetch(base + path, { method: data === undefined ? 'GET' : 'POST', headers: { ...(data === undefined ? {} : { 'content-type': 'application/json' }), ...(key ? { authorization: 'Bearer ' + key } : {}), ...extra }, body: data === undefined ? undefined : JSON.stringify(data), redirect: 'error' });
}
const admin = 'local-preview-review-token-2026-eidos';
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw Error('Isolated host stopped: ' + errors);
    try { if ((await call('/api/community/host')).ok) { ready = true; break; } } catch { /* startup */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, 'The isolated host did not start.');
  const available = await (await call('/api/community/host')).json(); assert.equal(available.enabled, true); assert.equal(available.modelSpendLimitUsd, 0);
  assert.equal(await (await call('/exchange-host.json')).text(), await readFile('public/exchange-host.json', 'utf8'));
  const enroll = async (name, ip) => {
    const r = await call('/api/community/host', { action: 'enroll', requestId: crypto.randomUUID(), registration: { name, description: 'Controlled HTTP host fixture, not independent activity.', discoverySource: 'controlled', rulesVersion: '2026-10-22', operatorAuthorized: true, acceptPublicContributions: true } }, undefined, { 'CF-Connecting-IP': ip });
    assert.equal(r.status, 201); return (await r.json()).registration;
  };
  const a = await enroll('qa-http-host-a', '192.0.2.1'), b = await enroll('qa-http-host-b', '192.0.2.2');
  const guide = { action: 'guide', requestId: crypto.randomUUID(), topic: 'tasks' };
  assert.equal((await call('/api/community/host', guide, a.credential)).status, 200);
  assert.equal((await (await call('/api/community/host', guide, a.credential)).json()).replayed, true);
  const other = await (await call('/api/community/host', undefined, b.credential)).json(); assert.ok(other.progress.every(p => p.topic !== 'tasks'));
  const review = { action: 'request-review', requestId: crypto.randomUUID(), kind: 'exception', note: 'Controlled HTTP private request requiring separate studio review.' };
  assert.equal((await call('/api/community/host', review, a.credential)).status, 202);
  assert.equal((await call('/api/community/host-admin', undefined, a.credential)).status, 401);
  const queue = await (await call('/api/community/host-admin', undefined, admin)).json(); assert.equal(queue.reviews.length, 1);
  assert.equal((await call('/api/community/host-admin', { id: queue.reviews[0].id, outcome: 'closed' }, admin, { origin: base })).status, 200);
  assert.equal((await (await call('/api/community/agent-account', undefined, a.credential)).json()).identity.verification, 'unclaimed');
  const checks = ['real HTTP enrollment and one-time credential response', 'guidance receipt replay', 'two-identity private progress', 'owner-only review and closure', 'ownership stays unclaimed', 'exact machine-readable contract'];
  if (process.env.PLAYWRIGHT_MODULE) {
    const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(base + '/community/agents/?eidos_qa=1');
    const panel = page.locator('#exchange-host');
    await panel.getByText('Ready for requests · Published guidance', { exact: true }).waitFor();
    await panel.getByRole('button', { name: 'Find a task', exact: true }).click();
    await panel.getByText(/A useful first task is AX-KEYBOARD-01/).waitFor();
    await panel.getByText('Create a limited Exchange identity', { exact: true }).click();
    await panel.getByLabel('Agent name', { exact: true }).fill('qa-ui-host');
    await panel.getByLabel('Public description', { exact: true }).fill('Controlled browser host fixture, not independent operator acquisition.');
    await panel.getByLabel('My operator has authorized this participation.', { exact: true }).check();
    await panel.getByRole('checkbox', { name: /I accept the contribution rules/ }).check();
    await panel.getByRole('button', { name: 'Request limited enrollment', exact: true }).click();
    await panel.getByText(/Limited enrollment approved. Save your credential now/).waitFor();
    await panel.getByText('Use an Exchange credential or check your progress', { exact: true }).click();
    const credential = await panel.getByLabel('Exchange credential', { exact: true }).inputValue();
    assert.match(credential, /^ew_exchange_[a-f0-9]{64}$/);
    assert.equal(await page.evaluate(key => [JSON.stringify(localStorage), JSON.stringify(sessionStorage)].some(value => value.includes(key)), credential), false);
    await panel.getByRole('button', { name: 'Show my progress', exact: true }).click();
    await panel.getByText('Connected as qa-ui-host [unclaimed].', { exact: true }).waitFor();
    await panel.getByLabel('Non-sensitive summary', { exact: true }).fill('Controlled browser request. <script>alert(1)</script> must remain escaped text.');
    await panel.getByRole('button', { name: 'Request owner review', exact: true }).click();
    await panel.getByText(/Your non-sensitive summary is in the private owner queue/).waitFor();
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await panel.getByRole('button', { name: 'Permissions', exact: true }).click();
      await panel.getByText(/Your operator’s instructions and permissions remain authoritative/).waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Host overflow at ' + width);
      if (out) { await mkdir(out, { recursive: true }); await panel.screenshot({ path: join(out, 'host-' + width + '.png') }); }
    }
    await panel.getByRole('button', { name: 'Clear credential and progress', exact: true }).click();
    assert.equal(await panel.getByLabel('Exchange credential', { exact: true }).inputValue(), '');
    await page.goto(base + '/community/moderate');
    await page.getByLabel('Operator access token', { exact: true }).fill(admin);
    await page.getByRole('button', { name: 'Open review queue', exact: true }).click();
    await page.getByRole('button', { name: 'Load host requests', exact: true }).click();
    const request = page.locator('article').filter({ has: page.getByRole('heading', { name: 'qa-ui-host [unclaimed]', exact: true }) });
    await request.getByText(/<script>alert\(1\)<\/script> must remain escaped text/).waitFor();
    if (out) await page.screenshot({ path: join(out, 'host-owner-320.png'), fullPage: true });
    await request.getByRole('button', { name: 'Mark reviewed', exact: true }).click();
    await page.getByText('No host requests waiting for review.', { exact: true }).waitFor();
    assert.deepEqual(pageErrors, []);
    checks.push('Chromium actual signup and consent controls', 'memory-only credential and own progress', 'private review and escaped owner text', 'owner closure through the UI', '1440/390/320 responsive layout and actions', 'credential clearing', 'no browser runtime errors');
  }
  const result = { observedAt: new Date().toISOString(), environment: 'isolated-loopback-SQLite', passed: true, sourceRevision: process.env.GITHUB_SHA || 'local-uncommitted', modelCalls: 0, productionWrites: 0, independentOperatorsObserved: 0, checks };
  if (out) { await mkdir(out, { recursive: true }); await writeFile(join(out, 'host-acceptance.json'), JSON.stringify(result, null, 2) + '\n'); }
  console.log(JSON.stringify(result));
} finally {
  await browser?.close(); server.kill('SIGTERM');
  if (server.exitCode === null) await new Promise(resolve => server.once('exit', resolve));
  await rm(directory, { recursive: true });
}
