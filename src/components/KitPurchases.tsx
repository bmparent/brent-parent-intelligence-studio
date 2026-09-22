import { useEffect, useState } from 'react';
import { accountEpoch } from '../lib/accountEpoch';
type Purchase = { id: string; status: string; created_at: string; archive_digest: string | null };
export function KitPurchases({ username }: { username: string }) {
  const [orders, setOrders] = useState<Purchase[]>([]), [error, setError] = useState(''), [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/shop/purchases', { signal: controller.signal, cache: 'no-store' }).then(async r => {
      if (!r.ok) throw Error('Kit purchases could not load. Retry after signing in.');
      return r.json();
    }).then(value => { if (!controller.signal.aborted) { setOrders(value.purchases); setError(''); } }).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [username, refresh]);
  async function download(id: string) {
    const epoch = accountEpoch();
    try {
      const response = await fetch('/api/shop/purchases', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!response.ok) throw Error('This download is unavailable. Refresh the purchase status or contact billing.');
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (epoch !== accountEpoch()) return;
      const { download: save } = await import('../playground/export');
      save(bytes, 'eidos-cinematic-starter-v1.zip', 'application/zip');
    } catch (e) { if (epoch === accountEpoch()) setError((e as Error).message); }
  }
  return <section className="ew-member-card"><h2>Cinematic Starter purchases</h2>
    <p>Recover purchases linked to this account or its verified checkout email. No receipt token is needed here.</p>
    <button type="button" onClick={() => setRefresh(v => v + 1)}>Refresh kit purchases</button>
    {error && <p role="alert">{error}</p>}
    {orders.length ? <ul className="ew-member-list">{orders.map(order => <li key={order.id}><div><strong>Cinematic Starter v1</strong><p>{order.status} · {new Date(order.created_at).toLocaleDateString()}</p><small>Reference: {order.id}</small></div><button disabled={order.status !== 'paid'} onClick={() => void download(order.id)}>Download kit</button></li>)}</ul> : <p>No linked kit purchases yet. Older purchases without a recorded checkout email can still use their original receipt; billing can help with the payment reference.</p>}
  </section>;
}
