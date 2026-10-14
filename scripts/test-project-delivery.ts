import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { hash, type Context, type Database, type Statement } from '../functions/_shared/platform/core';
import { onRequestGet, onRequestPost } from '../functions/api/playground/delivery';
import { onRequestPost as legacySave } from '../functions/api/playground/projects';
import { onRequest as relay } from '../functions/_middleware';
import { DELIVERY_LIMITS, readProjectDeliveryArchive, type ProjectDeliveryEnv } from '../functions/_shared/platform/projectDelivery';
import schema from '../functions/_shared/platform/projectDeliverySchema';
import { createProjectSnapshot, buildFrozenPackage, type ProjectSnapshot } from '../src/playground/purchaseSnapshot';
import { createStarter } from '../src/playground/starters';
import { createProject } from '../src/playground/model';

const pixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aLTsAAAAASUVORK5CYII=';
const requestId = 'controlled-request-1';
type Hooks = { failChunk: boolean };
class Query implements Statement {
  constructor(private sql: DatabaseSync, private text: string, private hooks: Hooks, private values: unknown[] = []) {}
  bind(...values: unknown[]) { return new Query(this.sql, this.text, this.hooks, values); }
  first<T>() { return Promise.resolve((this.sql.prepare(this.text).get(...this.values as never[]) || null) as T | null); }
  all<T>() { return Promise.resolve({ results: this.sql.prepare(this.text).all(...this.values as never[]) as T[] }); }
  run() {
    if (this.hooks.failChunk && this.text.includes('INSERT INTO eidos_pg_delivery_chunks') && this.values[0] === 1) throw Error('Controlled chunk write failure');
    return Promise.resolve({ meta: { changes: Number(this.sql.prepare(this.text).run(...this.values as never[]).changes) } });
  }
}
async function fixture() {
  const sql = new DatabaseSync(':memory:'), hooks = { failChunk: false };
  sql.exec('PRAGMA foreign_keys=ON');
  for (const file of ['0001_eidos_platform.sql', '0002_members.sql', '0003_playground.sql']) sql.exec(readFileSync('migrations/' + file, 'utf8'));
  const database: Database = {
    prepare: text => new Query(sql, text, hooks),
    batch: statements => {
      sql.exec('BEGIN');
      try { const results = statements.map(statement => statement.run()); sql.exec('COMMIT'); return Promise.all(results); }
      catch (error) { sql.exec('ROLLBACK'); return Promise.reject(error); }
    },
  };
  const env: ProjectDeliveryEnv = { EIDOS_RUNTIME: 'sentinel', EIDOS_DB: database, EIDOS_LOCAL_TEST: 'true', PUBLIC_SITE_URL: 'http://localhost:8788', EIDOS_PLAYGROUND_DELIVERY_MODE: 'test' };
  for (const [owner, token] of [['alice', 'a'.repeat(64)], ['bob', 'b'.repeat(64)]]) {
    sql.prepare('INSERT INTO eidos_email_members(id,email,username,kind,created_at,newsletter_after) VALUES(?,?,?,?,?,?)').run(owner, owner + '@example.test', owner, 'person', '2026-10-14', '2026-10-14');
    sql.prepare('INSERT INTO eidos_member_sessions(token_hash,member_id,expires) VALUES(?,?,?)').run(await hash(token), owner, 2_000_000_000);
  }
  const snapshot = await createProjectSnapshot(createStarter({ starter: 'switchboard', goal: 'business', action: 'contact' }, pixel), 'document-fixture', 3);
  const context = (input?: unknown, owner = 'alice', query = ''): Context => ({ env, request: new Request('http://localhost:8788/api/playground/delivery' + query, {
    method: input === undefined ? 'GET' : 'POST', headers: { origin: 'http://localhost:8788', ...(owner ? { cookie: 'eidos_session_local=' + (owner === 'alice' ? 'a' : 'b').repeat(64) } : {}), ...(input === undefined ? {} : { 'content-type': 'application/json' }) },
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  }) });
  const freeze = (input: unknown = { requestId, snapshot }, owner = 'alice') => onRequestPost(context(input, owner));
  const read = (id: string, owner = 'alice') => onRequestGet(context(undefined, owner, '?id=' + id));
  return { sql, env, hooks, snapshot, context, freeze, read, close: () => sql.close() };
}
async function successful(response: Response) { assert.equal(response.status, 200, await response.clone().text()); return (await response.json()).delivery; }

