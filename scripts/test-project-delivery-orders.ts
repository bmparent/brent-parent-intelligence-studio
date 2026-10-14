import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createHash, createHmac } from 'node:crypto';
import { hash, type Context, type Database, type Statement } from '../functions/_shared/platform/core';
import { onRequestPost as checkout } from '../functions/api/shop/checkout';
import { onRequestPost as status } from '../functions/api/shop/status';
import { onRequestPost as download } from '../functions/api/shop/download';
import { onRequestPost as webhook } from '../functions/api/shop/webhook';
import { onRequestGet as capabilities } from '../functions/api/playground/delivery';
import { redeem } from '../functions/_shared/platform/templateShop';
import { freezeProjectDelivery, readProjectDeliveryArchive, type ProjectDeliveryEnv } from '../functions/_shared/platform/projectDelivery';
import schema from '../functions/_shared/platform/projectDeliveryOrdersSchema';
import { createProjectSnapshot } from '../src/playground/purchaseSnapshot';
import { createStarter } from '../src/playground/starters';

const origin = 'http://localhost:8788';
const originalBytes = new Uint8Array(readFileSync('artifacts/templates/packages/switchboard-developer-v1.0.3.zip'));
const originalHash = createHash('sha256').update(originalBytes).digest('hex');
class Query implements Statement {
  constructor(private sql: DatabaseSync, private text: string, private values: unknown[] = []) {}
  bind(...values: unknown[]) { return new Query(this.sql, this.text, values); }
  first<T>() { return Promise.resolve((this.sql.prepare(this.text).get(...this.values as never[]) || null) as T | null); }
  all<T>() { return Promise.resolve({ results: this.sql.prepare(this.text).all(...this.values as never[]) as T[] }); }
  run() { return Promise.resolve({ meta: { changes: Number(this.sql.prepare(this.text).run(...this.values as never[]).changes) } }); }
}
async function fixture() {
  const sql = new DatabaseSync(':memory:'); sql.exec('PRAGMA foreign_keys=ON');
  for (const name of ['0001_eidos_platform.sql', '0002_members.sql', '0004_paid_templates.sql']) sql.exec(readFileSync('migrations/' + name, 'utf8'));
  const database: Database = { prepare: text => new Query(sql, text), batch: statements => {
    sql.exec('BEGIN'); try { const results = statements.map(statement => statement.run()); sql.exec('COMMIT'); return Promise.all(results); }
    catch (error) { sql.exec('ROLLBACK'); return Promise.reject(error); }
  } };
  let archiveBytes = originalBytes, merchant = 'acct_fixturemerchant', failCheckout = false;
  const env: ProjectDeliveryEnv = { EIDOS_RUNTIME: 'sentinel', EIDOS_DB: database, EIDOS_LOCAL_TEST: 'true', PUBLIC_SITE_URL: origin,
    EIDOS_PLAYGROUND_DELIVERY_MODE: 'test', EIDOS_SHOP_ENABLED: 'true', EIDOS_TEMPLATE_TEST_ENABLED: 'true', EIDOS_TEMPLATE_VERIFIED_EDITIONS: 'switchboard-developer-v1',
    STRIPE_SECRET_KEY: 'sk_test_fixture', EIDOS_KIT_WEBHOOK_SECRET: 'whsec_controlled_fixture', EIDOS_TEMPLATE_STRIPE_ACCOUNT_ID: merchant,
    RESEND_API_KEY: 'fixture-mail-key', EIDOS_MAIL_FROM: 'Eidos <hello@example.test>',
    EIDOS_TEMPLATE_ARCHIVES: { async get(key) { return key.startsWith('templates/') ? { bytes: archiveBytes, sha256: createHash('sha256').update(archiveBytes).digest('hex') } : null; } } };
  for (const [owner, token] of [['alice', 'a'.repeat(64)], ['bob', 'b'.repeat(64)]]) {
    sql.prepare('INSERT INTO eidos_email_members(id,email,username,kind,created_at,newsletter_after) VALUES(?,?,?,?,?,?)').run(owner, owner + '@example.test', owner, 'person', '2026-10-14', '2026-10-14');
    sql.prepare('INSERT INTO eidos_member_sessions(token_hash,member_id,expires) VALUES(?,?,?)').run(await hash(token), owner, 2_000_000_000);
  }
  const project = createStarter({ starter: 'switchboard', goal: 'business', action: 'contact' });
  const snapshot = await createProjectSnapshot(project, 'document-fixture', 3, 'switchboard-developer-v1');
  const delivery = await freezeProjectDelivery(env, 'alice', { requestId: 'freeze-order-one', snapshot });
  const originalFetch = globalThis.fetch, sessions: URLSearchParams[] = [], mails: { text: string; to: string }[] = [];
  globalThis.fetch = async (url, init) => {
    if (String(url) === 'https://api.stripe.com/v1/account') return Response.json({ id: merchant, charges_enabled: true, payouts_enabled: true });
    if (String(url) === 'https://api.stripe.com/v1/checkout/sessions') {
      const values = new URLSearchParams(String(init?.body)); sessions.push(values);
      const id = values.get('client_reference_id')!;
      if (values.has('metadata[eidos_delivery_id]')) {
        const binding = sql.prepare('SELECT * FROM eidos_pg_delivery_orders WHERE order_id=?').get(id)!;
        assert.equal(binding.delivery_id, values.get('metadata[eidos_delivery_id]'), 'attachment must commit before external dispatch');
        assert.equal(binding.snapshot_hash, values.get('metadata[eidos_snapshot_hash]'));
      }
      return failCheckout ? Response.json({}, { status: 503 }) : Response.json({ id: 'cs_test_' + id.replaceAll('-', ''), url: 'https://checkout.stripe.com/c/pay/' + id, livemode: false });
    }
    if (String(url) === 'https://api.resend.com/emails') { mails.push(JSON.parse(String(init?.body))); return Response.json({ id: 'fixture-mail-' + mails.length }); }
    throw Error('Unexpected real network request: ' + url);
  };
  const context = (path: string, payload: unknown, owner = 'alice'): Context => ({ env, request: new Request(origin + path, { method: 'POST', headers: { origin, 'content-type': 'application/json', ...(owner ? { cookie: 'eidos_session_local=' + (owner === 'alice' ? 'a' : 'b').repeat(64) } : {}) }, body: JSON.stringify(payload) }) });
  const begin = (attempt: string, deliveryId: unknown = delivery.id, owner = 'alice') => checkout(context('/api/shop/checkout', { productId: 'switchboard-developer-v1', editionId: 'developer', acceptTerms: true, attempt, ...(deliveryId === undefined ? {} : { deliveryId }) }, owner));
  const getOrder = async (attempt: string) => sql.prepare('SELECT o.*,t.* FROM eidos_orders o JOIN eidos_template_orders t ON t.order_id=o.id WHERE receipt_hash=?').get(await hash(attempt))!;
  const event = async (attempt: string, id: string, type = 'checkout.session.completed', overrides: Record<string, unknown> = {}, signature = true) => {
    const row = await getOrder(attempt), session = sessions.find(values => values.get('client_reference_id') === row.id)!;
    const metadata = Object.fromEntries([...session.entries()].filter(([key]) => key.startsWith('metadata[')).map(([key, value]) => [key.slice(9, -1), value]));
    const payload = { id, type, livemode: false, data: { object: { id: row.session_id, client_reference_id: row.id, mode: 'payment', currency: 'usd', amount_total: row.price_cents,
      payment_status: 'paid', payment_intent: 'pi_fixture_' + row.id, customer_details: { email: row.email || 'guest@example.test' }, metadata, ...overrides } } };
    const raw = JSON.stringify(payload), timestamp = Math.floor(Date.now() / 1000), digest = createHmac('sha256', env.EIDOS_KIT_WEBHOOK_SECRET!).update(timestamp + '.' + raw).digest('hex');
    return webhook({ env, request: new Request(origin + '/api/shop/webhook', { method: 'POST', headers: { 'stripe-signature': `t=${timestamp},v1=${signature ? digest : '0'.repeat(64)}` }, body: raw }) });
  };
  return { sql, env, delivery, snapshot, sessions, mails, context, begin, getOrder, event, setArchive(bytes: Uint8Array) { archiveBytes = bytes; }, setMerchant(value: string) { merchant = value; }, fail(value: boolean) { failCheckout = value; }, close() { globalThis.fetch = originalFetch; sql.close(); } };
}
async function ok(response: Response) { assert.equal(response.status, 200, await response.clone().text()); return response.json(); }

