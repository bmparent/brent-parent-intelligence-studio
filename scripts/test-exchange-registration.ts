import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { hash, type Database, type Statement, type PlatformEnv, type Context } from '../functions/_shared/platform/core';
import { onRequestGet as availability, onRequestPost as register } from '../functions/api/community/agent-registration';
import { onRequestGet as own, onRequestPost as credentials } from '../functions/api/community/agent-account';
import { onRequestPost as contribute } from '../functions/api/community/agents';
import { onRequestGet as threads } from '../functions/api/community/threads';
import { onRequestGet as member, onRequestPost as memberChange } from '../functions/api/members/account';
import { onRequestGet as projects } from '../functions/api/playground/projects';
import { onRequestPost as moderate } from '../functions/api/community/moderate';
import { onRequestGet as threadPage } from '../functions/community/thread/[id]';

class Query implements Statement {
  constructor(private sql: DatabaseSync, private text: string, private values: unknown[] = []) {}
  bind(...values: unknown[]) { return new Query(this.sql, this.text, values); }
  async first<T>() { return (this.sql.prepare(this.text).get(...this.values as never[]) || null) as T | null; }
  async all<T>() { return { results: this.sql.prepare(this.text).all(...this.values as never[]) as T[] }; }
  async run() { return { meta: { changes: Number(this.sql.prepare(this.text).run(...this.values as never[]).changes) } }; }
}
function fixture() {
  const sql = new DatabaseSync(':memory:');
  sql.exec('PRAGMA foreign_keys=ON');
  for (const file of ['0001_eidos_platform.sql', '0002_members.sql', '0010_agent_exchange_self_registration.sql']) sql.exec(readFileSync('migrations/' + file, 'utf8'));
  sql.exec(readFileSync('migrations/0010_agent_exchange_self_registration.sql', 'utf8'));
  const database: Database = { prepare: q => new Query(sql, q), batch: async statements => {
    sql.exec('BEGIN'); try { const values = []; for (const s of statements) values.push(await s.run()); sql.exec('COMMIT'); return values; }
    catch (e) { sql.exec('ROLLBACK'); throw e; }
  } };
  const env: PlatformEnv = { EIDOS_DB: database, EIDOS_LOCAL_TEST: 'true', EIDOS_EXCHANGE_SELF_REGISTRATION_ENABLED: 'true',
    EIDOS_RATE_SECRET: 'local-test-exchange-rate-key-at-least-32-characters', EIDOS_ADMIN_TOKEN: 'local-test-admin-key-at-least-32-characters' };
  return { sql, env };
}
const payload = (name: string) => ({ name, description: 'Controlled QA identity; not an outside acquisition.', discoverySource: 'controlled', rulesVersion: '2026-10-22', operatorAuthorized: true, acceptPublicContributions: true });
function ctx(env: PlatformEnv, input?: unknown, key?: string, extra: Record<string, string> = {}, path = '/api/community/agent-registration'): Context {
  return { env, request: new Request('http://localhost:8788' + path, { method: input === undefined ? 'GET' : 'POST',
    headers: { ...(input === undefined ? {} : { 'content-type': 'application/json' }), ...(key ? { authorization: 'Bearer ' + key } : {}), 'CF-Connecting-IP': '192.0.2.1', ...extra },
    body: input === undefined ? undefined : JSON.stringify(input) }) };
}
async function identity(env: PlatformEnv, name = 'qa-agent', ip = '192.0.2.1') {
  const r = await register(ctx(env, payload(name), undefined, { 'CF-Connecting-IP': ip }));
  assert.equal(r.status, 201, await r.clone().text());
  assert.equal(r.headers.get('cache-control'), 'no-store');
  return r.json();
}
const finding = { title: 'Controlled keyboard finding', body: 'Activity: qa\nA controlled reproducible keyboard finding and proposed fix.', category: 'agents' };

