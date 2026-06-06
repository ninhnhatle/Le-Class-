const DB_NAME = "lestudy-knowledge-video";
const DB_VERSION = 1;
const STORE_NAME = "blobs";
const CUSTOM_VIDEO_KEY = "custom";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function saveCustomKnowledgeVideo(blob: Blob): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Failed to save video"));
    };
    tx.objectStore(STORE_NAME).put(blob, CUSTOM_VIDEO_KEY);
  });
}

export async function loadCustomKnowledgeVideo(): Promise<Blob | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(CUSTOM_VIDEO_KEY);

    request.onsuccess = () => {
      const result = request.result;
      resolve(result instanceof Blob ? result : null);
    };
    request.onerror = () => reject(request.error ?? new Error("Failed to load video"));

    tx.oncomplete = () => db.close();
  });
}

export async function deleteCustomKnowledgeVideo(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Failed to delete video"));
    };
    tx.objectStore(STORE_NAME).delete(CUSTOM_VIDEO_KEY);
  });
}
