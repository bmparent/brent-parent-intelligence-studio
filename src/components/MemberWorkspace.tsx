import { useEffect, useState, type FormEvent } from 'react';
import { post, usePublicConfig } from '../lib/platform';
import { PasswordField } from './AccountAccess';

type Project = { id: string; name: string; updated_at: string };
type Purchase = { id: string; name: string; status: string; mode: string; created_at: string };
export function MemberWorkspace({ username, email }: { username: string; email?: string }) {
  const [projects, setProjects] = useState<Project[]>([]), [purchases, setPurchases] = useState<Purchase[]>([]), [busy, setBusy] = useState(true), [error, setError] = useState(''), [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const responses = await Promise.all(['/api/playground/projects', '/api/playground/purchases'].map(url => fetch(url, { signal: controller.signal, cache: 'no-store' })));
        if (responses.some(r => !r.ok)) throw Error('Your projects or orders could not load. Please refresh.');
        const [p, o] = await Promise.all(responses.map(r => r.json()));
        if (!controller.signal.aborted) { setProjects(p.projects); setPurchases(o.purchases); setError(''); }
      } catch (e) { if (!controller.signal.aborted) setError((e as Error).message); }
      finally { if (!controller.signal.aborted) setBusy(false); }
    }
    void load(); return () => controller.abort();
  }, [username, version]);
  async function get(id: string) {
    setError('');
    try {
      const response = await fetch('/api/playground/purchases', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!response.ok) throw Error('This export is not available to your account. Refresh your orders.');
      const { download } = await import('../playground/export');
      download(new Uint8Array(await response.arrayBuffer()), 'eidos-purchased-export.zip', 'application/zip');
    } catch (e) { setError((e as Error).message); }
  }
  return <>
    <section className="ew-member-card ew-member-wide" aria-busy={busy}>
      <p className="ew-eyebrow">Your Playground</p><h2>Pick up your next idea.</h2>
      <p>@{username} · {email}</p>
      <div className="ew-member-toolbar"><a className="ew-button ew-button--primary" href="/playground/">Open Playground</a><button onClick={() => { setBusy(true); setVersion(v => v + 1); }} disabled={busy}>Refresh projects and orders</button></div>
      {busy && <p role="status">Loading your saved work…</p>}{error && <p role="alert">{error}</p>}
      {projects.length ? <><h3>Recently edited</h3><ul className="ew-member-projects">{projects.slice(0, 3).map(p => <li key={p.id}><a href={'/playground/?open=' + encodeURIComponent(p.id)}>{p.name}</a><time dateTime={p.updated_at}>{new Date(p.updated_at).toLocaleString()}</time></li>)}</ul>
        <details><summary>All saved projects ({projects.length})</summary><ul className="ew-member-list">{projects.map(p => <li key={p.id}><a href={'/playground/?open=' + encodeURIComponent(p.id)}>{p.name}</a></li>)}</ul></details>
      </> : !busy && !error && <p>Save a project to your account in Playground to return to it from any device.</p>}
    </section>
    <section className="ew-member-card"><p className="ew-eyebrow">Purchased exports</p><h2>Your orders.</h2>
      {purchases.length ? <ul className="ew-member-list">{purchases.map(p => <li key={p.id}><div><strong>{p.name}</strong><p>{p.mode === 'test' ? 'Test order · ' : ''}{p.status}</p></div><button disabled={p.status !== 'paid'} onClick={() => void get(p.id)}>Download purchased export</button></li>)}</ul> : <p>Your purchased exports will appear here. Free Playground exports are always available in the editor.</p>}
    </section>
  </>;
}

export function MemberSecurity() {
  const config = usePublicConfig();
  const [security, setSecurity] = useState<{ hasPassword: boolean; googleLinked: boolean } | null>(null), [current, setCurrent] = useState(''), [password, setPassword] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  useEffect(() => {
    const oauth = new URLSearchParams(location.search).get('oauth');
    if (!oauth) return;
    queueMicrotask(() => {
      if (oauth === 'success') setMessage('Google sign-in is connected. Your existing account and projects are unchanged.');
      if (oauth === 'collision') setError('Google could not be linked because these identities belong to different accounts. Your existing account is unchanged.');
      if (oauth === 'error') setError('Google linking could not finish. Please try again.');
      history.replaceState(null, '', location.pathname);
    });
  }, []);
  useEffect(() => {
    if (!config?.passwordsReady) return;
    const controller = new AbortController();
    fetch('/api/members/credentials', { signal: controller.signal, cache: 'no-store' }).then(async r => { if (!r.ok) throw Error('Security settings could not load. Reload to try again.'); return r.json(); }).then(setSecurity).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [config?.passwordsReady]);
  async function change(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try { const result = await post<{ message: string }>('/api/members/credentials', { action: 'change-password', currentPassword: current, password }); setCurrent(''); setPassword(''); setMessage(result.message); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function link() {
    setBusy(true); setError('');
    try { const result = await post<{ authorizeUrl: string }>('/api/members/google', { action: 'link', currentPassword: current }); const url = new URL(result.authorizeUrl); if (url.origin !== 'https://accounts.google.com' || url.pathname !== '/o/oauth2/v2/auth') throw Error('Google sign-in could not start.'); location.assign(url.href); }
    catch (e) { setError((e as Error).message); setBusy(false); }
  }
  return <section className="ew-member-card"><p className="ew-eyebrow">Account security</p><h2>Sign in your way.</h2>
    {!security && config?.passwordsReady && !error ? <p role="status">Loading security settings…</p> : security?.hasPassword ? <form className="ew-form-stack" onSubmit={change} aria-busy={busy}><PasswordField label="Current password" value={current} onChange={setCurrent} current /><PasswordField label="New password" value={password} onChange={setPassword} /><button className="ew-button ew-button--secondary" disabled={busy}>Change password</button></form> : config?.passwordsReady && <p>Use <a href="/account/reset">password recovery</a> to request an email and set your first password.</p>}
    {security?.googleLinked ? <p>Google is linked to this account.</p> : config?.googleReady ? <><p>{security?.hasPassword ? 'Enter your current password above, then link your Google account.' : 'Link Google while signed in to keep your existing username and projects.'}</p><button className="ew-button ew-button--secondary" disabled={busy} onClick={() => void link()}>Link Google account</button></> : <p>Google sign-in is being connected.</p>}
    {message && <p role="status">{message}</p>}{error && <p role="alert">{error}</p>}
  </section>;
}
