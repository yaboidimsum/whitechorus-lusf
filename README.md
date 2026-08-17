# White Chorus

A dress-up game for the Indonesian electropop duo **White Chorus** and their
**L.U.F.S.** EP: dress **Emir** and **Friska** for the dance floor, then save
the looks you love. Looks are stored privately in your browser (localStorage).

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
app/                              # App Router — page shell is a Server Component
components/dress-up/              # Interactive client components
  DressUp.tsx                     # Orchestrator (state, save, Hall of Fame)
  CharacterStage.tsx              # Scene + layered two-character stage
  WardrobeGrid.tsx                # Category tabs + item thumbnail grid
data/assets.ts                    # Typed asset manifest (scenes, branding, frame)
data/characters.ts                # Characters + wardrobe catalog (single source of truth)
lib/looks.ts                      # Versioned localStorage persistence (looks:v2)
lib/types.ts                      # Shared domain types
public/assets/lufs/               # Optimized L.U.F.S. art (optimized from wc-reference/)
docs/                             # Design system, ADRs + glossary
wc-reference/                     # Source reference art (do not edit)
```

## Docs

- [Design system](docs/design-system.md)
- [Glossary](docs/glossary.md)
- [ADR-0001 Bun runtime](docs/adr/0001-bun-runtime.md)
- [ADR-0002 Next.js App Router + React Compiler](docs/adr/0002-nextjs-app-router.md)
- [ADR-0003 Tailwind v4](docs/adr/0003-tailwind-v4.md)
- [ADR-0004 localStorage looks](docs/adr/0004-localstorage-looks.md)
- [ADR-0005 Layered image assets](docs/adr/0005-layered-image-assets.md) (superseded)
- [ADR-0007 L.U.F.S. asset pipeline](docs/adr/0007-lufs-asset-pipeline.md)
# whitechorus-lusf