test('server freezes exact schema-5 package and keeps source/bytes owner-scoped and immutable', async () => {
  const f = await fixture(), originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw Error('Snapshot storage must not fetch assets or contact providers.'); };
  try {
    const frozen = await buildFrozenPackage(f.snapshot), saved = await successful(await f.freeze());
    assert.equal(saved.entitlement, 'not-verified'); assert.equal(saved.checkout, 'disabled');
    assert.equal(saved.archiveSha256, frozen.receipt.archiveSha256); assert.equal(saved.archiveBytes, frozen.archive.length);
    f.snapshot.project.name = 'Later draft';
    const reopened = await successful(await f.read(saved.id));
    assert.equal(reopened.snapshot.project.name, frozen.snapshot.project.name);
    assert.deepEqual((await readProjectDeliveryArchive(f.env, 'alice', saved.id)).archive, frozen.archive);
    assert.equal((await f.read(saved.id, 'bob')).status, 404);
    await assert.rejects(readProjectDeliveryArchive(f.env, 'bob', saved.id), /not found/);
    assert.equal((await f.read(saved.id, '')).status, 401);
    assert.equal((await onRequestGet(f.context(undefined, 'alice', '?id=' + saved.id + '&download=1'))).status, 400);
  } finally { globalThis.fetch = originalFetch; f.close(); }
});

test('delivery is TEST opt-in; legacy cloud remains 409 and older formats stay outside new storage', async () => {
  const f = await fixture();
  try {
    f.env.EIDOS_PLAYGROUND_DELIVERY_MODE = undefined; assert.equal((await f.freeze()).status, 503);
    f.env.EIDOS_PLAYGROUND_DELIVERY_MODE = 'live'; assert.equal((await f.freeze()).status, 503);
    f.env.EIDOS_PLAYGROUND_DELIVERY_MODE = 'test';
    for (const site of ['https://eidos-works.com', 'https://www.eidos-works.com', 'https://eidosworks.pages.dev', 'https://EIDOSWORKS.PAGES.DEV']) {
      f.env.PUBLIC_SITE_URL = site; assert.equal((await f.freeze()).status, 503);
    }
    f.env.PUBLIC_SITE_URL = 'http://localhost:8788';
    const old = await createProjectSnapshot(createProject(), 'legacy-document', 0);
    assert.equal((await f.freeze({ requestId, snapshot: old })).status, 400);
    assert.equal((await legacySave(f.context({ document: f.snapshot.project }))).status, 409);
    assert.equal((await f.freeze(undefined, '')).status, 401);
    assert.equal((await onRequestPost({ ...f.context({ requestId, snapshot: f.snapshot }), request: new Request('http://localhost:8788/api/playground/delivery', { method: 'POST', headers: { origin: 'https://wrong.example' } }) })).status, 403);
  } finally { f.close(); }
});

test('forged owner, rendered bytes, claimed hashes, unsafe images and oversized source fail closed', async () => {
  const f = await fixture();
  try {
    for (const field of ['owner', 'html', 'archive', 'archiveSha256', 'manifest']) assert.equal((await f.freeze({ requestId, snapshot: f.snapshot, [field]: 'forged' })).status, 400, field);
    assert.equal((await f.freeze({ requestId, snapshot: { ...f.snapshot, snapshotHash: '0'.repeat(64) } })).status, 400);
    const remote = structuredClone(f.snapshot); remote.project.sections[1].image = 'https://example.invalid/image.png';
    assert.equal((await f.freeze({ requestId, snapshot: remote })).status, 400);
    const injection = structuredClone(f.snapshot) as ProjectSnapshot & { project: Record<string, unknown> }; injection.project.javascript = 'alert(1)';
    assert.equal((await f.freeze({ requestId, snapshot: injection })).status, 400);
    const malformed = structuredClone(f.snapshot); malformed.project.sections[1].image = 'data:image/png;base64,iVBORw0KGgo=';
    assert.equal((await f.freeze({ requestId, snapshot: malformed })).status, 400);
    const tooLarge = { ...f.snapshot, extra: 'x'.repeat(DELIVERY_LIMITS.snapshotBytes) };
    assert.equal((await f.freeze({ requestId, snapshot: tooLarge })).status, 413);
    assert.equal(f.sql.prepare("SELECT COUNT(*) n FROM sqlite_master WHERE name='eidos_pg_delivery_snapshots'").get()!.n, 0);
  } finally { f.close(); }
});

test('same-owner request races are idempotent, mismatched payloads conflict, and another owner is independent', async () => {
  const f = await fixture();
  try {
    const results = await Promise.all(Array.from({ length: 4 }, () => f.freeze()));
    const saved = await Promise.all(results.map(successful)); assert.equal(new Set(saved.map(value => value.id)).size, 1);
    assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM eidos_pg_delivery_snapshots').get()!.n, 1);
    const row = f.sql.prepare('SELECT chunk_count FROM eidos_pg_delivery_snapshots').get()!;
    assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM eidos_pg_delivery_chunks').get()!.n, row.chunk_count);
    const changed = await createProjectSnapshot({ ...f.snapshot.project, name: 'Changed' }, f.snapshot.documentId, 4);
    assert.equal((await f.freeze({ requestId, snapshot: changed })).status, 409);
    const bob = await successful(await f.freeze({ requestId, snapshot: f.snapshot }, 'bob')); assert.notEqual(bob.id, saved[0].id);
    assert.equal((await f.read(bob.id)).status, 404);
  } finally { f.close(); }
});

