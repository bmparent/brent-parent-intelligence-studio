import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import type { Database, Statement, PlatformEnv, Context } from '../functions/_shared/platform/core';
import { runStudioDiscussion, studioAgents, studioTopics, studioTopicBody } from '../functions/_shared/platform/studioAgents';
import { onRequestPost as maintenance } from '../functions/api/community/maintenance';
import { onRequestGet as agents } from '../functions/api/community/agents';
import { onRequestGet as feed } from '../functions/community/feed';
import { onRequestGet as threadPage } from '../functions/community/thread/[id]';

class SQLiteStatement implements Statement {
  constructor(private connection: DatabaseSync, private sql: string, private values: unknown[] = []) {}
  bind(...values: unknown[]) { return new SQLiteStatement(this.connection, this.sql, values); }
  async first<T>() { return (this.connection.prepare(this.sql).get(...this.values as never[]) || null) as T | null; }
  async all<T>() { return { results: this.connection.prepare(this.sql).all(...this.values as never[]) as T[] }; }
  async run() { return { meta: { changes: Number(this.connection.prepare(this.sql).run(...this.values as never[]).changes) } }; }
}
function fixture(overrides: Partial<PlatformEnv> = {}) {
  const sql = new DatabaseSync(':memory:');
  sql.exec('PRAGMA foreign_keys=ON');
  for (const name of ['0001_eidos_platform.sql', '0002_members.sql'])
    sql.exec(readFileSync('migrations/' + name, 'utf8'));
  let serial = Promise.resolve<unknown[]>([]);
  const database: Database = {
    prepare: query => new SQLiteStatement(sql, query),
    batch(statements) {
      const next = serial.then(async () => {
        sql.exec('BEGIN');
        try {
          const values = [];
          for (const statement of statements) values.push(await statement.run());
          sql.exec('COMMIT');
          return values;
        } catch (error) { sql.exec('ROLLBACK'); throw error; }
      });
      serial = next.catch(() => []);
      return next;
    },
  };
  const env: PlatformEnv = {
    EIDOS_DB: database, EIDOS_LOCAL_TEST: 'true',
    EIDOS_ADMIN_TOKEN: 'test-only-studio-admin-token-at-least-32-characters',
    EIDOS_MAINTENANCE_TOKEN: 'test-only-studio-maintenance-token-at-least-32-characters',
    EIDOS_COMMUNITY_STUDIO_ENABLED: 'true', EIDOS_COMMUNITY_STUDIO_START_DATE: '2026-10-02',
    PUBLIC_SITE_URL: 'http://localhost:8788', ...overrides,
  };
  return { sql, env };
}
function context(env: PlatformEnv, path: string, token?: string): Context {
  return { env, request: new Request('http://localhost:8788' + path, {
    method: token === undefined ? 'GET' : 'POST',
    headers: { origin: 'http://localhost:8788', ...(token === undefined ? {} : { authorization: 'Bearer ' + token, 'content-type': 'application/json' }) },
    ...(token === undefined ? {} : { body: '{}' }),
  }) };
}
const morning = new Date('2026-10-02T13:17:00Z'); // 9:17am America/New_York.
test('Maintenance auth, feature switch, and start date fail before any identity or post is created', async () => {
  const { sql, env } = fixture();
  try {
    assert.equal((await maintenance(context(env, '/api/community/maintenance', 'wrong'))).status, 401);
    assert.equal((await runStudioDiscussion({ ...env, EIDOS_COMMUNITY_STUDIO_ENABLED: 'false' }, morning)).state, 'disabled');
    assert.equal((await runStudioDiscussion(env, new Date('2026-10-01T13:17:00Z'))).state, 'not-started');
    for (const value of ['', '2026-02-30', '2026-2-1', 'garbage'])
      await assert.rejects(runStudioDiscussion({ ...env, EIDOS_COMMUNITY_STUDIO_START_DATE: value }, morning), /valid community studio start date/);
    assert.equal(sql.prepare('SELECT count(*) n FROM eidos_agents').get()?.n, 0);
    assert.equal(sql.prepare('SELECT count(*) n FROM eidos_threads').get()?.n, 0);
  } finally { sql.close(); }
});
test('Repeated and overlapping runs publish one attributed prompt with no model or network call', async () => {
  const { sql, env } = fixture();
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw Error('Unexpected paid or external request'); };
  try {
    const results = await Promise.all(Array.from({ length: 12 }, () => runStudioDiscussion(env, morning)));
    assert.equal(results.reduce((count, result) => count + result.published, 0), 1);
    assert.ok(results.every(result => result.modelTokens === 0));
    assert.equal(sql.prepare('SELECT count(*) n FROM eidos_agents').get()?.n, 3);
    const thread = sql.prepare('SELECT * FROM eidos_threads').get()!;
    assert.equal(thread.author_type, 'agent'); assert.equal(thread.category, 'agents');
    assert.equal(thread.author, 'Eidos Operations'); assert.equal(thread.owner_id, studioAgents[1].id);
    assert.equal(thread.status, 'published'); assert.match(String(thread.body), /AI agent · operated by Eidos Works/);
    assert.equal(sql.prepare('SELECT count(*) n FROM eidos_replies').get()?.n, 0);
    const roster = await (await agents(context(env, '/api/community/agents'))).json();
    assert.equal(roster.agents.length, 3);
    assert.ok(roster.agents.every((agent: Record<string, unknown>) => agent.studio && agent.operator === 'Eidos Works' && !('key_hash' in agent)));
    assert.equal(roster.agents.find((agent: { id: string }) => agent.id === studioAgents[1].id).contributions, 1);
    const publicFeed = await (await feed(context(env, '/community/feed'))).json();
    assert.equal(publicFeed.items.length, 1); assert.ok(publicFeed.items[0].tags.includes('agent'));
    const html = await (await threadPage({ ...context(env, '/community/thread/' + thread.id), params: { id: String(thread.id) } })).text();
    assert.match(html, /AI agent/); assert.match(html, /Operator profile/);
  } finally { globalThis.fetch = original; sql.close(); }
});
test('Three weekly New York slots survive DST and skip missed slots without a catch-up burst', async () => {
  const { sql, env } = fixture({ EIDOS_COMMUNITY_STUDIO_START_DATE: '2026-10-26' });
  try {
    for (const [date, expected] of [
      ['2026-10-26T12:59:00Z', 0], ['2026-10-26T13:17:00Z', 1],
      ['2026-10-27T14:00:00Z', 0], ['2026-10-28T13:17:00Z', 1],
      ['2026-10-30T13:17:00Z', 1], ['2026-10-31T14:17:00Z', 0],
      ['2026-11-02T13:59:00Z', 0], ['2026-11-02T14:17:00Z', 1],
    ] as const) assert.equal((await runStudioDiscussion(env, new Date(date))).published, expected, date);
    assert.equal((await runStudioDiscussion(env, new Date('2026-11-06T14:17:00Z'))).published, 1);
    assert.equal(sql.prepare('SELECT count(*) n FROM eidos_threads').get()?.n, 5);
    assert.equal(sql.prepare('SELECT id FROM eidos_threads WHERE id=?').get(studioTopics[4].id), undefined);
    assert.ok(sql.prepare('SELECT id FROM eidos_threads WHERE id=?').get(studioTopics[5].id));
  } finally { sql.close(); }
});
test('Revocation, unpublication, and queue exhaustion cannot manufacture more activity', async () => {
  const { sql, env } = fixture();
  try {
    await runStudioDiscussion(env, new Date('2026-10-02T12:59:00Z'));
    sql.prepare('UPDATE eidos_agents SET revoked=1 WHERE id=?').run(studioAgents[1].id);
    assert.equal((await runStudioDiscussion(env, morning)).state, 'agent-paused');
    assert.equal(sql.prepare('SELECT revoked FROM eidos_agents WHERE id=?').get(studioAgents[1].id)?.revoked, 1);
    await runStudioDiscussion(env, new Date('2026-10-05T13:17:00Z'));
    sql.prepare("UPDATE eidos_threads SET status='rejected' WHERE id=?").run(studioTopics[1].id);
    assert.equal((await runStudioDiscussion(env, new Date('2026-10-05T14:17:00Z'))).state, 'already-handled');
    assert.equal((await runStudioDiscussion(env, new Date('2027-01-01T14:17:00Z'))).state, 'queue-exhausted');
    const publicFeed = await (await feed(context(env, '/community/feed'))).json();
    assert.equal(publicFeed.items.length, 0);
    assert.equal(sql.prepare('SELECT count(*) n FROM eidos_replies').get()?.n, 0);
  } finally { sql.close(); }
});
test('Cleanup retains rejected studio receipts and never replies to studio-authored threads', async () => {
  const { sql, env } = fixture({ EIDOS_PROACTIVE_ENABLED: 'true' });
  try {
    await runStudioDiscussion(env, morning);
    sql.prepare("UPDATE eidos_threads SET status='rejected',created_at='2020-01-01T00:00:00Z'").run();
    const response = await maintenance(context({ ...env, EIDOS_COMMUNITY_STUDIO_ENABLED: 'false' }, '/api/community/maintenance', env.EIDOS_MAINTENANCE_TOKEN));
    assert.equal(response.status, 200, await response.clone().text());
    assert.equal(sql.prepare('SELECT count(*) n FROM eidos_threads').get()?.n, 1);
    sql.prepare("UPDATE eidos_threads SET status='published',allow_assistant=1,published_at='2020-01-01T00:00:00Z'").run();
    await maintenance(context({ ...env, EIDOS_COMMUNITY_STUDIO_ENABLED: 'false' }, '/api/community/maintenance', env.EIDOS_MAINTENANCE_TOKEN));
    assert.equal(sql.prepare('SELECT count(*) n FROM eidos_replies').get()?.n, 0);
  } finally { sql.close(); }
});
test('The initial queue is bounded, distinct, and clearly disclosed', () => {
  assert.equal(studioTopics.length, 24);
  assert.equal(new Set(studioTopics.map(topic => topic.id)).size, 24);
  assert.equal(new Set(studioTopics.map(topic => topic.title)).size, 24);
  for (const topic of studioTopics) {
    assert.ok(studioAgents[topic.agent]); assert.ok(topic.title.length >= 8 && topic.title.length <= 140);
    assert.ok(studioTopicBody(topic).length >= 20 && studioTopicBody(topic).length <= 3000);
    assert.match(topic.href, /^\/(business-systems|digital-experiences|intelligent-systems|work|playground|lab)$/);
    assert.match(studioTopicBody(topic), /prepared studio discussion prompt/);
  }
});
