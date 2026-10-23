import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import {
  hash,
  type Context,
  type Database,
  type PlatformEnv,
  type Statement,
} from '../functions/_shared/platform/core';
import { accountsReady } from '../functions/_shared/platform/memberAuth';
import { mentionedUsernames } from '../functions/_shared/platform/mentions';
import { deliverNewsletters } from '../functions/_shared/platform/newsletter';
import { onRequestPost as auth } from '../functions/api/members/auth';
import {
  onRequestGet as account,
  onRequestPost as change,
} from '../functions/api/members/account';
import { onRequestGet as directory } from '../functions/api/members/directory';
import { onRequestPost as unsubscribe } from '../functions/api/members/unsubscribe';
import { onRequestPost as question } from '../functions/api/community/threads';
import { onRequestPost as reply } from '../functions/api/community/replies';
import { onRequestPost as agentPost } from '../functions/api/community/agents';

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
  for (const migration of ['0001_eidos_platform.sql', '0002_members.sql'])
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

await test('Public profiles use exact account ownership and expose only published posts/replies, even when new sign-in is disabled', async () => {
  const { sql, env } = fixture();
  await signup(env, 'alice');
  await signup(env, 'bob');
  const alice = sql.prepare("SELECT id FROM eidos_email_members WHERE username='alice'").get()!.id;
  const bob = sql.prepare("SELECT id FROM eidos_email_members WHERE username='bob'").get()!.id;
  const now = '2026-10-23T12:00:00.000Z';
  const own = crypto.randomUUID(), other = crypto.randomUUID(), pending = crypto.randomUUID();
  const thread = sql.prepare('INSERT INTO eidos_threads(id,title,body,category,author,author_type,owner_id,status,created_at) VALUES(?,?,?,\'build\',?,\'guest\',?,?,?)');
  thread.run(own, 'Alice is building a useful gallery', 'Public work from Alice.', '@alice', alice, 'published', now);
  thread.run(other, 'A different account is building', 'Bob uses a matching historical label.', '@alice', bob, 'published', now);
  thread.run(pending, 'A private pending conversation', 'Must never leak.', '@alice', alice, 'pending', now);
  thread.run(crypto.randomUUID(), 'A guest impersonated a display name', 'Must not attach to Alice.', '@alice', null, 'published', now);
  const visibleReply = crypto.randomUUID();
  const addReply = sql.prepare('INSERT INTO eidos_replies(id,thread_id,body,author,author_type,owner_id,status,created_at) VALUES(?,?,?,\'@alice\',\'guest\',?,?,?)');
  addReply.run(visibleReply, other, 'Alice replies to Bob in public.', alice, 'published', now);
  addReply.run(crypto.randomUUID(), own, 'Other account label collision.', bob, 'published', now);
  addReply.run(crypto.randomUUID(), own, 'Rejected reply must stay hidden.', alice, 'rejected', now);
  addReply.run(crypto.randomUUID(), pending, 'Public reply in pending parent must stay hidden.', alice, 'published', now);
  const response = await directory(ctx({ ...env, EIDOS_LOCAL_TEST: 'false' }, '/api/members/directory?username=ALICE'));
  assert.equal(response.status, 200, await response.clone().text());
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const profile = await response.json();
  assert.deepEqual(Object.keys(profile.member).sort(), ['created_at', 'kind', 'username']);
  assert.equal(profile.member.username, 'alice');
  assert.deepEqual(profile.posts.map((p: {id:string}) => p.id), [own]);
  assert.deepEqual(profile.replies.map((r: {id:string}) => r.id), [visibleReply]);
  assert.equal(profile.replies[0].thread_id, other);
  const raw = JSON.stringify(profile);
  for (const hidden of ['alice@example.test', String(alice), String(bob), 'newsletter', 'token_hash', 'owner_id', 'Must never leak', 'pending parent', 'label collision'])
    assert.ok(!raw.includes(hidden), hidden);
  sql.prepare("UPDATE eidos_email_members SET disabled=1 WHERE username='alice'").run();
  assert.equal((await directory(ctx(env, '/api/members/directory?username=alice'))).status, 404);
  sql.close();
});

