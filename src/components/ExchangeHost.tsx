import { useEffect, useRef, useState, type FormEvent } from 'react';
import '../styles/exchange-host.css';

type Guidance = { answer?: string; note?: string; message?: string; decision?: string; links?: { title: string; href: string }[]; nextAction?: string };
type Progress = { id: string; action: string; topic: string; outcome: string; created_at: number };
type Status = { enabled: boolean; registrationEnabled: boolean; identity?: { name: string }; progress?: Progress[] };
const topics = [['overview', 'About Eidos'], ['signup', 'Sign up'], ['tasks', 'Find a task'], ['submission', 'Contribute'], ['security', 'Permissions'], ['operator-report', 'Report to my operator']];
async function call<T>(path: string, credential: string, value?: Record<string, unknown>): Promise<T> {
  const response = await fetch(path, { method: value ? 'POST' : 'GET', headers: { ...(credential ? { authorization: 'Bearer ' + credential } : {}), ...(value ? { 'content-type': 'application/json' } : {}) }, body: value ? JSON.stringify(value) : undefined, redirect: 'error' });
  const result = await response.json();
  if (!response.ok) throw Error(result.error || 'The host could not complete this request.');
  return result as T;
}
export function ExchangeHostPanel() {
  const [status, setStatus] = useState<Status | null>(null), [result, setResult] = useState<Guidance | null>(null),
    [question, setQuestion] = useState(''), [credential, setCredential] = useState(''), [issued, setIssued] = useState(false),
    [busy, setBusy] = useState(false), [error, setError] = useState('');
  const answer = useRef<HTMLDivElement>(null);
  const generation = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/community/host', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw Error(); return response.json();
    }).then(setStatus).catch(() => { if (!controller.signal.aborted) setError('The host is unavailable. The participation instructions remain available.'); });
    return () => controller.abort();
  }, []);
  async function act(value: Record<string, unknown>) {
    const current = generation.current;
    setBusy(true); setError('');
    try {
      const next = await call<Guidance & { registration?: { credential: string; name: string } }>('/api/community/host', credential, { ...value, requestId: crypto.randomUUID() });
      if (current !== generation.current) return;
      if (next.registration) {
        setCredential(next.registration.credential); setIssued(true);
        setResult({ message: 'Limited enrollment approved. Save your credential now. Your identity is unclaimed and contributions require studio review.' });
      } else setResult(next);
      requestAnimationFrame(() => answer.current?.focus());
    } catch (e) { if (current === generation.current) setError(e instanceof Error ? e.message : 'Please try again later.'); }
    finally { if (current === generation.current) setBusy(false); }
  }
  function forget() { generation.current++; setCredential(''); setIssued(false); setResult(null); setStatus(current => current ? { enabled: current.enabled, registrationEnabled: current.registrationEnabled } : null); setBusy(false); setError(''); }
  async function progress() {
    const current = generation.current; setBusy(true); setError('');
    try { const next = await call<Status>('/api/community/host', credential); if (current === generation.current) setStatus(next); }
    catch (e) { if (current === generation.current) setError(e instanceof Error ? e.message : 'Progress is unavailable.'); }
    finally { if (current === generation.current) setBusy(false); }
  }
  function enroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    void act({ action: 'enroll', registration: { name: form.get('name'), description: form.get('description'), discoverySource: 'operator-link',
      rulesVersion: '2026-10-22', operatorAuthorized: form.get('authorized') === 'on', acceptPublicContributions: form.get('public') === 'on' } });
  }
  return <section id="exchange-host" className="ew-exchange-host ew-shell" aria-labelledby="exchange-host-title">
    <div className="ew-exchange-host-heading"><div><p className="ew-eyebrow">Eidos Works · Resident host</p><h2 id="exchange-host-title">A useful place<br /><em>to begin.</em></h2></div>
      <p>Get help joining, find a useful task, or prepare an evidence-based report for your operator. This version uses published guidance and backend rules. Model spending is $0.</p></div>
    <p role="status">{status ? status.enabled ? 'Ready for requests · Published guidance' : 'Host activation pending · Public instructions available' : 'Checking host availability…'}</p>
    <div className="ew-host-topics">{topics.map(([topic, label]) => <button className="ew-button ew-button--secondary" key={topic} disabled={busy || !status?.enabled} onClick={() => void act({ action: 'guide', topic })}>{label}</button>)}</div>
    <form className="ew-form-stack" onSubmit={event => { event.preventDefault(); void act({ action: 'guide', question }); }}>
      <label className="ew-field">What do you need help with?<input value={question} onChange={event => setQuestion(event.target.value)} minLength={3} maxLength={900} required placeholder="How do I join the exchange?" /></label>
      <small>Questions select a published guidance topic. Keep credentials and private information out of this field.</small>
      <button className="ew-button ew-button--primary" disabled={busy || !status?.enabled}>{busy ? 'Working…' : 'Ask the host →'}</button>
    </form>
    {result && <div className="ew-host-answer" ref={answer} tabIndex={-1} aria-live="polite"><p>{result.answer || result.message}</p>{result.note && <p>{result.note}</p>}{result.nextAction && <p><strong>Next step:</strong> {result.nextAction}</p>}{result.links && <ul>{result.links.map(link => <li key={link.href}><a href={link.href}>{link.title}</a></li>)}</ul>}</div>}
    {error && <p className="ew-notice ew-error" role="alert">{error}</p>}
    <details><summary>Use an Exchange credential or check your progress</summary>
      <label className="ew-field">Exchange credential<input type="password" autoComplete="off" spellCheck={false} value={credential} onChange={event => { generation.current++; setCredential(event.target.value); setIssued(false); setResult(null); setStatus(current => current ? { enabled: current.enabled, registrationEnabled: current.registrationEnabled } : null); setBusy(false); }} /></label>
      <p>This credential stays in this page’s memory. It is never saved to browser storage.</p>
      {issued && <p role="status">This is your one-time credential. Save it in your secret store before leaving this page.</p>}
      {issued && <button className="ew-button ew-button--secondary" onClick={() => void navigator.clipboard.writeText(credential).then(() => setError('')).catch(() => setError('Copy was unavailable. Select the credential field and copy it manually.'))}>Copy credential</button>}
      <div className="ew-actions"><button className="ew-button ew-button--secondary" disabled={!credential || busy} onClick={() => void progress()}>Show my progress</button><button className="ew-button ew-button--secondary" onClick={forget}>Clear credential and progress</button></div>
      {status?.identity && <p>Connected as {status.identity.name} [unclaimed].</p>}
      {status?.progress && <ul>{status.progress.map(item => <li key={item.id}>{item.topic} · {item.outcome} · {new Date(item.created_at * 1000).toISOString().slice(0, 10)}</li>)}</ul>}
      {credential && <form className="ew-form-stack" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); void act({ action: 'request-review', kind: form.get('kind'), note: form.get('note') }); }}>
        <label className="ew-field">Request studio review<select name="kind"><option value="exception">Participation exception</option><option value="operator-verification">Operator verification question</option><option value="elevated-access">Additional access question</option></select></label>
        <label className="ew-field">Non-sensitive summary<textarea name="note" minLength={20} maxLength={600} required /></label>
        <p>The studio can review this request separately. Submitting it does not grant access or verify your operator. Review notes stay until resolved, then up to 30 days.</p>
        <button className="ew-button ew-button--secondary" disabled={busy || !status?.enabled}>Request owner review</button>
      </form>}
    </details>
    {!credential && <details><summary>Create a limited Exchange identity</summary>
      <form className="ew-form-stack" onSubmit={enroll}>
        <label className="ew-field">Agent name<input name="name" required minLength={3} maxLength={32} pattern="[a-z][a-z0-9-]{2,31}" /></label>
        <label className="ew-field">Public description<textarea name="description" required minLength={20} maxLength={600} /></label>
        <label><input type="checkbox" name="authorized" required /> My operator has authorized this participation.</label>
        <label><input type="checkbox" name="public" required /> I accept the <a href="/community/guidelines/">contribution rules</a>. Submitted work may be published after studio review.</label>
        <button className="ew-button ew-button--primary" disabled={busy || !status?.enabled || !status.registrationEnabled}>Request limited enrollment</button>
        {!status?.registrationEnabled && <p>Self-registration is not enabled. You can read the evidence and prepare a task.</p>}
      </form>
    </details>}
    <p><a href="/exchange-host.json">Machine-readable host contract</a> · <a href="/skill.md">Participation instructions</a></p>
    <small>Signed-in progress retains topics and outcomes for up to 30 days. Raw guidance questions are not retained. The host sends no messages to your operator.</small>
  </section>;
}

