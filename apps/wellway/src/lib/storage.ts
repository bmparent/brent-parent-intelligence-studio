import { seedState, STORAGE_KEY, validateBackup } from "./data";

export const RECOVERY_KEY = `${STORAGE_KEY}.recovery`;
export function loadWorkspace(storage: Pick<Storage, "getItem" | "setItem">) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { state: seedState(), warning: "", writable: true };
    try {
      const parsed: unknown = JSON.parse(raw);
      if (validateBackup(parsed)) return { state: parsed, warning: "", writable: true };
    } catch { /* Preserve the original bytes before creating a sample workspace. */ }
    // Never overwrite an earlier recovery copy. If it differs, require manual recovery.
    const previous = storage.getItem(RECOVERY_KEY);
    if (previous !== null && previous !== raw) {
      return { state: seedState(), warning: "Your saved workspace could not be read. Original saves are preserved; automatic saving is paused. Export this session before closing.", writable: false };
    }
    storage.setItem(RECOVERY_KEY, raw);
    return { state: seedState(), warning: "Your saved workspace could not be read. Its original copy is preserved. Download it in Help & guide; this session starts with sample records.", writable: true };
  } catch {
    return { state: seedState(), warning: "Browser storage is unavailable. Automatic saving is paused. Export a backup before closing.", writable: false };
  }
}
