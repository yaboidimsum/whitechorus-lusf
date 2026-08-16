# White Chorus — Design System

Visual language for the **L.U.S.F. Dress Up** experience. Source of truth for
color, type, spacing, and component rules. Reference assets live in
`wc-reference/` and must not be edited.

## Thesis

White Chorus is an Indonesian electropop duo. Their L.U.S.F. EP
(*Love Under Flashing Strobe*) is a late-night, nostalgic world — dance floors,
stage lights, and the bittersweet feeling of missing someone in a crowd. The
dress-up site drops you into that world: you style **Emir** and **Friska** for
the floor and save the look.

**Signature:** a dark plum dressing-room stage lit by coral and pink neon, with
the two artists standing side by side on a real dance-floor backdrop.

## Palette

Defined as Tailwind v4 tokens in `app/globals.css` (`--color-*`).

| Token | Value | Utility | Use |
|---|---:|---|---|
| `plum-deep` | `#241a25` | `bg-plum-deep` | Page background, stage vignette |
| `plum` | `#3b2d38` | `bg-plum` | Panels, cards, secondary surfaces |
| `coral` | `#ff9a83` | `bg-coral` `text-coral` | Primary action, focus, active states |
| `pink-neon` | `#d36daf` | `text-pink-neon` | Secondary accent, destructive text |
| `cream` | `#f5e7e4` | `text-cream` | Main text, borders |
| `lavender` | `#a690a5` | `text-lavender` | Muted supporting text |
| `ink-violet` | `#2b1b31` | `text-ink-violet` | High-contrast text on light |

Rules:

- One accent carries the action: **coral**. Pink-neon is for secondary emphasis
  and the delete affordance.
- Borders are `cream` at reduced opacity (`border-cream/15`, `/25`) — hairline,
  never heavy.
- Depth comes from the stage shadow (`shadow-stage`) and the scene art itself.
  No decorative gradients beyond the stage vignette.

## Typography

Three deliberate roles, loaded via `next/font`:

| Role | Face | Token | Utility |
|---|---|---|---|
| Display | Bebas Neue (400) | `--font-display` | `font-display` |
| Body / UI | Nunito Sans (400–800) | `--font-body` | `font-body` (default) |
| Data / meta | Nunito Sans bold, tabular where numeric | — | `font-bold` |

Rules:

- Display is uppercase, condensed, tracking-wide — used for the hero headline
  and the `L.U.S.F.` eyebrow only.
- Interface copy is sentence case, Nunito Sans.
- Category and action labels are uppercase, bold, `tracking-[0.12em]`–`[0.2em]`.
- Headlines use `text-pretty` to avoid widows.
- Timestamps use `Intl.DateTimeFormat` — never hardcoded formats.

## Spacing & Radius

- Layout column: `max-w-md` (mobile-first, centered game column).
- Gaps: `gap-2` (controls), `gap-3` (grid), `gap-5` (sections).
- Radius: `rounded-full` for buttons/tabs, `rounded-2xl` for cards and item
  tiles, `rounded-[2rem]` for the stage.
- Tap targets ≥ 44px (`py-3`+ on primary controls).

## Components

### Stage (`components/dress-up/CharacterStage.tsx`)

- `aspect-[3/4]`, scene art as `object-cover` backdrop.
- Both artists always visible, standing on the scene, `object-contain`.
- Active character lifts (`-translate-y-1`) and gets a coral glow ring.
- Layers stack over the base body in `layerOrder` order (hair → accessory).
- Every layer is full-canvas; overlay with `inset-0` and `object-contain`.
- Base and first scene use `priority`; everything else lazy-loads.

### Character switcher

- Two segmented buttons: `Dress Emir` / `Dress Friska`.
- `aria-pressed`, active = coral fill, dark text.

### Scene carousel

- Horizontal row of square scene thumbnails.
- `aria-pressed` for the selected scene; name label on each.

### Wardrobe (`components/dress-up/WardrobeGrid.tsx`)

- Category rail (Hair / Top / Bottom / One-Piece / Shoes / Accessories),
  horizontal scroll on narrow screens.
- Only categories that have items render.
- Item cards are 3-column grid with cropped transparent thumbnails.
- Selected card: coral border + tinted fill + check badge.
- Tapping a selected item again removes it.

### Save & Hall of Fame

- `Save Outfit` primary button, disabled until at least one item is chosen.
- Saving snapshots **both** characters + the scene into `looks:v2`.
- Hall of Fame lists snapshots as scene-preview cards with timestamp + delete.
- Delete shows an **Undo** toast (restores the snapshot with its original id).

## Image / Asset Rules

- Real assets live in `public/assets/lufs/` (optimized from the source pack).
- `data/assets.ts` is the typed manifest; `data/characters.ts` maps items to
  slots and layer paths.
- Character layers share one canvas (`2480×3508` source → `990×1400` web), so
  alignment is guaranteed by identical positioning.
- Use `next/image` with `fill` inside fixed-aspect containers (no CLS).
- Never use bare `<img>`; never use CSS color blocks now that real layers exist.

## Accessibility

- Skip link before `#main`.
- `:focus-visible` coral outline globally; no `outline: none` without replacement.
- `role="img"` + `aria-label` describes each character's current outfit.
- Save/delete feedback announced via `role="status"`.
- `prefers-reduced-motion` disables transitions/animations.
- `touch-action: manipulation` on all buttons.
- `color-scheme: dark` + matching `theme-color`.

## Avoid

- Light cream/white cards (old placeholder look).
- Pink gradient canvas.
- Text-only wardrobe pills.
- Repeated centered SaaS marketing layouts.
- Hardcoded date formats.
- Immediate, non-undoable deletes.
- Default blue accents.