test('owner count and byte quotas use atomic admission, and rejected races create no orphan chunks', async () => {
  const f = await fixture();
  try {
    const saved = await successful(await f.freeze());
    for (let index = 1; index < DELIVERY_LIMITS.ownerCount - 1; index++) f.sql.prepare(`INSERT INTO eidos_pg_delivery_snapshots SELECT ?,owner_id,?,mode,document_id,revision,name,snapshot_hash,project_hash,snapshot_json,manifest_json,archive_sha256,archive_bytes,chunk_count,created_at FROM eidos_pg_delivery_snapshots WHERE id=?`).run(crypto.randomUUID(), 'seed-' + index, saved.id);
    const results = await Promise.all([f.freeze({ requestId: 'quota-request-a', snapshot: f.snapshot }), f.freeze({ requestId: 'quota-request-b', snapshot: f.snapshot })]);
    assert.deepEqual(results.map(value => value.status).sort(), [200, 409]);
    assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM eidos_pg_delivery_snapshots WHERE owner_id=?').get('alice')!.n, DELIVERY_LIMITS.ownerCount);
    assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM eidos_pg_delivery_chunks c LEFT JOIN eidos_pg_delivery_snapshots s ON s.id=c.snapshot_id WHERE s.id IS NULL').get()!.n, 0);
    await successful(await f.freeze()); // Existing requests remain readable at quota.
    const bob = await successful(await f.freeze({ requestId, snapshot: f.snapshot }, 'bob'));
    f.sql.prepare('UPDATE eidos_pg_delivery_snapshots SET archive_bytes=6000000 WHERE id=?').run(bob.id);
    for (let index = 1; index < 5; index++) f.sql.prepare(`INSERT INTO eidos_pg_delivery_snapshots SELECT ?,owner_id,?,mode,document_id,revision,name,snapshot_hash,project_hash,snapshot_json,manifest_json,archive_sha256,archive_bytes,chunk_count,created_at FROM eidos_pg_delivery_snapshots WHERE id=?`).run(crypto.randomUUID(), 'byte-seed-' + index, bob.id);
    assert.equal((await f.freeze({ requestId: 'bytes-request-new', snapshot: f.snapshot }, 'bob')).status, 409);
    assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM eidos_pg_delivery_snapshots WHERE owner_id=?').get('bob')!.n, 5);
  } finally { f.close(); }
});

test('chunk failure rolls back source and bytes; incomplete or corrupted archives cannot be delivered', async () => {
  const f = await fixture();
  try {
    f.hooks.failChunk = true; assert.equal((await f.freeze()).status, 503);
    assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM eidos_pg_delivery_snapshots').get()!.n, 0);
    assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM eidos_pg_delivery_chunks').get()!.n, 0);
    f.hooks.failChunk = false; const saved = await successful(await f.freeze());
    f.sql.prepare("UPDATE eidos_pg_delivery_chunks SET data_base64='eA==' WHERE snapshot_id=? AND ordinal=0").run(saved.id);
    await assert.rejects(readProjectDeliveryArchive(f.env, 'alice', saved.id), /hash does not match/);
    f.sql.prepare('DELETE FROM eidos_pg_delivery_chunks WHERE snapshot_id=? AND ordinal=0').run(saved.id);
    await assert.rejects(readProjectDeliveryArchive(f.env, 'alice', saved.id), /incomplete/);
  } finally { f.close(); }
});

test('delivery migration and runtime schema are identical', () => {
  assert.equal(schema.replaceAll('\r\n', '\n'), readFileSync('migrations/0006_project_delivery.sql', 'utf8').replaceAll('\r\n', '\n'));
});

test('delivery relay uses the explicit bounded body ceiling and never falls back after rejection', async () => {
  const originalFetch = globalThis.fetch; let calls = 0;
  globalThis.fetch = async (_url, init) => { calls++; assert.equal(String(init?.body).length, 13000); return Response.json({ frozen: true }); };
  const env = { EIDOS_PLATFORM_URL: 'https://controlled-preview.vercel.app', EIDOS_PLATFORM_TOKEN: 'x'.repeat(40) };
  const invoke = (length: number) => relay({ env, request: new Request('https://controlled-preview.pages.dev/api/playground/delivery', { method: 'POST', headers: { 'content-type': 'application/json' }, body: 'x'.repeat(length) }), next: async () => { throw Error('Delivery must use the configured relay.'); } });
  try { assert.equal((await invoke(13000)).status, 200); assert.equal((await invoke(DELIVERY_LIMITS.requestBytes + 1)).status, 413); assert.equal(calls, 1); }
  finally { globalThis.fetch = originalFetch; }
});
