# ADR 0001 — Bun as runtime and package manager

- Status: Accepted
- Date: 2026-08-17

## Context

A new starter project was needed for white-chorus. The choice of runtime and
package manager affects install speed, script execution, and CI reproducibility.

## Decision

Use **Bun** for both runtime and package management (`packageManager: bun@1.3.11`).
Dependencies are locked with `bun.lock`.

## Consequences

- Fast installs and fast script execution (`bun run dev`, `bun run build`).
- Bun is required in CI and local dev — no npm/pnpm fallback documented.
- All `package.json` scripts are run through `bun run`.