test('Registration fails closed and bounds transport, payload, policy and identity claims', async () => {
  const { sql, env } = fixture();
  try {
    assert.equal((await (await availability(ctx({ ...env, EIDOS_EXCHANGE_SELF_REGISTRATION_ENABLED: undefined }))).json()).enabled, false);
    assert.equal((await register(ctx({ ...env, EIDOS_EXCHANGE_SELF_REGISTRATION_ENABLED: undefined }, payload('qa-one')))).status, 503);
    assert.equal((await register(ctx({ ...env, EIDOS_RATE_SECRET: 'short' }, payload('qa-one')))).status, 503);
    assert.equal((await register(ctx(env, payload('qa-one'), undefined, { origin: 'https://evil.example' }))).status, 403);
    assert.equal((await register(ctx(env, payload('qa-one'), undefined, { 'sec-fetch-site': 'cross-site' }))).status, 403);
    assert.equal((await register(ctx({ ...env, EIDOS_LOCAL_TEST: undefined }, payload('qa-one')))).status, 403);
    assert.equal((await register(ctx(env, payload('qa-one'), undefined, { 'content-type': 'text/plain' }))).status, 415);
    assert.equal((await register(ctx(env, { ...payload('qa-one'), description: 'x'.repeat(2200) }))).status, 413);
    for (const data of [{ ...payload('qa-one'), admin: true }, { ...payload('qa-one'), operatorAuthorized: false }, payload('eidos-admin'), { ...payload('qa-one'), rulesVersion: 'old' }])
      assert.equal((await register(ctx(env, data))).status, 400);
    assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_exchange_identities').get()?.n, 0);
  } finally { sql.close(); }
});
test('Independent keys are hash-only, names cannot be reclaimed and no member/session entitlement is created', async () => {
  const { sql, env } = fixture();
  try {
    const a = await identity(env, 'qa-first'), b = await identity(env, 'qa-second', '192.0.2.2');
    assert.match(a.credential, /^ew_exchange_[a-f0-9]{64}$/);
    assert.equal(sql.prepare('SELECT key_hash FROM eidos_exchange_identities WHERE id=?').get(a.id)?.key_hash, await hash(a.credential));
    assert.ok(!JSON.stringify(sql.prepare('SELECT * FROM eidos_exchange_identities').all()).includes(a.credential));
    assert.equal((await register(ctx(env, payload('qa-first'), undefined, { 'CF-Connecting-IP': '192.0.2.3' }))).status, 409);
    const submitted = await (await contribute(ctx(env, finding, a.credential))).json();
    const mine = await (await own(ctx(env, undefined, a.credential))).json(), theirs = await (await own(ctx(env, undefined, b.credential))).json();
    assert.equal(mine.contributions[0].id, submitted.id);
    assert.deepEqual(theirs.contributions, []);
    assert.equal(mine.identity.verification, 'unclaimed');
    assert.ok(!JSON.stringify(mine).includes(a.credential));
    assert.equal((await own(ctx(env, undefined, a.credential, {}, '/api/community/agent-account?id=' + b.id))).status, 400);
    for (const table of ['eidos_email_members', 'eidos_member_sessions', 'eidos_member_keys', 'eidos_orders']) assert.equal(sql.prepare('SELECT COUNT(*) n FROM ' + table).get()?.n, 0);
    assert.equal((await (await member(ctx(env, undefined, a.credential))).json()).member, null);
    assert.equal((await memberChange(ctx(env, { action: 'create-key' }, a.credential, { origin: 'http://localhost:8788' }))).status, 401);
    assert.equal((await projects(ctx(env, undefined, a.credential))).status, 401);
    assert.equal((await moderate(ctx(env, { action: 'publish', kind: 'thread', id: submitted.id }, a.credential, { origin: 'http://localhost:8788' }))).status, 401);
  } finally { sql.close(); }
});
test('Contributions remain private pending review; publication escapes markup and never calls an AI or external service', async () => {
  const { sql, env } = fixture(), oldFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw Error('Unexpected external call'); };
  try {
    const a = await identity(env), response = await contribute(ctx(env, { ...finding, body: finding.body + '\n<script>alert(1)</script>' }, a.credential));
    assert.equal(response.status, 201);
    const receipt = await response.json(); assert.equal(receipt.state, 'pending'); assert.equal(receipt.url, undefined);
    assert.equal((await (await threads(ctx(env))).json()).threads.length, 0);
    assert.equal((await threadPage({ ...ctx(env), params: { id: receipt.id } })).status, 404);
    assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_mentions').get()?.n, 0);
    const approved = await moderate(ctx(env, { action: 'publish', kind: 'thread', id: receipt.id }, env.EIDOS_ADMIN_TOKEN, { origin: 'http://localhost:8788' }));
    assert.equal(approved.status, 200);
    const html = await (await threadPage({ ...ctx(env), params: { id: receipt.id } })).text();
    assert.ok(!html.includes('<script>alert(1)</script>')); assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
    const mine = await (await own(ctx(env, undefined, a.credential))).json(); assert.match(mine.contributions[0].url, /community\/thread\//);
    assert.match(html, /agent\/qa-agent \[unclaimed\]/);
  } finally { globalThis.fetch = oldFetch; sql.close(); }
});
test('Rotation is single-winner, cannot select another identity, and self/admin revocation and expiry deny later writes', async () => {
  const { sql, env } = fixture();
  try {
    const a = await identity(env, 'qa-rotate'), b = await identity(env, 'qa-other', '192.0.2.2');
    assert.equal((await credentials(ctx(env, { action: 'revoke-credential', id: b.id }, a.credential))).status, 400);
    const race = await Promise.all([1, 2].map(() => credentials(ctx(env, { action: 'rotate-credential' }, a.credential))));
    assert.deepEqual(race.map(r => r.status).sort(), [200, 401]);
    const rotated = await race.find(r => r.status === 200)!.json();
    assert.equal(rotated.expiresAt, a.expiresAt);
    assert.equal((await contribute(ctx(env, finding, a.credential))).status, 401);
    assert.equal((await own(ctx(env, undefined, b.credential))).status, 200);
    assert.equal((await credentials(ctx(env, { action: 'revoke-credential' }, rotated.credential))).status, 200);
    assert.equal((await contribute(ctx(env, finding, rotated.credential))).status, 401);
    sql.prepare('UPDATE eidos_exchange_identities SET expires_at=0 WHERE id=?').run(b.id);
    assert.equal((await contribute(ctx(env, finding, b.credential))).status, 401);
    const c = await identity(env, 'qa-admin-revoke', '192.0.2.3');
    assert.equal((await moderate(ctx(env, { action: 'revoke-exchange-agent', id: c.id }, env.EIDOS_ADMIN_TOKEN, { origin: 'http://localhost:8788' }))).status, 200);
    assert.equal((await own(ctx(env, undefined, c.credential))).status, 401);
  } finally { sql.close(); }
});
test('Concurrent submissions obey the combined review cap and feature-off preserves revocation', async () => {
  const { sql, env } = fixture();
  try {
    const a = await identity(env);
    const responses = await Promise.all(Array.from({ length: 8 }, () => contribute(ctx(env, finding, a.credential))));
    assert.equal(responses.filter(r => r.status === 201).length, 2);
    assert.ok(responses.every(r => [201, 429].includes(r.status)));
    assert.equal(sql.prepare("SELECT COUNT(*) n FROM eidos_threads WHERE status='pending'").get()?.n, 2);
    const disabled = { ...env, EIDOS_EXCHANGE_SELF_REGISTRATION_ENABLED: undefined };
    assert.equal((await contribute(ctx(disabled, finding, a.credential))).status, 503);
    assert.equal((await credentials(ctx(disabled, { action: 'revoke-credential' }, a.credential))).status, 200);
    assert.equal((await own(ctx(env, undefined, a.credential))).status, 401);
  } finally { sql.close(); }
});
test('Registration IP and lifetime caps resist parallel registration; reserved public credentials are rejected', async () => {
  const { sql, env } = fixture();
  try {
    await identity(env, 'qa-ip-one'); await identity(env, 'qa-ip-two');
    assert.equal((await register(ctx(env, payload('qa-ip-three')))).status, 429);
    const prepared = sql.prepare('INSERT INTO eidos_exchange_identities(id,name,description,key_hash,created_at,expires_at,revoked) VALUES(?,?,?,?,?,?,?)');
    for (let i = 2; i < 99; i++) prepared.run('fixture-' + i, 'fixture-' + i, 'Controlled capacity fixture', 'fixture-hash-' + i, new Date().toISOString(), 1, 1);
    const results = await Promise.all(['a', 'b'].map((x, i) => register(ctx(env, payload('qa-cap-' + x), undefined, { 'CF-Connecting-IP': '192.0.2.' + (10 + i) }))));
    assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
    assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_exchange_identities').get()?.n, 100);
    const a = (await results.find(r => r.status === 201)!.json());
    assert.equal((await contribute(ctx(env, { ...finding, body: finding.body + a.credential }, a.credential))).status, 400);
  } finally { sql.close(); }
});
test('Thread and reply submissions share one pending ceiling and cannot reply to unpublished work', async () => {
  const { sql, env } = fixture();
  try {
    const a = await identity(env);
    const first = await (await contribute(ctx(env, finding, a.credential))).json();
    assert.equal((await contribute(ctx(env, { threadId: first.id, body: 'A reply to still-private work.' }, a.credential))).status, 404);
    await moderate(ctx(env, { action: 'publish', kind: 'thread', id: first.id }, env.EIDOS_ADMIN_TOKEN, { origin: 'http://localhost:8788' }));
    const mixed = await Promise.all([contribute(ctx(env, finding, a.credential)), contribute(ctx(env, { threadId: first.id, body: 'A useful controlled reply.' }, a.credential))]);
    assert.deepEqual(mixed.map(r => r.status), [201, 201]);
    assert.equal(sql.prepare("SELECT COUNT(*) n FROM eidos_replies WHERE status='pending'").get()?.n, 1);
    assert.equal((await (await threads(ctx(env))).json()).threads.length, 1);
  } finally { sql.close(); }
});
test('Revocation between authentication and INSERT prevents persistence; rotation and revoke cannot both claim success', async () => {
  const { sql, env } = fixture();
  try {
    const a = await identity(env, 'qa-race-first'), b = await identity(env, 'qa-race-second');
    const original = env.EIDOS_DB!.prepare.bind(env.EIDOS_DB);
    env.EIDOS_DB!.prepare = text => {
      const query = original(text);
      if (text.startsWith('INSERT INTO eidos_threads')) sql.prepare('UPDATE eidos_exchange_identities SET revoked=1 WHERE id=?').run(a.id);
      return query;
    };
    assert.equal((await contribute(ctx(env, finding, a.credential))).status, 401);
    assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_threads').get()?.n, 0);
    const race = await Promise.all(['rotate-credential', 'revoke-credential'].map(action => credentials(ctx(env, { action }, b.credential))));
    assert.deepEqual(race.map(r => r.status).sort(), [200, 401]);
    assert.equal((await own(ctx(env, undefined, b.credential))).status, 401);
    if (race[0].status === 200) {
      const rotated = await race[0].json();
      assert.equal((await own(ctx(env, undefined, rotated.credential))).status, 200);
      assert.equal(race[1].status, 401, 'Failed stale revocation must not claim the rotated identity was revoked.');
    }
  } finally { sql.close(); }
});
