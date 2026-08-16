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

/** Selected item id per slot. Partial — unset slots show only the base body. */
export type Look = Partial<Record<SlotId, string>>;

export interface SavedLook {
  id: string;
  /** Full stage snapshot: both characters + scene. */
  looks: Record<CharacterId, Look>;
  sceneId: string;
  savedAt: number;
}
