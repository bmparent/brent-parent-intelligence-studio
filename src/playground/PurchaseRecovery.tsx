import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { download } from './export';
import { recoverApprovedPurchase, type RecoveredPurchase } from './purchaseRecoveryClient';
import { savePurchaseAttempt } from './purchaseClient';
import type { FrozenPackage } from './purchaseSnapshot';
import './finish-purchase.css';

export function PurchaseRecovery({ receipt, restore, guard }: { receipt: string; restore(frozen: FrozenPackage): Promise<void>; guard(): () => boolean }) {
  const [result, setResult] = useState<RecoveredPurchase | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const lock = useRef(false), active = useRef(true), generation = useRef(0);
  useLayoutEffect(() => { generation.current++; }, [receipt]);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function run(action: (valid: () => void) => Promise<void>) {
    if (lock.current) return; lock.current = true; setBusy(true); setError('');
    const operation = ++generation.current, workspaceValid = guard();
    const valid = () => { if (!active.current || generation.current !== operation || !workspaceValid()) throw Error('The workspace changed. Restore the page again before opening a copy.'); };
    try { await action(valid); } catch (reason) { if (active.current) setError((reason as Error).message); } finally { lock.current = false; if (active.current) setBusy(false); }
  }
  async function restoreCopy(valid: () => void) {
    if (!result?.frozen) return;
    // Reauthorize immediately before editing; a prior successful read does not
    // authorize a different signed-in owner or a newly revoked purchase.
    const fresh = await recoverApprovedPurchase(receipt); valid();
    if (!fresh.frozen || fresh.ownerId !== result.ownerId || fresh.snapshotHash !== result.snapshotHash || fresh.frozen.receipt.archiveSha256 !== result.frozen.receipt.archiveSha256) throw Error('The signed-in account or approved source changed. Restore the purchase again.');
    if (fresh.attempt) savePurchaseAttempt(fresh.attempt);
    await restore(fresh.frozen);
  }
  return <section className="pg-recovery-panel" aria-label="Restore purchased page"><div><span>Private purchase return</span><h2>Bring your approved page back.</h2><p>Sign in to the account that owns this receipt. Restore the purchased page even if this browser has no saved project. Your existing drafts stay separate.</p><a href="/account" target="_blank" rel="noreferrer">Sign in to your Eidos account</a></div><div>
    {!result && <button disabled={busy} onClick={() => void run(async valid => { const recovered = await recoverApprovedPurchase(receipt); valid(); setResult(recovered); })}>{busy ? 'Checking your purchased files…' : 'Restore my approved page'}</button>}
    {result && <><p>Verified approved page · revision {result.revision}<br />Original template kept separate: {result.originalProduct} · {result.originalVersion}</p><button disabled={busy} onClick={() => download(result.archive, result.downloadName, 'application/zip')}>Download exact approved ZIP</button>{result.frozen && <button disabled={busy} onClick={() => void run(restoreCopy)}>Open a new editable copy</button>}{result.limitation && <p role="status">{result.limitation}</p>}<small>Existing purchased downloads and recovery remain available on <a href={`/shop/start#receipt=${receipt}`}>your purchase page</a>. No new checkout is started here.</small></>}
    {error && <p role="alert">{error}</p>}
  </div></section>;
}
