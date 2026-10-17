import { validateProject, type Project } from "./model";
import { editorSelection, type EditorSelection } from './workspace';
export type Snapshot = {
  id: string;
  name: string;
  project: Project;
  savedAt: string;
};
export type Saved = { project: Project; snapshots: Snapshot[]; documentId: string; editor: EditorSelection; revision: number; savedAt: string };
export type SavedProjectSummary = Pick<Saved, 'documentId' | 'savedAt'> & { name: string };
export function validateSavedWorkspace(value: unknown): Saved {
  if (!value || typeof value !== 'object') throw Error('Invalid saved workspace.');
  const raw = value as Partial<Saved>, project = validateProject(raw.project);
  // The old single-workspace envelope had no identity or selection. Migrate only
  // the envelope; project validators and renderer versions remain unchanged.
  const documentId = typeof raw.documentId === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(raw.documentId) ? raw.documentId : crypto.randomUUID();
  return { project, documentId, editor: editorSelection(project, raw.editor), revision: Number.isSafeInteger(raw.revision) && raw.revision! >= 0 ? raw.revision! : 0,
    savedAt: typeof raw.savedAt === 'string' && Number.isFinite(Date.parse(raw.savedAt)) ? raw.savedAt : '',
    snapshots: (Array.isArray(raw.snapshots) ? raw.snapshots : []).slice(0, 5).map(s => ({id: String(s.id).slice(0,100),name:String(s.name).slice(0,100),savedAt:String(s.savedAt).slice(0,100),project:validateProject(s.project)})) };
}
const DB = "eidos-playground-v1";
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("workspace");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(
        new Error("Close other Playground tabs to finish opening storage."),
      );
  });
}
export async function loadWorkspace(documentId?: string): Promise<Saved | null> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db
        .transaction("workspace")
        .objectStore("workspace")
        .get(documentId ? 'project:' + documentId : 'current');
      request.onsuccess = () => {
        try {
          resolve(request.result ? validateSavedWorkspace(request.result) : null);
        } catch (e) {
          reject(e);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
export async function saveWorkspace(value: Saved, stillCurrent: () => boolean = () => true): Promise<void> {
  const db = await database();
  try {
    // Database acquisition can finish after another project/revision was saved.
    // Do not let an obsolete request replace the single current-workspace key.
    // There is no await between this check and put: transactions created after
    // it retain IndexedDB's ordering for this object store.
    if (!stillCurrent()) return;
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("workspace", "readwrite");
      const store = tx.objectStore("workspace");
      store.put(value, 'project:' + value.documentId);
      store.put({documentId:value.documentId,name:value.project.name,savedAt:value.savedAt}, 'summary:' + value.documentId);
      store.put(value, "current");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export async function listSavedProjects(): Promise<SavedProjectSummary[]> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('workspace').objectStore('workspace').getAll(IDBKeyRange.bound('summary:', 'summary:\uffff'));
      request.onsuccess = () => resolve((request.result as SavedProjectSummary[]).filter(s => typeof s.documentId === 'string' && typeof s.name === 'string').sort((a,b) => b.savedAt.localeCompare(a.savedAt)));
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
export async function imageData(file: File): Promise<string> {
  if (
    !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
    file.size > 8_000_000
  )
    throw new Error("Choose a PNG, JPEG, or WebP image smaller than 8 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.width || !image.height || image.width * image.height > 16_000_000 || image.width > 12000 || image.height > 12000) throw new Error("Choose an image below 16 megapixels and 12,000 pixels per side.");
    const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Image processing is unavailable in this browser.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/webp", 0.88);
    if (data.length > 4_500_000)
      throw new Error(
        "This image is too large after processing. Try a smaller image.",
      );
    return data;
  } finally {
    URL.revokeObjectURL(url);
  }
}