test('capability and checkout bind server parent, owner and frozen bytes before provider dispatch', async () => {
  const f = await fixture();
  try {
    const request = new Request(origin + '/api/playground/delivery?capabilities=1', { headers: { cookie: 'eidos_session_local=' + 'a'.repeat(64) } });
    const cap = (await ok(await capabilities({ env: f.env, request }))).capabilities;
    assert.equal(cap.available, true); assert.equal(cap.ownerId, 'alice'); assert.equal(cap.products[0].priceCents, 9900); assert.equal(cap.products[0].parentArchiveSha256, originalHash);
    assert.equal((await f.begin('1'.repeat(64), f.delivery.id, 'bob')).status, 404);
    assert.equal((await f.begin('2'.repeat(64), f.delivery.id, '')).status, 401); assert.equal(f.sessions.length, 0);
    const attempt = '3'.repeat(64); await ok(await f.begin(attempt));
    const row = await f.getOrder(attempt), binding = f.sql.prepare('SELECT * FROM eidos_pg_delivery_orders WHERE order_id=?').get(row.id as string)!;
    assert.equal(binding.owner_id, 'alice'); assert.equal(binding.archive_sha256, f.delivery.archiveSha256); assert.equal(row.archive_sha256, originalHash);
    assert.equal(f.sessions[0].get('success_url'), origin + '/playground/?checkout=returned#receipt=' + attempt);
    assert.equal(f.sessions[0].get('cancel_url'), origin + '/playground/?checkout=cancelled');
    await ok(await f.begin(attempt)); assert.equal(f.sessions.length, 1);
    assert.equal((await checkout(f.context('/api/shop/checkout', { productId: 'switchboard', editionId: 'developer', acceptTerms: true, attempt }))).status, 409);
    const changed = await freezeProjectDelivery(f.env, 'alice', { requestId: 'different-freeze', snapshot: await createProjectSnapshot({ ...f.snapshot.project, name: 'Later page' }, 'document-fixture', 4, 'switchboard-developer-v1') });
    assert.equal((await f.begin(attempt, changed.id)).status, 409); assert.equal(f.sessions.length, 1);
    f.setArchive(new Uint8Array([1, 2, 3])); assert.equal((await f.begin('4'.repeat(64))).status, 409);
  } finally { f.close(); }
});

