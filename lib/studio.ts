"use client";

// Stockage des enregistrements du studio dans le téléphone (IndexedDB) :
// ils survivent à la fermeture de l'application, on peut s'y reprendre en plusieurs fois.

const BASE = "lucide-studio";
const TABLE = "enregistrements";

function ouvrir(): Promise<IDBDatabase> {
  return new Promise((resoudre, rejeter) => {
    const req = indexedDB.open(BASE, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(TABLE);
    req.onsuccess = () => resoudre(req.result);
    req.onerror = () => rejeter(req.error);
  });
}

async function transaction<T>(mode: IDBTransactionMode, action: (t: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await ouvrir();
  return new Promise((resoudre, rejeter) => {
    const req = action(db.transaction(TABLE, mode).objectStore(TABLE));
    req.onsuccess = () => resoudre(req.result);
    req.onerror = () => rejeter(req.error);
  });
}

export const enregistrerAudio = (jour: number, audio: Blob) => transaction("readwrite", (t) => t.put(audio, jour));
export const supprimerAudio = (jour: number) => transaction("readwrite", (t) => t.delete(jour));

/** Tous les enregistrements, par numéro de jour. */
export async function lireAudios(): Promise<Map<number, Blob>> {
  const [cles, valeurs] = await Promise.all([
    transaction("readonly", (t) => t.getAllKeys()),
    transaction("readonly", (t) => t.getAll()),
  ]);
  return new Map(cles.map((c, i) => [Number(c), valeurs[i] as Blob]));
}

/** Format d'enregistrement accepté par le navigateur (MP4/AAC sur iPhone, WebM/Opus ailleurs). */
export function formatEnregistrement(): { type: string; extension: string } {
  for (const [type, extension] of [
    ["audio/mp4", "m4a"],
    ["audio/webm;codecs=opus", "webm"],
    ["audio/webm", "webm"],
  ] as const) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return { type, extension };
  }
  return { type: "", extension: "webm" };
}

export function extensionPour(blob: Blob): string {
  return blob.type.includes("mp4") ? "m4a" : "webm";
}
