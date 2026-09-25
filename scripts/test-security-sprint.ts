import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { verifyAccessOwner } from '../functions/_shared/platform/ownerSecurity';
import { onRequestPost as inquiry } from '../functions/api/project-inquiries';
import { admin, HttpError, type Database, type Statement } from '../functions/_shared/platform/core';
import { onRequestGet as auditEntries } from '../functions/api/operations/audit';
import { withInquiryTurnstile } from './mock-inquiry-turnstile';

class Query implements Statement {
  constructor(private sql: DatabaseSync, private statement: string, private values: unknown[] = []) {}
  bind(...values: unknown[]) { return new Query(this.sql, this.statement, values); }
  async first<T>() { return (this.sql.prepare(this.statement).get(...this.values as never[]) || null) as T | null; }
  async all<T>() { return { results: this.sql.prepare(this.statement).all(...this.values as never[]) as T[] }; }
  async run() { return { meta: { changes: Number(this.sql.prepare(this.statement).run(...this.values as never[]).changes) } }; }
}

test('owner Access token rejects forged signatures, wrong audience and other identities', async () => {
  const { publicKey, privateKey } = await generateKeyPair('RS256');
  const jwk = { ...await exportJWK(publicKey), kid: 'owner-test-key', alg: 'RS256' };
  const keys = createLocalJWKSet({ keys: [jwk] });
  const settings = { EIDOS_ACCESS_TEAM_DOMAIN: 'eidos-test.cloudflareaccess.com',
    EIDOS_ACCESS_AUD: 'exampleAccessApplicationAudience123', EIDOS_OWNER_EMAIL: 'brent@example.com' };
  const token = (email: string, aud: string) => new SignJWT({ email })
    .setProtectedHeader({ alg: 'RS256', kid: 'owner-test-key' })
    .setIssuer('https://eidos-test.cloudflareaccess.com').setAudience(aud)
    .setIssuedAt().setExpirationTime('1h').sign(privateKey);
  assert.equal(await verifyAccessOwner(await token('Brent@Example.com', settings.EIDOS_ACCESS_AUD), settings, keys), 'brent@example.com');
  await assert.rejects(verifyAccessOwner(await token('stranger@example.com', settings.EIDOS_ACCESS_AUD), settings, keys));
  await assert.rejects(verifyAccessOwner(await token('brent@example.com', 'wrong-audience'), settings, keys));
  const valid = await token('brent@example.com', settings.EIDOS_ACCESS_AUD);
  const parts = valid.split('.');
  parts[1] = parts[1].slice(0, -1) + (parts[1].endsWith('a') ? 'b' : 'a');
  await assert.rejects(verifyAccessOwner(parts.join('.'), settings, keys));
});

test('authorized owner routes write minimal audit rows before work and fail closed without storage', async () => {
  const sql = new DatabaseSync(':memory:');
  const database: Database = {
    prepare: query => new Query(sql, query),
    batch: async statements => Promise.all(statements.map(statement => statement.run())),
  };
  const token = 'local-test-operator-credential-over-32-chars';
  const env = { EIDOS_LOCAL_TEST: 'true', EIDOS_ADMIN_TOKEN: token, EIDOS_DB: database };
  const request = new Request('http://127.0.0.1/api/operations/readiness',
    { headers: { authorization: 'Bearer ' + token } });
  try {
    await admin(request, env);
    const row = sql.prepare('SELECT actor,method,path,event FROM eidos_owner_audit').get();
    assert.deepEqual({ ...row }, { actor: 'automation', method: 'GET', path: '/api/operations/readiness', event: 'authorized' });
    assert.ok(!JSON.stringify(row).includes(token));
    const list = await auditEntries({ request: new Request('http://127.0.0.1/api/operations/audit?limit=2',
      { headers: { authorization: 'Bearer ' + token } }), env });
    assert.equal(list.status, 200);
    assert.equal((await list.json() as { events: unknown[] }).events.length, 2);
    await assert.rejects(admin(request, { ...env, EIDOS_DB: undefined }),
      (error: unknown) => error instanceof HttpError && error.status === 503);
    const denied = await auditEntries({ request: new Request('http://127.0.0.1/api/operations/audit',
      { headers: { authorization: 'Bearer wrong' } }), env });
    assert.equal(denied.status, 401);
    assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM eidos_owner_audit').get()?.n, 2);
  } finally { sql.close(); }
});

test('inquiry gate checks challenge, limits sends and stores only hashed quota identifiers', () => withInquiryTurnstile(async () => {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync('migrations/growth/0001_growth.sql', 'utf8'));
  sql.exec(readFileSync('migrations/growth/0002_owner_audit.sql', 'utf8'));
  const database: Database = {
    prepare: query => new Query(sql, query),
    batch: async statements => Promise.all(statements.map(statement => statement.run())),
  };
  let sends = 0;
  const env = {
    EIDOS_GROWTH_DB: database,
    EIDOS_PLATFORM_TOKEN: 'test-inquiry-secret-of-more-than-32-characters',
    TURNSTILE_SECRET_KEY: 'test-only',
    EIDOS_INQUIRY_MAILER: { fetch: (async () => { sends++; return Response.json({ ok: true, receipt: 'local-provider-receipt' }); }) as typeof fetch },
  };
  const request = (i: number, challenge = 'valid-turnstile-token') =>
    new Request('https://eidos-works.com/api/project-inquiries', {
      method: 'POST', headers: { origin: 'https://eidos-works.com', 'content-type': 'application/json', 'cf-connecting-ip': '192.0.2.1' },
      body: JSON.stringify({ projectType: 'Business Systems', problem: 'We need to simplify this repeated workflow.', name: 'Test',
        email: `inquiry${i}@example.com`, challenge }),
    });
  try {
    assert.equal((await inquiry({ request: request(0, 'forged-token-123'), env })).status, 403);
    assert.equal(sends, 0);
    for (let i = 0; i < 5; i++) assert.equal((await inquiry({ request: request(i), env })).status, 200);
    const denied = await inquiry({ request: request(5), env });
    assert.equal(denied.status, 429);
    assert.equal((await denied.json()).submitted, false);
    assert.equal(sends, 5);
    assert.ok(!JSON.stringify(sql.prepare('SELECT * FROM growth_quotas').all()).includes('192.0.2.1'));
    assert.equal((await inquiry({ request: request(6), env: { ...env, EIDOS_GROWTH_DB: undefined } })).status, 503);
    assert.equal(sends, 5);
  } finally { sql.close(); }
}));
