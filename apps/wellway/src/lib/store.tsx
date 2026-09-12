import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
} from "react";
import { seedState, reducer, STORAGE_KEY, validateBackup } from "./data";
import type { AppState, Action } from "./types";
const Context = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
  storageError: string;
}>({ state: seedState(), dispatch: () => {}, storageError: "" });
// Storage availability is external to React. Notify only when its status changes.
let storageStatus = "";
const storageListeners = new Set<() => void>();
function subscribeToStorage(listener: () => void) {
  storageListeners.add(listener);
  return () => {
    storageListeners.delete(listener);
  };
}
function reportStorageStatus(message: string) {
  if (message === storageStatus) return;
  storageStatus = message;
  storageListeners.forEach((listener) => listener());
}
const getStorageStatus = () => storageStatus;
const getServerStorageStatus = () => "";
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (validateBackup(parsed)) return parsed;
    }
  } catch {
    /* A malformed local snapshot never enters the app state. */
  }
  return seedState();
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const storageError = useSyncExternalStore(
    subscribeToStorage,
    getStorageStatus,
    getServerStorageStatus,
  );
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      reportStorageStatus("");
    } catch {
      reportStorageStatus(
        "This browser could not save your changes. Export a backup in Help & guide before closing.",
      );
    }
  }, [state]);
  return (
    <Context.Provider value={{ state, dispatch, storageError }}>
      {children}
    </Context.Provider>
  );
}
export const useStore = () => useContext(Context);
