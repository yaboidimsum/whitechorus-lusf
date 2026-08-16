# ADR 0004 — Saved looks in versioned localStorage

- Status: Accepted
- Date: 2026-08-17

## Context

Players want to save the looks they create. Requirements: works offline, no
accounts, private to the browser, and resilient to schema changes and storage
failure (incognito, quota, disabled storage).

## Decision

Persist looks in **localStorage** under a versioned key `looks:v2`
(`vercel-react-best-practices`: `client-localstorage-schema`):

- Storage shape: `{ looks: Record<id, SavedLook>, nextId: number }`.
- A `SavedLook` is a full stage snapshot: `{ looks: { emir, friska }, sceneId, savedAt }`.
- All reads/writes wrapped in `try-catch`; failures fall back to in-memory state
  for the current session.
- Reads cached in a module-level `cache` and invalidated on `storage` events
  from other tabs (`js-cache-storage`).
- Legacy `looks:v1` (placeholder-era) is dropped on first load.
- No PII, tokens, or large blobs stored — only slot→item maps, a scene id, and
  a timestamp.

## Consequences

- Works offline and without a backend.
- Data is per-browser; clearing site data loses saved looks.
- Schema changes require a migration path (bump key to `looks:v3`) — see
  `lib/looks.ts`.
- A future backend persistence layer can reuse the same `SavedLook` shape.
