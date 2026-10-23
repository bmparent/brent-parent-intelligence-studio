import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const directory = await mkdtemp(join(tmpdir(), 'exchange-self-registration-'));
const base = 'http://127.0.0.1:4398';
const output = process.env.EXCHANGE_EVIDENCE_DIR;
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4398', '--strictPort'], {
  env: { ...process.env, EIDOS_PREVIEW_DB_PATH: join(directory, 'fixture.sqlite'), EIDOS_PREVIEW_EXCHANGE_REGISTRATION: 'true' }, stdio: ['ignore', 'ignore', 'pipe'],
});
let error = '', browser;
server.stderr.on('data', chunk => { error = (error + chunk.toString()).slice(-1000); });
async function call(path, data, key, extra = {}) {
  return fetch(base + path, { method: data === undefined ? 'GET' : 'POST',
    headers: { ...(data === undefined ? {} : { 'content-type': 'application/json' }), ...(key ? { authorization: 'Bearer ' + key } : {}), ...extra },
    body: data === undefined ? undefined : JSON.stringify(data), redirect: 'error' });
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw Error('Local fixture stopped: ' + error);
    try { if ((await call('/api/community/agent-registration')).ok) { ready = true; break; } } catch { /* startup */ }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert.ok(ready, 'The isolated fixture did not start.');
  const availability = await (await call('/api/community/agent-registration')).json();
  assert.equal(availability.enabled, true);
  for (const path of ['/skill.md', '/agent-brief.json']) assert.equal(await (await call(path)).text(), await readFile('public' + path, 'utf8'));
  const register = async name => {
    const r = await call('/api/community/agent-registration', { name, description: 'Controlled HTTP QA; not independent acquisition.', discoverySource: 'controlled',
      rulesVersion: availability.rulesVersion, operatorAuthorized: true, acceptPublicContributions: true });
    assert.equal(r.status, 201); assert.equal(r.headers.get('cache-control'), 'no-store'); return r.json();
  };
  const a = await register('qa-http-first'), b = await register('qa-http-second');
  const submitted = await call('/api/community/agents', { title: 'Controlled HTTP contribution', body: 'Activity: qa\nExact reproduction and proposed fix from the isolated HTTP fixture.' }, a.credential);
  assert.equal(submitted.status, 201); const receipt = await submitted.json();
  assert.equal(receipt.state, 'pending'); assert.equal(receipt.url, undefined);
  const own = await (await call('/api/community/agent-account', undefined, a.credential)).json();
  assert.equal(own.contributions[0].id, receipt.id);
  assert.equal((await (await call('/api/community/agent-account', undefined, b.credential)).json()).contributions.length, 0);
  assert.equal((await (await call('/api/community/threads')).json()).threads.length, 0);
  assert.equal((await call('/community/thread/' + receipt.id)).status, 404);
  const approved = await call('/api/community/moderate', { action: 'publish', kind: 'thread', id: receipt.id }, 'local-preview-review-token-2026-eidos', { origin: base });
  assert.equal(approved.status, 200);
  const after = await (await call('/api/community/agent-account', undefined, a.credential)).json();
  assert.equal(after.contributions[0].status, 'published');
  assert.equal((await call(after.contributions[0].url)).status, 200);
  assert.equal((await call('/api/community/agent-account')).status, 401);
  assert.equal((await call('/api/community/moderate', { action: 'revoke-exchange-agent', id: b.id }, a.credential, { origin: base })).status, 401);
  const rotated = await call('/api/community/agent-account', { action: 'rotate-credential' }, a.credential);
  assert.equal(rotated.status, 200); const fresh = await rotated.json();
  assert.equal((await call('/api/community/agent-account', undefined, a.credential)).status, 401);
  assert.equal((await call('/api/community/agent-account', { action: 'revoke-credential' }, fresh.credential)).status, 200);
  assert.equal((await call('/api/community/agent-account', undefined, fresh.credential)).status, 401);
  const checks = ['HTTP self-registration', 'two identities', 'pending persistence and privacy', 'manual publication and public readback', 'operator-only moderation', 'credential rotation and revocation'];
  if (process.env.PLAYWRIGHT_MODULE) {
    const playwright = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE);
    browser = await playwright.chromium.launch({ headless: true });
    const page = await browser.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + '/community/agents');
      await page.getByRole('link', { name: 'Inspect the studio briefing and evidence' }).waitFor();
      assert.equal(await page.getByRole('link', { name: 'read the participation instructions' }).getAttribute('href'), '/skill.md');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
      await page.goto(base + '/community/agent-guide');
      await page.getByRole('heading', { name: 'Evaluate first. Join when it helps.' }).waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
      if (output) { await mkdir(output, { recursive: true }); await page.screenshot({ path: join(output, 'agent-guide-' + width + '.png'), fullPage: true }); }
    }
    assert.deepEqual(errors, []); checks.push('real Chromium 1440/390/320 links, copy, overflow and page errors');
  }
  const result = { time: new Date().toISOString(), environment: 'isolated-loopback-SQLite', passed: true, productionWrites: 0,
    independentOperatorsObserved: 0, paidModelCalls: 0, checks };
  if (output) { await mkdir(output, { recursive: true }); await writeFile(join(output, 'registration-receipt.json'), JSON.stringify(result, null, 2)); }
  console.log(JSON.stringify(result));
} finally {
  await browser?.close(); server.kill('SIGTERM');
  if (server.exitCode === null) await new Promise(resolve => server.once('exit', resolve));
  await rm(directory, { recursive: true });
}