await test('Public profile activity is bounded, independently paginated and stably ordered', async () => {
  const { sql, env } = fixture();
  await signup(env, 'alice');
  const member = sql.prepare("SELECT id FROM eidos_email_members WHERE username='alice'").get()!.id;
  const now = '2026-10-23T12:00:00.000Z';
  const insert = sql.prepare("INSERT INTO eidos_threads(id,title,body,category,author,author_type,owner_id,status,created_at) VALUES(?,?,?,'design','@alice','guest',?,'published',?)");
  const ids = Array.from({ length: 23 }, () => crypto.randomUUID()).sort().reverse();
  for (const id of ids) insert.run(id, 'A published work update', 'x'.repeat(500), member, now);
  const read = async (suffix = '') => (await directory(ctx(env, '/api/members/directory?username=alice' + suffix))).json();
  const first = await read(), second = await read('&postsPage=1');
  assert.equal(first.posts.length, 20); assert.equal(first.morePosts, true);
  assert.equal(second.posts.length, 3); assert.equal(second.morePosts, false);
  assert.deepEqual([...first.posts, ...second.posts].map(p => p.id), ids);
  assert.equal(first.posts[0].excerpt.length, 400);
  assert.equal(first.repliesPage, 0); assert.deepEqual(second.replies, []);
  for (const invalid of ['-1', '501', '1.5', '1 OR 1=1'])
    assert.equal((await directory(ctx(env, '/api/members/directory?username=alice&postsPage=' + encodeURIComponent(invalid)))).status, 400);
  assert.equal((await directory(ctx(env, '/api/members/directory?username=not_registered'))).status, 404);
  assert.equal((await directory(ctx(env, '/api/members/directory?username=alice%27%20OR%201=1'))).status, 404);
  assert.equal((await directory(ctx({ ...env, EIDOS_DB: undefined }, '/api/members/directory?username=alice'))).status, 503);
  sql.close();
});

await test('Email verification is required, single-use, expiring, and creates private hashed sessions', async () => {
  const { sql, env } = fixture();
  const request = await auth(
    ctx(env, '/api/members/auth', {
      action: 'signup',
      username: 'alice',
      email: 'alice@example.test',
      newsletter: true,
    }),
  );
  const link = (await request.json()).localVerificationUrl;
  const token = new URLSearchParams(new URL(link).hash.slice(1)).get('token')!;
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_email_members').get()?.n, 0);
  assert.equal(
    sql.prepare('SELECT token_hash FROM eidos_signin_links').get()?.token_hash,
    await hash(token),
  );
  const responses = await Promise.all(
    [1, 2].map(() =>
      auth(ctx(env, '/api/members/auth', { action: 'verify', token })),
    ),
  );
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 400]);
  const cookie = responses
    .find((r) => r.status === 200)!
    .headers.get('set-cookie')!;
  assert.match(cookie, /HttpOnly; SameSite=Lax; Max-Age=2592000/);
  assert.equal(
    sql.prepare('SELECT token_hash FROM eidos_member_sessions').get()
      ?.token_hash,
    await hash(cookie.split(';')[0].split('=')[1]),
  );
  assert.equal(
    (await (await account(ctx(env, '/api/members/account'))).json()).member,
    null,
  );
  const own = await (
    await account(ctx(env, '/api/members/account', undefined, { cookie }))
  ).json();
  assert.equal(own.member.username, 'alice');
  assert.equal(own.member.newsletter, true);
  const listed = await (
    await directory(ctx(env, '/api/members/directory?q=al'))
  ).json();
  assert.deepEqual(Object.keys(listed.members[0]).sort(), [
    'created_at',
    'kind',
    'username',
  ]);
  sql.prepare('UPDATE eidos_member_sessions SET expires=0').run();
  assert.equal(
    (
      await (
        await account(ctx(env, '/api/members/account', undefined, { cookie }))
      ).json()
    ).member,
    null,
  );
  const second = await auth(
    ctx(env, '/api/members/auth', {
      action: 'signin',
      email: 'alice@example.test',
    }),
  );
  const expiredToken = new URLSearchParams(
    new URL((await second.json()).localVerificationUrl).hash.slice(1),
  ).get('token');
  sql.prepare('UPDATE eidos_signin_links SET expires=0').run();
  assert.equal(
    (
      await auth(
        ctx(env, '/api/members/auth', {
          action: 'verify',
          token: expiredToken,
        }),
      )
    ).status,
    400,
  );
  sql.close();
});

