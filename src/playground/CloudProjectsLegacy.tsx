import {accountEpoch, subscribeAccountChanges} from '../lib/accountEpoch';
import { useEffect, useRef, useState } from 'react';
import { validateProject, type Project } from './model';
import { cloudPreflight } from './limits';
import type { SaveTarget } from './workspace';
import { Purchases } from './Purchases';
import { supportsProductionCloud, CLOUD_FORMAT_NOTICE } from './releaseBoundary';

type Saved = { id: string; name: string; head: string; updated_at: string };
type Revision = { id: string; created_at: string };
function historyReplace() { const url = new URL(location.href); url.searchParams.delete('open'); window.history.replaceState(null, '', url.pathname + url.search + url.hash); }
async function api(query = '', input?: unknown) {
  const response = await fetch('/api/playground/projects' + query, {
    credentials: 'same-origin',
    ...(input ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) } : {}),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Account projects are temporarily unavailable. Your open design is unchanged; download a backup before leaving.');
  return result;
}
function AcceptedCloudProjects({ project, target: active, documentId, guard, load, acknowledge, disabled, canSave = true }: {
  project: Project; target: SaveTarget | null; documentId: string; guard: () => () => boolean;
  load: (p: Project, target?: SaveTarget | null) => Promise<boolean>;
  acknowledge: (id: string, target: SaveTarget) => void; disabled: boolean;
  canSave?: boolean;
}) {
  const [projects, setProjects] = useState<Saved[]>([]);
  const [history, setHistory] = useState<{id:string; revisions:Revision[]} | null>(null);
  const [preview, setPreview] = useState<{project:Project; target:SaveTarget; valid:() => boolean} | null>(null);
  const [message, setMessage] = useState('Cloud saves are manual. Local autosave stays on.');
  const [busy, setBusy] = useState(false);
  const [requestedProject, setRequestedProject] = useState('');
  const [newFormatSaveEnabled, setNewFormatSaveEnabled] = useState(false);
  const [resumeEnabled, setResumeEnabled] = useState(false), [usage,setUsage] = useState<{imageBytes:number;imageLimit:number;documentBytes:number;documentLimit:number} | null>(null);
  const cloudFormatReady = supportsProductionCloud(project) || (project.schemaVersion < 5 && newFormatSaveEnabled) || resumeEnabled;
  useEffect(() => { let mounted = true; queueMicrotask(() => { if (mounted) { const id = new URLSearchParams(location.search).get('open') || ''; if (/^[a-f0-9-]{36}$/.test(id)) setRequestedProject(id); } }); return () => { mounted = false; }; }, []);
  useEffect(() => {
    const invalidate = () => {
      setProjects([]); setHistory(null); setPreview(null); setNewFormatSaveEnabled(false); setResumeEnabled(false); setUsage(null);
    };
    // Opening a local project does not opt into account access. Session changes
    // clear the old account's view; only an explicit cloud action fetches it.
    return subscribeAccountChanges(invalidate);
  }, []);
  const lock = useRef(false);
  const preflight = cloudPreflight(project);
  async function run(action: (valid: () => boolean) => Promise<void>) {
    if (lock.current) return;
    const workspaceCurrent = guard(), epoch = accountEpoch();
    const valid = () => workspaceCurrent() && epoch === accountEpoch();
    lock.current = true; setBusy(true);
    try { await action(valid); } catch (error) { if(valid()) setMessage((error as Error).message); }
    finally { lock.current = false; setBusy(false); }
  }
  async function refresh(valid:()=>boolean) {
    const result = await api();
    if(typeof result.ownerId !== 'string' || !result.ownerId || !Array.isArray(result.projects)) throw Error('The account service needs the matching Playground update. Local editing and exports remain available.');
    if(!valid())throw Error('Workspace changed. Refresh account projects again.');
    const resume = result.resumeProtocol === 1 && result.resumeSaveEnabled === true;
    setProjects(result.projects.filter((p:Saved) => p && typeof p.id === 'string' && typeof p.name === 'string'));
    setNewFormatSaveEnabled(result.newFormatSaveEnabled === true); setResumeEnabled(resume);
    const s = result.storage;
    setUsage(s && [s.imageBytes,s.imageLimit,s.documentBytes,s.documentLimit].every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0) ? s : null);
    return {owner:result.ownerId,newFormatSaveEnabled:result.newFormatSaveEnabled === true,resume};
  }
  async function save(copy: boolean, valid: () => boolean) {
    if (!canSave) return;
    if (!preflight.allowed) {setMessage(preflight.message); return;}
    const ownerEpoch=accountEpoch();
    const snapshot = JSON.stringify(project);
    const {owner,newFormatSaveEnabled:available,resume} = await refresh(valid);
    if (!valid()) {setMessage('Save canceled because the workspace changed.'); return;}
    if (!supportsProductionCloud(project) && !resume && !(project.schemaVersion < 5 && available)) {setMessage(CLOUD_FORMAT_NOTICE); return;}
    if (active && active.owner !== owner) {setMessage('Your account changed. Open a project from this account, or import this design again to detach its previous owner before saving.'); return;}
    setMessage('Saving to your account…');
    const result = await api('', { document: project, expectedOwner:owner, ...(!supportsProductionCloud(project) && resume ? {intent:'resume'} : {}), ...(!copy && active ? {id: active.id, expectedRevision: active.head} : {}) });
    if(ownerEpoch!==accountEpoch())return; // A late response cannot attach an earlier account to this workspace.
    if(result.ownerId !== owner || typeof result.id !== 'string' || typeof result.revision !== 'string') throw Error('The account save could not be confirmed. Keep your local backup and refresh account projects.');
    // History records retain their own identity even if the user switched while saving.
    acknowledge(documentId, {id:result.id,head:result.revision,name:project.name,owner:result.ownerId,saved:snapshot});
    setMessage(valid() ? 'Saved to your account.' : 'The earlier design was saved. Your current workspace was not replaced.');
    setHistory(null);
    if(valid()) await refresh(valid);
  }
  async function open(id: string, valid: () => boolean, revision?: string) {
    const result = await api('?id=' + encodeURIComponent(id) + (revision ? '&revision=' + encodeURIComponent(revision) : ''));
    if(typeof result.ownerId !== 'string' || !result.ownerId) throw Error('The account service needs the matching Playground update. Your local design is unchanged.');
    const document = validateProject(result.document);
    if (!valid()) {setMessage('Cloud open ignored because the workspace changed. Open it again when ready.'); return;}
    const target = {id,head:result.head,owner:result.ownerId,name:document.name,saved:revision && revision !== result.head ? '' : JSON.stringify(document)};
    if (revision) {setPreview({project:document,target,valid});setMessage('Revision preview only. Restore explicitly to edit it; Save then creates a new head.');}
    else {if(!await load(document,target)) throw Error('Open paused: save your current project and try again.');setPreview(null);setHistory(null);setMessage('Project opened. Undo restores both the previous design and its save target.');}
  }
  return <details className="pg-project-tools" open={requestedProject ? true : undefined}>
    <summary>Account projects</summary>
    <p><a href="/account" target="_blank" rel="noreferrer">Sign in with your Eidos account</a>, then refresh this list.</p>
    <p>Your design stays on this device until an account save succeeds. If cloud saving is unavailable, download your project to keep a recovery copy.</p>
    {!cloudFormatReady && <p role="status"><strong>Local only — not saved to your account.</strong> {CLOUD_FORMAT_NOTICE}</p>}
    {requestedProject && <p><button disabled={busy || disabled} onClick={() => void run(async valid => { await open(requestedProject, valid); setRequestedProject(''); historyReplace(); })}>Open project selected from your account</button> Your current local design can be restored with Undo.</p>}
    <p>Save target: {active ? `${active.name} · ${active.id}` : 'New account project (detached design)'}</p>
    <button disabled={busy} onClick={() => void run(async valid => {await refresh(valid); setMessage('Project list refreshed.');})}>Refresh account projects</button>
    <button disabled={busy || disabled || !canSave || !preflight.allowed || !cloudFormatReady} onClick={() => void run(valid => save(false,valid))}>{active ? 'Save account revision' : 'Import into my account'}</button>
    <button disabled={busy || disabled || !canSave || !preflight.allowed || !cloudFormatReady} onClick={() => void run(valid => save(true,valid))}>Save as new account project</button>
    <p role="status">{message}{active && active.saved !== JSON.stringify(project) ? ' Current design has changes not saved to your account.' : ''}</p>
    <p>{preflight.message || `Account document size: ${preflight.bytes.toLocaleString()} / 2,000,000 bytes.`}</p>
    {usage ? <p>Account storage: {(usage.imageBytes/1_000_000).toFixed(1)} / {usage.imageLimit/1_000_000} MB images; {(usage.documentBytes/1_000_000).toFixed(1)} / {usage.documentLimit/1_000_000} MB project history. Up to 20 projects and 100 revisions each. Earlier work is kept when storage is full.</p> : <p>Refresh account projects to check available storage and saving. Project backups and asset downloads remain available on this device.</p>}
    {projects.map(p => <button disabled={busy || disabled} key={p.id} onClick={() => void run(valid => open(p.id,valid))}>{p.name} {active?.id === p.id ? '(open)' : ''}</button>)}
    {active && <button disabled={busy || disabled} onClick={() => void run(async valid => {const result=await api('?id='+encodeURIComponent(active.id)+'&revisions=1');if(valid()) setHistory({id:active.id,revisions:result.revisions});})}>Browse revision history</button>}
    {active && history?.id === active.id && <label>Preview a revision
      <select value="" disabled={busy || disabled} onChange={e => { if(e.target.value) void run(valid => open(active.id,valid,e.target.value)); }}>
        <option value="">Choose saved revision</option>
        {history.revisions.map(r => <option key={r.id} value={r.id}>{new Date(r.created_at).toLocaleString()} · {r.id.slice(0,8)}</option>)}
      </select>
    </label>}
    {preview && <div><p>Revision preview: {preview.project.name}</p><p>{preview.project.sections.find(s=>s.id==='hero')?.title}</p><button disabled={disabled} onClick={()=>void run(async () => {if(!preview.valid()) {setMessage('Workspace changed. Preview the revision again before restoring.');setPreview(null);return;}if(!await load(preview.project,{...preview.target,saved:''})) throw Error('Restore paused: save your current project and try again.');setPreview(null);setMessage('Revision restored locally. Save creates a new immutable head.');})}>Restore this revision locally</button><button onClick={()=>setPreview(null)}>Dismiss revision preview</button></div>}
    <Purchases active={active} dirty={active?.saved !== JSON.stringify(project)} />
  </details>;
}

export function CloudProjects(props:Parameters<typeof AcceptedCloudProjects>[0]) {
 return <AcceptedCloudProjects {...props}/>;
}

export type LegacyCloudProps = Parameters<typeof AcceptedCloudProjects>[0];
