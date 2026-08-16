import type { Character, CharacterId, SlotId, WardrobeItem } from "@/lib/types";

export const characters: Character[] = [
  {
    id: "emir",
    name: "Emir",
    fullName: "Emir Agung Mahendra",
    baseSrc: "/assets/lufs/characters/emir/base.png",
    slots: ["top", "bottom", "shoes", "accessory"],
  },
  {
    id: "friska",
    name: "Friska",
    fullName: "Clara Friska Adinda",
    baseSrc: "/assets/lufs/characters/friska/base.png",
    slots: ["top", "bottom", "shoes"],
  },
];

const A = "/assets/lufs/characters";

/**
 * Wardrobe catalog mapped from the supplied L.U.S.F. asset pack.
 * Every layer shares the character base canvas, so it stacks with `inset-0`
 * over the base body. No `hair` / `one-piece` layers exist yet in the pack —
 * hair is baked into the base, and `one-piece` is reserved for future assets.
 */
export const wardrobe: WardrobeItem[] = [
  // Emir
  { id: "emir-top-hoodie", characterId: "emir", slot: "top", name: "Hoodie", src: `${A}/emir/top-hoodie.png`, thumb: `${A}/emir/top-hoodie.thumb.png` },
  { id: "emir-top-tee", characterId: "emir", slot: "top", name: "Graphic Tee", src: `${A}/emir/top-tee.png`, thumb: `${A}/emir/top-tee.thumb.png` },
  { id: "emir-top-jacket", characterId: "emir", slot: "top", name: "Denim Jacket", src: `${A}/emir/top-jacket.png`, thumb: `${A}/emir/top-jacket.thumb.png` },
  { id: "emir-bottom-utility", characterId: "emir", slot: "bottom", name: "Utility Pants", src: `${A}/emir/bottom-utility.png`, thumb: `${A}/emir/bottom-utility.thumb.png` },
  { id: "emir-bottom-shorts", characterId: "emir", slot: "bottom", name: "Shorts", src: `${A}/emir/bottom-shorts.png`, thumb: `${A}/emir/bottom-shorts.thumb.png` },
  { id: "emir-bottom-joggers", characterId: "emir", slot: "bottom", name: "Joggers", src: `${A}/emir/bottom-joggers.png`, thumb: `${A}/emir/bottom-joggers.thumb.png` },
  { id: "emir-shoes-high-tops", characterId: "emir", slot: "shoes", name: "High-Tops", src: `${A}/emir/shoes-high-tops.png`, thumb: `${A}/emir/shoes-high-tops.thumb.png` },
  { id: "emir-shoes-boots", characterId: "emir", slot: "shoes", name: "Boots", src: `${A}/emir/shoes-boots.png`, thumb: `${A}/emir/shoes-boots.thumb.png` },
  { id: "emir-accessory-masks", characterId: "emir", slot: "accessory", name: "Party Masks", src: `${A}/emir/accessory-masks.png`, thumb: `${A}/emir/accessory-masks.thumb.png` },

  // Friska
  { id: "friska-top-halter", characterId: "friska", slot: "top", name: "Halter Top", src: `${A}/friska/top-halter.png`, thumb: `${A}/friska/top-halter.thumb.png` },
  { id: "friska-top-tee", characterId: "friska", slot: "top", name: "Graphic Tee", src: `${A}/friska/top-tee.png`, thumb: `${A}/friska/top-tee.thumb.png` },
  { id: "friska-top-blazer", characterId: "friska", slot: "top", name: "Cropped Blazer", src: `${A}/friska/top-blazer.png`, thumb: `${A}/friska/top-blazer.thumb.png` },
  { id: "friska-bottom-scratch", characterId: "friska", slot: "bottom", name: "Patchwork Skirt", src: `${A}/friska/bottom-scratch.png`, thumb: `${A}/friska/bottom-scratch.thumb.png` },
  { id: "friska-bottom-button", characterId: "friska", slot: "bottom", name: "Button Skirt", src: `${A}/friska/bottom-button.png`, thumb: `${A}/friska/bottom-button.thumb.png` },
  { id: "friska-bottom-jeans", characterId: "friska", slot: "bottom", name: "Wide-Leg Jeans", src: `${A}/friska/bottom-jeans.png`, thumb: `${A}/friska/bottom-jeans.thumb.png` },
  { id: "friska-shoes-high-tops", characterId: "friska", slot: "shoes", name: "High-Tops", src: `${A}/friska/shoes-high-tops.png`, thumb: `${A}/friska/shoes-high-tops.thumb.png` },
  { id: "friska-shoes-knee-boots", characterId: "friska", slot: "shoes", name: "Knee Boots", src: `${A}/friska/shoes-knee-boots.png`, thumb: `${A}/friska/shoes-knee-boots.thumb.png` },
  { id: "friska-shoes-cowboy", characterId: "friska", slot: "shoes", name: "Cowboy Boots", src: `${A}/friska/shoes-cowboy.png`, thumb: `${A}/friska/shoes-cowboy.thumb.png` },
];

export const slotLabels: Record<SlotId, string> = {
  hair: "Hair",
  top: "Top",
  bottom: "Bottom",
  "one-piece": "One-Piece",
  shoes: "Shoes",
  accessory: "Accessories",
};

// O(1) lookups (rule `js-index-maps`) — built once at module load.
export const itemById = new Map(wardrobe.map((w) => [w.id, w]));

const byCharacterSlot = new Map<CharacterId, Map<SlotId, WardrobeItem[]>>();
for (const w of wardrobe) {
  let slotMap = byCharacterSlot.get(w.characterId);
  if (!slotMap) {
    slotMap = new Map();
    byCharacterSlot.set(w.characterId, slotMap);
  }
  const list = slotMap.get(w.slot) ?? [];
  list.push(w);
  slotMap.set(w.slot, list);
}

export const itemsFor = (characterId: CharacterId, slot: SlotId): WardrobeItem[] =>
  byCharacterSlot.get(characterId)?.get(slot) ?? [];

/** Stack order for layers: hair behind, accessory in front. */
export const layerOrder: SlotId[] = ["hair", "top", "one-piece", "bottom", "shoes", "accessory"];