await test('Mail sign-in fails honestly, preserves secure cookies in production, and hides unknown emails', async () => {
  const { sql, env } = fixture();
  const prod = {
    ...env,
    EIDOS_LOCAL_TEST: undefined,
    PUBLIC_SITE_URL: 'https://eidos-works.com',
    EIDOS_ACCOUNTS_ENABLED: 'true',
    RESEND_API_KEY: 'test-only',
    EIDOS_MAIL_FROM: 'Eidos <papers@example.test>',
    TURNSTILE_SITE_KEY: 'test',
    TURNSTILE_SECRET_KEY: 'test',
  };
  assert.equal(
    accountsReady(new Request('https://eidos-works.com'), {
      ...env,
      EIDOS_LOCAL_TEST: 'true',
    }),
    false,
  );
  assert.equal(
    accountsReady(new Request('https://eidos-works.com'), {
      ...prod,
      EIDOS_RATE_SECRET: 'short',
    }),
    false,
  );
  const original = globalThis.fetch;
  let sent: Record<string, unknown> | undefined,
    fail = false,
    mailCalls = 0;
  globalThis.fetch = async (url, init) => {
    if (String(url).includes('turnstile'))
      return Response.json({
        success: true,
        hostname: 'eidos-works.com',
        action: 'member',
      });
    assert.equal(String(url), 'https://api.resend.com/emails');
    mailCalls++;
    if (fail)
      return Response.json(
        { error: 'provider private detail' },
        { status: 500 },
      );
    sent = JSON.parse(String(init?.body));
    assert.equal(init?.redirect, 'error');
    return Response.json({ id: 'test-mail' });
  };
  try {
    const unknown = await auth(
      ctx(prod, '/api/members/auth', {
        action: 'signin',
        email: 'missing@example.test',
        challenge: 'test',
      }),
    );
    assert.equal(unknown.status, 200);
    assert.equal(mailCalls, 0);
    const created = await auth(
      ctx(prod, '/api/members/auth', {
        action: 'signup',
        username: 'pilot',
        email: 'pilot@example.test',
        challenge: 'test',
      }),
    );
    assert.equal(created.status, 200);
    assert.equal((await created.json()).localVerificationUrl, undefined);
    assert.equal(sent?.to, 'pilot@example.test');
    const token = String(sent?.text).match(/#token=([a-f0-9]{64})/)![1];
    const verified = await auth(
      ctx(prod, '/api/members/auth', { action: 'verify', token }),
    );
    assert.match(
      verified.headers.get('set-cookie')!,
      /^__Host-eidos_session=[a-f0-9]{64}; Path=\/; HttpOnly; SameSite=Lax; Max-Age=2592000; Secure$/,
    );
    fail = true;
    const failure = await auth(
      ctx(prod, '/api/members/auth', {
        action: 'signin',
        email: 'pilot@example.test',
        challenge: 'test',
      }),
    );
    assert.equal(failure.status, 503);
    assert.doesNotMatch(
      await failure.text(),
      /provider private detail|on its way/,
    );
    assert.equal(
      (
        await auth(
          ctx(prod, '/api/members/auth', {
            action: 'signup',
            username: 'admin',
            email: 'admin@example.test',
          }),
        )
      ).status,
      400,
    );
  } finally {
    globalThis.fetch = original;
    sql.close();
  }
});

await test('Account changes enforce ownership, same-origin writes, session revocation, and agent key scope', async () => {
  const { sql, env } = fixture();
  const alice = await signup(env, 'alice'),
    bob = await signup(env, 'bob'),
    bot = await signup(env, 'research_bot', 'agent');
  assert.equal(
    (
      await change(
        ctx(
          env,
          '/api/members/account',
          { action: 'bookmark', slug: 'useful-paper', saved: true },
          { ...alice.headers, origin: 'https://evil.example' },
        ),
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await change(
        ctx(
          env,
          '/api/members/account',
          { action: 'bookmark', slug: 'useful-paper', saved: true },
          alice.headers,
        ),
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await (
        await account(ctx(env, '/api/members/account', undefined, bob.headers))
      ).json()
    ).saved.length,
    0,
  );
  assert.equal(
    (
      await change(
        ctx(
          env,
          '/api/members/account',
          { action: 'create-key' },
          alice.headers,
        ),
      )
    ).status,
    403,
  );
  const keys = await Promise.all(
    [1, 2, 3, 4].map(() =>
      change(
        ctx(env, '/api/members/account', { action: 'create-key' }, bot.headers),
      ),
    ),
  );
  assert.equal(keys.filter((r) => r.status === 201).length, 3);
  assert.equal(keys.filter((r) => r.status === 400).length, 1);
  const issued = await keys.find((r) => r.status === 201)!.json();
  const headers = { authorization: 'Bearer ' + issued.key, origin: '' };
  assert.equal(
    sql
      .prepare('SELECT key_hash FROM eidos_member_keys WHERE id=?')
      .get(issued.id)?.key_hash,
    await hash(issued.key),
  );
  const apiAccount = await (
    await account(ctx(env, '/api/members/account', undefined, headers))
  ).json();
  assert.equal(apiAccount.member.email, undefined);
  assert.equal(apiAccount.member.username, 'research_bot');
  assert.equal(
    (
      await change(
        ctx(
          env,
          '/api/members/account',
          { action: 'bookmark', slug: 'machine-readable-paper', saved: true },
          headers,
        ),
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await change(
        ctx(
          env,
          '/api/members/account',
          { action: 'preferences', newsletter: true },
          { ...headers, origin: 'http://localhost:8788' },
        ),
      )
    ).status,
    401,
  );
  assert.equal(
    (
      await change(
        ctx(
          env,
          '/api/members/account',
          { action: 'create-key' },
          { ...headers, origin: 'http://localhost:8788' },
        ),
      )
    ).status,
    401,
  );
  await change(
    ctx(
      env,
      '/api/members/account',
      { action: 'revoke-key', id: issued.id },
      alice.headers,
    ),
  );
  assert.equal(
    (await account(ctx(env, '/api/members/account', undefined, headers)))
      .status,
    200,
  );
  await change(
    ctx(
      env,
      '/api/members/account',
      { action: 'revoke-key', id: issued.id },
      bot.headers,
    ),
  );
  assert.equal(
    (await account(ctx(env, '/api/members/account', undefined, headers)))
      .status,
    401,
  );
  await change(
    ctx(env, '/api/members/account', { action: 'signout-all' }, alice.headers),
  );
  assert.equal(
    (
      await (
        await account(
          ctx(env, '/api/members/account', undefined, alice.headers),
        )
      ).json()
    ).member,
    null,
  );
  sql.close();
});

await test('Mentions link people and agents immediately, without spoofing or cross-account inbox access', async () => {
  const { sql, env } = fixture();
  const alice = await signup(env, 'alice'),
    bob = await signup(env, 'bob'),
    bot = await signup(env, 'research_bot', 'agent');
  assert.deepEqual(
    mentionedUsernames(
      'alice@example.test @bob @BOB and @research_bot @username_over_twenty_four_characters',
    ),
    ['bob', 'research_bot'],
  );
  const input = {
    author: 'Forged name',
    title: 'A useful question for @bob',
    body: 'Can @research_bot and @alice help explain this particular design decision?',
    category: 'agents',
  };
  const created = await question(
    ctx(env, '/api/community/threads', input, alice.headers),
  );
  assert.equal(created.status, 201);
  const { id } = await created.json();
  assert.equal(
    sql.prepare('SELECT author FROM eidos_threads WHERE id=?').get(id)?.author,
    '@alice',
  );
  const inbox = async (h: Record<string, string>) =>
    (
      await (
        await account(ctx(env, '/api/members/account', undefined, h))
      ).json()
    ).inbox;
  assert.equal((await inbox(bob.headers)).length, 1);
  assert.equal((await inbox(bot.headers)).length, 1);
  assert.equal((await inbox(alice.headers)).length, 0);
  const notice = (await inbox(bob.headers))[0];
  await change(
    ctx(
      env,
      '/api/members/account',
      { action: 'read-mention', id: notice.id },
      alice.headers,
    ),
  );
  assert.equal((await inbox(bob.headers))[0].read_at, null);
  await change(
    ctx(
      env,
      '/api/members/account',
      { action: 'read-mention', id: notice.id },
      bob.headers,
    ),
  );
  assert.ok((await inbox(bob.headers))[0].read_at);
  const response = await reply(
    ctx(
      env,
      '/api/community/replies',
      {
        threadId: id,
        body: 'Thanks @alice for asking this thoughtful question.',
      },
      bob.headers,
    ),
  );
  assert.equal(response.status, 201);
  assert.equal((await response.json()).state, 'published');
  assert.equal((await inbox(alice.headers)).length, 1);
  const agentKey = await (
    await change(
      ctx(env, '/api/members/account', { action: 'create-key' }, bot.headers),
    )
  ).json();
  const contribution = await agentPost(
    ctx(
      env,
      '/api/community/agents',
      {
        threadId: id,
        body: 'For @bob, the primary sources explain the behavior more clearly.',
      },
      { authorization: 'Bearer ' + agentKey.key },
    ),
  );
  assert.equal(contribution.status, 201);
  assert.equal((await inbox(bob.headers)).length, 2);
  assert.equal(
    (
      await question(
        ctx(env, '/api/community/threads', { ...input, author: '@alice' }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await question(
        ctx(
          env,
          '/api/community/threads',
          { title: 'A human community question', body: 'A clear question for this group.', category: 'build' },
          bot.headers,
        ),
      )
    ).status,
    201,
  );
  sql.prepare("UPDATE eidos_threads SET status='rejected' WHERE id=?").run(id);
  assert.equal((await inbox(bob.headers)).length, 0);
  assert.equal((await inbox(alice.headers)).length, 0);
  sql.close();
});

await test('Verified sessions post without another CAPTCHA; guests and revoked sessions still require verification', async () => {
  const {sql,env} = fixture();
  const person = await signup(env, 'verified_person');
  Object.assign(env, {EIDOS_LOCAL_TEST:'false',EIDOS_ACCOUNTS_ENABLED:'true',RESEND_API_KEY:'test-only-no-mail',EIDOS_MAIL_FROM:'QA <qa@example.test>',TURNSTILE_SITE_KEY:'test-site',TURNSTILE_SECRET_KEY:'test-secret'});
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw Error('Verified contributions must not call CAPTCHA or mail providers'); };
  try {
    const response = await question(ctx(env, '/api/community/threads', {title:'A verified session question',body:'How could we make this layout easier to read?'}, person.headers));
    assert.equal(response.status,201,await response.clone().text());
    const {id} = await response.json();
    assert.equal((await reply(ctx(env,'/api/community/replies',{threadId:id,body:'Yes!'},person.headers))).status,201);
    assert.equal((await reply(ctx(env,'/api/community/replies',{threadId:id,body:'Yes!',author:'Guest'}))).status,400);
    sql.prepare('DELETE FROM eidos_member_sessions').run();
    assert.equal((await reply(ctx(env,'/api/community/replies',{threadId:id,body:'Yes!',author:'Guest'},person.headers))).status,400);
    assert.equal(sql.prepare('SELECT COUNT(*) n FROM eidos_replies WHERE thread_id=?').get(id)?.n,1);
  } finally { globalThis.fetch=original;sql.close(); }
});

function paper(slug: string, date: string) {
  return {
    slug,
    title: 'Useful <paper>',
    byline: 'Eidos Works Editorial',
    excerpt: 'A grounded explanation.',
    publishedAt: date,
    body: [
      {
        heading: 'The complete explanation',
        paragraphs: [
          'The full article text is included, not just its summary.',
        ],
        bullets: ['A practical example.'],
      },
    ],
    sources: [{ title: 'Primary source', url: 'https://example.test/source' }],
  };
}
await test('A configured static feed avoids custom-domain challenges while email links stay canonical', async () => {
  const {sql,env}=fixture();
  await signup(env,'reader','person',true);
  sql.prepare('UPDATE eidos_email_members SET newsletter_after=?').run('2020-01-01T00:00:00.000Z');
  const sending={...env,PUBLIC_SITE_URL:'https://eidos-works.com',EIDOS_PUBLICATION_FEED_URL:'https://eidosworks.pages.dev/insights-feed.json',EIDOS_ACCOUNTS_ENABLED:'true',EIDOS_NEWSLETTER_ENABLED:'true',RESEND_API_KEY:'test-only',EIDOS_MAIL_FROM:'Eidos <papers@example.test>'};
  const original=globalThis.fetch;
  const urls:string[]=[];let mail:Record<string,string>|undefined;
  globalThis.fetch=async(url,init)=>{
    urls.push(String(url));
    if(String(url)===sending.EIDOS_PUBLICATION_FEED_URL){assert.equal(init?.redirect,'error');return Response.json({items:[paper('hosted-paper',new Date(Date.now()-86400000).toISOString())]});}
    assert.equal(String(url),'https://api.resend.com/emails');mail=JSON.parse(String(init?.body));return Response.json({id:'test-provider-id'});
  };
  try{
    assert.equal((await deliverNewsletters(sending)).sent,1);
    assert.match(mail!.text,/https:\/\/eidos-works.com\/insights\/hosted-paper/);
    assert.match(mail!.text,/https:\/\/eidos-works.com\/account\/unsubscribe#token=/);
    assert.ok(!mail!.text.includes('pages.dev'));
    const requests=urls.length;
    for(const value of ['http://eidosworks.pages.dev/insights-feed.json','https://user:password@eidosworks.pages.dev/insights-feed.json','https://eidosworks.pages.dev/private','https://eidosworks.pages.dev/insights-feed.json?token=secret'])
      await assert.rejects(()=>deliverNewsletters({...sending,EIDOS_PUBLICATION_FEED_URL:value}),/Invalid configured publication feed URL/);
    assert.equal(urls.length,requests);
    globalThis.fetch=async()=>new Response('',{status:403});
    await assert.rejects(()=>deliverNewsletters(sending),/Publication feed unavailable \(HTTP 403\)/);
  }finally{globalThis.fetch=original;sql.close();}
});
await test('Opt-in delivery sends full papers once, normalizes dates, and supports private durable unsubscribe', async () => {
  const { sql, env } = fixture();
  const alice = await signup(env, 'alice', 'person', true);
  await signup(env, 'bob');
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10),
    before = yesterday + 'T15:00:00.000Z';
  sql.prepare('UPDATE eidos_email_members SET newsletter_after=?').run(before);
  const sending = {
    ...env,
    EIDOS_ACCOUNTS_ENABLED: 'true',
    EIDOS_NEWSLETTER_ENABLED: 'true',
    RESEND_API_KEY: 'test-only',
    EIDOS_MAIL_FROM: 'Eidos <papers@example.test>',
  };
  const original = globalThis.fetch;
  const messages: { to: string; text: string; html: string }[] = [];
  const ids: string[] = [];
  globalThis.fetch = async (url, init) => {
    if (String(url).endsWith('/insights-feed.json'))
      return Response.json({
        items: [
          paper('earlier', yesterday + 'T10:00:00Z'),
          paper('new-paper', yesterday + 'T12:00:00-04:00'),
          paper('tomorrow', new Date(Date.now() + 86400000).toISOString()),
        ],
      });
    messages.push(JSON.parse(String(init?.body)));
    ids.push(new Headers(init?.headers).get('idempotency-key')!);
    return Response.json({ id: 'test-provider-id' });
  };
  try {
    assert.equal((await deliverNewsletters(sending)).sent, 1);
    assert.equal((await deliverNewsletters(sending)).sent, 0);
    assert.equal(messages.length, 1);
    assert.equal(messages[0].to, 'alice@example.test');
    assert.match(messages[0].text, /full article text/);
    assert.match(messages[0].text, /https:\/\/example.test\/source/);
    assert.match(messages[0].html, /Useful &lt;paper&gt;/);
    assert.doesNotMatch(messages[0].text, /\/insights\/(earlier|tomorrow)/);
    assert.equal(
      sql
        .prepare(
          "SELECT newsletter_after FROM eidos_email_members WHERE username='alice'",
        )
        .get()?.newsletter_after,
      yesterday + 'T16:00:00.000Z',
    );
    assert.equal(
      sql.prepare('SELECT payload FROM eidos_mail_deliveries').get()?.payload,
      '',
    );
    assert.match(ids[0], /^digest:/);
    const token = messages[0].text.match(
      /\/account\/unsubscribe#token=([a-f0-9]{64})/,
    )![1];
    assert.equal(
      sql.prepare('SELECT token_hash FROM eidos_unsubscribe_tokens').get()
        ?.token_hash,
      await hash(token),
    );
    assert.equal(
      (
        await unsubscribe(
          ctx(
            env,
            '/api/members/unsubscribe',
            { token },
            { origin: 'https://evil.example' },
          ),
        )
      ).status,
      403,
    );
    assert.equal(
      (await unsubscribe(ctx(env, '/api/members/unsubscribe', { token })))
        .status,
      200,
    );
    assert.equal(
      (await unsubscribe(ctx(env, '/api/members/unsubscribe', { token })))
        .status,
      200,
    );
    const after = await (
      await account(ctx(env, '/api/members/account', undefined, alice.headers))
    ).json();
    assert.equal(after.member.newsletter, false);
  } finally {
    globalThis.fetch = original;
    sql.close();
  }
});

await test('Failed or uncertain mail never advances delivery or resends beyond the provider dedupe window', async () => {
  const { sql, env } = fixture();
  await signup(env, 'alice', 'person', true);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  sql
    .prepare('UPDATE eidos_email_members SET newsletter_after=?')
    .run('2020-01-01T00:00:00.000Z');
  const sending = {
    ...env,
    EIDOS_ACCOUNTS_ENABLED: 'true',
    EIDOS_NEWSLETTER_ENABLED: 'true',
    RESEND_API_KEY: 'test-only',
    EIDOS_MAIL_FROM: 'Eidos <papers@example.test>',
  };
  const original = globalThis.fetch;
  const payloads: string[] = [],
    keys: string[] = [];
  globalThis.fetch = async (url, init) => {
    if (String(url).endsWith('/insights-feed.json'))
      return Response.json({
        items: [paper('new-paper', yesterday + 'T12:00:00Z')],
      });
    payloads.push(String(init?.body));
    keys.push(new Headers(init?.headers).get('idempotency-key')!);
    throw Error('Simulated uncertain provider outcome');
  };
  try {
    assert.equal((await deliverNewsletters(sending)).sent, 0);
    assert.equal(
      sql.prepare('SELECT newsletter_after FROM eidos_email_members').get()
        ?.newsletter_after,
      '2020-01-01T00:00:00.000Z',
    );
    sql.prepare('UPDATE eidos_mail_deliveries SET claimed_until=0').run();
    await deliverNewsletters(sending);
    assert.equal(payloads.length, 2);
    assert.equal(payloads[0], payloads[1]);
    assert.equal(keys[0], keys[1]);
    sql
      .prepare('UPDATE eidos_mail_deliveries SET claimed_until=0,created_at=?')
      .run(Math.floor(Date.now() / 1000) - 24 * 3600);
    await deliverNewsletters(sending);
    assert.equal(payloads.length, 2);
    assert.equal(
      sql.prepare('SELECT status FROM eidos_mail_deliveries').get()?.status,
      'uncertain',
    );
    globalThis.fetch = async () =>
      Response.json({ items: [{ slug: 'bad', publishedAt: yesterday }] });
    await assert.rejects(
      () => deliverNewsletters(sending),
      /Invalid publication feed/,
    );
  } finally {
    globalThis.fetch = original;
    sql.close();
  }
});
