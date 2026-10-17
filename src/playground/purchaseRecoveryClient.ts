import { canonicalJson, frozenPackageFromArchive, hashBytes, type FrozenPackage } from './purchaseSnapshot';
import { jsonRequest, validateAcceptedDelivery, validateDeliveryPurchase, type DeliveryPurchase, type PurchaseAttempt } from './purchaseClient';

export type RecoveredPurchase = { archive: Uint8Array; downloadName: string; documentId: string; revision: number; snapshotHash: string; ownerId: string; originalProduct: string; originalVersion: string; frozen: FrozenPackage | null; limitation: string; purchase?: DeliveryPurchase; attempt?: PurchaseAttempt };
const object = (value: unknown) => { if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('Approved purchase metadata is missing.'); return value as Record<string, unknown>; };
const identifier = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);

/** Paid retrieval intentionally never asks current new-checkout capabilities,
 * prices, product availability, parent pins, or the renderer to rebuild a ZIP. */
export async function recoverApprovedPurchase(receipt: string, request: typeof fetch = fetch): Promise<RecoveredPurchase> {
  if (!/^[a-f0-9]{64}$/.test(receipt)) throw Error('The private purchase reference is invalid.');
  const status = await jsonRequest('/api/shop/status', { receipt }, request), page = object(status.approvedPage);
  if (page.state === 'sign_in_required' || !identifier(page.ownerId)) throw Error('Sign in to the account that owns this approved page, then try restoring it again.');
  if (status.status !== 'paid' || page.state !== 'ready') throw Error(`This approved purchase is not ready (${String(status.paymentState || status.status)}). Keep the receipt and check again after payment is verified.`);
  if (page.mode !== 'test' || !identifier(page.deliveryId) || !identifier(page.documentId) || !Number.isSafeInteger(page.revision) || Number(page.revision) < 0 || !/^[a-f0-9]{64}$/.test(String(page.snapshotHash)) || !/^[a-f0-9]{64}$/.test(String(page.archiveSha256)) || !Number.isSafeInteger(page.archiveBytes) || Number(page.archiveBytes) < 22 || Number(page.archiveBytes) > 48_000_000 || typeof status.downloadToken !== 'string') throw Error('The approved archive identity cannot be verified.');
  const response = await request('/api/shop/download', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ receipt, downloadToken: status.downloadToken, artifact: 'approved-page' }), signal: AbortSignal.timeout(25000) });
  if (!response.ok || !response.headers.get('content-type')?.includes('application/zip')) throw Error('The approved archive could not be retrieved. Sign in to its owner account and keep the receipt.');
  const reader = response.body?.getReader(); if (!reader) throw Error('The approved archive response is empty.');
  const chunks: Uint8Array[] = []; let total = 0;
  try { while (true) { const { done, value } = await reader.read(); if (done) break; total += value.length; if (total > Number(page.archiveBytes)) { await reader.cancel(); throw Error('The archive exceeds its recorded size.'); } chunks.push(value); } } finally { reader.releaseLock(); }
  const archive = new Uint8Array(total); let offset = 0; for (const chunk of chunks) { archive.set(chunk, offset); offset += chunk.length; }
  if (archive.length !== page.archiveBytes || await hashBytes(archive) !== page.archiveSha256) throw Error('The purchased archive does not match its immutable receipt. Do not repurchase.');
  const result: RecoveredPurchase = { archive, downloadName: (typeof page.downloadName === 'string' ? page.downloadName : 'approved-page.zip').replace(/[^a-zA-Z0-9._-]/g, ''), documentId: page.documentId, revision: Number(page.revision), snapshotHash: String(page.snapshotHash), ownerId: page.ownerId, originalProduct: String(status.productId || ''), originalVersion: String(status.version || ''), frozen: null, limitation: '' };
  try {
    const frozen = await frozenPackageFromArchive(archive), owner = { ownerId: page.ownerId };
    const accepted = validateAcceptedDelivery({ ...page, id: page.deliveryId }, owner, frozen), purchase = validateDeliveryPurchase(status, owner, frozen, accepted);
    const ownedSource = object((await jsonRequest('/api/playground/delivery?id=' + encodeURIComponent(page.deliveryId), undefined, request)).delivery);
    if (ownedSource.ownerId !== owner.ownerId || canonicalJson(ownedSource.snapshot) !== canonicalJson(frozen.snapshot) || canonicalJson(ownedSource.manifest) !== canonicalJson(frozen.manifest)) throw Error('The owned editable source differs from the approved archive.');
    result.frozen = frozen; result.purchase = purchase; result.attempt = { ownerId: owner.ownerId, snapshotHash: frozen.snapshot.snapshotHash, delivery: accepted, receipt };
  } catch (reason) {
    result.limitation = `The exact purchased ZIP is verified and available. This source cannot be reopened in this editor: ${(reason as Error).message}`;
  }
  return result;
}
