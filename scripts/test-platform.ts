import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { inflateRawSync } from 'node:zlib';
import type {
  Database,
  Statement,
  PlatformEnv,
  Context,
} from '../functions/_shared/platform/core';
import { hash, reserve } from '../functions/_shared/platform/core';
import { onRequestPost as assistant } from '../functions/api/assistant';
import { onRequestPost as legacy } from '../functions/api/intelligence';
import {
  onRequestPost as question,
  onRequestGet as questions,
} from '../functions/api/community/threads';
import { onRequestPost as reply } from '../functions/api/community/replies';
import { onRequestPost as moderate } from '../functions/api/community/moderate';
import { onRequestPost as agentPost } from '../functions/api/community/agents';
import { onRequestPost as maintenance } from '../functions/api/community/maintenance';
import { onRequestGet as threadPage } from '../functions/community/thread/[id]';
import { onRequestGet as feed } from '../functions/community/feed';
import { onRequestPost as checkout } from '../functions/api/shop/checkout';
import { onRequestPost as webhook } from '../functions/api/shop/webhook';
import { onRequestPost as download } from '../functions/api/shop/download';
import { onRequestPost as status } from '../functions/api/shop/status';
import { kitArchiveBase64 } from '../functions/_shared/platform/kitArchive';
class SQLiteStatement implements Statement {
  constructor(
    private db: DatabaseSync,
    private sql: string,
    private values: unknown[] = [],
  ) {}
  bind(...values: unknown[]) {
    return new SQLiteStatement(this.db, this.sql, values);
  }
  async first<T>() {
    return (this.db.prepare(this.sql).get(...(this.values as never[])) ||
      null) as T | null;
  }
  async all<T>() {
    return {
      results: this.db
        .prepare(this.sql)
        .all(...(this.values as never[])) as T[],
    };
  }
  async run() {
    return {
      meta: {
        changes: Number(
          this.db.prepare(this.sql).run(...(this.values as never[])).changes,
        ),
      },
    };
  }
}
function setup(overrides: Partial<PlatformEnv> = {}) {
  const sql = new DatabaseSync(':memory:');
  sql.exec('PRAGMA foreign_keys=ON;');
  sql.exec(readFileSync('migrations/0001_eidos_platform.sql', 'utf8'));
  const db: Database = {
    prepare: (q) => new SQLiteStatement(sql, q),
    batch: async (statements) => {
      sql.exec('BEGIN');
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.run());
        sql.exec('COMMIT');
        return results;
      } catch (e) {
        sql.exec('ROLLBACK');
        throw e;
      }
    },
  };
  const env: PlatformEnv = {
    EIDOS_RUNTIME: 'sentinel',
    EIDOS_DB: db,
    EIDOS_LOCAL_TEST: 'true',
    EIDOS_RATE_SECRET: 'test-rate-secret-with-at-least-32-characters',
    EIDOS_ADMIN_TOKEN: 'test-operator-access-token-at-least-32-characters',
    PUBLIC_SITE_URL: 'http://localhost:8788',
    ...overrides,
  };
  return { db, env, sql };
}
function context(
  env: PlatformEnv,
  path: string,
  input?: unknown,
  headers: Record<string, string> = {},
  params?: Record<string, string>,
): Context {
  return {
    env,
    params,
    request: new Request('http://localhost:8788' + path, {
      method: input === undefined ? 'GET' : 'POST',
      headers: {
        origin: 'http://localhost:8788',
        ...(input === undefined ? {} : { 'content-type': 'application/json' }),
        ...headers,
      },
      ...(input === undefined ? {} : { body: JSON.stringify(input) }),
    }),
  };
}
async function value(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}
const questionInput = {
  author: 'Test Builder',
  title: 'How do I build a better storefront?',
  body: '@eidos I want a responsive storefront with a clearer entry and product hierarchy.',
  allowAssistant: true,
};
await test('Atomic quotas cannot overspend under concurrent reservations', async () => {
  const { db, sql } = setup();
  const outcomes = await Promise.all(
    Array.from({ length: 50 }, () => reserve(db, 'concurrent', 100, 750)),
  );
  assert.equal(outcomes.filter(Boolean).length, 7);
  const row = sql.prepare('SELECT used FROM eidos_quotas').get();
  assert.equal(row?.used, 700);
  sql.close();
});
await test('Published knowledge and legacy clients spend zero model tokens', async () => {
  const { env, sql } = setup({ OPENAI_API_KEY: 'test-only-key' });
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw Error('Unexpected call');
  };
  try {
    const result = await value(
      await assistant(
        context(env, '/api/assistant', { question: 'What is Sentinel Lab?' }),
      ),
    );
    assert.equal(result.mode, 'sources');
    assert.match(String(result.answer), /separately/);
    const previous = await value(
      await legacy(
        context(env, '/api/intelligence', {
          prompt: 'A storefront project',
          mode: 'compass',
        }),
      ),
    );
    assert.ok(previous);
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = original;
    sql.close();
  }
});
await test('AI is opt-in, capped globally, deduplicated, and fails closed without a database', async () => {
  const { env, sql } = setup({
    OPENAI_API_KEY: 'test-only-key',
    EIDOS_ASSISTANT_MODEL: 'test-model',
    EIDOS_AI_ENABLED: 'true',
    EIDOS_AI_DAILY_TOKENS: '5000',
  });
  let calls = 0;
  const original = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    calls++;
    const payload = JSON.parse(String(init?.body));
    assert.equal(payload.store, false);
    assert.equal(payload.max_output_tokens, 320);
    assert.equal(payload.tools, undefined);
    return Response.json({
      output: [
        {
          type: 'message',
          content: [
            { type: 'output_text', text: 'A concise grounded answer.' },
          ],
        },
      ],
    });
  };
  try {
    const input = {
      question: 'How do I scope a website?',
      enhanced: true,
      requestId: crypto.randomUUID(),
    };
    const first = await value(
      await assistant(context(env, '/api/assistant', input)),
    );
    assert.equal(first.mode, 'ai');
    await assistant(context(env, '/api/assistant', input));
    assert.equal(calls, 1);
    assert.equal(
      (
        await assistant(
          context(env, '/api/assistant', {
            ...input,
            question: 'Different question',
          }),
        )
      ).status,
      409,
    );
    const outcomes = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        assistant(
          context(
            env,
            '/api/assistant',
            { ...input, requestId: crypto.randomUUID() },
            { 'CF-Connecting-IP': '192.0.2.' + i },
          ),
        ),
      ),
    );
    assert.ok(outcomes.every((r) => r.status === 200));
    assert.ok(calls >= 1 && calls <= 2);
    const callsAtLimit = calls;
    assert.ok(
      Number(
        sql
          .prepare("SELECT used FROM eidos_quotas WHERE bucket='ai-global'")
          .get()?.used,
      ) <= 5000,
    );
    await assistant(
      context({ ...env, EIDOS_DB: undefined }, '/api/assistant', {
        ...input,
        requestId: crypto.randomUUID(),
      }),
    );
    assert.equal(calls, callsAtLimit);
    const outage = await value(
      await assistant(
        context(
          {
            ...env,
            EIDOS_DB: {
              prepare() {
                throw Error('simulated database outage');
              },
            } as PlatformEnv['EIDOS_DB'],
          },
          '/api/assistant',
          { ...input, requestId: crypto.randomUUID() },
        ),
      ),
    );
    assert.equal(outage.mode, 'sources');
    assert.equal(calls, callsAtLimit);
  } finally {
    globalThis.fetch = original;
    sql.close();
  }
});
await test('Request boundaries reject oversized bodies and cross-origin writes', async () => {
  const { env, sql } = setup();
  assert.equal(
    (
      await assistant(
        context(env, '/api/assistant', { question: 'x'.repeat(7000) }),
      )
    ).status,
    413,
  );
  assert.equal(
    (
      await question(
        context(env, '/api/community/threads', questionInput, {
          origin: 'https://untrusted.example',
        }),
      )
    ).status,
    403,
  );
  assert.equal(sql.prepare('SELECT count(*) n FROM eidos_threads').get()?.n, 0);
  sql.close();
});
await test('Questions are private until reviewed, then receive at most one requested Eidos reply', async () => {
  const { env, sql } = setup();
  const created = await value(
    await question(context(env, '/api/community/threads', questionInput)),
  );
  const id = String(created.id);
  assert.equal(created.state, 'pending');
  assert.equal(
    (await value(await questions(context(env, '/api/community/threads'))))
      .threads instanceof Array,
    true,
  );
  assert.equal(
    (
      (await value(await questions(context(env, '/api/community/threads'))))
        .threads as unknown[]
    ).length,
    0,
  );
  assert.equal(
    (
      await threadPage(
        context(env, '/community/thread/' + id, undefined, {}, { id }),
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await moderate(
        context(env, '/api/community/moderate', {
          action: 'publish',
          kind: 'thread',
          id,
        }),
      )
    ).status,
    401,
  );
  const headers = { authorization: 'Bearer ' + env.EIDOS_ADMIN_TOKEN };
  assert.equal(
    (
      await moderate(
        context(
          env,
          '/api/community/moderate',
          { action: 'publish', kind: 'thread', id },
          headers,
        ),
      )
    ).status,
    200,
  );
  await moderate(
    context(
      env,
      '/api/community/moderate',
      { action: 'publish', kind: 'thread', id },
      headers,
    ),
  );
  assert.equal(
    sql
      .prepare("SELECT count(*) n FROM eidos_replies WHERE author_type='eidos'")
      .get()?.n,
    1,
  );
  const html = await (
    await threadPage(
      context(env, '/community/thread/' + id, undefined, {}, { id }),
    )
  ).text();
  assert.match(html, /How do I build a better storefront/);
  assert.match(html, /published-source suggestion/);
  assert.equal(
    (await value(await feed(context(env, '/community/feed')))).items instanceof
      Array,
    true,
  );
  const response = await reply(
    context(env, '/api/community/replies', {
      threadId: id,
      body: 'A useful follow-up question.',
      author: 'Another guest',
    }),
  );
  assert.equal(response.status, 201);
  sql.close();
});
await test('Untrusted thread HTML is escaped and unpublished content disappears', async () => {
  const { env, sql } = setup();
  const id = crypto.randomUUID();
  sql
    .prepare(
      "INSERT INTO eidos_threads(id,title,body,category,author,author_type,status,created_at,published_at) VALUES(?,?,?,'build',?,'guest','published',?,?)",
    )
    .run(
      id,
      '<script>alert(1)</script>',
      '<img src=x onerror=alert(1)>',
      '<svg onload=alert(1)>',
      new Date().toISOString(),
      new Date().toISOString(),
    );
  let html = await (
    await threadPage(
      context(env, '/community/thread/' + id, undefined, {}, { id }),
    )
  ).text();
  assert.ok(!html.includes('<img src=x'));
  assert.ok(!html.includes('<script>alert(1)'));
  assert.ok(html.includes('&lt;img'));
  await moderate(
    context(
      env,
      '/api/community/moderate',
      { action: 'unpublish', kind: 'thread', id },
      { authorization: 'Bearer ' + env.EIDOS_ADMIN_TOKEN },
    ),
  );
  assert.equal(
    (
      await threadPage(
        context(env, '/community/thread/' + id, undefined, {}, { id }),
      )
    ).status,
    404,
  );
  html = await (await feed(context(env, '/community/feed'))).text();
  assert.ok(!html.includes(id));
  sql.close();
});
await test('Proactive assistance respects opt-in, age, human identity, and the one-reply cap', async () => {
  const { env, sql } = setup({ EIDOS_PROACTIVE_ENABLED: 'true' });
  const date = new Date(Date.now() - 2 * 86400000).toISOString();
  for (const [allow, type] of [
    [1, 'guest'],
    [0, 'guest'],
    [1, 'agent'],
  ] as const) {
    sql
      .prepare(
        "INSERT INTO eidos_threads(id,title,body,category,author,author_type,status,allow_assistant,created_at,published_at) VALUES(?,?,?,'build','Test',?,'published',?,?,?)",
      )
      .run(
        crypto.randomUUID(),
        'Website question',
        'How should this website be built?',
        type,
        allow,
        date,
        date,
      );
  }
  const headers = { authorization: 'Bearer ' + env.EIDOS_ADMIN_TOKEN };
  await maintenance(context(env, '/api/community/maintenance', {}, headers));
  await maintenance(context(env, '/api/community/maintenance', {}, headers));
  assert.equal(
    sql
      .prepare("SELECT count(*) n FROM eidos_replies WHERE author_type='eidos'")
      .get()?.n,
    1,
  );
  sql.close();
});
await test('Agents need registered revocable keys and cannot trigger bot loops', async () => {
  const { env, sql } = setup();
  assert.equal(
    (await agentPost(context(env, '/api/community/agents', questionInput)))
      .status,
    401,
  );
  const registered = await value(
    await moderate(
      context(
        env,
        '/api/community/moderate',
        {
          action: 'register-agent',
          name: 'Research Helper',
          profileUrl: 'https://example.com/operator',
        },
        { authorization: 'Bearer ' + env.EIDOS_ADMIN_TOKEN },
      ),
    ),
  );
  const headers = { authorization: 'Bearer ' + registered.key };
  const created = await value(
    await agentPost(
      context(env, '/api/community/agents', questionInput, headers),
    ),
  );
  await moderate(
    context(
      env,
      '/api/community/moderate',
      { action: 'publish', kind: 'thread', id: created.id },
      { authorization: 'Bearer ' + env.EIDOS_ADMIN_TOKEN },
    ),
  );
  assert.equal(
    sql.prepare('SELECT category FROM eidos_threads').get()?.category,
    'agents',
  );
  assert.equal(sql.prepare('SELECT count(*) n FROM eidos_replies').get()?.n, 0);
  await moderate(
    context(
      env,
      '/api/community/moderate',
      { action: 'revoke-agent', id: registered.id },
      { authorization: 'Bearer ' + env.EIDOS_ADMIN_TOKEN },
    ),
  );
  assert.equal(
    (
      await agentPost(
        context(env, '/api/community/agents', questionInput, headers),
      )
    ).status,
    401,
  );
  sql.close();
});
await test('Turnstile cannot be bypassed on production hosts or with a mismatched hostname', async () => {
  const { env, sql } = setup({
    EIDOS_LOCAL_TEST: 'true',
    TURNSTILE_SECRET_KEY: 'test-only',
    TURNSTILE_SITE_KEY: 'test-site-key',
  });
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json({
      success: true,
      hostname: 'wrong.example',
      action: 'community',
    });
  try {
    const request = new Request(
      'https://eidos-works.com/api/community/threads',
      {
        method: 'POST',
        headers: {
          origin: 'https://eidos-works.com',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ ...questionInput, challenge: 'test' }),
      },
    );
    assert.equal((await question({ request, env })).status, 400);
    assert.equal(
      sql.prepare('SELECT count(*) n FROM eidos_threads').get()?.n,
      0,
    );
  } finally {
    globalThis.fetch = original;
    sql.close();
  }
});
async function signedEvent(env: PlatformEnv, event: unknown, valid = true) {
  const raw = JSON.stringify(event),
    stamp = Math.floor(Date.now() / 1000);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.EIDOS_KIT_WEBHOOK_SECRET!),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const digest = [
    ...new Uint8Array(
      await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(stamp + '.' + raw),
      ),
    ),
  ]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('');
  return webhook({
    env,
    request: new Request('http://localhost:8788/api/shop/webhook', {
      method: 'POST',
      headers: {
        'stripe-signature': `t=${stamp},v1=${valid ? digest : '0'.repeat(64)}`,
      },
      body: raw,
    }),
  });
}
await test('Only matching signed paid events unlock a real ZIP; refunds revoke access, including out-of-order events', async () => {
  const { env, sql } = setup({
    STRIPE_SECRET_KEY: 'test-only',
    EIDOS_KIT_WEBHOOK_SECRET: 'test-webhook-secret',
    EIDOS_SHOP_ENABLED: 'true',
  });
  const receipt = 'a'.repeat(64),
    id = crypto.randomUUID();
  await env
    .EIDOS_DB!.prepare(
      'INSERT INTO eidos_orders(id,receipt_hash,session_id,created_at) VALUES(?,?,?,?)',
    )
    .bind(id, await hash(receipt), 'cs_test_example', new Date().toISOString())
    .run();
  assert.equal(
    (await download(context(env, '/api/shop/download', { receipt }))).status,
    403,
  );
  const event = {
    id: 'evt_paid',
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_example',
        mode: 'payment',
        payment_status: 'paid',
        amount_total: 2900,
        currency: 'usd',
        client_reference_id: id,
        payment_intent: 'pi_test_example',
        metadata: { eidos_product: 'cinematic-starter-v1', eidos_order_id: id },
      },
    },
  };
  assert.equal((await signedEvent(env, event, false)).status, 400);
  assert.equal(
    (
      await signedEvent(env, {
        ...event,
        data: { object: { ...event.data.object, amount_total: 1 } },
      })
    ).status,
    400,
  );
  assert.equal((await signedEvent(env, event)).status, 200);
  assert.equal((await signedEvent(env, event)).status, 200);
  assert.equal(
    (await value(await status(context(env, '/api/shop/status', { receipt }))))
      .status,
    'paid',
  );
  const result = await download(
    context(env, '/api/shop/download', { receipt }),
  );
  assert.equal(result.status, 200);
  const zip = Buffer.from(await result.arrayBuffer());
  assert.equal(zip.readUInt32LE(), 0x04034b50);
  const nameLength = zip.readUInt16LE(26),
    size = zip.readUInt32LE(18);
  assert.match(
    inflateRawSync(
      zip.subarray(30 + nameLength, 30 + nameLength + size),
    ).toString(),
    /Afterlight/,
  );
  await signedEvent(env, {
    id: 'evt_refund',
    type: 'charge.refunded',
    data: { object: { payment_intent: 'pi_test_example' } },
  });
  assert.equal(
    (await download(context(env, '/api/shop/download', { receipt }))).status,
    403,
  );
  await signedEvent(env, { ...event, id: 'evt_paid_late' });
  assert.equal(
    sql.prepare('SELECT status FROM eidos_orders').get()?.status,
    'refunded',
  );
  assert.equal(
    (
      await download(
        context(env, '/api/shop/download', { receipt: 'b'.repeat(64) }),
      )
    ).status,
    404,
  );
  assert.ok(Buffer.from(kitArchiveBase64, 'base64').length > 5000);
  sql.close();
});
await test('Checkout is disabled until configured and never trusts client pricing or redirects', async () => {
  const { env, sql } = setup();
  assert.equal(
    (await checkout(context(env, '/api/shop/checkout', { acceptTerms: true })))
      .status,
    503,
  );
  const original = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    const values = new URLSearchParams(String(init?.body));
    assert.equal(values.get('line_items[0][price_data][unit_amount]'), '2900');
    assert.ok(
      values
        .get('success_url')!
        .startsWith('http://localhost:8788/shop/success#receipt='),
    );
    return Response.json({
      id: 'cs_test_generated',
      url: 'https://checkout.stripe.com/c/pay/test',
    });
  };
  try {
    const result = await checkout(
      context(
        {
          ...env,
          STRIPE_SECRET_KEY: 'test-only',
          EIDOS_KIT_WEBHOOK_SECRET: 'test-only',
          EIDOS_SHOP_ENABLED: 'true',
        },
        '/api/shop/checkout',
        {
          acceptTerms: true,
          price: 1,
          successUrl: 'https://untrusted.example',
        },
      ),
    );
    assert.equal(result.status, 200);
    assert.equal(
      sql.prepare('SELECT status FROM eidos_orders').get()?.status,
      'pending',
    );
  } finally {
    globalThis.fetch = original;
    sql.close();
  }
});
