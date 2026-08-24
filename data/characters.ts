import type { Character, CharacterId, SlotId, WardrobeItem } from "@/lib/types";

export const characters: Character[] = [
  {
    id: "emir",
    name: "Emir",
    fullName: "Emir Agung Mahendra",
    baseSrc: "/assets/lufs/characters/emir/base.png",
    slots: ["hair", "top", "bottom", "shoes"],
  },
  {
    id: "friska",
    name: "Friska",
    fullName: "Clara Friska Adinda",
    baseSrc: "/assets/lufs/characters/friska/base.png",
    slots: ["hair", "top", "bottom", "shoes"],
  },
];

export function getCharacterBaseSrc(characterId: CharacterId, hairItemId?: string): string {
  if (characterId === "emir") {
    if (hairItemId === "emir-hair-bun") return "/assets/lufs/characters/emir/base-bun.png";
    return "/assets/lufs/characters/emir/base.png";
  }
  if (characterId === "friska") {
    if (hairItemId === "friska-hair-bob") return "/assets/lufs/characters/friska/base-bob.png";
    return "/assets/lufs/characters/friska/base.png";
  }
  return `/assets/lufs/characters/${characterId}/base.png`;
}

const A = "/assets/lufs/characters";
const I = "/assets/lufs/characters/icons/v2";

/**
 * Wardrobe catalog mapped from the supplied L.U.F.S. asset pack.
 * Every layer shares the character base canvas, so it stacks with `inset-0`
 * over the base body.
 */
