import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { type Context, type Database, type PlatformEnv, type Statement } from '../functions/_shared/platform/core';
import { onRequestPost as auth } from '../functions/api/members/auth';
import { onRequestGet as get, onRequestPost as save } from '../functions/api/playground/projects';
import { onRequestPost as checkout } from '../functions/api/playground/checkout';
import { onRequestPost as download } from '../functions/api/playground/purchases';
import { onRequestPost as webhook } from '../functions/api/playground/webhook';
import { createProject } from '../src/playground/model';
import { createHmac } from 'node:crypto';

test('Cloud revisions preserve images, enforce ownership, and reject stale writes', async () => {
  const {env,sql}=fixture(), alice=await signup(env,'alice'), bob=await signup(env,'bobby');
  const document=createProject(); document.sections[1].image='data:image/png;base64,iVBORw0KGgo=';
  assert.equal((await save(ctx(env,'/api/playground/projects',{document,expectedOwner:'another-account'},alice.headers))).status,409);
  const first=await save(ctx(env,'/api/playground/projects',{document},alice.headers));
  assert.equal(first.status,200,await first.clone().text());
  const saved=await first.json();
  const reopened=await get(ctx(env,'/api/playground/projects?id='+saved.id,undefined,alice.headers));
  assert.deepEqual((await reopened.json()).document,document);
  assert.equal((await get(ctx(env,'/api/playground/projects?id='+saved.id,undefined,bob.headers))).status,404);
  assert.equal((await save(ctx(env,'/api/playground/projects',{document,id:saved.id,expectedRevision:saved.revision},bob.headers))).status,404);
  document.name='Second';
  assert.equal((await save(ctx(env,'/api/playground/projects',{document,id:saved.id,expectedRevision:saved.revision},alice.headers))).status,200);
  assert.equal((await save(ctx(env,'/api/playground/projects',{document,id:saved.id,expectedRevision:saved.revision},alice.headers))).status,409);
  const historical=await get(ctx(env,'/api/playground/projects?id='+saved.id+'&revision='+saved.revision,undefined,alice.headers));
  assert.notEqual((await historical.json()).document.name,'Second');
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_pg_assets').get()?.n,1);
  assert.equal((await save(ctx(env,'/api/playground/projects',{document},alice.headers))).status,200);
  assert.equal((await get(ctx(env,'/api/playground/projects',undefined,alice.headers))).status,200);
  assert.equal((await get(ctx(env,'/api/playground/projects'))).status,401);
  sql.close();
});