test('only matching signed payment unlocks exact approved bytes; original download remains byte-identical', async () => {
  const f = await fixture(), attempt = '5'.repeat(64);
  try {
    await ok(await f.begin(attempt));
    assert.equal((await download(f.context('/api/shop/download', { receipt: attempt, downloadToken: '0'.repeat(64), artifact: 'approved-page' }))).status, 403);
    assert.equal((await f.event(attempt, 'evt_bad_signature', undefined, {}, false)).status, 400);
    const values = f.sessions[0], metadata = Object.fromEntries([...values.entries()].filter(([key]) => key.startsWith('metadata[')).map(([key, value]) => [key.slice(9, -1), value]));
    assert.equal((await f.event(attempt, 'evt_wrong_snapshot', undefined, { metadata: { ...metadata, eidos_snapshot_hash: '0'.repeat(64) } })).status, 400);
    f.setMerchant('acct_wrong'); assert.equal((await f.event(attempt, 'evt_wrong_merchant')).status, 503); f.setMerchant('acct_fixturemerchant');
    await ok(await f.event(attempt, 'evt_paid'));
    const paid = await ok(await status(f.context('/api/shop/status', { receipt: attempt })));
    assert.equal(paid.approvedPage.state, 'ready'); assert.equal(paid.approvedPage.snapshotHash, f.delivery.snapshotHash);
    assert.deepEqual((await ok(await status(f.context('/api/shop/status', { receipt: attempt }, '')))).approvedPage, { state: 'sign_in_required' });
    assert.equal((await download(f.context('/api/shop/download', { receipt: attempt, downloadToken: paid.downloadToken, artifact: 'approved-page' }, ''))).status, 401);
    assert.equal((await download(f.context('/api/shop/download', { receipt: attempt, downloadToken: paid.downloadToken, artifact: 'approved-page' }, 'bob'))).status, 403);
    const approved = await download(f.context('/api/shop/download', { receipt: attempt, downloadToken: paid.downloadToken, artifact: 'approved-page' }));
    assert.equal(approved.status, 200); assert.equal(approved.headers.get('x-eidos-archive-sha256'), f.delivery.archiveSha256);
    assert.deepEqual(new Uint8Array(await approved.arrayBuffer()), (await readProjectDeliveryArchive(f.env, 'alice', f.delivery.id)).archive);
    const original = await download(f.context('/api/shop/download', { receipt: attempt, downloadToken: paid.downloadToken })); assert.equal(original.status, 200); assert.deepEqual(new Uint8Array(await original.arrayBuffer()), originalBytes);
    // Previously paid bytes do not depend on today's sale eligibility, registry lookup, or original archive provider.
    f.env.EIDOS_TEMPLATE_TEST_ENABLED = 'false'; f.env.EIDOS_TEMPLATE_VERIFIED_EDITIONS = ''; f.setArchive(new Uint8Array([0]));
    const retained = await download(f.context('/api/shop/download', { receipt: attempt, downloadToken: paid.downloadToken, artifact: 'approved-page' }));
    assert.equal(retained.status, 200); assert.equal(retained.headers.get('x-eidos-archive-sha256'), f.delivery.archiveSha256);
    await ok(await f.event(attempt, 'evt_refund', 'charge.refunded')); await ok(await f.event(attempt, 'evt_paid_replay'));
    assert.equal((await download(f.context('/api/shop/download', { receipt: attempt, downloadToken: paid.downloadToken, artifact: 'approved-page' }))).status, 403);
    assert.equal((await ok(await status(f.context('/api/shop/status', { receipt: attempt })))).approvedPage.state, 'revoked');
  } finally { f.close(); }
});

