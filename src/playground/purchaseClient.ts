import { hashBytes, type FrozenPackage } from './purchaseSnapshot';

export type DeliveryProduct = { productId: string; editionId: 'developer'; version: string; priceCents: number; currency: 'usd'; parentArchiveSha256: string; parentArchiveBytes: number };
export type DeliveryCapabilities = { mode: 'test'; ownerId: string; available: boolean; reason: string; limits: { snapshotBytes: number; archiveBytes: number }; products: DeliveryProduct[]; turnstileSiteKey: string; localTest: boolean };
export type AcceptedDelivery = { id: string; ownerId: string; documentId: string; revision: number; snapshotHash: string; projectHash: string; archiveSha256: string; archiveBytes: number; mode: 'test' };
export type ApprovedPage = Omit<AcceptedDelivery, 'id'> & { deliveryId: string; state: 'pending' | 'ready' | 'revoked'; output: string; downloadName: string; parent: { productId: string; editionId: string; version: string; archiveSha256: string; archiveBytes: number; licenseId: string } };
export type DeliveryPurchase = { status: string; paymentState?: string; mailStatus?: string; orderId: string; productId: string; editionId: string; version: string; downloadName?: string; downloadToken?: string; approvedPage: ApprovedPage };
export type PurchaseAttempt = { ownerId: string; snapshotHash: string; delivery: AcceptedDelivery; receipt: string };
type Fetch = typeof fetch;
const hash = /^[a-f0-9]{64}$/, id = /^[a-zA-Z0-9_-]{1,100}$/;
const validId = (value: unknown): value is string => typeof value === 'string' && id.test(value);
export type PurchaseOwner = Pick<DeliveryCapabilities, 'ownerId'>;
function object(value: unknown): Record<string, unknown> { if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error('The server response is incomplete. Your local package is unchanged.'); return value as Record<string, unknown>; }
const integer = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const string = (value: unknown, max = 200) => typeof value === 'string' && value.length <= max;
export class PurchaseRequestError extends Error { status: number; constructor(status: number, message: string) { super(message); this.status = status; } }
export async function jsonRequest(path: string, input: unknown | undefined, request: Fetch): Promise<Record<string, unknown>> {
  const response = await request(path, { credentials: 'same-origin', cache: 'no-store', ...(input === undefined ? {} : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }), signal: AbortSignal.timeout(25000) });
  let body: Record<string, unknown>;
  try { body = object(await response.json()); } catch { throw new PurchaseRequestError(response.status, 'Purchase service could not be verified. Your local package is unchanged.'); }
  if (!response.ok) throw new PurchaseRequestError(response.status, string(body.error, 500) ? body.error as string : 'Purchase service is unavailable. Your local package is unchanged.');
  return body;
}
export function validateCapabilities(input: unknown): DeliveryCapabilities {
  const value = object(input), limits = object(value.limits);
  if (value.mode !== 'test' || !validId(value.ownerId) || typeof value.available !== 'boolean' || (value.reason !== null && !string(value.reason, 500)) || !Array.isArray(value.products) || value.products.length > 20 || !integer(limits.snapshotBytes) || !integer(limits.archiveBytes) || !limits.snapshotBytes || !limits.archiveBytes || typeof value.localTest !== 'boolean' || !string(value.turnstileSiteKey, 200)) throw Error('This server does not provide a supported TEST purchase capability.');
  const products = value.products.map(item => {
    const product = object(item);
    if (!validId(product.productId) || product.editionId !== 'developer' || !string(product.version, 40) || !product.version || !integer(product.priceCents) || Number(product.priceCents) <= 0 || product.currency !== 'usd' || !hash.test(String(product.parentArchiveSha256)) || !integer(product.parentArchiveBytes) || !product.parentArchiveBytes) throw Error('The server product, price, or version could not be verified.');
    return product as DeliveryProduct;
  });
  if (new Set(products.map(product => product.productId)).size !== products.length) throw Error('The server returned duplicate products.');
  return { mode: 'test', ownerId: value.ownerId as string, available: value.available, reason: value.reason as string || '', limits: { snapshotBytes: limits.snapshotBytes as number, archiveBytes: limits.archiveBytes as number }, products, turnstileSiteKey: value.turnstileSiteKey as string, localTest: value.localTest };
}
export async function fetchDeliveryCapabilities(request: Fetch = fetch) { return validateCapabilities((await jsonRequest('/api/playground/delivery?capabilities=1', undefined, request)).capabilities); }
export function matchingProduct(capabilities: DeliveryCapabilities, frozen: FrozenPackage): DeliveryProduct | null {
  const parent = frozen.snapshot.parent;
  if (!parent) return null;
  return capabilities.products.find(product => product.productId === parent.editionId && product.version === parent.version && product.parentArchiveSha256 === parent.sha256 && product.parentArchiveBytes === parent.bytes) || null;
}
export function assertPurchaseCapability(capabilities: DeliveryCapabilities, frozen: FrozenPackage): DeliveryProduct {
  if (!capabilities.available || capabilities.mode !== 'test') throw Error(capabilities.reason || 'Purchase is not enabled. Your local package remains available.');
  const product = matchingProduct(capabilities, frozen);
  if (!product) throw Error('Choose the matching server-available parent edition and prepare a new review. The current frozen package is unchanged.');
  if (new TextEncoder().encode(JSON.stringify(frozen.snapshot)).length > capabilities.limits.snapshotBytes || frozen.archive.length > capabilities.limits.archiveBytes) throw Error('This review exceeds the server size limit. Reduce image sizes in a new draft; your local package is unchanged.');
  return product;
}
export function validateAcceptedDelivery(input: unknown, capabilities: PurchaseOwner, frozen: FrozenPackage): AcceptedDelivery {
  const value = object(input), snapshot = frozen.snapshot;
  if (!validId(value.id) || value.mode !== 'test' || value.ownerId !== capabilities.ownerId || value.documentId !== snapshot.documentId || value.revision !== snapshot.revision || value.snapshotHash !== snapshot.snapshotHash || value.projectHash !== snapshot.projectHash || value.archiveSha256 !== frozen.receipt.archiveSha256 || value.archiveBytes !== frozen.archive.length) throw Error('The server did not accept this exact owner, revision, and package. Your local review is unchanged.');
  return { id: value.id as string, mode: 'test', ownerId: value.ownerId as string, documentId: value.documentId as string, revision: value.revision as number, snapshotHash: value.snapshotHash as string, projectHash: value.projectHash as string, archiveSha256: value.archiveSha256 as string, archiveBytes: value.archiveBytes as number };
}
export async function acceptFrozenDelivery(capabilities: DeliveryCapabilities, frozen: FrozenPackage, requestId: string, request: Fetch = fetch): Promise<AcceptedDelivery> {
  assertPurchaseCapability(capabilities, frozen);
  if (!/^[a-zA-Z0-9_-]{8,100}$/.test(requestId)) throw Error('The frozen submission reference is invalid.');
  return validateAcceptedDelivery((await jsonRequest('/api/playground/delivery', { requestId, snapshot: frozen.snapshot }, request)).delivery, capabilities, frozen);
}
export async function fetchAcceptedDelivery(deliveryId: string, capabilities: DeliveryCapabilities, frozen: FrozenPackage, request: Fetch = fetch) {
  if (!id.test(deliveryId)) throw Error('The accepted page reference is invalid.');
  return validateAcceptedDelivery((await jsonRequest('/api/playground/delivery?id=' + encodeURIComponent(deliveryId), undefined, request)).delivery, capabilities, frozen);
}
export async function startFrozenCheckout(capabilities: DeliveryCapabilities, frozen: FrozenPackage, accepted: AcceptedDelivery, receipt: string, terms: boolean, challenge: string, request: Fetch = fetch): Promise<string> {
  const product = assertPurchaseCapability(capabilities, frozen); validateAcceptedDelivery(accepted, capabilities, frozen);
  if (!hash.test(receipt) || !terms || !challenge) throw Error('Review the terms and complete verification before continuing.');
  const result = await jsonRequest('/api/shop/checkout', { productId: product.productId, editionId: product.editionId, deliveryId: accepted.id, acceptTerms: true, attempt: receipt, challenge }, request);
  let url: URL; try { url = new URL(String(result.url)); } catch { throw Error('The secure checkout address could not be verified. Keep this attempt and check its status.'); }
  if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' || url.username || url.password || url.port) throw Error('The secure checkout address could not be verified. Keep this attempt and check its status.');
  return url.href;
}
export function validateDeliveryPurchase(input: unknown, capabilities: PurchaseOwner, frozen: FrozenPackage, accepted: AcceptedDelivery): DeliveryPurchase {
  const value = object(input), page = object(value.approvedPage);
  const expected = frozen.snapshot.parent;
  if (page.state === 'sign_in_required') throw Error('Sign in to the account that owns this approved page.');
  const parent = object(page.parent);
  if (!expected || !validId(value.orderId) || !string(value.status, 50) || value.productId !== expected.editionId || value.editionId !== 'developer' || value.version !== expected.version || !['pending', 'ready', 'revoked'].includes(String(page.state)) || page.deliveryId !== accepted.id || page.output !== frozen.snapshot.output || !string(page.downloadName, 200)) throw Error('This purchase does not match the reviewed page and original edition.');
  validateAcceptedDelivery({ ...page, id: page.deliveryId }, capabilities, frozen);
  if (parent.productId !== expected.editionId || parent.editionId !== 'developer' || parent.version !== expected.version || parent.archiveSha256 !== expected.sha256 || parent.archiveBytes !== expected.bytes || parent.licenseId !== expected.license.id) throw Error('The purchased original edition does not match the frozen reference.');
  return value as DeliveryPurchase;
}
export async function fetchDeliveryPurchase(receipt: string, capabilities: PurchaseOwner, frozen: FrozenPackage, accepted: AcceptedDelivery, request: Fetch = fetch) {
  if (!hash.test(receipt)) throw Error('The private purchase reference is invalid.');
  return validateDeliveryPurchase(await jsonRequest('/api/shop/status', { receipt }, request), capabilities, frozen, accepted);
}
export async function inspectReturnedPurchase(receipt: string, capabilities: PurchaseOwner, frozen: FrozenPackage, request: Fetch = fetch) {
  if (!hash.test(receipt)) throw Error('The private purchase reference is invalid.');
  const result = await jsonRequest('/api/shop/status', { receipt }, request), page = object(result.approvedPage);
  if (page.state === 'sign_in_required') throw Error('Sign in to the account that owns this approved page.');
  const accepted = validateAcceptedDelivery({ ...page, id: page.deliveryId }, capabilities, frozen);
  return { attempt: { ownerId: capabilities.ownerId, snapshotHash: frozen.snapshot.snapshotHash, receipt, delivery: accepted }, purchase: validateDeliveryPurchase(result, capabilities, frozen, accepted) };
}
export async function inspectOwnedPurchase(receipt: string, frozen: FrozenPackage, request: Fetch = fetch) {
  if (!hash.test(receipt)) throw Error('The private purchase reference is invalid.');
  const result = await jsonRequest('/api/shop/status', { receipt }, request), page = object(result.approvedPage);
  if (page.state === 'sign_in_required' || !validId(page.ownerId)) throw Error('Sign in to the account that owns this approved page.');
  const owner = { ownerId: page.ownerId }, accepted = validateAcceptedDelivery({ ...page, id: page.deliveryId }, owner, frozen);
  return { attempt: { ownerId: owner.ownerId, snapshotHash: frozen.snapshot.snapshotHash, receipt, delivery: accepted }, purchase: validateDeliveryPurchase(result, owner, frozen, accepted) };
}
export async function downloadDeliveryArtifact(artifact: 'original' | 'approved-page', receipt: string, capabilities: PurchaseOwner, frozen: FrozenPackage, accepted: AcceptedDelivery, request: Fetch = fetch) {
  const purchase = await fetchDeliveryPurchase(receipt, capabilities, frozen, accepted, request);
  if (purchase.status !== 'paid' || purchase.approvedPage.state !== 'ready' || !purchase.downloadToken) throw Error('Payment and this approved page must both be ready before download.');
  const response = await request('/api/shop/download', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ receipt, downloadToken: purchase.downloadToken, ...(artifact === 'approved-page' ? { artifact } : {}) }), signal: AbortSignal.timeout(25000) });
  if (!response.ok || !response.headers.get('content-type')?.includes('application/zip')) throw Error('The purchased archive could not be retrieved. Keep your local backup and try again.');
  const expectedBytes = artifact === 'approved-page' ? accepted.archiveBytes : frozen.snapshot.parent!.bytes;
  const expectedHash = artifact === 'approved-page' ? accepted.archiveSha256 : frozen.snapshot.parent!.sha256;
  const reader = response.body?.getReader(); if (!reader) throw Error('The archive response is missing.');
  const chunks: Uint8Array[] = []; let length = 0;
  try { while (true) { const { done, value } = await reader.read(); if (done) break; length += value.length; if (length > expectedBytes) { await reader.cancel(); throw Error('The purchased archive exceeds its verified size.'); } chunks.push(value); } } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  if (length !== expectedBytes || await hashBytes(bytes) !== expectedHash) throw Error('The purchased archive hash does not match. Do not repurchase; keep your local backup.');
  const name = (artifact === 'approved-page' ? purchase.approvedPage.downloadName : purchase.downloadName || 'original-template.zip').replace(/[^a-zA-Z0-9._-]/g, '');
  return { purchase, bytes, name };
}
export function newPurchaseReceipt() { return [...crypto.getRandomValues(new Uint8Array(32))].map(byte => byte.toString(16).padStart(2, '0')).join(''); }
const attemptKey = (owner: string, snapshot: string) => `eidos.playground.purchase.${owner}.${snapshot}`;
export function savePurchaseAttempt(value: PurchaseAttempt, storage: Pick<Storage, 'setItem'> = sessionStorage) { storage.setItem(attemptKey(value.ownerId, value.snapshotHash), JSON.stringify(value)); }
export function loadPurchaseAttempt(capabilities: DeliveryCapabilities, frozen: FrozenPackage, storage: Pick<Storage, 'getItem'> = sessionStorage): PurchaseAttempt | null {
  const raw = storage.getItem(attemptKey(capabilities.ownerId, frozen.snapshot.snapshotHash)); if (!raw) return null;
  const value = object(JSON.parse(raw));
  if (value.ownerId !== capabilities.ownerId || value.snapshotHash !== frozen.snapshot.snapshotHash || !hash.test(String(value.receipt))) throw Error('The saved purchase attempt belongs to a different review.');
  return { ownerId: capabilities.ownerId, snapshotHash: frozen.snapshot.snapshotHash, receipt: value.receipt as string, delivery: validateAcceptedDelivery(value.delivery, capabilities, frozen) };
}
const returnKey = 'eidos.playground.purchase-return';
const outboundKey = 'eidos.playground.checkout-attempt';
export function saveCheckoutReturn(receipt: string, storage: Pick<Storage, 'setItem'> = sessionStorage) {
  if (!hash.test(receipt)) throw Error('The private purchase reference is invalid.');
  storage.setItem(outboundKey, receipt);
}
export function capturePurchaseReturn(href: string, storage: Pick<Storage, 'setItem'> & Partial<Pick<Storage, 'getItem'>> = sessionStorage): { href: string; returned: boolean } {
  const url = new URL(href), state = url.searchParams.get('checkout');
  if (!['returned', 'cancelled'].includes(state || '')) return { href, returned: false };
  const receipt = new URLSearchParams(url.hash.slice(1)).get('receipt') || (state === 'cancelled' ? storage.getItem?.(outboundKey) : '') || '';
  storage.setItem(returnKey, JSON.stringify({ state, receipt: hash.test(receipt) ? receipt : '' }));
  url.searchParams.delete('checkout'); url.hash = '';
  return { href: url.pathname + url.search, returned: true };
}
export function purchaseReturn(storage: Pick<Storage, 'getItem'> = sessionStorage): { state: string; receipt: string } | null {
  try { const raw = storage.getItem(returnKey); if (!raw) return null; const value = object(JSON.parse(raw)); return ['returned', 'cancelled'].includes(String(value.state)) && (value.receipt === '' || hash.test(String(value.receipt))) ? value as { state: string; receipt: string } : null; } catch { return null; }
}
export function clearPurchaseReturn(storage: Pick<Storage, 'removeItem'> = sessionStorage) { storage.removeItem(returnKey); }
export function safePurchaseContinuePath(value: unknown, receipt: unknown): string | null {
  if (typeof value !== 'string' || !hash.test(String(receipt))) return null;
  const expected = '/playground/?checkout=returned#receipt=' + receipt;
  return value === expected ? expected : null;
}
