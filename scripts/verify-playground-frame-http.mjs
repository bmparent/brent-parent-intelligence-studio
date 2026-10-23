import assert from 'node:assert/strict';
const argument = process.argv.find(value => value.startsWith('--base-url='));
const base = argument?.slice('--base-url='.length) || process.env.PG_BASE_URL || 'http://127.0.0.1:4173';
const responses = await Promise.all([fetch(base + '/playground-frame'), fetch(base + '/playground-frame')]);
const policies = responses.map(response => response.headers.get('content-security-policy'));
assert.notEqual(policies[0], policies[1], 'Each frame must receive a fresh nonce');
for (const [index, response] of responses.entries()) {
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') || '', /^text\/html/);
  assert.match(response.headers.get('cache-control') || '', /no-store/);
  assert.match(response.headers.get('x-robots-tag') || '', /noindex/);
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(response.headers.get('set-cookie'), null);
  const policy = policies[index], nonce = policy?.match(/script-src 'nonce-([a-f0-9]+)'/)?.[1];
  assert.ok(nonce);
  for (const directive of ["default-src 'none'", "connect-src 'none'", "frame-src 'none'", "frame-ancestors 'self'", 'sandbox allow-scripts']) assert.ok(policy.includes(directive));
  assert.ok(!/script-src[^;]*(unsafe-inline|unsafe-eval|https:|blob:|data:)/.test(policy));
  assert.ok(!policy.includes('allow-same-origin'));
  assert.match(await response.text(), new RegExp(`<script nonce="${nonce}">`));
}
console.log('PASS: preview frame HTTP 200, fresh nonce, private/no-store/noindex and opaque/no-network security boundaries');
