# White Chorus — L.U.F.S. Dress-Up & Hall of Fame

An interactive dress-up experience and community Hall of Fame created for the Indonesian electropop duo **White Chorus** celebrating their **L.U.F.S.** EP.

Dress **Emir** and **Friska** for the stage or dance floor, design custom Kaos merchandise, upload custom background stages, listen to the album tracklist, and publish styled looks to the global Hall of Fame with community ratings and social sharing.

---

## ⚡ Tech Stack & Architecture

- **Runtime & Package Manager:** [Bun](https://bun.sh) (`bun@1.3.11+`)
- **Frontend Framework:** [Next.js 16](https://nextjs.org) (App Router, Turbopack, React Compiler)
- **UI & Animation:** React 19, [Tailwind CSS v4](https://tailwindcss.com), [Motion](https://motion.dev) (`motion/react`), [Lucide Icons](https://lucide.dev), [Sonner](https://sonner.emilkowal.ski)
- **Backend & Database:** [Supabase](https://supabase.com) (PostgreSQL, Row Level Security, `@supabase/ssr`, Storage Buckets)
- **State & Export:** Versioned localStorage fallback (`useSyncExternalStore`), Canvas-to-PNG exporter, Web Share API for Instagram Stories
- **Performance:** Built following [Vercel React Best Practices](https://github.com/vercel/next.js) (granular hydration, image optimization, memoized calculations, reduced motion accessibility).

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have **Bun** installed:
```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Install Dependencies
```bash
bun install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials (see [Backend Setup](#-backend-setup-supabase)):
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

### 4. Run Local Development Server
```bash
bun dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `bun dev` | Starts Next.js development server with Turbopack |
| `bun run build` | Builds the production bundle |
| `bun run start` | Serves the production build locally |
| `bun run lint` | Runs ESLint checks |
| `bun run analyze` | Runs production build with Next.js Bundle Analyzer |

---

## 🗄️ Backend Setup (Supabase)

The backend uses Supabase for **Database**, **Authentication**, and **Storage**. If you are setting up a fresh Supabase project for this repository, follow these steps:

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Under **Project Settings** → **API**, copy:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **Project API Anon Key** (`sb_publishable_...` or `eyJ...`)

### Step 2: Run Database Migration
Open your Supabase **SQL Editor** and execute the entire SQL schema located at:
[`supabase/migrations/20260820_init_schema.sql`](supabase/migrations/20260820_init_schema.sql)

This script will automatically create:
- **Tables:**
  - `profiles`: User accounts linked with `auth.users`, handles usernames, display names, avatars, and anonymous flags.
  - `outfits`: Stores outfit combinations (Emir & Friska slot IDs), custom stage data, custom Kaos designs, average star ratings, and vote counts.
  - `outfit_ratings`: 1–5 star ratings per user per outfit (enforces unique rating per user).
- **Triggers & Functions:**
  - `handle_new_user()`: Automatically provisions a profile when a user signs up.
  - `handle_outfit_rating_change()`: Atomically recalculates `rating_avg` and `ratings_count` whenever votes are added/updated/deleted.
- **Row Level Security (RLS) Policies:**
  - Public read access for public outfits and profiles.
  - Authenticated user write/delete access for their own outfits and ratings.
- **Storage Bucket:**
  - Creates the `outfit-assets` public bucket with strict user folder RLS policies (`auth.uid()`).

### Step 3: Configure Supabase Authentication
1. Go to **Authentication** → **Providers**:
   - Enable **Email / Password** (turn off "Confirm email" if you prefer instant onboarding).
   - *(Optional)* Enable **Google OAuth** provider with your Google Cloud client ID/secret.
2. Go to **Authentication** → **URL Configuration**:
   - Set **Site URL** to your production domain (e.g. `https://white-chorus-orpin.vercel.app` or `https://lufs.whitechorus.com`).
   - Add the following to **Redirect URLs**:
     ```text
     http://localhost:3000/**
     http://localhost:3000/auth/callback
     https://<your-vercel-domain>.vercel.app/**
     https://<your-vercel-domain>.vercel.app/auth/callback
     https://<your-custom-domain>/**
     https://<your-custom-domain>/auth/callback
     ```

---

## 🌐 Deployment (Vercel)

### 1. Deploying to Vercel
You can deploy via the Vercel CLI or by connecting your GitHub repository to Vercel:

```bash
# Deploy to Preview
npx vercel

# Deploy directly to Production
npx vercel --prod
```

### 2. Required Environment Variables on Vercel
Go to **Project Settings** → **Environment Variables** on Vercel and add:

| Variable | Environment | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | Your Supabase anon public key |

> [!IMPORTANT]
> Because Next.js inlines `NEXT_PUBLIC_*` variables at **build time**, whenever you change or add these variables in Vercel, you **must trigger a new deployment / redeploy** for the values to take effect in client JavaScript.

### 3. Setting Up a Custom Domain or Subdomain (e.g., `lufs.whitechorus.com`)
1. In Vercel, go to **Project Settings** → **Domains**.
2. Enter your custom domain or subdomain (e.g. `lufs.whitechorus.com`).
3. In your DNS provider (e.g. Cloudflare, Namecheap, Niagahoster):
   - Add a `CNAME` record with Host `lufs` pointing to `cname.vercel-dns.com`.
4. Remember to add `https://lufs.whitechorus.com/auth/callback` to the Supabase **Redirect URLs** list.

---

## ⚠️ Important Things the Owner Needs to Be Aware Of

1. **Graceful Offline / Local Storage Fallback:**
   - If Supabase environment variables are omitted or invalid, the app **does not crash**.
   - It automatically falls back to client-side `localStorage` (`looks:v4`) and seeded demo looks, ensuring preview visitors and local testing can still dress characters and save outfits.

2. **Client-Side Image Optimization for Custom Assets:**
   - When users upload custom photo backgrounds or custom t-shirt artwork, images are automatically compressed using WebP and resized before being uploaded to Supabase Storage (`outfit-assets`), preserving storage bandwidth and preventing quota exhaustion.

3. **Hall of Fame Visibility Rules:**
   - When a visitor visits `/hall-of-fame` for the first time without uploading any outfit, the top **Spotlight Hero** section remains empty/hidden, and submissions from actual users are prioritized.
   - Once a user publishes their look, their newest outfit automatically becomes their featured Spotlight submission.

4. **Security & Row Level Security (RLS):**
   - Never expose the Supabase `service_role` key in frontend code or `NEXT_PUBLIC_*` environment variables.
   - All table mutations (`insert`, `update`, `delete`) and storage writes are protected by Postgres RLS matching `(select auth.uid()) = user_id`.

5. **Audio Player Asset Path:**
   - Audio tracks are served from [`public/audio/`](public/audio/). The track metadata, audio sources, and lyrics are mapped in [`data/tracks.ts`](data/tracks.ts).

---

## 📂 Project Structure

```text
app/
├── auth/callback/route.ts        # Next.js Server Route for OAuth / Magic link exchange
├── hall-of-fame/page.tsx         # Full Hall of Fame community gallery
├── layout.tsx                    # Root layout (fonts, metadata, music player, toasts)
├── page.tsx                      # Home page (Hero, Dress-Up Studio, Music, Showcase)
└── prototypes/                   # Prototype and sandbox routes

components/
├── audio/                        # Music Player, audio drawer, welcome modal
├── auth/                         # Supabase AuthModal & UserNav components
├── dress-up/                     # Core Dress-Up game components
│   ├── CharacterStage.tsx        # Layered canvas & sprite stacking engine
│   ├── CustomKaosModal.tsx       # Custom t-shirt draw/upload design studio
│   ├── DressUp.tsx               # Studio orchestrator (state, wardrobe, scene)
│   ├── HallOfFame.tsx            # Submissions grid, search, sort & voting
│   ├── InstagramStoryShareModal.tsx # Instagram Story canvas generator & share
│   ├── LookDetailModal.tsx       # Fullscreen detail view & voting
│   ├── LookPreview.tsx           # Scaled stage preview
│   └── WardrobeGrid.tsx          # Wardrobe category selector & item thumbnails
└── ui/                           # Primitive buttons, inputs, selects, dialogs

data/
├── assets.ts                     # Scene backgrounds, branding & frames
├── characters.ts                 # Emir & Friska wardrobe catalog & slot definitions
└── tracks.ts                     # White Chorus L.U.F.S. audio tracks & timestamps

lib/
├── export.ts                     # Canvas rendering & PNG generation
├── image-compress.ts             # Browser-side image compression
├── looks.ts                      # LocalStorage persistence & synchronization
├── types.ts                      # TypeScript models and domain types
└── supabase/
    ├── client.ts                 # Browser Supabase client (with auto-sanitization)
    ├── server.ts                 # Server Component & Route Handler Supabase client
    ├── middleware.ts             # Edge session refresher
    └── storage.ts                # Supabase Storage asset uploader

supabase/
└── migrations/
    └── 20260820_init_schema.sql  # Complete PostgreSQL schema, RLS, triggers & storage
```

---

## 📄 License & Credits

- Music & Visual Identity © **White Chorus** & **L.U.F.S. Records**.
- Developed with Next.js, Tailwind CSS, Motion, and Supabase.
