import Image from "next/image";
import { YouTubeEmbed } from "@next/third-parties/google";
import DressUp from "@/components/dress-up/DressUp";
import { branding } from "@/data/assets";

export default function Home() {
  return (
    <main
      id="main"
      className="flex-1 px-4 py-8 pb-[env(safe-area-inset-bottom)] sm:px-6"
    >
      <header className="mx-auto mb-6 flex max-w-2xl flex-col items-center text-center lg:max-w-5xl">
        <Image
          src={branding.signage.src}
          alt="L.U.S.F. Dress Up Machine"
          width={160}
          height={160}
          priority
          className="drop-shadow-[0_0_28px_rgba(255,154,131,0.35)]"
        />
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.3em] text-pink-neon">
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

      {/* Melayang — lead single */}
      <section className="mx-auto mt-14 w-full max-w-2xl text-center lg:max-w-5xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-pink-neon">
          White Chorus · Melayang
        </p>
        <h2 className="font-display mt-1 text-3xl font-normal uppercase leading-none tracking-wide text-cream text-balance sm:text-4xl">
          An anthem for the ones lost in Jakarta&rsquo;s night
        </h2>
        <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-cream/65">
          The lead single from L.U.S.F. — trip-hop and nostalgic pop for the
          afterglow.
        </p>
        <div className="mx-auto mt-6 max-w-xl overflow-hidden rounded-[2rem] border border-cream/15 shadow-stage">
          <YouTubeEmbed
            videoid="MI_Kvwd7zLA"
            playlabel="Play Melayang by White Chorus"
          />
        </div>
      </section>
    </main>
  );
}
