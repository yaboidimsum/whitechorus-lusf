# White Chorus — Glossary

Terms used across the white-chorus codebase and docs. Keep this in sync when
new domain concepts appear.

| Term | Definition |
|------|------------|
| **White Chorus** | Indonesian electropop duo — Clara Friska Adinda and Emir Agung Mahendra. |
| **L.U.S.F.** | *Love Under Flashing Strobe* — the duo's six-track EP and the dress-up site's theme. |
| **Friska** | Dressable character — Clara Friska Adinda. Asset id `friska`. |
| **Emir** | Dressable character — Emir Agung Mahendra. Asset id `emir`. |
| **Dress-up game** | The player mixes and matches wardrobe items onto the two characters and saves the look. |
| **Character** | A dressable body — Emir or Friska. Has a base body and a set of slots. |
| **Slot** | A body position a wardrobe layer occupies: `hair`, `top`, `bottom`, `one-piece`, `shoes`, `accessory`. |
| **Wardrobe item** | A single clothing/accessory layer that fits one slot and one character. |
| **Look** | The selected wardrobe items for one character (slot id → item id). |
| **Stage snapshot** | A saved look capturing **both** characters + the scene. |
| **Saved look** | A stage snapshot persisted to `localStorage` under the versioned `looks:v2` key. |
| **Layer** | A full-canvas transparent PNG stacked over a character base (`layerOrder`: hair → top → one-piece → bottom → shoes → accessory). |
| **Scene** | A backdrop behind both characters (e.g. Dance Floor, Stage). |
| **Hall of Fame** | The saved-looks gallery. |
| **Asset** | Optimized art under `public/assets/lufs/`; source masters stay in `wc-reference/`. |
