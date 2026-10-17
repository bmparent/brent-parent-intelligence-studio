import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFrozenPackage, createProjectSnapshot, parentEditions } from '../src/playground/purchaseSnapshot';
import { createStarter } from '../src/playground/starters';
import { acceptFrozenDelivery, assertPurchaseCapability, assertReviewedPurchaseTerms, capturePurchaseReturn, downloadDeliveryArtifact, fetchDeliveryCapabilities, fetchDeliveryPurchase, inspectReturnedPurchase, loadPurchaseAttempt, matchingProduct, newPurchaseReceipt, purchaseReturn, safePurchaseContinuePath, saveCheckoutReturn, savePurchaseAttempt, startFrozenCheckout, validateAcceptedDelivery, validateCapabilities, validateDeliveryPurchase, type DeliveryCapabilities } from '../src/playground/purchaseClient';

const frozen = await buildFrozenPackage(await createProjectSnapshot(createStarter({ starter: 'switchboard', goal: 'business', action: 'contact' }), 'document-a', 7, parentEditions[0].editionId));
const parent = parentEditions[0], receipt = 'a'.repeat(64);
const rawCapabilities = { mode: 'test', ownerId: 'owner-a', available: true, reason: null, limits: { snapshotBytes: 1_500_000, archiveBytes: 6_000_000 }, turnstileSiteKey: '', localTest: true, products: [{ productId: parent.editionId, editionId: 'developer', version: parent.version, priceCents: 1234, currency: 'usd', parentArchiveSha256: parent.sha256, parentArchiveBytes: parent.bytes }] };
const cap = validateCapabilities(rawCapabilities);
const accepted = { id: 'delivery-a', ownerId: cap.ownerId, documentId: frozen.snapshot.documentId, revision: 7, snapshotHash: frozen.snapshot.snapshotHash, projectHash: frozen.snapshot.projectHash, archiveSha256: frozen.receipt.archiveSha256, archiveBytes: frozen.archive.length, mode: 'test' as const };
const status = (state = 'pending') => ({ status: state, paymentState: state, orderId: 'order-a', productId: parent.editionId, editionId: 'developer', version: parent.version, downloadName: 'original.zip', downloadToken: 'server-signed-token', approvedPage: { ...accepted, deliveryId: accepted.id, state: state === 'paid' ? 'ready' : state === 'refunded' ? 'revoked' : 'pending', output: frozen.snapshot.output, downloadName: 'approved-page.zip', parent: { productId: parent.editionId, editionId: 'developer', version: parent.version, archiveSha256: parent.sha256, archiveBytes: parent.bytes, licenseId: parent.license.id } } });
const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
function fixture(handler: (path: string, body: Record<string, unknown> | undefined) => Response | Promise<Response>) { const calls: { path: string; body?: Record<string, unknown> }[] = []; return { calls, request: (async (input, init) => { const path = String(input), body = init?.body ? JSON.parse(String(init.body)) : undefined; calls.push({ path, body }); return handler(path, body); }) as typeof fetch }; }
test('only an explicit authenticated TEST capability supplies original price/version, disabled and mismatch paths make zero POSTs', async () => {
  const mock = fixture(() => response({ capabilities: rawCapabilities }));
  assert.deepEqual(await fetchDeliveryCapabilities(mock.request), cap);
  assert.deepEqual(mock.calls.map(call => call.path), ['/api/playground/delivery?capabilities=1']);
  assert.equal(matchingProduct(cap, frozen)?.priceCents, 1234);
  assert.throws(() => validateCapabilities({ ...rawCapabilities, mode: 'live' }), /TEST/);
  assert.throws(() => validateCapabilities({ ...rawCapabilities, ownerId: null }), /TEST/);
  assert.throws(() => validateCapabilities({ ...rawCapabilities, products: [{ ...rawCapabilities.products[0], priceCents: null }] }), /price/);
  const noNetwork = fixture(() => { throw Error('Unexpected network request'); });
  for (const unavailable of [{ ...cap, available: false, reason: 'Off' }, { ...cap, products: [] }, { ...cap, limits: { snapshotBytes: 1, archiveBytes: 1 } }]) {
    await assert.rejects(() => acceptFrozenDelivery(unavailable, frozen, 'same-request', noNetwork.request));
    await assert.rejects(() => startFrozenCheckout(unavailable, frozen, accepted, receipt, true, 'fixture', noNetwork.request));
  }
  assert.equal(noNetwork.calls.length, 0);
  assert.throws(() => assertPurchaseCapability({ ...cap, products: [{ ...cap.products[0], version: '999' }] }, frozen), /matching/);
});
test('server acceptance must bind the exact owner, source, revision, snapshot and archive', async () => {
  const mock = fixture(() => response({ delivery: accepted }));
  assert.deepEqual(await acceptFrozenDelivery(cap, frozen, 'same-request', mock.request), accepted);
  assert.deepEqual(Object.keys(mock.calls[0].body!).sort(), ['requestId', 'snapshot']);
  for (const field of ['ownerId', 'documentId', 'revision', 'snapshotHash', 'projectHash', 'archiveSha256', 'archiveBytes', 'mode']) assert.throws(() => validateAcceptedDelivery({ ...accepted, [field]: 'wrong' }, cap, frozen), /exact/);
  const reject = fixture(() => response({ error: 'Image rejected' }, 400));
  await assert.rejects(() => acceptFrozenDelivery(cap, frozen, 'same-request', reject.request), /Image rejected/);
});
test('checkout sends only server identifiers, stable attempt, terms and challenge; unsafe redirects never pass', async () => {
  const mock = fixture(() => response({ url: 'https://checkout.stripe.com/c/pay/cs_test_fixture' }));
  for (let index = 0; index < 2; index++) assert.equal(await startFrozenCheckout(cap, frozen, accepted, receipt, true, 'fixture', mock.request), 'https://checkout.stripe.com/c/pay/cs_test_fixture');
  assert.deepEqual(mock.calls[0].body, mock.calls[1].body);
  assert.deepEqual(mock.calls[0].body, { productId: parent.editionId, editionId: 'developer', deliveryId: accepted.id, acceptTerms: true, attempt: receipt, challenge: 'fixture' });
  for (const url of ['https://evil.example/', 'http://checkout.stripe.com/a', 'https://checkout.stripe.com.evil.example', 'https://user@checkout.stripe.com/a', 'https://checkout.stripe.com:444/a', 'javascript:alert(1)']) await assert.rejects(() => startFrozenCheckout(cap, frozen, accepted, receipt, true, 'fixture', fixture(() => response({ url })).request), /checkout address/);
  await assert.rejects(() => startFrozenCheckout(cap, frozen, accepted, receipt, false, 'fixture', mock.request), /terms/);
  await assert.rejects(() => startFrozenCheckout(cap, frozen, accepted, receipt, true, '', mock.request), /verification/);
});
test('status cannot turn a redirect, another owner, different revision, original edition, or revoked artifact into an approved download', async () => {
  assert.equal(validateDeliveryPurchase(status(), cap, frozen, accepted).status, 'pending');
  assert.equal(validateDeliveryPurchase(status('paid'), cap, frozen, accepted).approvedPage.state, 'ready');
  assert.throws(() => validateDeliveryPurchase({ ...status('paid'), approvedPage: { state: 'sign_in_required' } }, cap, frozen, accepted), /Sign in/);
  assert.throws(() => validateDeliveryPurchase({ ...status('paid'), version: '999' }, cap, frozen, accepted), /does not match/);
  for (const field of ['ownerId', 'snapshotHash', 'projectHash', 'archiveSha256', 'revision']) assert.throws(() => validateDeliveryPurchase({ ...status('paid'), approvedPage: { ...status('paid').approvedPage, [field]: 'wrong' } }, cap, frozen, accepted));
  for (const state of ['pending', 'refunded']) { const mock = fixture(() => response(status(state))); await assert.rejects(() => downloadDeliveryArtifact('approved-page', receipt, cap, frozen, accepted, mock.request), /both be ready/); assert.equal(mock.calls.length, 1); }
});
test('paid approved-page download verifies the exact stored hash/bytes and retains default original download semantics', async () => {
  const mock = fixture(path => path.endsWith('/status') ? response(status('paid')) : new Response(frozen.archive, { headers: { 'content-type': 'application/zip' } }));
  const approved = await downloadDeliveryArtifact('approved-page', receipt, cap, frozen, accepted, mock.request);
  assert.deepEqual(approved.bytes, frozen.archive); assert.equal(approved.name, 'approved-page.zip');
  assert.equal(mock.calls[1].body?.artifact, 'approved-page');
  const tampered = frozen.archive.slice(); tampered[40] ^= 1;
  await assert.rejects(() => downloadDeliveryArtifact('approved-page', receipt, cap, frozen, accepted, fixture(path => path.endsWith('/status') ? response(status('paid')) : new Response(tampered, { headers: { 'content-type': 'application/zip' } })).request), /hash does not match/);
  const original = fixture(path => path.endsWith('/status') ? response(status('paid')) : new Response(new Uint8Array(1), { headers: { 'content-type': 'application/zip' } }));
  await assert.rejects(() => downloadDeliveryArtifact('original', receipt, cap, frozen, accepted, original.request), /hash does not match/);
  assert.equal('artifact' in original.calls[1].body!, false, 'original path does not acquire a new selector');
});
test('private attempts are isolated by owner and frozen hash and returned receipts must match exact approved page', async () => {
  const data = new Map<string, string>(), storage = { getItem: (key: string) => data.get(key) || null, setItem: (key: string, value: string) => { data.set(key, value); } };
  const attempt = { ownerId: cap.ownerId, snapshotHash: frozen.snapshot.snapshotHash, receipt, delivery: accepted };
  savePurchaseAttempt(attempt, storage); assert.deepEqual(loadPurchaseAttempt(cap, frozen, storage), attempt);
  assert.equal(loadPurchaseAttempt({ ...cap, ownerId: 'owner-b' }, frozen, storage), null);
  const result = await inspectReturnedPurchase(receipt, cap, frozen, fixture(() => response(status('paid'))).request);
  assert.deepEqual(result.attempt, attempt); assert.equal(result.purchase.status, 'paid');
  await assert.rejects(() => fetchDeliveryPurchase(receipt, { ...cap, ownerId: 'owner-b' } as DeliveryCapabilities, frozen, accepted, fixture(() => response(status('paid'))).request), /exact owner/);
  assert.match(newPurchaseReceipt(), /^[a-f0-9]{64}$/); assert.notEqual(newPurchaseReceipt(), newPurchaseReceipt());
});
test('return and recovery paths accept only the exact known same-origin path with the same receipt', () => {
  const values = new Map<string, string>(), storage = { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const result = capturePurchaseReturn('https://preview.example/playground/?studio=page&checkout=returned#receipt=' + receipt, storage);
  assert.equal(result.href, '/playground/?studio=page'); assert.equal(result.returned, true); assert.ok([...values.values()][0].includes(receipt));
  assert.deepEqual(capturePurchaseReturn('https://preview.example/playground/?checkout=unrelated', storage), { href: 'https://preview.example/playground/?checkout=unrelated', returned: false });
  const path = '/playground/?checkout=returned#receipt=' + receipt;
  assert.equal(safePurchaseContinuePath(path, receipt), path);
  for (const unsafe of ['https://evil.example' + path, '//evil.example' + path, '/account', path.replace(receipt, 'b'.repeat(64)), path + '&next=evil', 'javascript:alert(1)']) assert.equal(safePurchaseContinuePath(unsafe, receipt), null);
  saveCheckoutReturn(receipt, storage);
  capturePurchaseReturn('https://preview.example/playground/?checkout=cancelled', storage);
  assert.deepEqual(purchaseReturn(storage), { state: 'cancelled', receipt }, 'a cancelled return keeps the dispatched private attempt without asking current sales capability');
});

test('checkout revalidation requires renewed review when the displayed price changes', async () => {
  assert.doesNotThrow(() => assertReviewedPurchaseTerms(cap, structuredClone(cap), frozen));
  const noNetwork = fixture(() => { throw Error('Unexpected checkout request'); });
  for (const priceCents of [cap.products[0].priceCents + 1, cap.products[0].priceCents - 1]) {
    const changed = { ...cap, products: [{ ...cap.products[0], priceCents }] };
    await assert.rejects(async () => {
      assertReviewedPurchaseTerms(cap, changed, frozen);
      await startFrozenCheckout(changed, frozen, accepted, receipt, true, 'fixture', noNetwork.request);
    }, /price or edition changed/);
  }
  assert.throws(() => assertReviewedPurchaseTerms(cap, { ...cap, ownerId: 'owner-b' }, frozen), /account changed/);
  assert.throws(() => assertReviewedPurchaseTerms(cap, { ...cap, available: false, reason: 'Sales paused' }, frozen), /Sales paused/);
  assert.equal(noNetwork.calls.length, 0);
});