test('refund or independent revocation blocks recovery without claiming a ready artifact', async () => {
  const f = await fixture(), attempt = '9'.repeat(64);
  try {
    await ok(await f.begin(attempt)); await ok(await f.event(attempt, 'evt_recovery_revoked_paid'));
    const token = f.mails[0].text.match(/#token=([a-f0-9]{64})/)![1], order = await f.getOrder(attempt);
    f.sql.prepare('INSERT INTO eidos_revoked_payments(payment_intent,received_at) VALUES(?,?)').run(order.payment_intent as string, new Date().toISOString());
    assert.equal((await redeem(f.context('/api/shop/redeem', { token }))).status, 403);
    assert.equal(f.sql.prepare('SELECT used FROM eidos_template_recovery WHERE token_hash=?').get(await hash(token))!.used, 0);
    await ok(await f.event(attempt, 'evt_recovery_refund', 'charge.refunded'));
    assert.equal((await redeem(f.context('/api/shop/redeem', { token }))).status, 401);
  } finally { f.close(); }
});

test('checkout failure retry and recovery retain one immutable approved artifact', async () => {
  const f = await fixture(), attempt = '6'.repeat(64);
  try {
    f.fail(true); assert.equal((await f.begin(attempt)).status, 502);
    const row = await f.getOrder(attempt); assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM eidos_pg_delivery_orders').get()!.n, 1);
    f.fail(false); await ok(await f.begin(attempt)); assert.equal((await f.getOrder(attempt)).id, row.id);
    await ok(await f.event(attempt, 'evt_recovery_paid'));
    const token = f.mails[0].text.match(/#token=([a-f0-9]{64})/)![1];
    assert.equal((await redeem(f.context('/api/shop/redeem', { token }, ''))).status, 401);
    assert.equal((await redeem(f.context('/api/shop/redeem', { token }, 'bob'))).status, 403);
    const recovered = await ok(await redeem(f.context('/api/shop/redeem', { token })));
    assert.equal(recovered.approvedPage.deliveryId, f.delivery.id); assert.equal(recovered.continuePath, '/playground/?checkout=returned#receipt=' + recovered.receipt);
    assert.equal((await redeem(f.context('/api/shop/redeem', { token }))).status, 401);
    const recoveredStatus = await ok(await status(f.context('/api/shop/status', { receipt: recovered.receipt })));
    const delivered = await download(f.context('/api/shop/download', { receipt: recovered.receipt, downloadToken: recoveredStatus.downloadToken, artifact: 'approved-page' }));
    assert.equal(delivered.headers.get('x-eidos-archive-sha256'), f.delivery.archiveSha256);
    assert.equal((await status(f.context('/api/shop/status', { receipt: attempt }))).status, 404);
  } finally { f.close(); }
});

test('concurrent same-attempt requests cannot replace the winning page attachment', async () => {
  const f = await fixture(), attempt = '8'.repeat(64);
  try {
    const other = await freezeProjectDelivery(f.env, 'alice', { requestId: 'racing-second-freeze', snapshot: await createProjectSnapshot({ ...f.snapshot.project, name: 'Another approval' }, 'other-document', 1, 'switchboard-developer-v1') });
    const responses = await Promise.all([f.begin(attempt, f.delivery.id), f.begin(attempt, other.id)]);
    assert.deepEqual(responses.map(response => response.status).sort(), [200, 409]);
    assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM eidos_orders').get()!.n, 1);
    assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM eidos_template_orders').get()!.n, 1);
    assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM eidos_pg_delivery_orders').get()!.n, 1);
    assert.equal(f.sessions.length, 1);
    const winner = f.sql.prepare('SELECT delivery_id FROM eidos_pg_delivery_orders').get()!.delivery_id;
    assert.equal(f.sessions[0].get('metadata[eidos_delivery_id]'), winner);
  } finally { f.close(); }
});

test('historical and guest original orders never gain attachments and retain original checkout/download behavior', async () => {
  const f = await fixture(), attempt = '7'.repeat(64);
  try {
    await ok(await checkout(f.context('/api/shop/checkout', { productId: 'switchboard', editionId: 'developer', acceptTerms: true, attempt }, '')));
    assert.equal(f.sessions[0].get('success_url'), origin + '/shop/start#receipt=' + attempt);
    assert.equal((await f.begin(attempt)).status, 409);
    await ok(await f.event(attempt, 'evt_guest_paid'));
    const guest = await ok(await status(f.context('/api/shop/status', { receipt: attempt }, ''))); assert.equal(guest.approvedPage, undefined);
    const original = await download(f.context('/api/shop/download', { receipt: attempt, downloadToken: guest.downloadToken }, '')); assert.equal(original.status, 200); assert.deepEqual(new Uint8Array(await original.arrayBuffer()), originalBytes);
    assert.equal((await download(f.context('/api/shop/download', { receipt: attempt, downloadToken: guest.downloadToken, artifact: 'approved-page' }, ''))).status, 404);
    assert.equal(f.sql.prepare("SELECT COUNT(*) n FROM sqlite_master WHERE name='eidos_pg_delivery_orders'").get()!.n, 1); // A rejected authenticated attachment prepared the additive table only.
    assert.equal(f.sql.prepare('SELECT COUNT(*) n FROM eidos_pg_delivery_orders').get()!.n, 0);
  } finally { f.close(); }
});

test('order attachment schema matches additive migration', () => {
  assert.equal(schema.replaceAll('\r\n', '\n'), readFileSync('migrations/0007_project_delivery_orders.sql', 'utf8').replaceAll('\r\n', '\n'));
});
