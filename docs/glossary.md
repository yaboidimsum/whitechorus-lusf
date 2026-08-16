# White Chorus — Glossary

Terms used across the white-chorus codebase and docs. Keep this in sync when
new domain concepts appear.

| Term | Definition |
|------|------------|
| **White Chorus** | The product: a web dress-up game. |
| **Clara Friska** | One of the two dressable characters. |
| **Emir Agung** | The other dressable character. |
| **Dress-up game** | A game where the player mixes and matches wardrobe items onto a character. |
| **Character** | A dressable body — Clara Friska or Emir Agung. Has a set of slots. |
| **Slot** | A body position a wardrobe item occupies: `hair`, `top`, `bottom`, `shoes`, `accessory`. |
| **Wardrobe item** | A single piece of clothing/accessory that fits one slot. |
| **Look** | The current selection of wardrobe items on a character (slot id → item id). |
| **Saved look** | A look persisted to `localStorage` under the versioned `looks:v1` key. |
| **Layer** | A rendered wardrobe item stacked onto the character canvas (z-order: hair → top → bottom → shoes → accessory). |
| **Asset** | A layered PNG/SVG image file for a wardrobe item (optional; color placeholder used until assets exist). |
