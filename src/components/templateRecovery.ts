type SessionStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
type Pending = { token: string; expiresAt: number };
export type RecoveryResult = { receipt: string; continuePath?: string; saved?: boolean };
const key = 'eidos.template.pending-recovery';
const receiptKey = 'eidos.template.receipt';
const tokenPattern = /^[a-f0-9]{64}$/;
const lifetime = 30 * 60 * 1000;
export class TemplateRecoveryError extends Error {
  constructor(message: string, public kind: 'signin' | 'owner' | 'expired' | 'revoked' | 'unavailable') { super(message); }
}
/** Private tab-local recovery intent. No token belongs in a query string or log. */
export function createTemplateRecovery(token: string, storage: SessionStore, { now = Date.now, request = fetch }: { now?: () => number; request?: typeof fetch } = {}) {
  let pending: Pending | null = null, storageAvailable = true;
  try {
    const raw = storage.getItem(key);
    let value: Pending | null = null;
    try { value = raw && raw.length < 300 ? JSON.parse(raw) as Pending : null; } catch { /* Discard malformed local data below. */ }
    if (value && typeof value.token === 'string' && tokenPattern.test(value.token) && Number.isSafeInteger(value.expiresAt) && value.expiresAt > now() && value.expiresAt <= now() + lifetime) pending = value;
    else if (raw) storage.removeItem(key);
  } catch { storageAvailable = false; }
  if (tokenPattern.test(token)) {
    if (pending?.token !== token) pending = { token, expiresAt: now() + lifetime };
    try { storage.setItem(key, JSON.stringify(pending)); } catch { storageAvailable = false; }
  }
  let inFlight: Promise<RecoveryResult> | null = null, completed: RecoveryResult | null = null;
  function forget(expected: Pending) {
    pending = null;
    try { const saved = JSON.parse(storage.getItem(key) || 'null') as Pending | null; if (saved?.token === expected.token) storage.removeItem(key); } catch { storageAvailable = false; }
  }
  async function submit(): Promise<RecoveryResult> {
    const captured = pending;
    if (!captured || captured.expiresAt <= now()) {
      if (captured) forget(captured);
      throw new TemplateRecoveryError('This recovery link expired. Request a fresh email below.', 'expired');
    }
    let response: Response, data: Record<string, unknown>;
    try {
      response = await request('/api/shop/redeem', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: captured.token }), signal: AbortSignal.timeout(25000) });
      data = await response.json();
    } catch { throw new TemplateRecoveryError('Recovery could not be confirmed. Your private link is kept in this tab; retry after signing in or request a fresh email.', 'unavailable'); }
    const message = typeof data?.error === 'string' ? data.error : '';
    if (!response.ok) {
      if (response.status === 401 && message === 'Sign in to the account that approved this page.') throw new TemplateRecoveryError('Sign in to the account that approved this page, then retry this private recovery link here.', 'signin');
      if (response.status === 403 && ['This purchase belongs to another account.', 'This approved page belongs to another account.'].includes(message)) throw new TemplateRecoveryError('This purchase belongs to another account. Switch to its owner account, then retry here.', 'owner');
      if (response.status === 401 && message === 'This recovery link is invalid or expired.') { forget(captured); throw new TemplateRecoveryError('This recovery link expired or was already used. Request a fresh email below.', 'expired'); }
      if (response.status === 403 && message === 'This approved page purchase was revoked.') { forget(captured); throw new TemplateRecoveryError('This approved page purchase was revoked. Contact billing if you need help.', 'revoked'); }
      throw new TemplateRecoveryError('Recovery is temporarily unavailable. Your private link is kept in this tab; retry or request a fresh email.', 'unavailable');
    }
    if (!data || typeof data.receipt !== 'string' || !tokenPattern.test(data.receipt) || (data.continuePath !== undefined && data.continuePath !== '/playground/?checkout=returned#receipt=' + data.receipt))
      throw new TemplateRecoveryError('The recovery response could not be verified. Keep this tab open and request a fresh email if retry reports the link was already used.', 'unavailable');
    let saved = true;
    try { storage.setItem(receiptKey, data.receipt); } catch { storageAvailable = false; saved = false; }
    forget(captured);
    completed = { receipt: data.receipt, ...(typeof data.continuePath === 'string' ? { continuePath: data.continuePath } : {}), saved };
    return completed;
  }
  return {
    hasPending: () => Boolean(pending && pending.expiresAt > now()),
    storageAvailable: () => storageAvailable,
    discard() { if (pending) forget(pending); },
    redeem() {
      if (completed) return Promise.resolve(completed);
      if (!inFlight) inFlight = submit().finally(() => { inFlight = null; });
      return inFlight;
    },
  };
}
