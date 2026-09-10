import { useEffect, useReducer, useState } from "react";
import { createProject, type Project } from "./model";
import { loadWorkspace, saveWorkspace, type Snapshot } from "./storage";
import { useRef } from "react";
import { workspace, workspaceReducer, type SaveTarget } from "./workspace";
export function useProject() {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, () => workspace(createProject(), crypto.randomUUID()));
  const generation = useRef(0);
  const [editVersion,bumpEditVersion]=useReducer((v:number)=>v+1,0);
  const guard = () => { const captured = generation.current; return () => captured === generation.current; };
  const [ready, setReady] = useState(false),
    [snapshots, setSnapshots] = useState<Snapshot[]>([]),
    [savedState, setSavedState] = useState<{
      project: Project;
      snapshots: Snapshot[];
      generation: number;
    } | null>(null);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    let cancelled = false;
    loadWorkspace()
      .then((saved) => {
        if (cancelled) return;
        if (saved) {
          dispatch({ type: "load", project: saved.project, documentId: crypto.randomUUID() });
          setSnapshots(saved.snapshots);
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setReady(true);
          setStorageError(
            "Device saving is unavailable. Download project JSON to keep your work.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const project = state.current.project;
  useEffect(() => {
    if (!ready || storageError) return;
    let cancelled = false;
    const writeGeneration=editVersion;
    const timer = setTimeout(() => {
      saveWorkspace({ project, snapshots })
        .then(() => {
          if (!cancelled) setSavedState({ project, snapshots, generation:writeGeneration });
        })
        .catch(() => {
          if (!cancelled)
            setStorageError(
              "Could not save on this device. Download project JSON before closing.",
            );
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [project, snapshots, ready, storageError, editVersion]);
  const dirty =
    ready &&
    (savedState?.project !== project || savedState?.snapshots !== snapshots || savedState?.generation !== editVersion);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  return {
    project: state.current.project,
    ready,
    snapshots,
    status:
      storageError ||
      (!ready
        ? "Opening workspace…"
        : dirty
          ? "Saving…"
          : "Saved on this device"),
    storageError,
    target: state.current.target,
    documentId: state.current.documentId,
    guard,
    replace: (project: Project, target?: SaveTarget | null) => {
      generation.current++; bumpEditVersion();
      dispatch({type: 'replace', project, target, documentId: crypto.randomUUID()});
    },
    acknowledge: (documentId: string, target: SaveTarget) => dispatch({type:'saved',documentId,target}),
    edit: (project: Project | ((current: Project) => Project), group?: string) => {
      generation.current++; bumpEditVersion();
      dispatch({ type: "edit", project, group, time: Date.now() });
    },
    undo: () => { generation.current++; bumpEditVersion(); dispatch({ type: "undo" }); },
    redo: () => { generation.current++; bumpEditVersion(); dispatch({ type: "redo" }); },
    canUndo: !!state.past.length,
    canRedo: !!state.future.length,
    saveSnapshot: (name: string) =>
      setSnapshots((v) =>
        [
          {
            id: crypto.randomUUID(),
            name,
            project: state.current.project,
            savedAt: new Date().toISOString(),
          },
          ...v,
        ].slice(0, 5),
      ),
  };
}
