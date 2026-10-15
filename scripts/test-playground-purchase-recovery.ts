import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFrozenPackage, canonicalJson, createProjectSnapshot, digestFiles, frozenPackageFromArchive, hashBytes, parentEditions, validateProjectSnapshot, verifyFrozenPackage, type FrozenPackage } from '../src/playground/purchaseSnapshot';
import { zipFiles } from '../src/playground/export';
import { createStarter } from '../src/playground/starters';
import { recoverApprovedPurchase } from '../src/playground/purchaseRecoveryClient';
import { createTemplateRecovery, TemplateRecoveryError } from '../src/components/templateRecovery';

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

const pendingKey = 'eidos.template.pending-recovery', receiptKey = 'eidos.template.receipt', recoveryToken = 'c'.repeat(64);
function privateSession() {
  const values = new Map<string, string>([['draft-sentinel', 'preserve existing project']]);
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
}
const reply = (status: number, value: unknown) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });
const recoverySuccess = { receipt, continuePath: '/playground/?checkout=returned#receipt=' + receipt };
const isKind = (kind: TemplateRecoveryError['kind']) => (error: unknown) => error instanceof TemplateRecoveryError && error.kind === kind && !error.message.includes(recoveryToken);

test('private recovery survives logged-out rejection and same-tab reload, then resumes with the identical token after sign-in', async () => {
  const storage = privateSession(), bodies: unknown[] = []; let signedIn = false;
  const request = (async (path, init) => {
    assert.equal(path, '/api/shop/redeem'); assert.equal(init?.credentials, 'same-origin'); assert.equal(init?.cache, 'no-store'); assert.ok(init?.signal);
    assert.equal(JSON.parse(storage.getItem(pendingKey)!).token, recoveryToken, 'persist before sending, including an interrupted navigation');
    bodies.push(JSON.parse(String(init?.body)));
    return signedIn ? reply(200, recoverySuccess) : reply(401, { error: 'Sign in to the account that approved this page.' });
  }) as typeof fetch;
  const first = createTemplateRecovery(recoveryToken, storage, { request });
  await assert.rejects(first.redeem, isKind('signin')); assert.equal(first.hasPending(), true);
  const reloaded = createTemplateRecovery('', storage, { request }); signedIn = true;
  assert.deepEqual(await reloaded.redeem(), { ...recoverySuccess, saved: true });
  assert.deepEqual(bodies, [{ token: recoveryToken }, { token: recoveryToken }]); assert.equal(storage.getItem(pendingKey), null); assert.equal(storage.getItem(receiptKey), receipt);
  assert.deepEqual([...storage.values.keys()].sort(), ['draft-sentinel', receiptKey].sort()); assert.equal(storage.getItem('draft-sentinel'), 'preserve existing project');
});

test('wrong-owner rejection retains private recovery until an explicit retry with the owner account', async () => {
  const storage = privateSession(); let owner = false, calls = 0;
  const request = (async () => { calls++; return owner ? reply(200, recoverySuccess) : reply(403, { error: 'This purchase belongs to another account.' }); }) as typeof fetch;
  const recovery = createTemplateRecovery(recoveryToken, storage, { request });
  await assert.rejects(recovery.redeem, isKind('owner')); assert.equal(recovery.hasPending(), true); assert.equal(calls, 1);
  owner = true; await recovery.redeem(); assert.equal(calls, 2); assert.equal(recovery.hasPending(), false);
});

test('concurrent callers share a single redemption and a successful result never resubmits the single-use token', async () => {
  const storage = privateSession(); let calls = 0, finish!: (response: Response) => void;
  const request = (() => { calls++; return new Promise<Response>(resolve => { finish = resolve; }); }) as typeof fetch;
  const recovery = createTemplateRecovery(recoveryToken, storage, { request });
  const first = recovery.redeem(), duplicate = recovery.redeem(); assert.equal(first, duplicate); assert.equal(calls, 1);
  finish(reply(200, recoverySuccess)); assert.deepEqual(await first, await duplicate); await recovery.redeem(); assert.equal(calls, 1);
});

