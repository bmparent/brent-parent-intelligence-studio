import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFrozenPackage, canonicalJson, createProjectSnapshot, digestFiles, frozenPackageFromArchive, hashBytes, parentEditions, validateProjectSnapshot, verifyFrozenPackage, type FrozenPackage } from '../src/playground/purchaseSnapshot';
import { zipFiles } from '../src/playground/export';
import { createStarter } from '../src/playground/starters';
import { recoverApprovedPurchase } from '../src/playground/purchaseRecoveryClient';

const encode = (text: string) => new TextEncoder().encode(text), receipt = 'b'.repeat(64);
const current = await buildFrozenPackage(await createProjectSnapshot(createStarter({ starter: 'switchboard', goal: 'business', action: 'contact' }), 'paid-document', 7, parentEditions[0].editionId));
async function historicalPackage(): Promise<FrozenPackage> {
  const value = structuredClone(current);
  value.snapshot.parent!.version = '0.9.0';
  const { snapshotHash: old, ...payload } = value.snapshot; assert.ok(old);
  value.snapshot.snapshotHash = await hashBytes(encode(canonicalJson(payload)));
  value.files.find(file => file.name === 'SNAPSHOT.json')!.data = encode(JSON.stringify(value.snapshot, null, 2));
  value.manifest.parent = value.snapshot.parent; value.manifest.snapshotHash = value.snapshot.snapshotHash;
  value.manifest.files = await digestFiles(value.files.filter(file => file.name !== 'PACKAGE_MANIFEST.json'));
  value.files.find(file => file.name === 'PACKAGE_MANIFEST.json')!.data = encode(JSON.stringify(value.manifest, null, 2));
  value.archive = zipFiles(value.files); value.receipt = { ...value.receipt, snapshotHash: value.snapshot.snapshotHash, archiveSha256: await hashBytes(value.archive), bytes: value.archive.length };
  return value;
}
const json = (value: unknown) => new Response(JSON.stringify(value), { headers: { 'content-type': 'application/json' } });
function fixture(frozen: FrozenPackage, state = 'paid', source?: unknown) {
  const calls: string[] = [], parent = frozen.snapshot.parent!;
  const accepted = { id: 'delivery-one', ownerId: 'owner-one', documentId: frozen.snapshot.documentId, revision: frozen.snapshot.revision, snapshotHash: frozen.snapshot.snapshotHash, projectHash: frozen.snapshot.projectHash, archiveSha256: frozen.receipt.archiveSha256, archiveBytes: frozen.archive.length, mode: 'test' };
  const status = { status: state, paymentState: state, orderId: 'order-one', productId: parent.editionId, editionId: 'developer', version: parent.version, downloadToken: 'fixture-token', approvedPage: { ...accepted, deliveryId: accepted.id, state: state === 'paid' ? 'ready' : state === 'refunded' ? 'revoked' : state === 'sign_in_required' ? 'sign_in_required' : 'pending', output: frozen.snapshot.output, downloadName: 'approved.zip', parent: { productId: parent.editionId, editionId: 'developer', version: parent.version, archiveSha256: parent.sha256, archiveBytes: parent.bytes, licenseId: parent.license.id } } };
  const request = (async (input, init) => { const path = String(input); calls.push(path);
    if (path === '/api/shop/status') return json(status);
    if (path === '/api/shop/download') { assert.deepEqual(JSON.parse(String(init?.body)), { receipt, downloadToken: 'fixture-token', artifact: 'approved-page' }); return new Response(frozen.archive, { headers: { 'content-type': 'application/zip' } }); }
    if (path === '/api/playground/delivery?id=delivery-one') return json({ delivery: { ...accepted, snapshot: source || frozen.snapshot, manifest: frozen.manifest } });
    throw Error('No current capability, registry, merchant or provider request is allowed: ' + path);
  }) as typeof fetch;
  return { request, calls, status };
}

test('stored parser preserves historical parent version and byte-exact archive while new checkout validation rejects the old reference', async () => {
  const old = await historicalPackage();
  await assert.rejects(() => validateProjectSnapshot(old.snapshot), /parent|reference/i);
  assert.deepEqual(await verifyFrozenPackage(old), old);
  const parsed = await frozenPackageFromArchive(old.archive);
  assert.equal(parsed.snapshot.parent?.version, '0.9.0'); assert.deepEqual(parsed.archive, old.archive);
  const mock = fixture(old), recovered = await recoverApprovedPurchase(receipt, mock.request);
  assert.equal(recovered.limitation, ''); assert.equal(recovered.frozen?.snapshot.parent?.version, '0.9.0'); assert.deepEqual(recovered.archive, old.archive);
  assert.deepEqual(mock.calls, ['/api/shop/status', '/api/shop/download', '/api/playground/delivery?id=delivery-one']);
});

test('fresh-device recovery verifies owned source and preserves exact paid bytes independently of local workspace or current capability', async () => {
  const mock = fixture(current), recovered = await recoverApprovedPurchase(receipt, mock.request);
  assert.equal(recovered.frozen?.snapshot.documentId, 'paid-document'); assert.equal(recovered.attempt?.ownerId, 'owner-one'); assert.equal(recovered.purchase?.status, 'paid');
  assert.deepEqual(recovered.archive, current.archive); assert.equal(recovered.limitation, '');
  const changed = structuredClone(current.snapshot); changed.revision++;
  const mismatch = await recoverApprovedPurchase(receipt, fixture(current, 'paid', changed).request);
  assert.equal(mismatch.frozen, null); assert.deepEqual(mismatch.archive, current.archive); assert.match(mismatch.limitation, /source differs/);
});

test('an unsupported historical source keeps its verified ZIP available without pretending it can reopen', async () => {
  const old = structuredClone(current); old.archive = zipFiles([{ name: 'README.txt', data: encode('Earlier archived output') }]);
  old.receipt.archiveSha256 = await hashBytes(old.archive); old.receipt.bytes = old.archive.length;
  const mock = fixture(old), recovered = await recoverApprovedPurchase(receipt, mock.request);
  assert.equal(recovered.frozen, null); assert.match(recovered.limitation, /no supported editable snapshot/); assert.deepEqual(recovered.archive, old.archive); assert.equal(mock.calls.length, 2);
});

test('pending, revoked, unsigned and corrupted archived data do not grant restoration', async () => {
  for (const state of ['pending', 'refunded', 'sign_in_required']) { const mock = fixture(current, state); await assert.rejects(() => recoverApprovedPurchase(receipt, mock.request), /not ready|Sign in/); assert.equal(mock.calls.length, 1); }
  const damaged = structuredClone(current); damaged.archive[40] ^= 1;
  await assert.rejects(() => recoverApprovedPurchase(receipt, fixture(damaged).request), /immutable receipt/);
  await assert.rejects(() => frozenPackageFromArchive(damaged.archive), /hash|manifest|archive/);
});
