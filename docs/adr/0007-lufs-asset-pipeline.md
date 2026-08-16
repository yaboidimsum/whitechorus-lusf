# ADR 0007 — L.U.S.F. asset pipeline

- Status: Accepted
- Date: 2026-08-17

## Context

The supplied asset pack (`wc-reference/white chorus lufs dress up website/`)
provides real transparent PNG artwork for both artists, their wardrobes, and
scene backdrops. The original placeholder approach (CSS color blocks) is no
longer needed, and 5–6 MB source PNGs are too heavy for the web.

## Decision

- Copy/optimize source art into `public/assets/lufs/` with **semantic** names
  (no timestamp filenames in the app layer).
- Character base + wardrobe layers share one canvas; layers overlay at
  `inset-0` with `object-contain`.
- Downscale for web and optimize with PIL: layers → transparent PNG (max 1400px),
  opaque scenes → JPG (max 1600px), cropped thumbnails → transparent PNG.
- Reference a typed manifest (`data/assets.ts`) and map slots in
  `data/characters.ts`.
- Render with `next/image` `fill` inside fixed-aspect containers; `priority`
  only for the base bodies and first scene.

## Consequences

- ~20 MB of source art becomes ~2.7 MB (42 files) in `public/assets/lufs/`.
- Wardrobe categories reflect what the pack actually contains (no `hair` /
  `one-piece` layers yet); those slots stay reserved in the type.
- Source art stays untouched under `wc-reference/` as the master.
