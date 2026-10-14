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
        request.onsuccess = () => resolve(request.result || null);
      };
    });
    if (!value) return null;
    if (value.snapshot.documentId !== documentId) throw Error('Saved review belongs to another project.');
    return await verifyFrozenPackage(value);
  } finally { db.close(); }
}
