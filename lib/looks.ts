import type { Look, SavedLook } from "@/lib/types";

/**
 * Versioned localStorage schema — rule `client-localstorage-schema`.
 * - Key carries a version (`looks:v1`) so future schema changes can migrate,
 *   never collide, and never silently corrupt saved looks.
 * - All reads/writes wrapped in try-catch (localStorage throws in private
 *   browsing, when disabled, or on quota overflow).
 * - Reads cached in memory (rule `js-cache-storage`).
 */

const STORAGE_KEY = "looks:v1";

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
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as StoredShape) : defaultValue();
  } catch {
    cache = defaultValue();
  }
  return cache;
}

function writeAll(shape: StoredShape) {
  cache = shape;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shape));
  } catch {
    // storage unavailable (incognito/quota) — in-memory state still works for the session
  }
}

export function saveLook(characterId: string, items: Look): SavedLook {
  const shape = readAll();
  const id = String(shape.nextId);
  const saved: SavedLook = {
    id,
    characterId,
    items,
    savedAt: Date.now(),
  };
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
