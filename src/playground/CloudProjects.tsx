import { useRef, useState } from 'react';
import { validateProject, type Project } from './model';
import { cloudPreflight } from './limits';
import type { SaveTarget } from './workspace';
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
export function CloudProjects({ project, target: active, documentId, guard, load, acknowledge, disabled }: {
  project: Project; target: SaveTarget | null; documentId: string; guard: () => () => boolean;
  load: (p: Project, target?: SaveTarget | null) => void;
  acknowledge: (id: string, target: SaveTarget) => void; disabled: boolean;
}) {
  const [projects, setProjects] = useState<Saved[]>([]);
  const [history, setHistory] = useState<{id:string; revisions:Revision[]} | null>(null);
  const [preview, setPreview] = useState<{project:Project; target:SaveTarget; valid:() => boolean} | null>(null);
  const [message, setMessage] = useState('Cloud saves are manual. Local autosave stays on.');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const preflight = cloudPreflight(project);
  async function run(action: (valid: () => boolean) => Promise<void>) {
    if (lock.current) return;
    const valid = guard();
    lock.current = true; setBusy(true);
    try { await action(valid); } catch (error) { if(valid()) setMessage((error as Error).message); }
    finally { lock.current = false; setBusy(false); }
  }
  async function refresh() { const result = await api(); setProjects(result.projects); return result.ownerId as string; }
  async function save(copy: boolean, valid: () => boolean) {
    if (!preflight.allowed) {setMessage(preflight.message); return;}
    const snapshot = JSON.stringify(project);
    const owner = await refresh();
    if (!valid()) {setMessage('Save canceled because the workspace changed.'); return;}
    if (active && active.owner !== owner) {setMessage('Your account changed. Open a project from this account, or import this design again to detach its previous owner before saving.'); return;}
    setMessage('Saving to your account…');
    const result = await api('', { document: project, expectedOwner:owner, ...(!copy && active ? {id: active.id, expectedRevision: active.head} : {}) });
    // History records retain their own identity even if the user switched while saving.
    acknowledge(documentId, {id:result.id,head:result.revision,name:project.name,owner:result.ownerId,saved:snapshot});
    setMessage(valid() ? 'Saved to your account.' : 'The earlier design was saved. Your current workspace was not replaced.');
    setHistory(null);
  }
  async function open(id: string, valid: () => boolean, revision?: string) {
    const result = await api('?id=' + encodeURIComponent(id) + (revision ? '&revision=' + encodeURIComponent(revision) : ''));
    const document = validateProject(result.document);
    if (!valid()) {setMessage('Cloud open ignored because the workspace changed. Open it again when ready.'); return;}
    const target = {id,head:result.head,owner:result.ownerId,name:document.name,saved:revision && revision !== result.head ? '' : JSON.stringify(document)};
    if (revision) {setPreview({project:document,target,valid});setMessage('Revision preview only. Restore explicitly to edit it; Save then creates a new head.');}
    else {load(document,target);setPreview(null);setHistory(null);setMessage('Project opened. Undo restores both the previous design and its save target.');}
  }
  return <details className="pg-project-tools">
    <summary>Account projects</summary>
    <p><a href="/account" target="_blank" rel="noreferrer">Sign in with your Eidos account</a>, then refresh this list.</p>
    <p>Save target: {active ? `${active.name} · ${active.id}` : 'New account project (detached design)'}</p>
    <button disabled={busy} onClick={() => void run(async () => {await refresh(); setMessage('Project list refreshed.');})}>Refresh account projects</button>
    <button disabled={busy || disabled || !preflight.allowed} onClick={() => void run(valid => save(false,valid))}>{active ? 'Save account revision' : 'Import into my account'}</button>
    <button disabled={busy || disabled || !preflight.allowed} onClick={() => void run(valid => save(true,valid))}>Save as new account project</button>
    <p role="status">{message}{active && active.saved !== JSON.stringify(project) ? ' Current design has changes not saved to your account.' : ''}</p>
    <p>{preflight.message || `Account document size: ${preflight.bytes.toLocaleString()} / 2,000,000 bytes.`}</p>
    {projects.map(p => <button disabled={busy || disabled} key={p.id} onClick={() => void run(valid => open(p.id,valid))}>{p.name} {active?.id === p.id ? '(open)' : ''}</button>)}
    {active && <button disabled={busy || disabled} onClick={() => void run(async valid => {const result=await api('?id='+encodeURIComponent(active.id)+'&revisions=1');if(valid()) setHistory({id:active.id,revisions:result.revisions});})}>Browse revision history</button>}
    {active && history?.id === active.id && <label>Preview a revision
      <select value="" disabled={busy || disabled} onChange={e => { if(e.target.value) void run(valid => open(active.id,valid,e.target.value)); }}>
        <option value="">Choose saved revision</option>
        {history.revisions.map(r => <option key={r.id} value={r.id}>{new Date(r.created_at).toLocaleString()} · {r.id.slice(0,8)}</option>)}
      </select>
    </label>}
    {preview && <div><p>Revision preview: {preview.project.name}</p><p>{preview.project.sections.find(s=>s.id==='hero')?.title}</p><button disabled={disabled} onClick={()=>{if(!preview.valid()) {setMessage('Workspace changed. Preview the revision again before restoring.');setPreview(null);return;}load(preview.project,{...preview.target,saved:''});setPreview(null);setMessage('Revision restored locally. Save creates a new immutable head.');}}>Restore this revision locally</button><button onClick={()=>setPreview(null)}>Dismiss revision preview</button></div>}
    <Purchases active={active} dirty={active?.saved !== JSON.stringify(project)} />
  </details>;
}