test('local retention is bounded without extending on repeated links and terminal server expiry or revocation clears it', async () => {
  const storage = privateSession(); let time = 1000, calls = 0;
  const request = (async () => { calls++; return reply(200, recoverySuccess); }) as typeof fetch;
  createTemplateRecovery(recoveryToken, storage, { now: () => time, request }); const expiresAt = JSON.parse(storage.getItem(pendingKey)!).expiresAt;
  time += 60000; const repeated = createTemplateRecovery(recoveryToken, storage, { now: () => time, request }); assert.equal(JSON.parse(storage.getItem(pendingKey)!).expiresAt, expiresAt);
  time = expiresAt; await assert.rejects(repeated.redeem, isKind('expired')); assert.equal(calls, 0); assert.equal(storage.getItem(pendingKey), null);
  for (const [status, message, kind] of [[401, 'This recovery link is invalid or expired.', 'expired'], [403, 'This approved page purchase was revoked.', 'revoked']] as const) {
    const recovery = createTemplateRecovery(recoveryToken, storage, { request: (async () => reply(status, { error: message })) as typeof fetch });
    await assert.rejects(recovery.redeem, isKind(kind)); assert.equal(recovery.hasPending(), false); assert.equal(storage.getItem(pendingKey), null);
  }
  for (const raw of ['{', JSON.stringify({ token: recoveryToken, expiresAt: 1 }), JSON.stringify({ token: recoveryToken, expiresAt: Date.now() + 3600000 }), JSON.stringify({ token: {}, expiresAt: Date.now() + 10000 })]) {
    storage.setItem(pendingKey, raw); assert.equal(createTemplateRecovery('', storage).hasPending(), false); assert.equal(storage.getItem(pendingKey), null);
  }
});

test('unknown transport outcomes and invalid success bodies retain intent without automatic retries or unsafe continuation', async () => {
  const storage = privateSession(); let calls = 0;
  for (const mode of ['transport', 'json', 'receipt', 'path', 'server'] as const) {
    const request = (async () => { calls++; if (mode === 'transport') throw Error('network secret ' + recoveryToken); if (mode === 'json') return new Response('{'); if (mode === 'receipt') return reply(200, { receipt: 'invalid' }); if (mode === 'path') return reply(200, { receipt, continuePath: 'https://untrusted.invalid/?token=' + recoveryToken }); return reply(503, { error: 'provider secret ' + recoveryToken }); }) as typeof fetch;
    const recovery = createTemplateRecovery(recoveryToken, storage, { request }), before = calls;
    await assert.rejects(recovery.redeem, isKind('unavailable')); assert.equal(calls, before + 1); assert.equal(recovery.hasPending(), true); assert.equal(storage.getItem(receiptKey), null);
  }
});

test('unavailable session storage permits in-memory retry, while a completed old request cannot erase a newer recovery link', async () => {
  const disabled = { getItem() { throw Error('disabled'); }, setItem() { throw Error('disabled'); }, removeItem() { throw Error('disabled'); } }; let signedIn = false;
  const request = (async () => signedIn ? reply(200, recoverySuccess) : reply(401, { error: 'Sign in to the account that approved this page.' })) as typeof fetch;
  const memory = createTemplateRecovery(recoveryToken, disabled, { request }); await assert.rejects(memory.redeem, isKind('signin')); assert.equal(memory.storageAvailable(), false);
  signedIn = true; assert.equal((await memory.redeem()).saved, false); assert.equal(memory.hasPending(), false);
  const storage = privateSession(); let finish!: (response: Response) => void;
  const old = createTemplateRecovery(recoveryToken, storage, { request: (() => new Promise<Response>(resolve => { finish = resolve; })) as typeof fetch }); const oldPromise = old.redeem();
  const newToken = 'd'.repeat(64), next = createTemplateRecovery(newToken, storage); finish(reply(200, recoverySuccess)); await oldPromise;
  assert.equal(JSON.parse(storage.getItem(pendingKey)!).token, newToken); next.discard(); assert.equal(storage.getItem(pendingKey), null);
});

test('guest original recovery continues without an account or Playground redirect and explicit receipt arrival can discard stale intent', async () => {
  const storage = privateSession(), guest = createTemplateRecovery(recoveryToken, storage, { request: (async () => reply(200, { receipt })) as typeof fetch });
  assert.deepEqual(await guest.redeem(), { receipt, saved: true }); assert.equal(storage.getItem(receiptKey), receipt);
  const stale = createTemplateRecovery(recoveryToken, storage); stale.discard(); assert.equal(stale.hasPending(), false); assert.equal(storage.getItem(pendingKey), null);
});
