import {
  createContext,
  useContext,
  useReducer,
  useState,
  useEffect,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
} from "react";
import { seedState, reducer, STORAGE_KEY } from "./data";
import { loadWorkspace } from "./storage";
import type { AppState, Action } from "./types";
const Context = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
  storageError: string;
  recoveryWarning: string;
  saving: boolean;
}>({ state: seedState(), dispatch: () => {}, storageError: "", recoveryWarning: "", saving: false });
// Storage availability is external to React. Notify only when its status changes.
let storageStatus: { error: string; saved: AppState | null } = {
  error: "",
  saved: null,
};
const storageListeners = new Set<() => void>();
function subscribeToStorage(listener: () => void) {
  storageListeners.add(listener);
  return () => {
    storageListeners.delete(listener);
  };
}
function reportStorageStatus(message: string, saved: AppState | null) {
  if (message === storageStatus.error && saved === storageStatus.saved) return;
  storageStatus = { error: message, saved };
  storageListeners.forEach((listener) => listener());
}
const getStorageStatus = () => storageStatus;
const getServerStorageStatus = () => storageStatus;
export function StoreProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => loadWorkspace({
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  }));
  const [state, dispatch] = useReducer(reducer, initial.state);
  const snapshot = useSyncExternalStore(
    subscribeToStorage,
    getStorageStatus,
    getServerStorageStatus,
  );
  useEffect(() => {
    if (!initial.writable) {
      reportStorageStatus(initial.warning, null);
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      reportStorageStatus("", state);
    } catch {
      reportStorageStatus(
        "This browser could not save your changes. Export a backup in Help & guide before closing.",
        null,
      );
    }
  }, [state, initial]);
  useEffect(() => {
    if (!snapshot.error) return;
    const protect = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [snapshot.error]);
  return (
    <Context.Provider
      value={{
        state,
        dispatch,
        storageError: snapshot.error,
        recoveryWarning: initial.writable ? initial.warning : "",
        saving: !snapshot.error && snapshot.saved !== state,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