test('Frozen checkout is idempotent and entitlement requires signed matching payment', async () => {
  const {env,sql}=fixture(), alice=await signup(env,'alice'), bob=await signup(env,'bobby');
  env.EIDOS_PLAYGROUND_STRIPE_KEY='sk_test_fixture'; env.EIDOS_PLAYGROUND_WEBHOOK_SECRET='whsec_fixture'; env.EIDOS_PLAYGROUND_TEST_PRICE_CENTS='100';
  const document=createProject(), saved=await (await save(ctx(env,'/api/playground/projects',{document},alice.headers))).json();
  const input={projectId:saved.id,revisionId:saved.revision,requestId:crypto.randomUUID()};
  const originalFetch=globalThis.fetch; let calls=0;
  globalThis.fetch=async (_url,init) => {calls++; assert.ok(new Headers(init?.headers).get('idempotency-key'));return new Response(JSON.stringify({id:'cs_test_fixture',url:'https://checkout.stripe.com/c/pay/cs_test_fixture',livemode:false}));};
  try {
    const response=await checkout(ctx(env,'/api/playground/checkout',input,alice.headers));
    assert.equal(response.status,200,await response.clone().text());
    const orderId=(await response.json()).orderId;
    await checkout(ctx(env,'/api/playground/checkout',input,alice.headers)); assert.equal(calls,1);
    assert.equal((await download(ctx(env,'/api/playground/purchases',{id:orderId},alice.headers))).status,403);
    const frozen=sql.prepare('SELECT archive FROM eidos_pg_orders WHERE id=?').get(orderId)?.archive;
    document.name='Edited after checkout'; await save(ctx(env,'/api/playground/projects',{document,id:saved.id,expectedRevision:saved.revision},alice.headers));
    const object={id:'cs_test_fixture',livemode:false,mode:'payment',currency:'usd',amount_total:100,client_reference_id:orderId,metadata:{eidos_product:'playground-v1',eidos_order_id:orderId},payment_intent:'pi_fixture',payment_status:'unpaid'};
    async function event(id:string,type:string,payload:Record<string,unknown>,valid=true) {
      const raw=JSON.stringify({id,type,livemode:false,data:{object:payload}}), timestamp=Math.floor(Date.now()/1000);
      const signature=createHmac('sha256',valid?'whsec_fixture':'wrong').update(timestamp+'.'+raw).digest('hex');
      return webhook({env,request:new Request('http://localhost:8788/api/playground/webhook',{method:'POST',headers:{'stripe-signature':`t=${timestamp},v1=${signature}`},body:raw})});
    }
    assert.equal((await event('evt_bad','checkout.session.completed',object,false)).status,400);
    assert.equal((await event('evt_delay','checkout.session.completed',object)).status,200);
    assert.equal((await download(ctx(env,'/api/playground/purchases',{id:orderId},alice.headers))).status,403);
    object.payment_status='paid';
    assert.equal((await event('evt_wrong','checkout.session.async_payment_succeeded',{...object,amount_total:1})).status,400);
    assert.equal((await event('evt_paid','checkout.session.async_payment_succeeded',object)).status,200);
    assert.equal((await event('evt_paid','checkout.session.async_payment_succeeded',object)).status,200);
    assert.equal((await download(ctx(env,'/api/playground/purchases',{id:orderId},bob.headers))).status,403);
    const delivered=await download(ctx(env,'/api/playground/purchases',{id:orderId},alice.headers)); assert.equal(delivered.status,200);
    assert.equal(Buffer.from(await delivered.arrayBuffer()).toString('base64'),frozen);
    await event('evt_expired','checkout.session.expired',object);
    assert.equal((await download(ctx(env,'/api/playground/purchases',{id:orderId},alice.headers))).status,200);
    await event('evt_refund','charge.refunded',{payment_intent:'pi_fixture'});
    await event('evt_late','checkout.session.async_payment_succeeded',object);
    assert.equal((await download(ctx(env,'/api/playground/purchases',{id:orderId},alice.headers))).status,403);
    env.EIDOS_PLAYGROUND_STRIPE_KEY='sk_live_forbidden';
    assert.equal((await checkout(ctx(env,'/api/playground/checkout',input,alice.headers))).status,503);
  } finally {globalThis.fetch=originalFetch;sql.close();}
});
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
function fixture() {
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
function ctx(
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
async function signup(
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

test('image decoder availability and atomic owner storage quota preserve saved state',async()=>{
 const {env,sql}=fixture(),alice=await signup(env,'image_owner');const document=createProject();
 const first=await save(ctx(env,'/api/playground/projects',{document},alice.headers));assert.equal(first.status,200);
 const saved=await first.json();document.sections[1].image='data:image/png;base64,iVBORw0KGgo=';
 const validate=env.EIDOS_VALIDATE_PLAYGROUND_IMAGE;delete env.EIDOS_VALIDATE_PLAYGROUND_IMAGE;
 assert.equal((await save(ctx(env,'/api/playground/projects',{document,id:saved.id,expectedRevision:saved.revision},alice.headers))).status,503);
 env.EIDOS_VALIDATE_PLAYGROUND_IMAGE=validate;
 const owner=sql.prepare('SELECT id FROM eidos_email_members WHERE username=?').get('image_owner')!.id;
 sql.prepare('INSERT INTO eidos_pg_assets(owner_id,hash,data) VALUES(?,?,zeroblob(40000000))').run(owner,'quota-fixture');
 assert.equal((await save(ctx(env,'/api/playground/projects',{document,id:saved.id,expectedRevision:saved.revision},alice.headers))).status,413);
 assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_pg_revisions').get()!.n,1);
 assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_pg_assets').get()!.n,1);
 sql.close();
});
