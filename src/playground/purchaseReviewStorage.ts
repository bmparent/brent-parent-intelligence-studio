import { verifyFrozenPackage, type FrozenPackage } from './purchaseSnapshot';

// Separate local database: review writes cannot replace an editable workspace.
async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('eidos-playground-reviews-v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('packages');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(Error('Close another Playground tab to open local review storage.'));
  });
}
export async function saveFrozenReview(value: FrozenPackage, stillCurrent = () => true): Promise<boolean> {
  await verifyFrozenPackage(value);
  const db = await database();
  try {
    if (!stillCurrent()) return false;
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('packages', 'readwrite'), store = transaction.objectStore('packages');
      store.put(value, 'snapshot:' + value.snapshot.snapshotHash);
      store.put(value.snapshot.snapshotHash, 'document:' + value.snapshot.documentId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    return true;
  } finally { db.close(); }
}
export async function loadFrozenReview(documentId: string): Promise<FrozenPackage | null> {
  const db = await database();
  try {
    const value = await new Promise<FrozenPackage | null>((resolve, reject) => {
      const store = db.transaction('packages').objectStore('packages'), head = store.get('document:' + documentId);
      head.onerror = () => reject(head.error);
      head.onsuccess = () => {
        if (!head.result) { resolve(null); return; }
        const request = store.get('snapshot:' + head.result);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const value = request.result as FrozenPackage | undefined;
          if (!value || value.snapshot.documentId === documentId) { resolve(value || null); return; }
          const alias = store.get('alias:' + documentId);
          alias.onerror = () => reject(alias.error);
          alias.onsuccess = () => alias.result?.snapshotHash === value.snapshot.snapshotHash && alias.result?.sourceDocumentId === value.snapshot.documentId ? resolve(value) : reject(Error('Saved review belongs to another project.'));
        };
      };
    });
    if (!value) return null;
    return await verifyFrozenPackage(value);
  } finally { db.close(); }
}
/** A recovered editable copy gets a new local identity; the paid receipt keeps
 * its immutable server identity. Existing draft/review head keys are untouched. */
export async function saveRecoveredReview(value: FrozenPackage, localDocumentId: string): Promise<void> {
  await verifyFrozenPackage(value);
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(localDocumentId) || localDocumentId === value.snapshot.documentId) throw Error('Recovered editing copies need a separate local identity.');
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('packages', 'readwrite'), store = transaction.objectStore('packages');
      store.put(value, 'snapshot:' + value.snapshot.snapshotHash);
      store.put(value.snapshot.snapshotHash, 'document:' + localDocumentId);
      store.put({ sourceDocumentId: value.snapshot.documentId, snapshotHash: value.snapshot.snapshotHash }, 'alias:' + localDocumentId);
      transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); transaction.onabort = () => reject(transaction.error);
    });
  } finally { db.close(); }
}
