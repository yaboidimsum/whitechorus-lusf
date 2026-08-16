# ADR 0002 — Next.js App Router with React Compiler and Turbopack

- Status: Accepted
- Date: 2026-08-17

## Context

The starter should be fast by default: fast builds, fast HMR, and optimized
client bundles. Manual memoization (`useMemo`, `useCallback`, `memo`) is easy to
get wrong and clutters components.

## Decision

Use **Next.js 16 App Router** with:
- **Turbopack** (default bundler in Next 16) for faster builds and HMR.
- **React Compiler** (`reactCompiler: true`) so component re-renders are
  auto-optimized — no manual memoization needed (`vercel-react-best-practices`:
  `rerender-*`).
- `experimental.optimizePackageImports` for `lucide-react` and `date-fns` to
  avoid barrel-file import cost (`bundle-barrel-imports`).
- `experimental.turbopackInferModuleSideEffects: true` for better tree shaking.
- `@next/bundle-analyzer` behind `ANALYZE=true` (`bun run analyze`).

## Consequences

- Server Components by default; only interactive parts of the dress-up game are
  client components.
- Bundle sizes must be checked with `bun run analyze` before adding heavy deps.
- React Compiler avoids manual `memo`; do not re-add manual memoization without
  justification.
