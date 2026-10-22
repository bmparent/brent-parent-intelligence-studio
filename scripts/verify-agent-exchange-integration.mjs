import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { collectPilot, summarizePilot } from './agent-exchange-pilot.mjs';

const directory = await mkdtemp(join(tmpdir(), 'agent-exchange-http-'));
const base = 'http://127.0.0.1:4197';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '4197', '--strictPort'], {
  env: { ...process.env, EIDOS_PREVIEW_DB_PATH: join(directory, 'fixture.sqlite') }, stdio: ['ignore', 'ignore', 'pipe'],
});
let serverError = '';
server.stderr.on('data', chunk => { serverError = (serverError + chunk.toString()).slice(-2000); });
async function moderation(input) {
  const response = await fetch(base + '/api/community/moderate', { method: 'POST', headers: {
    origin: base, authorization: 'Bearer local-preview-review-token-2026-eidos', 'content-type': 'application/json',
  }, body: JSON.stringify(input) });
  assert.ok(response.ok, 'Local fixture moderation failed.');
  return response.json();
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw Error('The isolated fixture server stopped: ' + serverError);
    try { if ((await fetch(base + '/api/community/agents')).ok) { ready = true; break; } } catch { /* startup only */ }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert.ok(ready, 'The isolated server did not start.');
  const agent = await moderation({ action: 'register-agent', name: 'Pilot QA Agent', profileUrl: 'https://example.com/controlled-qa' });
  const file = join(directory, 'draft.json');
  await writeFile(file, JSON.stringify({ title: '[AX-KEYBOARD-01] Controlled HTTP persistence check', category: 'agents',
    body: 'Challenge: AX-KEYBOARD-01\nActivity: qa\nFinding: Continue is a div with a click listener.\nReproduction steps: Tab from the project input; Continue is skipped.\nExpected and observed behavior: Keyboard users need to activate Continue.\nMinimal fix: Use a native button.\nVerification: Controlled fixture; this is not an independent participant.' }));
  const run = args => spawnSync(process.execPath, ['public/agent-exchange-starter.mjs', ...args, '--origin=' + base], {
    encoding: 'utf8', env: { ...process.env, EIDOS_AGENT_KEY: agent.key }, timeout: 20000,
  });
  const publish = run(['publish', '--file=' + file, '--confirm-public']);
  assert.equal(publish.status, 0, publish.stderr);
  assert.ok(!publish.stdout.includes(agent.key) && !publish.stderr.includes(agent.key));
  const receipt = JSON.parse(publish.stdout);
  const readback = run(['verify', '--receipt=' + receipt.url]);
  assert.equal(readback.status, 0, readback.stderr);
  const detail = JSON.parse(readback.stdout);
  assert.equal(detail.thread.id, receipt.id);
  assert.equal(detail.thread.author_type, 'agent');
  assert.match(detail.thread.body, /Activity: qa/);
  const snapshot = await collectPilot(base);
  const report = summarizePilot(snapshot.records);
  assert.equal(report.observed.qa, 1);
  assert.equal(report.outcomes.verifiedIndependentOperators, null);
  await moderation({ action: 'revoke-agent', id: agent.id });
  const denied = run(['publish', '--file=' + file, '--confirm-public']);
  assert.equal(denied.status, 1);
  assert.match(denied.stderr, /401/);
  const after = await (await fetch(base + '/api/community/threads?category=agents')).json();
  assert.equal(after.threads.length, 1, 'Revocation must reject before persisting another post.');
  console.log(JSON.stringify({ passed: true, environment: 'isolated-loopback-SQLite', checks: ['actual CLI publication', 'persisted HTTP readback', 'AI attribution', 'QA excluded from participation', 'credential not printed', 'revoked-key denial without a second write'], productionWrites: 0 }));
} finally {
  server.kill('SIGTERM');
  if (server.exitCode === null) await new Promise(resolve => server.once('exit', resolve));
  await rm(directory, { recursive: true });
}
