import type { CharacterId, Look, SavedLook } from "@/lib/types";

/**
 * Versioned localStorage persistence — rule `client-localstorage-schema`.
 * - Key carries a version (`looks:v2`) so schema changes migrate cleanly.
 * - All reads/writes wrapped in try-catch (localStorage throws in private
 *   browsing, when disabled, or on quota overflow).
 * - Reads cached in memory and invalidated on cross-tab `storage` events
 *   (rule `js-cache-storage`).
 *
 * v2 stores a full stage snapshot (both characters + scene). Legacy `looks:v1`
 * held placeholder color-block looks and is dropped on first load.
 */

const STORAGE_KEY = "looks:v2";
const LEGACY_KEY = "looks:v1";

interface StoredShape {
  looks: Record<string, SavedLook>;
  nextId: number;
}

let cache: StoredShape | null = null;

function defaultValue(): StoredShape {
  return { looks: {}, nextId: 1 };
}

function readAll(): StoredShape {
  if (cache) return cache;
  let store = defaultValue();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) store = JSON.parse(raw) as StoredShape;
    localStorage.removeItem(LEGACY_KEY); // drop placeholder-era data
  } catch {
    store = defaultValue();
  }
  cache = store;
  return store;
}

function writeAll(shape: StoredShape) {
  cache = shape;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shape));
  } catch {
    // storage unavailable (incognito/quota) — in-memory state still works for the session
  }
}

export function saveLook(
  looks: Record<CharacterId, Look>,
  sceneId: string,
): SavedLook {
  const shape = readAll();
  const id = String(shape.nextId);
  const saved: SavedLook = { id, looks, sceneId, savedAt: Date.now() };
  shape.looks[id] = saved;
  shape.nextId += 1;
  writeAll(shape);
  return saved;
}

export function loadLooks(): SavedLook[] {
  return Object.values(readAll().looks);
}

export function deleteLook(id: string) {
  const shape = readAll();
  delete shape.looks[id];
  writeAll(shape);
}

/** Restore a previously deleted look with its original id (undo). */
export function restoreLook(saved: SavedLook) {
  const shape = readAll();
  shape.looks[saved.id] = saved;
  const n = Number.parseInt(saved.id, 10);
  if (!Number.isNaN(n) && n >= shape.nextId) shape.nextId = n + 1;
  writeAll(shape);
}

/** Listen for writes from other tabs and refresh the in-memory cache. */
export function subscribeLooks(onChange: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      onChange();
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
