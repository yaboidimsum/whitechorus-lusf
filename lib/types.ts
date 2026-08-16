export type SlotId = "hair" | "top" | "bottom" | "shoes" | "accessory";

export interface Character {
  id: string;
  name: string;
  slots: SlotId[];
}

export interface WardrobeItem {
  id: string;
  slot: SlotId;
  name: string;
  /** Path to layered PNG/SVG asset, e.g. `/wardrobe/clara/tops/red-tee.png`.
   *  Leave undefined until assets exist — the renderer falls back to a color block. */
  image?: string;
  /** Placeholder fill while no image asset exists. */
  color?: string;
}

/** Selected item id per slot. Partial — unset slots fall back to the character base. */
export type Look = Partial<Record<SlotId, string>>;

export interface SavedLook {
  id: string;
  characterId: string;
  items: Look;
  savedAt: number;
}
