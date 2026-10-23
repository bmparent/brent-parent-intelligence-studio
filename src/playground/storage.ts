import { validateProject, type Project } from './model';
import { editorSelection, type EditorSelection } from './workspace';

export type Snapshot = { id: string; name: string; project: Project; savedAt: string };
export type RecoveryRecord = { key: string; raw: unknown; message: string };
export type Saved = { project: Project; snapshots: Snapshot[]; documentId: string; editor: EditorSelection; revision: number; savedAt: string; recovery?: RecoveryRecord[] };
export type SavedProjectSummary = Pick<Saved, 'documentId' | 'savedAt'> & { name: string };
export class WorkspaceRecordError extends Error {
  constructor(public record: RecoveryRecord) { super(record.message); }
}
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : '';
export function validateSavedWorkspace(value: unknown): Saved {
  if (!value || typeof value !== 'object') throw Error('Invalid saved workspace.');
  const raw = value as Partial<Saved>, project = validateProject(raw.project);
  const documentId = typeof raw.documentId === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(raw.documentId) ? raw.documentId : crypto.randomUUID();
  const snapshots: Snapshot[] = [], recovery: RecoveryRecord[] = [];
  for (const [index, value] of (Array.isArray(raw.snapshots) ? raw.snapshots : []).entries()) {
    try {
      if (!value || typeof value !== 'object') throw Error('Invalid variation.');
      snapshots.push({ id: String(value.id ?? index).slice(0,100), name: String(value.name ?? 'Recovered variation').slice(0,100), savedAt: date(value.savedAt), project: validateProject(value.project) });
    } catch { recovery.push({key: 'variation:' + index, raw: value, message: 'A saved variation could not be opened.'}); }
  }
  if (raw.snapshots != null && !Array.isArray(raw.snapshots)) recovery.push({key:'variations',raw:raw.snapshots,message:'Saved variations could not be opened.'});
  return { project, documentId, editor: editorSelection(project, raw.editor), revision: Number.isSafeInteger(raw.revision) && raw.revision! >= 0 ? raw.revision! : 0,
    savedAt: date(raw.savedAt), snapshots, ...(recovery.length ? {recovery} : {}) };
}
const DB = 'eidos-playground-v1';
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('workspace');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Close other Playground tabs, then retry saving.'));
  });
}
export async function loadWorkspace(documentId?: string): Promise<Saved | null> {
  const db = await database(), key = documentId ? 'project:' + documentId : 'current';
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('workspace').objectStore('workspace').get(key);
      request.onsuccess = () => {
        if (request.result === undefined) { resolve(null); return; }
        try {
          const saved = validateSavedWorkspace(request.result);
          if (saved.recovery?.length) saved.recovery = [{key,raw:request.result,message:'Some saved variations need recovery. The project can still be edited.'}];
          resolve(saved);
        } catch { reject(new WorkspaceRecordError({key,raw:request.result,message:'This saved project could not be opened. Its original data is kept for recovery.'})); }
      };
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
export async function saveWorkspace(value: Saved, stillCurrent: () => boolean = () => true): Promise<boolean> {
  const db = await database();
  try {
    if (!stillCurrent()) return false;
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('workspace', 'readwrite'), store = tx.objectStore('workspace');
      // Preserve unreadable data in the SAME transaction as its replacement.
      // Failed archive/write aborts everything; a default cannot erase it.
      for (const key of ['current', 'project:' + value.documentId]) {
        const read = store.get(key);
        read.onsuccess = () => {
          if (read.result === undefined) return;
          let preserve: boolean;
          try { preserve = !!validateSavedWorkspace(read.result).recovery?.length; } catch { preserve = true; }
          if (preserve) store.put({key,raw:read.result,message:'Original saved data retained before recovery.'}, 'recovery:' + crypto.randomUUID());
        };
      }
      store.put(value, 'project:' + value.documentId);
      store.put({documentId:value.documentId,name:value.project.name,savedAt:value.savedAt}, 'summary:' + value.documentId);
      store.put(value, 'current');
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || Error('Saving was interrupted.'));
    });
  } finally { db.close(); }
}
export async function readSavedProjects(): Promise<{projects: SavedProjectSummary[]; recovery: RecoveryRecord[]}> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('workspace'), store = tx.objectStore('workspace');
      const projects: SavedProjectSummary[] = [], recovery: RecoveryRecord[] = [];
      const request = store.openCursor(IDBKeyRange.bound('recovery:', 'summary:\uffff'));
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;
        const key = String(cursor.key), value = cursor.value;
        if (key.startsWith('summary:')) {
          if (value && typeof value === 'object' && typeof value.documentId === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(value.documentId) && typeof value.name === 'string')
            projects.push({documentId:value.documentId,name:value.name,savedAt:date(value.savedAt)});
          else recovery.push({key,raw:value,message:'A saved project entry needs recovery.'});
        } else if (key.startsWith('recovery:')) recovery.push({key,raw:value,message:'Original saved data is available for recovery.'});
        cursor.continue();
      };
      tx.oncomplete = () => resolve({projects:projects.sort((a,b) => b.savedAt.localeCompare(a.savedAt)),recovery});
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally { db.close(); }
}
export async function listSavedProjects(): Promise<SavedProjectSummary[]> { return (await readSavedProjects()).projects; }
export { imageData } from './imageImport';
