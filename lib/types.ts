export type CharacterId = "emir" | "friska";

/** Body position a wardrobe layer occupies. */
export type SlotId =
  | "hair"
  | "top"
  | "bottom"
  | "one-piece"
  | "shoes"
  | "accessory";

export interface Character {
  id: CharacterId;
  name: string;
  fullName: string;
  /** Transparent base body (hair baked in). Same canvas as its wardrobe layers. */
  baseSrc: string;
  /** Slots that actually have wardrobe items for this character. */
  slots: SlotId[];
}

export interface WardrobeItem {
  id: string;
  characterId: CharacterId;
  slot: SlotId;
  name: string;
  /** Full-canvas transparent layer, aligned to the character base. */
  src: string;
  /** Cropped preview for the wardrobe grid. */
  thumb: string;
}

export interface Scene {
  id: string;
  name: string;
  src: string;
}

export interface CustomSceneData {
  /** Base64 data URL or image source */
  src: string;
  /** Horizontal position percentage 0-100 (50 = centered) */
  posX: number;
  /** Vertical position percentage 0-100 (50 = centered) */
  posY: number;
  /** Zoom scale 1.0 to 2.5 */
  scale: number;
}

export interface CustomKaosData {
  /** Mode: pattern upload, freehand paint, or solid color */
  mode: "pattern" | "paint" | "color";
  /** PNG / compressed image data URL of the pattern or drawing (projected to 990x1400 full canvas) */
  artworkSrc?: string;
  /** High-resolution close-up 600x600 editor artwork for resuming paint editing */
  editorArtworkSrc?: string;
  /** Raw pattern source data URL */
  editorPatternSrc?: string;
  /** Solid background color (hex string, e.g. "#ffffff") */
  color?: string;
  /** Horizontal pan offset percentage 0-100 (50 = centered) */
  posX?: number;
  /** Vertical pan offset percentage 0-100 (50 = centered) */
  posY?: number;
  /** Zoom scale 1.0 to 2.5 */
  scale?: number;
}

/** Selected item id per slot. Partial — unset slots show only the base body. */
export type Look = Partial<Record<SlotId, string>>;

export interface SavedLook {
  id: string;
  /** Full stage snapshot: both characters + scene. */
  looks: Record<CharacterId, Look>;
  sceneId: string;
  /** Optional custom background data when sceneId is "custom" */
  customScene?: CustomSceneData;
  /** Optional custom t-shirt artwork for Emir and/or Friska */
  customKaos?: Partial<Record<CharacterId, CustomKaosData>>;
  savedAt: number;
  /** True for the seeded example looks shipped in the Hall of Fame. */
  demo?: boolean;
  /** Creator username or handle (e.g. "@stylist_jkt"). */
  username?: string;
  /** Current user's individual rating from 0 to 5 stars. */
  rating?: number;
  /** Average star rating (e.g. 4.8). */
  ratingAvg?: number;
  /** Number of people who have rated this outfit. */
  ratingsCount?: number;
}
