import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { dirname } from 'node:path';

// This checks the disabled reading preview. It never creates an identity and
// must not be used as evidence for the enabled hosted registration flow.
const base = process.argv.find(value => value.startsWith('--base='))?.slice(7);
assert.ok(base, 'Supply the immutable reading preview with --base=URL');
const url = new URL(base);
assert.ok(url.protocol === 'https:' && /^[a-f0-9]{8}\.eidosworks\.pages\.dev$/.test(url.hostname)
  && url.pathname === '/' && !url.search && !url.hash && !url.username && !url.password && !url.port,
'Use an immutable Eidos reading preview, never the production origin.');
const receipt = { time: new Date().toISOString(), environment: 'hosted-disabled-reading-preview',
  baseUrl: url.origin, checks: [], clientAccess: [], productionWrites: 0, identitiesCreated: 0,
  enabledHostedRegistrationAcceptance: 'blocked: fresh isolated hosted database and runtime not provisioned' };
const request = (path, init = {}) => fetch(url.origin + path, {
  ...init, headers: { 'user-agent': 'EidosExchangeQA/1.0 (controlled readiness check)', ...init.headers },
  redirect: 'error', signal: AbortSignal.timeout(20000),
});
for (const path of ['/skill.md', '/agent-brief.json']) {
  const response = await request(path);
  assert.equal(response.status, 200, path + ' must be readable');
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.deepEqual(bytes, await readFile('public' + path), path + ' must match the candidate');
  receipt.checks.push({ path, status: response.status, sha256: createHash('sha256').update(bytes).digest('hex') });
}
const availability = await request('/api/community/agent-registration');
assert.equal(availability.status, 200);
assert.equal((await availability.json()).enabled, false);
receipt.checks.push({ check: 'explicit disabled availability', passed: true });
const rejected = await request('/api/community/agent-registration', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
});
assert.equal(rejected.status, 503);
receipt.checks.push({ check: 'registration refused while disabled', status: rejected.status });
// Read-only status request: retain the inherited removed-backend failure.
const status = await request('/api/community/agent-account');
receipt.accountEndpointStatus = status.status;
await status.arrayBuffer();
const python = spawnSync('python', ['-c', `
import urllib.request, urllib.error, json, sys
for label, headers in [('python-default', {}), ('identified-agent', {'User-Agent': 'EidosExchangeQA/1.0 (controlled readiness check)'})]:
  try:
    with urllib.request.urlopen(urllib.request.Request(sys.argv[1], headers=headers), timeout=20) as response:
      response.read()
      print(json.dumps({'client':label, 'status':response.status}))
  except urllib.error.HTTPError as error:
    error.read()
    print(json.dumps({'client':label, 'status':error.code}))
`, url.origin + '/skill.md'], { encoding: 'utf8', timeout: 45000 });
assert.equal(python.status, 0, 'Python client checks did not complete');
receipt.clientAccess = python.stdout.trim().split('\n').map(line => JSON.parse(line));
receipt.readingPreviewPassed = true;
receipt.broadMachineClientAccessPassed = receipt.clientAccess.every(client => client.status === 200);
const output = process.env.EXCHANGE_PREFLIGHT_RECEIPT;
if (output) {
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(receipt, null, 2) + '\n');
}
console.log(JSON.stringify(receipt, null, 2));
