import Image from "next/image";
import { YouTubeEmbed } from "@next/third-parties/google";
import DressUp from "@/components/dress-up/DressUp";
import { branding } from "@/data/assets";
import { characters } from "@/data/characters";

export default function Home() {
  return (
    <main
      id="main"
      className="flex-1 px-4 py-8 pb-[env(safe-area-inset-bottom)] sm:px-6"
    >
      <header className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center lg:max-w-5xl">
        <Image
          src={branding.signage.src}
          alt="L.U.S.F. Dress Up Machine"
          width={160}
          height={160}
          priority
          className="drop-shadow-[0_0_28px_rgba(255,154,131,0.35)]"
        />
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.3em] text-pink-neon">
          White Chorus · L.U.S.F.
        </p>
        <h1 className="font-display mt-1 text-4xl font-normal uppercase leading-none tracking-wide text-cream sm:text-5xl text-balance">
          Dress for the afterglow
        </h1>
        <p className="mt-3 max-w-sm text-pretty text-sm text-cream/65">
          Style Emir and Friska for the dance floor, then save your look to the
          Hall of Fame.
        </p>
      </header>

      <DressUp />

      {/* The Duo — meet the band */}
      <section className="border-y border-cream/10 bg-plum-deep/40 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-2xl lg:max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-pink-neon">
              White Chorus
            </p>
            <h2 className="font-display mt-1 text-3xl font-normal uppercase leading-none tracking-wide text-cream text-balance sm:text-4xl">
              The duo
            </h2>
            <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-cream/75">
              An Indonesian electropop duo — trip-hop, dark electronics, and
              nostalgic pop, cut for the Jakarta night.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
            {characters.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 rounded-2xl border border-cream/15 bg-plum p-4"
              >
                <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-black/30">
                  <Image
                    src={c.baseSrc}
                    alt={`${c.fullName}, member of White Chorus`}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-display text-2xl uppercase leading-none tracking-wide text-cream">
                    {c.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-cream/75">{c.fullName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* L.U.S.F. — the new EP */}
      <section className="border-y border-cream/10 bg-plum/40 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-2xl lg:max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-pink-neon">
              New EP
            </p>
            <h2 className="font-display mt-1 text-3xl font-normal uppercase leading-none tracking-wide text-cream text-balance sm:text-4xl">
              Love Under Flashing Strobe
            </h2>
            <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-cream/75">
              Six tracks of cinta under the strobe. Out September 2, 2026.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-lg border-y border-cream/10">
            <div className="flex items-baseline justify-between gap-4 py-3.5">
              <span className="font-display text-xl uppercase leading-none tracking-wide text-coral">
                Melayang
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cream/60">
                Lead single · out now
              </span>
            </div>
            <div className="border-t border-cream/10 py-3.5 text-center text-xs uppercase tracking-[0.14em] text-cream/50">
              Five more tracks, September 2
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="https://youtu.be/MI_Kvwd7zLA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-coral px-6 py-3 text-sm font-extrabold uppercase tracking-[0.14em] text-plum-deep transition-[transform,opacity] duration-150 ease-out-quart hover:opacity-85 active:scale-[0.97]"
            >
              Listen to Melayang
            </a>
          </div>
        </div>
      </section>

      {/* Melayang — lead single */}
      <section className="border-y border-cream/10 bg-plum-deep/40 py-20 sm:py-24">
        <div className="mx-auto w-full max-w-2xl text-center lg:max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-pink-neon">
            White Chorus · Melayang
          </p>
          <h2 className="font-display mt-1 text-3xl font-normal uppercase leading-none tracking-wide text-cream text-balance sm:text-4xl">
            An anthem for the ones lost in Jakarta&rsquo;s night
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-cream/65">
            The lead single from L.U.S.F. — trip-hop and nostalgic pop for the
            afterglow.
          </p>
          <div className="mx-auto mt-8 max-w-xl overflow-hidden rounded-[2rem] border border-coral/30 shadow-stage">
            <YouTubeEmbed
              videoid="MI_Kvwd7zLA"
              playlabel="Play Melayang by White Chorus"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
