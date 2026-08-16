# ADR 0005 — Layered image assets for characters

- Status: Accepted
- Date: 2026-08-17

## Context

Clara Friska and Emir Agung are rendered by stacking wardrobe items as layers
(the classic dress-up model). No design assets exist yet — the UI must work
before production images arrive.

## Decision

Render characters as **stacked layers**, one per slot
(`hair → top → bottom → shoes → accessory`), and model each wardrobe item with
an optional `image` path plus a `color` fallback:

- While `image` is undefined, the item renders as a colored block
  (`bundle-conditional`: assets are only used when a real asset path exists).
- When assets arrive, add paths like `/wardrobe/<character>/<slot>/<item>.png`
  and render via `next/image`.
- The catalog (`data/characters.ts`) is the single source of truth for slots
  and items.

## Consequences

- The dress-up UI is fully functional before assets exist.
- Swapping placeholders for real images is a data change, not a code change.
- `next/image` should be used once real assets exist (width/height/sizes) for
  automatic optimization — no bare `<img>` in production paths.
