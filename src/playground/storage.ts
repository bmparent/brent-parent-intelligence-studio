import { validateProject, type Project } from "./model";
export type Snapshot = {
  id: string;
  name: string;
  project: Project;
  savedAt: string;
};
export type Saved = { project: Project; snapshots: Snapshot[] };
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
export async function loadWorkspace(): Promise<Saved | null> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db
        .transaction("workspace")
        .objectStore("workspace")
        .get("current");
      request.onsuccess = () => {
        try {
          const value = request.result as Saved | undefined;
          resolve(
            value
              ? {
                  project: validateProject(value.project),
                  snapshots: value.snapshots
                    .slice(0, 5)
                    .map((s) => ({
                      ...s,
                      project: validateProject(s.project),
                    })),
                }
              : null,
          );
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
export async function saveWorkspace(value: Saved): Promise<void> {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("workspace", "readwrite");
      tx.objectStore("workspace").put(value, "current");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
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
