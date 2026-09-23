import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { fixture, ctx, signup } from './playground-test-fixture';
import { onRequestPost as checkout } from '../functions/api/shop/checkout';
import { onRequestPost as webhook } from '../functions/api/shop/webhook';
import { onRequestGet as list, onRequestPost as download } from '../functions/api/shop/purchases';
import { kitAttempt, kitDownload, archiveDigest } from '../functions/_shared/platform/kitDelivery';

test('ambiguous checkout retries preserve order, parameters and frozen delivery; verified recovery revokes on refund', async () => {
  const { env, sql } = fixture();
  Object.assign(env, { EIDOS_SHOP_ENABLED: 'true', STRIPE_SECRET_KEY: 'sk_test_fixture', EIDOS_KIT_WEBHOOK_SECRET: 'test-signing-key' });
  const buyer = await signup(env, 'kit_buyer'), other = await signup(env, 'kit_other');
  const original = globalThis.fetch, calls: { body: string; key: string }[] = [];
  globalThis.fetch = async (_url, init) => {
    calls.push({ body: String(init?.body), key: new Headers(init?.headers).get('idempotency-key')! });
    if (calls.length === 1) throw Error('Response lost after Stripe accepted request');
    return Response.json({ id: 'cs_test_fixture', url: 'https://checkout.stripe.com/c/pay/cs_test_fixture' });
  };
  try {
    const attempt = 'a'.repeat(64), input = { acceptTerms: true, attempt, useCase: 'own-website' };
    // Guest checkout: recovery later proves control of signed checkout email.
    assert.equal((await checkout(ctx(env, '/api/shop/checkout', input))).status, 503);
    assert.equal((await checkout(ctx(env, '/api/shop/checkout', input))).status, 200);
    assert.equal(calls[0].key, calls[1].key);
    assert.equal(calls[0].body, calls[1].body);
    assert.equal(sql.prepare('SELECT count(*) n FROM eidos_orders').get()?.n, 1);
    assert.equal((await checkout(ctx(env, '/api/shop/checkout', input))).status, 200);
    assert.equal(calls.length, 2);
    const id = sql.prepare('SELECT id FROM eidos_orders').get()!.id as string;
    const sign = async (type: string, object: unknown, eventId: string) => {
      const raw = JSON.stringify({ id: eventId, type, data: { object } }), stamp = Math.floor(Date.now() / 1000);
      const signature = createHmac('sha256', env.EIDOS_KIT_WEBHOOK_SECRET!).update(stamp + '.' + raw).digest('hex');
      return webhook({ env, request: new Request('http://localhost:8788/api/shop/webhook', { method: 'POST', headers: { 'stripe-signature': `t=${stamp},v1=${signature}` }, body: raw }) });
    };
    const paid = { id: 'cs_test_fixture', client_reference_id: id, mode: 'payment', currency: 'usd', amount_total: 2900, payment_status: 'paid', payment_intent: 'pi_fixture', customer_details: { email: 'kit_buyer@example.test' }, metadata: { eidos_product: 'cinematic-starter-v1', eidos_order_id: id } };
    assert.equal((await sign('checkout.session.completed', paid, 'evt_paid')).status, 200);
    const purchases = await (await list(ctx(env, '/api/shop/purchases', undefined, buyer.headers))).json();
    assert.equal(purchases.purchases[0].id, id);
    assert.equal((await download(ctx(env, '/api/shop/purchases', { id }, other.headers))).status, 404);
    const archive = await download(ctx(env, '/api/shop/purchases', { id }, buyer.headers));
    assert.equal(archive.status, 200);
    assert.equal(archive.headers.get('x-artifact-sha256'), purchases.purchases[0].archive_digest);
    const delivered = Buffer.from(await archive.arrayBuffer());
    assert.equal(createHash('sha256').update(delivered).digest('hex'), purchases.purchases[0].archive_digest);
    const frozen = sql.prepare('SELECT data FROM eidos_kit_archives WHERE digest=?').get(purchases.purchases[0].archive_digest) as {data:string};
    assert.deepEqual(delivered, Buffer.from(frozen.data, 'base64'));
    assert.equal((await sign('charge.refunded', { payment_intent: 'pi_fixture' }, 'evt_refund')).status, 200);
    assert.equal((await sign('checkout.session.completed', paid, 'evt_late_paid')).status, 200);
    assert.equal((await download(ctx(env, '/api/shop/purchases', { id }, buyer.headers))).status, 403);
  } finally { globalThis.fetch = original; sql.close(); }
});
test('attempt parameters and authenticated owner cannot be changed; expired attempt never creates another order', async () => {
  const { env, sql } = fixture();
  const buyer = await signup(env, 'attempt_owner'), other = await signup(env, 'attempt_other');
  const request = ctx(env, '/api/shop/checkout', {}, buyer.headers).request;
  const token = 'b'.repeat(64), site = env.PUBLIC_SITE_URL!;
  await kitAttempt(request, env, token, 'own-website', site);
  await assert.rejects(kitAttempt(request, env, token, 'client-project', site), /different options/);
  await assert.rejects(kitAttempt(ctx(env, '/api/shop/checkout', {}, other.headers).request, env, token, 'own-website', site), /account that started/);
  sql.exec('UPDATE eidos_kit_attempts SET expires=1');
  await assert.rejects(kitAttempt(request, env, token, 'own-website', site), /expired/);
  assert.equal(sql.prepare('SELECT count(*) n FROM eidos_orders').get()?.n, 1);
  sql.close();
});

test('frozen purchases never fall back to a legacy archive when bytes are missing or corrupt', async () => {
  const { env, sql } = fixture();
  try {
    const attempt = await kitAttempt(ctx(env, '/api/shop/checkout').request, env, 'c'.repeat(64), 'own-website', env.PUBLIC_SITE_URL!);
    sql.prepare("UPDATE eidos_orders SET status='paid' WHERE id=?").run(attempt.order_id);
    const order = sql.prepare('SELECT * FROM eidos_orders WHERE id=?').get(attempt.order_id) as unknown as import('../functions/_shared/platform/shop').Order;
    const valid = await kitDownload(env, order);
    assert.equal(valid.status, 200);
    sql.exec("UPDATE eidos_kit_archives SET data='Y29ycnVwdA=='");
    await assert.rejects(kitDownload(env, order), /support check/);
    sql.exec('DELETE FROM eidos_kit_archives');
    await assert.rejects(kitDownload(env, order), /support check/);
    // Only purchases with no frozen-version association are historical v1 orders.
    sql.exec('DELETE FROM eidos_kit_attempts');
    const legacy = await kitDownload(env, order);
    const { legacyKitArchiveBase64 } = await import('../functions/_shared/platform/legacyKitArchive');
    assert.equal(legacy.headers.get('x-artifact-sha256'), await archiveDigest(legacyKitArchiveBase64));
  } finally { sql.close(); }
});
