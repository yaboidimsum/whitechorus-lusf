# White Chorus

A dress-up game: dress **Clara Friska** and **Emir Agung**, then save the looks
you love. Looks are stored privately in your browser (localStorage).

Built on **Bun** + **Next.js 16** (App Router, Turbopack) + **Tailwind CSS v4**,
optimized per [Vercel React Best Practices](../../.agents/skills/vercel-react-best-practices/).

## Getting Started

```bash
bun install
bun dev          # http://localhost:3000
```

## Scripts

| Script | Purpose |
|--------|---------|
| `bun dev` | Next.js dev server (Turbopack) |
| `bun run build` | Production build |
| `bun run start` | Serve production build |
| `bun run lint` | ESLint |
| `bun run analyze` | Bundle analyzer (opens report) |

## Structure

```
app/                    # App Router — page shell is a Server Component
components/dress-up/    # Interactive client components
data/characters.ts      # Characters + wardrobe catalog (single source of truth)
lib/looks.ts            # Versioned localStorage persistence (looks:v1)
lib/types.ts            # Shared domain types
docs/                   # ADRs + glossary (grill-with-docs output)
```

## Docs

- [Glossary](docs/glossary.md)
- [ADR-0001 Bun runtime](docs/adr/0001-bun-runtime.md)
- [ADR-0002 Next.js App Router + React Compiler](docs/adr/0002-nextjs-app-router.md)
- [ADR-0003 Tailwind v4](docs/adr/0003-tailwind-v4.md)
- [ADR-0004 localStorage looks](docs/adr/0004-localstorage-looks.md)
- [ADR-0005 Layered image assets](docs/adr/0005-layered-image-assets.md)
