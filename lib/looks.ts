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

const STORAGE_KEY = "looks:v4";
const LEGACY_KEY = "looks:v3";

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

/** Seeded example outfits so the Hall of Fame ships populated with rich community looks. */
function seedExamples(shape: StoredShape) {
  const sampleCreators = [
    "@whitechorus",
    "@clara.friska",
    "@emir.agung",
    "@lufs_jakarta",
    "@afterglow.stylist",
    "@strobe_dusk",
    "@row9_krapela",
    "@melayang_vibes",
    "@synth_pop_id",
    "@bandung_sound",
    "@senayan_rave",
    "@jakarta_underground",
    "@kemang_club",
    "@electro_chic",
    "@midnight_strobe",
    "@triphop_aesthetic",
    "@dusk_stylist",
    "@retro_glow",
    "@neon_afterglow",
    "@indie_jakarta",
  ];

  const sampleAvgs = [4.9, 4.8, 5.0, 4.7, 4.6, 4.9, 4.8, 4.5, 4.9, 5.0, 4.7, 4.8, 4.9, 4.6, 5.0, 4.8, 4.7, 4.9, 4.8, 5.0];
  const sampleCounts = [42, 28, 65, 19, 14, 33, 25, 12, 51, 88, 22, 31, 45, 16, 73, 29, 18, 37, 26, 60];

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
    { emir: { top: "emir-top-tee", bottom: "emir-bottom-utility", shoes: "emir-shoes-high-tops" }, friska: { top: "friska-top-tee", bottom: "friska-bottom-jeans", shoes: "friska-shoes-knee-boots" }, sceneId: "dance-floor" },
    { emir: { top: "emir-top-jacket", bottom: "emir-bottom-joggers", shoes: "emir-shoes-boots", accessory: "emir-accessory-masks" }, friska: { top: "friska-top-blazer", bottom: "friska-bottom-button", shoes: "friska-shoes-high-tops" }, sceneId: "stage" },
    { emir: { top: "emir-top-hoodie", bottom: "emir-bottom-shorts", shoes: "emir-shoes-high-tops" }, friska: { top: "friska-top-halter", bottom: "friska-bottom-scratch", shoes: "friska-shoes-knee-boots" }, sceneId: "dance-floor" },
    { emir: { top: "emir-top-jacket", bottom: "emir-bottom-utility", shoes: "emir-shoes-boots" }, friska: { top: "friska-top-tee", bottom: "friska-bottom-jeans", shoes: "friska-shoes-cowboy" }, sceneId: "stage" },
    { emir: { top: "emir-top-tee", bottom: "emir-bottom-shorts", shoes: "emir-shoes-boots", accessory: "emir-accessory-masks" }, friska: { top: "friska-top-halter", bottom: "friska-bottom-button", shoes: "friska-shoes-high-tops" }, sceneId: "dance-floor" },
    { emir: { top: "emir-top-hoodie", bottom: "emir-bottom-joggers", shoes: "emir-shoes-high-tops" }, friska: { top: "friska-top-blazer", bottom: "friska-bottom-jeans", shoes: "friska-shoes-knee-boots" }, sceneId: "stage" },
    { emir: { top: "emir-top-jacket", bottom: "emir-bottom-shorts", shoes: "emir-shoes-boots" }, friska: { top: "friska-top-halter", bottom: "friska-bottom-scratch", shoes: "friska-shoes-cowboy" }, sceneId: "dance-floor" },
    { emir: { top: "emir-top-tee", bottom: "emir-bottom-utility", shoes: "emir-shoes-high-tops", accessory: "emir-accessory-masks" }, friska: { top: "friska-top-tee", bottom: "friska-bottom-button", shoes: "friska-shoes-high-tops" }, sceneId: "stage" },
    { emir: { top: "emir-top-hoodie", bottom: "emir-bottom-joggers", shoes: "emir-shoes-boots" }, friska: { top: "friska-top-blazer", bottom: "friska-bottom-scratch", shoes: "friska-shoes-knee-boots" }, sceneId: "dance-floor" },
    { emir: { top: "emir-top-jacket", bottom: "emir-bottom-utility", shoes: "emir-shoes-high-tops" }, friska: { top: "friska-top-halter", bottom: "friska-bottom-jeans", shoes: "friska-shoes-cowboy" }, sceneId: "stage" },
  ];

  const base = Date.now();
  combos.forEach((c, i) => {
    const id = String(shape.nextId);
    shape.looks[id] = {
      id,
      looks: { emir: c.emir, friska: c.friska },
      sceneId: c.sceneId,
      savedAt: base - (combos.length - i) * 120_000,
      demo: true,
      username: sampleCreators[i % sampleCreators.length],
      rating: 0,
      ratingAvg: sampleAvgs[i % sampleAvgs.length],
      ratingsCount: sampleCounts[i % sampleCounts.length],
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
    localStorage.removeItem(LEGACY_KEY); // drop previous version data
  } catch {
    store = defaultValue();
  }
  // Seed examples on fresh key
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

const MY_LOOKS_KEY = "my_look_ids:v1";

export function getMyLookIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(MY_LOOKS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function isMyLook(id: string): boolean {
  return getMyLookIds().has(id);
}

export function addMyLookId(id: string) {
  if (typeof window === "undefined") return;
  try {
    const set = getMyLookIds();
    set.add(id);
    localStorage.setItem(MY_LOOKS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function saveLook(
  looks: Record<CharacterId, Look>,
  sceneId: string,
  username = "Anonymous Stylist",
  rating = 0,
  customScene?: import("@/lib/types").CustomSceneData,
  customKaos?: Partial<Record<CharacterId, import("@/lib/types").CustomKaosData>>,
): SavedLook {
  const shape = readAll();
  const id = String(shape.nextId);
  const cleanUsername = username.trim() ? (username.startsWith("@") ? username.trim() : `@${username.trim()}`) : "@stylist";
  const userRate = Math.max(0, Math.min(5, rating));
  const saved: SavedLook = {
    id,
    looks,
    sceneId,
    ...(customScene && sceneId === "custom" ? { customScene } : {}),
    ...(customKaos && Object.keys(customKaos).length > 0 ? { customKaos } : {}),
    savedAt: Date.now(),
    username: cleanUsername,
    rating: userRate,
    ratingAvg: userRate > 0 ? userRate : 0,
    ratingsCount: userRate > 0 ? 1 : 0,
  };
  shape.looks[id] = saved;
  shape.nextId += 1;
  writeAll(shape);
  addMyLookId(id);
  return saved;
}

export function rateLook(id: string, newRating: number): boolean {
  // Prevent rating own submission
  if (isMyLook(id)) {
    return false;
  }

  const shape = readAll();
  const target = shape.looks[id];
  if (!target) return false;

  const validRate = Math.max(1, Math.min(5, newRating));
  const prevCount = target.ratingsCount ?? 0;
  const prevAvg = target.ratingAvg ?? 0;
  const prevUserRating = target.rating ?? 0;

  let newCount = prevCount;
  let totalScore = prevAvg * prevCount;

  if (prevUserRating > 0) {
    totalScore = totalScore - prevUserRating + validRate;
  } else {
    newCount = prevCount + 1;
    totalScore = totalScore + validRate;
  }

  target.rating = validRate;
  target.ratingsCount = newCount;
  target.ratingAvg = Number((totalScore / Math.max(1, newCount)).toFixed(1));
  writeAll(shape);
  return true;
}

export function deleteLook(id: string): boolean {
  if (!isMyLook(id)) return false;
  const shape = readAll();
  delete shape.looks[id];
  writeAll(shape);
  return true;
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
