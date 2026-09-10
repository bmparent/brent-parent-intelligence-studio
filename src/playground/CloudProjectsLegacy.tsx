import { useRef, useState } from 'react';
import { validateProject } from './model';
import { Purchases } from './Purchases';
import { legacySaveTarget, supportsProductionCloud } from './releaseBoundary';
import type { LegacyCloudProps } from './CloudProjects';

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
/** Existing production API protocol. Server authorization still checks the session
 * and owner for every request. The legacy response does not expose an owner ID.
 * Save targets live in workspace history, not this conditionally mounted panel.
 */
export function CloudProjects({ project, target: active, documentId, load, acknowledge, guard, disabled }: LegacyCloudProps) {
  const [projects, setProjects] = useState<Saved[]>([]);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [message, setMessage] = useState('Cloud saves are manual. Local autosave stays on.');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  async function run(action: (valid: () => boolean) => Promise<void>) {
    if (lock.current) return;
    const valid = guard();
    lock.current = true; setBusy(true);
    try { await action(valid); } catch (error) { if (valid()) setMessage(error instanceof Error ? error.message : 'Account request failed. Your local copy is safe.'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function refresh(valid: () => boolean) {
    const result = await api();
    if (valid()) setProjects(result.projects);
  }
  async function save(copy: boolean, valid: () => boolean) {
    if (!valid() || !supportsProductionCloud(project)) return;
    const snapshot = JSON.stringify(project);
    setMessage('Saving to your account…');
    const result = await api('', { document: project, ...(!copy && active ? {id: active.id, expectedRevision: active.head} : {}) });
    acknowledge(documentId, legacySaveTarget(result.id, result.revision, project.name, snapshot));
    if (!valid()) return;
    setRevisions([]);
    setMessage('Saved to your account.');
    await refresh(valid);
  }
  async function open(id: string, valid: () => boolean, revision?: string) {
    const result = await api('?id=' + encodeURIComponent(id) + (revision ? '&revision=' + encodeURIComponent(revision) : ''));
    const document = validateProject(result.document);
    const history = await api('?id=' + encodeURIComponent(id) + '&revisions=1');
    if (!valid()) return;
    const saved = revision && revision !== result.head ? '' : JSON.stringify(document);
    setMessage(revision ? 'Revision opened. Save to make it the latest revision. Undo restores your previous local design.' : 'Project opened. Undo restores your previous local design.');
    setRevisions(history.revisions);
    load(document, legacySaveTarget(id, result.head, document.name, saved));
  }
  return <details className="pg-project-tools">
    <summary>Account projects</summary>
    <p><a href="/account" target="_blank" rel="noreferrer">Sign in with your Eidos account</a>, then refresh this list.</p>
    <button disabled={busy} onClick={() => void run(async valid => { await refresh(valid); if (valid()) setMessage('Project list refreshed.'); })}>Refresh account projects</button>
    <button disabled={busy || disabled} onClick={() => void run(valid => save(false, valid))}>{active ? 'Save account revision' : 'Import into my account'}</button>
    <button disabled={busy || disabled} onClick={() => void run(valid => save(true, valid))}>Save as new account project</button>
    <p role="status">{message}{active && active.saved !== JSON.stringify(project) ? ' Current design has changes not saved to your account.' : ''}</p>
    {projects.map(project => <button disabled={busy || disabled} key={project.id} onClick={() => void run(valid => open(project.id, valid))}>{project.name} {active?.id === project.id ? '(open)' : ''}</button>)}
    {active && <button disabled={busy || disabled} onClick={() => void run(async valid => {
      const result = await api('?id=' + encodeURIComponent(active.id) + '&revisions=1');
      if (valid()) setRevisions(result.revisions);
    })}>Refresh revision history</button>}
    {active && revisions.length > 0 && <label>Open a revision
      <select value="" disabled={busy || disabled} onChange={event => { const id = event.target.value; if (id) void run(valid => open(active.id, valid, id)); }}>
        <option value="">Choose saved revision</option>
        {revisions.map(revision => <option key={revision.id} value={revision.id}>{new Date(revision.created_at).toLocaleString()} · {revision.id.slice(0, 8)}</option>)}
      </select>
    </label>}
    <Purchases active={active} dirty={active?.saved !== JSON.stringify(project)} />
  </details>;
}
