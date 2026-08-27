import type { CharacterId, Look, SavedLook } from "@/lib/types";
import { createBrowserClient } from "@/lib/supabase/client";
import { uploadOutfitAsset } from "@/lib/supabase/storage";

const STORAGE_KEY = "looks:v5";
const LEGACY_KEYS = ["looks:v3", "looks:v4"];
const MY_LOOKS_KEY = "my_look_ids:v2";

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

function readAll(): StoredShape {
  if (cache) return cache;
  let store = defaultValue();
  let needsRewrite = false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      store = JSON.parse(raw) as StoredShape;
      // Prune any legacy dummy/demo looks so Hall of Fame only has real data
      if (store.looks && typeof store.looks === "object") {
        for (const id of Object.keys(store.looks)) {
          if (store.looks[id]?.demo || id.startsWith("demo-")) {
            delete store.looks[id];
            needsRewrite = true;
          }
        }
      }
    }
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    store = defaultValue();
  }

  cache = store;
  if (needsRewrite) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch {}
  }
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
    // in-memory fallback
  }
  for (const listener of listeners) listener();
}

const ANON_LOOKS_KEY = "stylist:anon_look_ids:v1";
const LEGACY_MY_LOOK_KEYS = ["my_look_ids:v1", "my_look_ids:v2"];

