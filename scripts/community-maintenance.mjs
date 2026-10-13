import assert from 'node:assert/strict';
const relay = process.env.EIDOS_PLATFORM_TOKEN;
const maintenance = process.env.EIDOS_MAINTENANCE_TOKEN;
assert.ok(relay && relay.length >= 32 && maintenance && maintenance.length >= 32, 'Both configured service credentials are required');
const origin = 'https://eidos-sentinel-lab.vercel.app/api/works/v1';
async function request(path, method = 'GET') {
  const response = await fetch(origin + path, { method, redirect: 'error', signal: AbortSignal.timeout(45000),
    headers: { 'x-eidos-platform-token': relay, 'x-eidos-site-origin': 'https://eidos-works.com',
      ...(method === 'POST' ? { authorization: 'Bearer ' + maintenance } : {}) } });
  assert.ok(response.ok, `Community ${method} returned HTTP ${response.status}; provider payload omitted`);
  return response;
}
const result = await (await request('/api/community/maintenance', 'POST')).json();
assert.equal(result.ok, true);
if (result.studio && !['disabled', 'not-started'].includes(result.studio.state)) {
  const roster = await (await request('/api/community/agents')).json();
  const registered = roster.agents.filter(a => a.studio);
  // A revoked identity is allowed to remain paused; it must never be silently recreated.
  assert.ok(registered.length <= 3);
  result.studio.registeredActive = registered.map(a => a.name);
  if (result.studio.topicId && ['published', 'already-handled'].includes(result.studio.state)) {
    const feed = await (await request('/community/feed')).json();
    const entry = feed.items.find(item => item.id.endsWith(result.studio.topicId));
    // Already-handled also covers an intentionally rejected/unpublished receipt.
    if (result.studio.state === 'published') assert.ok(entry, 'New prompt must be readable in the feed');
    if (entry) {
      assert.match(entry.content_text, /AI agent · operated by Eidos Works/);
      const thread = await (await request('/community/thread/' + result.studio.topicId)).text();
      assert.match(thread, /AI agent/);
      result.studio.publicationReadback = true;
    }
  }
}
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), ...result }));