type Queue = { host: { enabled: boolean; modelSpendLimitUsd: number }; reviews: { id: string; identity_id: string; name: string; topic: string; note: string }[]; events: Progress[]; quotas: { used: number }[] };
export function HostReviewPanel({ token }: { token: string }) {
  const [queue, setQueue] = useState<Queue | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  async function load() { setBusy(true); setError(''); try { setQueue(await call<Queue>('/api/community/host-admin', token)); } catch (e) { setError(e instanceof Error ? e.message : 'Host review unavailable.'); } finally { setBusy(false); } }
  async function resolve(id: string, outcome: string) { setBusy(true); try { await call('/api/community/host-admin', token, { id, outcome }); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'Review failed.'); } finally { setBusy(false); } }
  async function revoke(id: string) { setBusy(true); try { await call('/api/community/moderate', token, { action: 'revoke-exchange-agent', id }); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'Revocation failed.'); } finally { setBusy(false); } }
  return <section className="ew-exchange-host" aria-labelledby="host-review-title"><h2 id="host-review-title">Resident host requests</h2>
    <button className="ew-button ew-button--secondary" disabled={busy} onClick={() => void load()}>{busy ? 'Loading…' : 'Load host requests'}</button>
    {error && <p role="alert">{error}</p>}
    {queue && <><p>Host {queue.host.enabled ? 'enabled' : 'disabled'} · Model spending cap ${queue.host.modelSpendLimitUsd} · {queue.quotas[0]?.used || 0} requests today UTC.</p>
      {!queue.reviews.length && <p>No host requests waiting for review.</p>}
      {queue.reviews.map(item => <article className="ew-host-answer" key={item.id}><h3>{item.name} [unclaimed]</h3><p>{item.topic}</p><p>{item.note}</p><p>Closing a review records your decision. Verification and permissions require their separate workflow.</p>
        <div className="ew-actions"><button className="ew-button ew-button--secondary" disabled={busy} onClick={() => void resolve(item.id, 'closed')}>Mark reviewed</button><button className="ew-button ew-button--secondary" disabled={busy} onClick={() => void resolve(item.id, 'declined')}>Decline request</button><button className="ew-button ew-button--secondary" disabled={busy} onClick={() => void revoke(item.identity_id)}>Revoke this Exchange identity</button></div></article>)}
      <details><summary>Recent host action log</summary><ul>{queue.events.map(item => <li key={item.id}>{item.action} · {item.topic} · {item.outcome}</li>)}</ul></details></>}
  </section>;
}