export function getAnonymousLookIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    // Purge legacy unscoped keys that caused cross-account ownership bleed
    LEGACY_MY_LOOK_KEYS.forEach((k) => localStorage.removeItem(k));
    const raw = localStorage.getItem(ANON_LOOKS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function addAnonymousLookId(id: string) {
  if (typeof window === "undefined") return;
  try {
    const set = getAnonymousLookIds();
    set.add(id);
    localStorage.setItem(ANON_LOOKS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

export function isLookAuthor(look: SavedLook | undefined | null, currentUserId?: string | null): boolean {
  if (!look) return false;
  // If look has a database userId
  if (look.userId) {
    return !!currentUserId && look.userId === currentUserId;
  }
  // Demo looks belong to nobody
  if (look.demo) return false;
  // If guest without userId, check anonymous look session
  if (!currentUserId) {
    return getAnonymousLookIds().has(look.id);
  }
  return false;
}

export function isMyLook(id: string, currentUserId?: string | null): boolean {
  const shape = readAll();
  const target = shape.looks[id];
  return isLookAuthor(target, currentUserId);
}

/**
 * Fetch public looks from Supabase Postgres database and merge with optimistic cache.
 */
export async function syncRemoteLooks(): Promise<void> {
  const supabase = createBrowserClient();
  if (!supabase) return;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    // Fetch outfits joined with creator profiles
    const { data: outfitsData, error: outfitsError } = await supabase
      .from("outfits")
      .select(`
        id,
        user_id,
        title,
        scene_id,
        looks,
        custom_scene,
        custom_kaos,
        rating_avg,
        ratings_count,
        created_at,
        profiles (
          username,
          display_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(60);

    if (outfitsError || !outfitsData) return;

    // Fetch user's individual ratings if signed in
    let userRatingsMap = new Map<string, number>();
    if (currentUserId) {
      const { data: ratingsData } = await (supabase as any)
        .from("outfit_ratings")
        .select("outfit_id, stars")
        .eq("user_id", currentUserId);

      if (ratingsData && Array.isArray(ratingsData)) {
        ratingsData.forEach((r: any) => userRatingsMap.set(r.outfit_id, r.stars));
      }
    }

    const shape = readAll();

    outfitsData.forEach((row: any) => {
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const username = profile?.username ? `@${profile.username}` : "@stylist";

      shape.looks[row.id] = {
        id: row.id,
        userId: row.user_id,
        title: row.title || "Untitled Look",
        looks: (row.looks as Record<CharacterId, Look>) || { emir: {}, friska: {} },
        sceneId: row.scene_id,
        customScene: (row.custom_scene as any) || undefined,
        customKaos: (row.custom_kaos as any) || undefined,
        savedAt: new Date(row.created_at).getTime(),
        username,
        rating: userRatingsMap.get(row.id) ?? 0,
        ratingAvg: Number(row.rating_avg) || 0,
        ratingsCount: Number(row.ratings_count) || 0,
      };
    });

    writeAll(shape);
  } catch (err) {
    console.warn("Failed to sync looks with remote Supabase database:", err);
  }
}

export async function saveLook(
  looks: Record<CharacterId, Look>,
  sceneId: string,
  username = "Anonymous Stylist",
  rating = 0,
  customScene?: import("@/lib/types").CustomSceneData,
  customKaos?: Partial<Record<CharacterId, import("@/lib/types").CustomKaosData>>,
  title = "Untitled Look",
  characterOrder?: CharacterId[]
): Promise<SavedLook> {
  const supabase = createBrowserClient();
  const shape = readAll();
  const localId = `look-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const cleanUsername = username.trim() ? (username.startsWith("@") ? username.trim() : `@${username.trim()}`) : "@stylist";
  const userRate = Math.max(0, Math.min(5, rating));
  const order = characterOrder ?? ["emir", "friska"];

  const saved: SavedLook = {
    id: localId,
    title,
    looks,
    characterOrder: order,
    sceneId,
    ...(customScene && sceneId === "custom" ? { customScene } : {}),
    ...(customKaos && Object.keys(customKaos).length > 0 ? { customKaos } : {}),
    savedAt: Date.now(),
    username: cleanUsername,
    rating: userRate,
    ratingAvg: userRate > 0 ? userRate : 0,
    ratingsCount: userRate > 0 ? 1 : 0,
  };

  // Optimistic local cache update
  shape.looks[localId] = saved;
  addAnonymousLookId(localId);
  writeAll(shape);

  // Background Supabase Sync
  if (supabase) {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const userId = session.user.id;

        // Upload custom background asset if present
        let uploadedCustomScene = customScene;
        if (customScene?.src && customScene.src.startsWith("data:")) {
          const bgUrl = await uploadOutfitAsset(userId, customScene.src, "bg");
          uploadedCustomScene = { ...customScene, src: bgUrl };
        }

        // Upload custom kaos artwork assets if present
        let uploadedCustomKaos = customKaos;
        if (customKaos) {
          uploadedCustomKaos = { ...customKaos };
          for (const charId of ["emir", "friska"] as CharacterId[]) {
            const data = customKaos[charId];
            if (data?.artworkSrc && data.artworkSrc.startsWith("data:")) {
              const artUrl = await uploadOutfitAsset(
                userId,
                data.artworkSrc,
                charId === "emir" ? "kaos_emir" : "kaos_friska"
              );
              uploadedCustomKaos[charId] = { ...data, artworkSrc: artUrl };
            }
          }
        }

        const { data: inserted, error } = await (supabase as any)
          .from("outfits")
          .insert({
            user_id: userId,
            title,
            scene_id: sceneId,
            looks: looks as any,
            custom_scene: uploadedCustomScene ? (uploadedCustomScene as any) : null,
            custom_kaos: uploadedCustomKaos ? (uploadedCustomKaos as any) : null,
            is_public: true,
          })
          .select("id, created_at")
          .single();

        if (!error && inserted) {
          // Replace local optimistic key with database UUID
          delete shape.looks[localId];
          const dbSaved: SavedLook = {
            ...saved,
            id: inserted.id,
            userId,
            customScene: uploadedCustomScene,
            customKaos: uploadedCustomKaos,
            savedAt: new Date(inserted.created_at).getTime(),
          };
          shape.looks[inserted.id] = dbSaved;
          writeAll(shape);
        }
      } catch (e) {
        console.warn("Supabase background save error fallback to local:", e);
      }
    })();
  }

  return saved;
}

export async function rateLook(id: string, newRating: number, currentUserId?: string | null): Promise<boolean> {
  if (!currentUserId) return false;

  const shape = readAll();
  const target = shape.looks[id];
  if (!target) return false;

  // Prevent rating own submission
  if (isLookAuthor(target, currentUserId)) {
    return false;
  }

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

  // Optimistic local update
  target.rating = validRate;
  target.ratingsCount = newCount;
  target.ratingAvg = Number((totalScore / Math.max(1, newCount)).toFixed(1));
  writeAll(shape);

  // Sync with Supabase Database
  const supabase = createBrowserClient();
  if (supabase && !id.startsWith("demo-") && !id.startsWith("look-")) {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        await (supabase as any)
          .from("outfit_ratings")
          .upsert(
            {
              outfit_id: id,
              user_id: session.user.id,
              stars: validRate,
            },
            { onConflict: "outfit_id,user_id" }
          );
      } catch (err) {
        console.warn("Remote rating error fallback:", err);
      }
    })();
  }

  return true;
}

export async function deleteLook(id: string, currentUserId?: string | null): Promise<boolean> {
  const shape = readAll();
  const target = shape.looks[id];
  if (!target || !isLookAuthor(target, currentUserId)) return false;

  delete shape.looks[id];
  writeAll(shape);

  const supabase = createBrowserClient();
  if (supabase && !id.startsWith("demo-") && !id.startsWith("look-")) {
    (async () => {
      try {
        await supabase.from("outfits").delete().eq("id", id);
      } catch (err) {
        console.warn("Remote delete error fallback:", err);
      }
    })();
  }

  return true;
}

export function restoreLook(saved: SavedLook) {
  const shape = readAll();
  shape.looks[saved.id] = saved;
  writeAll(shape);
}

export function getLooksSnapshot(): SavedLook[] {
  if (!cache) snapshot = Object.values(readAll().looks);
  return snapshot;
}

const SERVER_SNAPSHOT: SavedLook[] = [];
export function getServerLooksSnapshot(): SavedLook[] {
  return SERVER_SNAPSHOT;
}

export function subscribeLooks(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}
