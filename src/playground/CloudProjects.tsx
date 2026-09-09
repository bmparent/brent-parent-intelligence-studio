import { useRef, useState } from 'react';
import { validateProject, type Project } from './model';
import { Purchases } from './Purchases';

type Saved = { id: string; name: string; head: string; updated_at: string };
type Revision = { id: string; created_at: string };
async function api(query = '', input?: unknown) {
  const response = await fetch('/api/playground/projects' + query, {
    credentials: 'same-origin',
    ...(input ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Cloud projects are temporarily unavailable. Your local copy is safe.');
  return result;
}
export function CloudProjects({ project, load, disabled }: { project: Project; load: (p: Project) => void; disabled: boolean }) {
  const [projects, setProjects] = useState<Saved[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [active, setActive] = useState<{id: string; head: string} | null>(null);
  const [saved, setSaved] = useState('');
  const [message, setMessage] = useState('Cloud saves are manual. Local autosave stays on.');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try { await action(); } catch (error) { setMessage((error as Error).message); }
    finally { lock.current = false; setBusy(false); }
  }
  async function refresh() { setProjects((await api()).projects); }
  async function save(copy: boolean) {
    const snapshot = JSON.stringify(project);
    setMessage('Saving to your account…');
    const result = await api('', { document: project, ...(!copy && active ? {id: active.id, expectedRevision: active.head} : {}) });
    setActive({id: result.id, head: result.revision}); setSaved(snapshot); setRevisions([]);
    setMessage('Saved to your account.');
    await refresh();
  }
  async function open(id: string, revision?: string) {
    const result = await api('?id=' + encodeURIComponent(id) + (revision ? '&revision=' + encodeURIComponent(revision) : ''));
    const document = validateProject(result.document);
    load(document); setActive({id, head: result.head});
    setSaved(revision && revision !== result.head ? '' : JSON.stringify(document));
    setMessage(revision ? 'Revision opened. Save to make it the latest revision. Undo restores your previous local design.' : 'Project opened. Undo restores your previous local design.');
    setRevisions((await api('?id=' + encodeURIComponent(id) + '&revisions=1')).revisions);
  }
  return <details className="pg-project-tools">
    <summary>Account projects</summary>
    <p><a href="/account" target="_blank" rel="noreferrer">Sign in with your Eidos account</a>, then refresh this list.</p>
    <button disabled={busy} onClick={() => void run(async () => {await refresh(); setMessage('Project list refreshed.');})}>Refresh account projects</button>
    <button disabled={busy || disabled} onClick={() => void run(() => save(false))}>{active ? 'Save account revision' : 'Import into my account'}</button>
    <button disabled={busy || disabled} onClick={() => void run(() => save(true))}>Save as new account project</button>
    <p role="status">{message}{active && saved !== JSON.stringify(project) ? ' Current design has changes not saved to your account.' : ''}</p>
    {projects.map(p => <button disabled={busy || disabled} key={p.id} onClick={() => void run(() => open(p.id))}>{p.name} {active?.id === p.id ? '(open)' : ''}</button>)}
    {active && revisions.length > 0 && <label>Open a revision
      <select value="" disabled={busy || disabled} onChange={e => { if(e.target.value) void run(() => open(active.id, e.target.value)); }}>
        <option value="">Choose saved revision</option>
        {revisions.map(r => <option key={r.id} value={r.id}>{new Date(r.created_at).toLocaleString()} · {r.id.slice(0,8)}</option>)}
      </select>
    </label>}
    <Purchases active={active} dirty={saved !== JSON.stringify(project)} />
  </details>;
}
