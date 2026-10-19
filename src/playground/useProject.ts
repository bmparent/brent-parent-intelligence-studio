import { accountEpoch } from '../lib/accountEpoch';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { createProject, validateProject, type Project } from './model';
import { loadWorkspace, saveWorkspace, listSavedProjects, type Saved, type SavedProjectSummary, type Snapshot } from './storage';
import { editorSelection, workspace, workspaceReducer, type EditorSelection, type SaveTarget } from './workspace';

const EMPTY_SNAPSHOTS: Snapshot[] = [];

export function useProject() {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, () => workspace(createProject(), crypto.randomUUID()));
  const generation = useRef(0), persistenceGeneration = useRef(0), switching = useRef(false);
  const gesture = useRef<string | undefined>(undefined);
  const [editVersion, bumpEditVersion] = useReducer((v: number, reset?: number) => reset ?? v + 1, 0);
  // This identity stays stable: Preview uses it to avoid rebuilding during a drag.
  const guard = useCallback(() => { const captured = generation.current, epoch = accountEpoch(); return () => captured === generation.current && epoch === accountEpoch(); }, []);
  const [ready, setReady] = useState(false), [started, setStarted] = useState(false), [hasSavedProject, setHasSavedProject] = useState(false);
  const [snapshotsByDocument, setSnapshotsByDocument] = useState<Record<string, Snapshot[]>>({}), [savedProjects, setSavedProjects] = useState<SavedProjectSummary[]>([]);
  const [savedState, setSavedState] = useState<Saved | null>(null), [storageError, setStorageError] = useState('');
  const { project, documentId, editor } = state.current;
  const snapshots = snapshotsByDocument[documentId] || EMPTY_SNAPSHOTS;
  const savedValue = (): Saved => ({ project, documentId, editor, snapshots, revision: editVersion, savedAt: new Date().toISOString() });
  function remember(value: Saved) {
    setSavedState(value);
    setHasSavedProject(true);
    setSavedProjects(items => [{documentId:value.documentId,name:value.project.name,savedAt:value.savedAt}, ...items.filter(item => item.documentId !== value.documentId)]);
  }
  useEffect(() => {
    let cancelled = false;
    Promise.all([loadWorkspace(), listSavedProjects()]).then(([saved, projects]) => {
      if (cancelled) return;
      if (saved) {
        dispatch({type:'load',project:saved.project,documentId:saved.documentId,editor:saved.editor});
        setSnapshotsByDocument(values => ({...values, [saved.documentId]: saved.snapshots})); bumpEditVersion(saved.revision); setSavedState(saved); setHasSavedProject(true);
      }
      setSavedProjects(projects); setReady(true);
    }).catch(() => {
      if (!cancelled) { setReady(true); setStorageError('Device saving is unavailable. Download project JSON to keep your work.'); }
    });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    // Never persist the unexplained createProject() fallback on a clean visit.
    if (!ready || !hasSavedProject || storageError) return;
    let cancelled = false;
    const captured = persistenceGeneration.current;
    const stillCurrent = () => !cancelled && captured === persistenceGeneration.current;
    const value: Saved = {project,documentId,editor,snapshots,revision:editVersion,savedAt:new Date().toISOString()};
    const timer = setTimeout(() => {
      saveWorkspace(value, stillCurrent).then(() => {
        if (stillCurrent()) {
          setSavedState(value);
          setSavedProjects(items => [{documentId,name:project.name,savedAt:value.savedAt}, ...items.filter(item => item.documentId !== documentId)]);
        }
      }).catch(() => { if (stillCurrent()) setStorageError('Could not save on this device. Download project JSON before closing.'); });
    }, 350);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [project, documentId, editor, snapshots, ready, hasSavedProject, storageError, editVersion]);
  const dirty = ready && hasSavedProject && (savedState?.project !== project || savedState?.snapshots !== snapshots || savedState?.editor !== editor || savedState?.documentId !== documentId || savedState?.revision !== editVersion);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);
  async function saveNow() {
    if (!ready || !hasSavedProject) return false;
    const captured = persistenceGeneration.current, value = savedValue();
    try {
      await saveWorkspace(value, () => captured === persistenceGeneration.current);
      if (captured !== persistenceGeneration.current) return false;
      setStorageError(''); remember(value); return true;
    } catch {
      if (captured === persistenceGeneration.current) setStorageError('Could not save on this device. Download project JSON before closing.');
      return false;
    }
  }
  async function activate(next: Project, saved?: Saved, newIdentity?: string) {
    if (!ready || switching.current) return false;
    const captured = generation.current;
    const valid = validateProject(next);
    switching.current = true;
    try {
      // Preserve the previous document before switching. Failed saving keeps it open.
      if (hasSavedProject && !await saveNow()) return false;
      if (captured !== generation.current) return false;
      generation.current++; persistenceGeneration.current++; gesture.current = undefined;
      const identity = saved?.documentId || newIdentity || crypto.randomUUID();
      dispatch({type:'load',project:valid,documentId:identity,editor:saved?.editor});
      setSnapshotsByDocument(values => ({...values, [identity]: saved?.snapshots || []})); bumpEditVersion(saved?.revision ?? 0);
      setSavedState(null); setHasSavedProject(true); setStarted(true);
      return true;
    } finally { switching.current = false; }
  }
  function changed() { generation.current++; persistenceGeneration.current++; bumpEditVersion(); }
  return {
    beginGesture: () => { gesture.current = 'gesture:' + crypto.randomUUID(); },
    endGesture: () => { gesture.current = undefined; },
    project, ready, started, hasSavedProject, savedProjects, editor,
    startProject: (next: Project) => activate(next),
    startRecoveredProject: async (next: Project) => { const id = crypto.randomUUID(); return await activate(next, undefined, id) ? id : null; },
    continueProject: () => { if (hasSavedProject) { generation.current++; setStarted(true); } },
    returnToStart: () => { generation.current++; gesture.current = undefined; setStarted(false); },
    openSavedProject: async (id: string) => {
      const captured = generation.current;
      try {
        const saved = await loadWorkspace(id);
        if (captured !== generation.current) return false;
        return saved ? await activate(saved.project,saved) : false;
      } catch {
        if (captured === generation.current) setStorageError('This saved project could not be opened. Your current design is unchanged.');
        return false;
      }
    },
    setEditorSelection: (selection: Pick<EditorSelection,'sectionId'|'nodeId'>) => {
      const next = editorSelection(project,selection);
      if (editor.sectionId === next.sectionId && editor.nodeId === next.nodeId) return;
      persistenceGeneration.current++; dispatch({type:'select',editor:selection});
    },
    revision: editVersion, saveNow, snapshots,
    status: storageError || (!ready ? 'Opening workspace…' : !hasSavedProject ? 'Choose a starting point' : dirty ? 'Saving…' : 'Saved on this device'),
    storageError, target: state.current.target, documentId, guard,
    replace: async (next: Project, target?: SaveTarget | null) => {
      if (!ready || switching.current) return false;
      const valid = validateProject(next), captured = generation.current, epoch = accountEpoch();
      switching.current = true;
      try {
        // Import/restore creates a new identity, but must persist the outgoing
        // document first. Undo is a convenience, not its only durable backup.
        if (hasSavedProject && !await saveNow()) return false;
        if (captured !== generation.current || epoch !== accountEpoch()) return false;
        const identity = crypto.randomUUID();
        changed(); gesture.current = undefined; setHasSavedProject(true); setStarted(true);
        setSnapshotsByDocument(values => ({...values, [identity]: []}));
        dispatch({type:'replace',project:valid,target,documentId:identity});
        return true;
      } finally { switching.current = false; }
    },
    acknowledge: (id: string, target: SaveTarget) => dispatch({type:'saved',documentId:id,target}),
    edit: (next: Project | ((current: Project) => Project), group?: string) => {
      changed(); dispatch({type:'edit',project:next,group:gesture.current || group,time:Date.now()});
    },
    undo: () => { changed(); gesture.current = undefined; dispatch({type:'undo'}); },
    redo: () => { changed(); gesture.current = undefined; dispatch({type:'redo'}); },
    canUndo: !!state.past.length, canRedo: !!state.future.length,
    saveSnapshot: (name: string) => {
      changed(); setSnapshotsByDocument(values => ({...values, [documentId]: [{id:crypto.randomUUID(),name,project,savedAt:new Date().toISOString()},...(values[documentId] || [])].slice(0,5)}));
    },
  };
}
