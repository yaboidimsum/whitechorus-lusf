import type { Character, WardrobeItem } from "@/lib/types";

export const characters: Character[] = [
  { id: "clara", name: "Clara Friska", slots: ["hair", "top", "bottom", "shoes", "accessory"] },
  { id: "emir", name: "Emir Agung", slots: ["hair", "top", "bottom", "shoes", "accessory"] },
];

/** Placeholder catalog. Swap `color` for `image` paths once assets are produced. */
export const wardrobe: WardrobeItem[] = [
  // Clara — hair
  { id: "clara-hair-long", slot: "hair", name: "Long Waves", color: "#5b3a29" },
  { id: "clara-hair-pony", slot: "hair", name: "Ponytail", color: "#8a5a33" },
  // Clara — tops
  { id: "clara-top-red", slot: "top", name: "Red Tee", color: "#e0453a" },
  { id: "clara-top-floral", slot: "top", name: "Floral Blouse", color: "#d97bb0" },
  // Clara — bottoms
  { id: "clara-bottom-jeans", slot: "bottom", name: "Blue Jeans", color: "#3d6fa9" },
  { id: "clara-bottom-skirt", slot: "bottom", name: "Denim Skirt", color: "#5d8cc4" },
  // Clara — shoes
  { id: "clara-shoes-sneakers", slot: "shoes", name: "Sneakers", color: "#f5f5f5" },
  { id: "clara-shoes-heels", slot: "shoes", name: "Heels", color: "#2b2b2b" },
  // Clara — accessory
  { id: "clara-acc-scarf", slot: "accessory", name: "Scarf", color: "#f2c14e" },
  { id: "clara-acc-bag", slot: "accessory", name: "Tote Bag", color: "#a97142" },

  // Emir — hair
  { id: "emir-hair-fade", slot: "hair", name: "Fade", color: "#2e2017" },
  { id: "emir-hair-mop", slot: "hair", name: "Mop Top", color: "#4a3523" },
  // Emir — tops
  { id: "emir-top-hoodie", slot: "top", name: "Hoodie", color: "#4a4a5a" },
  { id: "emir-top-shirt", slot: "top", name: "Button Shirt", color: "#e8e8ee" },
  // Emir — bottoms
  { id: "emir-bottom-joggers", slot: "bottom", name: "Joggers", color: "#3a3a46" },
  { id: "emir-bottom-chinos", slot: "bottom", name: "Chinos", color: "#7a6a52" },
  // Emir — shoes
  { id: "emir-shoes-runners", slot: "shoes", name: "Runners", color: "#d23d3d" },
  { id: "emir-shoes-boots", slot: "shoes", name: "Boots", color: "#3b2f26" },
  // Emir — accessory
  { id: "emir-acc-watch", slot: "accessory", name: "Watch", color: "#9aa0a6" },
  { id: "emir-acc-cap", slot: "accessory", name: "Cap", color: "#d32f2f" },
];