export const wardrobe: WardrobeItem[] = [
  // Emir - Hair / Skeleton Styles
  { id: "emir-hair-short", characterId: "emir", slot: "hair", name: "Buzz Cut", src: `${A}/emir/base.png`, thumb: `${I}/icon_emir_hair_buzz.png` },
  { id: "emir-hair-bun", characterId: "emir", slot: "hair", name: "Man Bun", src: `${A}/emir/base-bun.png`, thumb: `${I}/icon_emir_hair_bun.png` },

  // Emir - Tops
  { id: "emir-top-overcoat", characterId: "emir", slot: "top", name: "Overcoat & Tee", src: `${A}/emir/top-overcoat.png`, thumb: `${I}/icon_emir_top4.png` },
  { id: "emir-top-hoodie", characterId: "emir", slot: "top", name: "Hoodie", src: `${A}/emir/top-hoodie.png`, thumb: `${I}/icon_emir_top3.png` },
  { id: "emir-top-tee", characterId: "emir", slot: "top", name: "Graphic Tee", src: `${A}/emir/top-tee.png`, thumb: `${I}/icon_emir_top1.png` },
  { id: "emir-top-jacket", characterId: "emir", slot: "top", name: "Denim Jacket", src: `${A}/emir/top-jacket.png`, thumb: `${I}/icon_emir_top2.png` },
  { id: "emir-top-custom", characterId: "emir", slot: "top", name: "Custom Kaos", src: "custom", thumb: `${A}/custom-kaos/thumb-emir.png` },

  // Emir - Bottoms
  { id: "emir-bottom-trousers", characterId: "emir", slot: "bottom", name: "Tailored Trousers", src: `${A}/emir/bottom-trousers.png`, thumb: `${I}/icon_emir_bottoms4.png` },
  { id: "emir-bottom-utility", characterId: "emir", slot: "bottom", name: "Utility Pants", src: `${A}/emir/bottom-utility.png`, thumb: `${I}/icon_emir_bottoms2.png` },
  { id: "emir-bottom-shorts", characterId: "emir", slot: "bottom", name: "Shorts", src: `${A}/emir/bottom-shorts.png`, thumb: `${I}/icon_emir_bottoms1.png` },
  { id: "emir-bottom-joggers", characterId: "emir", slot: "bottom", name: "Joggers", src: `${A}/emir/bottom-joggers.png`, thumb: `${I}/icon_emir_bottoms3.png` },

  // Emir - Shoes
  { id: "emir-shoes-loafers", characterId: "emir", slot: "shoes", name: "Dress Shoes", src: `${A}/emir/shoes-loafers.png`, thumb: `${I}/icon_emir_shoes4.png` },
  { id: "emir-shoes-high-tops", characterId: "emir", slot: "shoes", name: "High-Tops", src: `${A}/emir/shoes-high-tops.png`, thumb: `${I}/icon_emir_shoes1.png` },
  { id: "emir-shoes-boots", characterId: "emir", slot: "shoes", name: "Boots", src: `${A}/emir/shoes-boots.png`, thumb: `${I}/icon_emir_shoes2.png` },
  { id: "emir-accessory-masks", characterId: "emir", slot: "shoes", name: "Party Mask", src: `${A}/emir/accessory-masks.png`, thumb: `${I}/icon_emir_shoes3.png` },

  // Friska - Hair / Skeleton Styles
  { id: "friska-hair-buns", characterId: "friska", slot: "hair", name: "Space Buns", src: `${A}/friska/base.png`, thumb: `${I}/icon_friska_hair_buns.png` },
  { id: "friska-hair-bob", characterId: "friska", slot: "hair", name: "Wavy Bob", src: `${A}/friska/base-bob.png`, thumb: `${I}/icon_friska_hair_bob.png` },

  // Friska - Tops & Dresses
  { id: "friska-top-shearling-coat", characterId: "friska", slot: "top", name: "Shearling Coat", src: `${A}/friska/top-shearling-coat.png`, thumb: `${I}/icon_friska_top4.png` },
  { id: "friska-one-piece-lavender-dress", characterId: "friska", slot: "top", name: "Tiered Dress", src: `${A}/friska/one-piece-lavender-dress.png`, thumb: `${I}/icon_friska_onepiece1.png` },
  { id: "friska-one-piece-coat-dress", characterId: "friska", slot: "top", name: "Coat & Dress", src: `${A}/friska/one-piece-coat-dress.png`, thumb: `${I}/icon_friska_onepiece2.png` },
  { id: "friska-top-halter", characterId: "friska", slot: "top", name: "Halter Top", src: `${A}/friska/top-halter.png`, thumb: `${I}/icon_friska_top3.png` },
  { id: "friska-top-tee", characterId: "friska", slot: "top", name: "Graphic Tee", src: `${A}/friska/top-tee.png`, thumb: `${I}/icon_friska_top1.png` },
  { id: "friska-top-blazer", characterId: "friska", slot: "top", name: "Cropped Blazer", src: `${A}/friska/top-blazer.png`, thumb: `${I}/icon_friska_top2.png` },
  { id: "friska-top-custom", characterId: "friska", slot: "top", name: "Custom Kaos", src: "custom", thumb: `${A}/custom-kaos/thumb-friska.png` },

  // Friska - Bottoms
  { id: "friska-bottom-scratch", characterId: "friska", slot: "bottom", name: "Patchwork Skirt", src: `${A}/friska/bottom-scratch.png`, thumb: `${I}/icon_friska_bottoms3.png` },
  { id: "friska-bottom-button", characterId: "friska", slot: "bottom", name: "Button Skirt", src: `${A}/friska/bottom-button.png`, thumb: `${I}/icon_friska_bottoms2.png` },
  { id: "friska-bottom-jeans", characterId: "friska", slot: "bottom", name: "Wide-Leg Jeans", src: `${A}/friska/bottom-jeans.png`, thumb: `${I}/icon_friska_bottoms1.png` },

  // Friska - Shoes
  { id: "friska-shoes-heeled-boots", characterId: "friska", slot: "shoes", name: "Heeled Boots", src: `${A}/friska/shoes-heeled-boots.png`, thumb: `${I}/icon_friska_shoes4.png` },
  { id: "friska-shoes-high-tops", characterId: "friska", slot: "shoes", name: "High-Tops", src: `${A}/friska/shoes-high-tops.png`, thumb: `${I}/icon_friska_shoes1.png` },
  { id: "friska-shoes-knee-boots", characterId: "friska", slot: "shoes", name: "Knee Boots", src: `${A}/friska/shoes-knee-boots.png`, thumb: `${I}/icon_friska_shoes3.png` },
  { id: "friska-shoes-cowboy", characterId: "friska", slot: "shoes", name: "Cowboy Boots", src: `${A}/friska/shoes-cowboy.png`, thumb: `${I}/icon_friska_shoes2.png` },
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

/** Stack order for layers: hair behind, accessory in front. Clothing hems
 *  overlap shoe tops; tops overlap bottoms. */
export const layerOrder: SlotId[] = ["hair", "shoes", "one-piece", "bottom", "top", "accessory"];

/** Returns `layerOrder` filtered to only the slots this character supports. */
export const layerOrderFor = (characterId: CharacterId): SlotId[] => {
  const character = characters.find((c) => c.id === characterId);
  if (!character) return layerOrder;
  return layerOrder.filter((slot) => character.slots.includes(slot));
};
