import type { CharacterId, Look, SavedLook } from "@/lib/types";

/**
 * Versioned localStorage persistence — rule `client-localstorage-schema`.
 * - Key carries a version (`looks:v2`) so schema changes migrate cleanly.
 * - All reads/writes wrapped in try-catch (localStorage throws in private
 *   browsing, when disabled, or on quota overflow).
 * - Exposed as an external store (`useSyncExternalStore`) so client-only data
 *   never diverges from the server render during hydration.
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
let snapshot: SavedLook[] = [];
const listeners = new Set<() => void>();

function defaultValue(): StoredShape {
  return { looks: {}, nextId: 1 };
}

/** Seeded example outfits so the Hall of Fame ships populated (2 pages of 3×3). */
function seedExamples(shape: StoredShape) {
  const combos: Array<{ emir: Look; friska: Look; sceneId: string }> = [
    { emir: { top: "emir-top-hoodie", bottom: "emir-bottom-joggers", shoes: "emir-shoes-boots" }, friska: { top: "friska-top-halter", bottom: "friska-bottom-scratch", shoes: "friska-shoes-high-tops" }, sceneId: "dance-floor" },
    { emir: { top: "emir-top-tee", bottom: "emir-bottom-shorts", shoes: "emir-shoes-high-tops", accessory: "emir-accessory-masks" }, friska: { top: "friska-top-blazer", bottom: "friska-bottom-jeans", shoes: "friska-shoes-cowboy" }, sceneId: "stage" },
    { emir: { top: "emir-top-jacket", bottom: "emir-bottom-utility", shoes: "emir-shoes-high-tops" }, friska: { top: "friska-top-tee", bottom: "friska-bottom-button", shoes: "friska-shoes-knee-boots" }, sceneId: "dance-floor" },
    { emir: { top: "emir-top-hoodie", bottom: "emir-bottom-shorts", shoes: "emir-shoes-boots" }, friska: { top: "friska-top-halter", bottom: "friska-bottom-jeans", shoes: "friska-shoes-cowboy" }, sceneId: "stage" },
    { emir: { top: "emir-top-tee", bottom: "emir-bottom-joggers", shoes: "emir-shoes-high-tops", accessory: "emir-accessory-masks" }, friska: { top: "friska-top-blazer", bottom: "friska-bottom-scratch", shoes: "friska-shoes-high-tops" }, sceneId: "dance-floor" },
    { emir: { top: "emir-top-jacket", bottom: "emir-bottom-shorts", shoes: "emir-shoes-boots" }, friska: { top: "friska-top-tee", bottom: "friska-bottom-button", shoes: "friska-shoes-cowboy" }, sceneId: "stage" },
    { emir: { top: "emir-top-hoodie", bottom: "emir-bottom-utility", shoes: "emir-shoes-boots" }, friska: { top: "friska-top-halter", bottom: "friska-bottom-jeans", shoes: "friska-shoes-knee-boots" }, sceneId: "dance-floor" },
    { emir: { top: "emir-top-tee", bottom: "emir-bottom-joggers", shoes: "emir-shoes-high-tops" }, friska: { top: "friska-top-blazer", bottom: "friska-bottom-scratch", shoes: "friska-shoes-high-tops" }, sceneId: "stage" },
    { emir: { top: "emir-top-jacket", bottom: "emir-bottom-shorts", shoes: "emir-shoes-high-tops", accessory: "emir-accessory-masks" }, friska: { top: "friska-top-tee", bottom: "friska-bottom-button", shoes: "friska-shoes-knee-boots" }, sceneId: "dance-floor" },
    { emir: { top: "emir-top-hoodie", bottom: "emir-bottom-utility", shoes: "emir-shoes-boots" }, friska: { top: "friska-top-halter", bottom: "friska-bottom-scratch", shoes: "friska-shoes-cowboy" }, sceneId: "stage" },
  ];
  const base = Date.now();
  combos.forEach((c, i) => {
    const id = String(shape.nextId);
    shape.looks[id] = {
      id,
      looks: { emir: c.emir, friska: c.friska },
      sceneId: c.sceneId,
      savedAt: base - (combos.length - i) * 60_000,
      demo: true,
    };
    shape.nextId += 1;
  });
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
  // Seed examples on a fresh install only (never had data before).
  if (store.nextId === 1 && Object.keys(store.looks).length === 0) {
    seedExamples(store);
  }
  cache = store;
  return store;
}

function notify() {
  snapshot = Object.values(readAll().looks);
  for (const listener of listeners) listener();
}

function writeAll(shape: StoredShape) {
  cache = shape;
  snapshot = Object.values(shape.looks);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shape));
  } catch {
    // storage unavailable (incognito/quota) — in-memory state still works for the session
  }
  for (const listener of listeners) listener();
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

/** Client snapshot — referentially stable between changes (for useSyncExternalStore). */
export function getLooksSnapshot(): SavedLook[] {
  if (!cache) snapshot = Object.values(readAll().looks);
  return snapshot;
}

/** Server / hydration snapshot — empty, since localStorage is client-only. */
const SERVER_SNAPSHOT: SavedLook[] = [];
export function getServerLooksSnapshot(): SavedLook[] {
  return SERVER_SNAPSHOT;
}

/** Subscribe to look changes (same-tab writes + cross-tab `storage` events). */
export function subscribeLooks(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      notify();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}
