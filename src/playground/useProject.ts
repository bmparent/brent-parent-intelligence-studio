import { useEffect, useReducer, useState } from "react";
import { createProject, type Project } from "./model";
import { loadWorkspace, saveWorkspace, type Snapshot } from "./storage";
type State = {
  current: Project;
  past: Project[];
  future: Project[];
  group: string;
  time: number;
};
type Action =
  | { type: "edit"; project: Project; group?: string; time: number }
  | { type: "undo" | "redo" }
  | { type: "load"; project: Project };
function reducer(s: State, a: Action): State {
  if (a.type === "load")
    return { current: a.project, past: [], future: [], group: "", time: 0 };
  if (a.type === "undo")
    return s.past.length
      ? {
          current: s.past[s.past.length - 1],
          past: s.past.slice(0, -1),
          future: [s.current, ...s.future],
          group: "",
          time: 0,
        }
      : s;
  if (a.type === "redo")
    return s.future.length
      ? {
          current: s.future[0],
          past: [...s.past, s.current],
          future: s.future.slice(1),
          group: "",
          time: 0,
        }
      : s;
  if (a.type === "edit")
    return {
      current: a.project,
      past:
        a.group && a.group === s.group && a.time - s.time < 900
          ? s.past
          : [...s.past, s.current].slice(-30),
      future: [],
      group: a.group || "",
      time: a.time,
    };
  return s;
}
export function useProject() {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    current: createProject(),
    past: [],
    future: [],
    group: "",
    time: 0,
  }));
  const [ready, setReady] = useState(false),
    [snapshots, setSnapshots] = useState<Snapshot[]>([]),
    [savedState, setSavedState] = useState<{
      project: Project;
      snapshots: Snapshot[];
    } | null>(null);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    let cancelled = false;
    loadWorkspace()
      .then((saved) => {
        if (cancelled) return;
        if (saved) {
          dispatch({ type: "load", project: saved.project });
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
  const project = state.current;
  useEffect(() => {
    if (!ready || storageError) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      saveWorkspace({ project, snapshots })
        .then(() => {
          if (!cancelled) setSavedState({ project, snapshots });
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
  }, [project, snapshots, ready, storageError]);
  const dirty =
    ready &&
    (savedState?.project !== project || savedState?.snapshots !== snapshots);
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
    project: state.current,
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
    edit: (project: Project, group?: string) =>
      dispatch({ type: "edit", project, group, time: Date.now() }),
    undo: () => dispatch({ type: "undo" }),
    redo: () => dispatch({ type: "redo" }),
    canUndo: !!state.past.length,
    canRedo: !!state.future.length,
    saveSnapshot: (name: string) =>
      setSnapshots((v) =>
        [
          {
            id: crypto.randomUUID(),
            name,
            project: state.current,
            savedAt: new Date().toISOString(),
          },
          ...v,
        ].slice(0, 5),
      ),
  };
}
