# ADR 0005 — Layered image assets for characters

- Status: Superseded by ADR-0007
- Date: 2026-08-17 (superseded 2026-08-17)

## Context

Clara Friska and Emir Agung are rendered by stacking wardrobe items as layers
(the classic dress-up model). At the time this ADR was written, no design
assets existed, so the UI used placeholder color blocks.

## Decision (original)

Render characters as **stacked layers**, one per slot
(`hair → top → bottom → shoes → accessory`), with an optional `image` path plus
a `color` fallback for each wardrobe item.

## Superseded

The supplied L.U.S.F. asset pack replaced color placeholders with real
transparent PNG layers. See **ADR-0007** for the current asset pipeline. The
stacked-layer model and `data/characters.ts` as single source of truth are
unchanged.
