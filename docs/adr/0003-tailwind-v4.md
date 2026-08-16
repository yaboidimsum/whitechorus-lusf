# ADR 0003 — Tailwind CSS v4

- Status: Accepted
- Date: 2026-08-17

## Context

Styling approach for the dress-up UI. No design reference exists yet, so the
chosen system must support fast iteration with utility classes.

## Decision

Use **Tailwind CSS v4** (CSS-first configuration):
- Imported via `@import "tailwindcss"` in `app/globals.css`.
- Theme tokens defined with `@theme inline` (colors, fonts).
- No `tailwind.config.js` needed — v4 is config-in-CSS.
- Fonts wired through `next/font` (Geist) mapped to `--font-sans` / `--font-mono`.

## Consequences

- Styling lives in class names and a small set of CSS variables.
- Brand colors for White Chorus (pink-tinted canvas) are defined in `globals.css`.
- When a design reference arrives, tokens can be added to `@theme` without
  restructuring components.
