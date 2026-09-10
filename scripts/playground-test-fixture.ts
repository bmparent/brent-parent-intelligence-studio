import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {type Context,type Database,type PlatformEnv,type Statement} from '../functions/_shared/platform/core';
import {onRequestPost as auth} from '../functions/api/members/auth';
class Query implements Statement {
  constructor(
    private sql: DatabaseSync,
    private text: string,
    private values: unknown[] = [],
  ) {}
  bind(...values: unknown[]) {
    return new Query(this.sql, this.text, values);
  }
  async first<T>() {
    return (this.sql.prepare(this.text).get(...(this.values as never[])) ||
      null) as T | null;
  }
  async all<T>() {
    return {
      results: this.sql
        .prepare(this.text)
        .all(...(this.values as never[])) as T[],
    };
  }
  async run() {
    return {
      meta: {
        changes: Number(
          this.sql.prepare(this.text).run(...(this.values as never[])).changes,
        ),
      },
    };
  }
}
export function fixture() {
  const sql = new DatabaseSync(':memory:');
  sql.exec('PRAGMA foreign_keys=ON;');
  // Production retains these earlier Clerk records. The email-account schema
  // must coexist with them without changing identity or losing data.
  sql.exec("CREATE TABLE eidos_members(id TEXT PRIMARY KEY, display_name TEXT NOT NULL, created_at TEXT NOT NULL); INSERT INTO eidos_members VALUES('legacy-user','Existing member','2026-09-07')");
  for (const migration of ['0001_eidos_platform.sql', '0002_members.sql', '0003_playground.sql'])
    sql.exec(readFileSync('migrations/' + migration, 'utf8'));
  // Reapplying the additive migrations is safe for existing installations.
  sql.exec(readFileSync('migrations/0002_members.sql', 'utf8'));
  assert.deepEqual({ ...sql.prepare('SELECT * FROM eidos_members').get() }, {
    id: 'legacy-user', display_name: 'Existing member', created_at: '2026-09-07',
  });
  const db: Database = {
    prepare: (q) => new Query(sql, q),
    batch: async (statements) => {
      sql.exec('BEGIN');
      try {
        const result = [];
        for (const s of statements) result.push(await s.run());
        sql.exec('COMMIT');
        return result;
      } catch (e) {
        sql.exec('ROLLBACK');
        throw e;
      }
    },
  };
  const env: PlatformEnv = {
    EIDOS_RUNTIME: 'sentinel',
    EIDOS_VALIDATE_PLAYGROUND_IMAGE: async () => {}, // Decoder exercised separately in Sentinel's real Sharp tests.
    EIDOS_DB: db,
    EIDOS_LOCAL_TEST: 'true',
    PUBLIC_SITE_URL: 'http://localhost:8788',
    EIDOS_RATE_SECRET: 'test-only-rate-key-of-more-than-32-characters',
    EIDOS_ADMIN_TOKEN: 'test-only-admin-key-of-more-than-32-characters',
  };
  return { sql, env };
}
export function ctx(
  env: PlatformEnv,
  path: string,
  input?: unknown,
  headers: Record<string, string> = {},
): Context {
  const site = env.PUBLIC_SITE_URL || 'http://localhost:8788';
  return {
    env,
    request: new Request(site + path, {
      method: input === undefined ? 'GET' : 'POST',
      headers: {
        origin: site,
        ...(input === undefined ? {} : { 'content-type': 'application/json' }),
        ...headers,
      },
      ...(input === undefined ? {} : { body: JSON.stringify(input) }),
    }),
  };
}
export async function signup(
  env: PlatformEnv,
  username: string,
  kind = 'person',
  newsletter = false,
) {
  const r = await auth(
    ctx(env, '/api/members/auth', {
      action: 'signup',
      username,
      email: username + '@example.test',
      kind,
      newsletter,
    }),
  );
  assert.equal(r.status, 200, await r.clone().text());
  const link = (await r.json()).localVerificationUrl;
  const token = new URLSearchParams(new URL(link).hash.slice(1)).get('token');
  const verified = await auth(
    ctx(env, '/api/members/auth', { action: 'verify', token }),
  );
  assert.equal(verified.status, 200, await verified.clone().text());
  const cookie = verified.headers.get('set-cookie')!.split(';')[0];
  return { cookie, token, headers: { cookie } };
}

