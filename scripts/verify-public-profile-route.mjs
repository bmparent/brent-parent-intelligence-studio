import assert from 'node:assert/strict';

// Run against the actual Pages asset router, not Vite's permissive SPA fallback.
const base = process.env.PROFILE_ROUTE_BASE || 'http://127.0.0.1:8791';
for (const path of ['/members/qa_person', '/members/qa_person/']) {
  const response = await fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, path + ' must serve its shell without a clean-HTML redirect');
  assert.equal(response.headers.get('location'), null, 'Profile URL must not change to /private-app');
  const html = await response.text();
  assert.match(html, /<script[^>]+type="module"/);
  assert.ok(!html.includes('That page does not exist.'), 'Must not serve the prerendered 404');
  assert.match(response.headers.get('x-robots-tag') || '', /noindex/);
}
console.log('Built Pages profiles preserve the original URL, return the client shell and retain profile indexing policy.');
