import Image from "next/image";
import { YouTubeEmbed } from "@next/third-parties/google";
import DressUp from "@/components/dress-up/DressUp";
import DspLinks from "@/components/DspLinks";
import PhotoGalaxy from "@/components/galaxy/PhotoGalaxy";
import { CoverflowCarousel, type CoverflowSlide } from "@/components/ui/coverflow-carousel";
import { branding } from "@/data/assets";
import { characters } from "@/data/characters";
import type { CharacterId } from "@/lib/types";

import UserNav from "@/components/auth/UserNav";

/** The Duo — bios drawn from the wc-reference notes. */
const DUO_ORDER: CharacterId[] = ["friska", "emir"];
const DUO_BIO: Record<CharacterId, string> = {
  friska: "Lead vocalist and songwriter",
  emir: "Producer, composer, and instrumentalist",
};

const DUO_SLIDES: CoverflowSlide[] = [
  {
    src: "/photograph-1.jpg",
    alt: "White Chorus — Clara Friska Adinda and Emir Agung Mahendra",
    title: "White Chorus",
    subtitle: "Clara Friska Adinda & Emir Agung Mahendra",
  },
  {
    src: "/photograph-2.jpg",
    alt: "White Chorus session portrait 2",
    title: "L.U.F.S. Era",
    subtitle: "Love Under Flashing Strobe",
  },
  {
    src: "/photograph-3.jpg",
    alt: "White Chorus session portrait 3",
    title: "Afterglow",
    subtitle: "Jakarta Electropop Duo",
  },
];

export default function Home() {
  return (
    <main id="main" className="flex-1">
      {/* Top Bar with User Navigation */}
      <div className="mx-auto flex max-w-2xl items-center justify-end px-4 pt-4 sm:px-6 lg:max-w-5xl">
        <UserNav />
      </div>

      <header className="animate-rise mx-auto flex max-w-2xl flex-col items-center text-center px-4 pt-3 sm:px-6 sm:pt-6 lg:max-w-5xl">
        <div className="flex items-center justify-center gap-4 sm:gap-7">
          <Image
            src="/white-chorus-logo.png"
            alt="White Chorus"
            width={1920}
            height={1080}
            priority
            className="h-10 w-auto sm:h-24"
          />
          <Image
            src={branding.signage.src}
            alt="L.U.F.S. Dress Up Machine"
            width={200}
            height={200}
            priority
            className="drop-shadow-[0_0_28px_rgba(255,154,131,0.35)] w-auto h-32 sm:h-60"
          />
        </div>
        <p className="mt-2 text-xs font-bold tracking-normal text-pink-neon">
          White Chorus · L.U.F.S.
        </p>
        <h1 className="font-display mt-1 text-3xl font-normal leading-none tracking-wide text-cream sm:text-5xl text-balance">
          Dress for the afterglow
        </h1>
        <p className="mt-3 max-w-sm text-pretty text-sm text-cream/65">
          Style Emir and Friska for the dance floor, then save your look to the
          Hall of Fame.
        </p>
      </header>

      <DressUp />

      {/* The Duo — meet the band */}
      <section className="relative overflow-hidden border-t border-cream/10 bg-plum-deep/40 py-12 sm:py-16">
        <PhotoGalaxy />
        <div aria-hidden className="absolute inset-0 bg-plum-deep/60" />
        <div className="relative z-10 mx-auto w-full px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold tracking-normal text-pink-neon">
              White Chorus
            </p>
            <h2 className="font-display mt-1 text-3xl font-normal leading-none uppercase tracking-wide text-cream text-balance sm:text-4xl">
              The duo
            </h2>
            <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-cream/75">
              An Indonesian electropop duo — trip-hop, dark electronics, and
              nostalgic pop, cut for the Jakarta night.
            </p>
          </div>

          <div className="mx-auto mt-8 w-full max-w-5xl rounded-[2rem] border border-cream/15 bg-plum-deep/75 p-5 shadow-stage backdrop-blur sm:mt-10 sm:p-8">
            {/* 3D Coverflow Carousel with Photograph 1-3 */}
            <div className="w-full">
              <CoverflowCarousel
                slides={DUO_SLIDES}
                cardWidth="clamp(190px, 28vw, 320px)"
                showNavigation
                showPagination
                cardClassName="border border-cream/20 bg-plum shadow-2xl"
              />
            </div>

            {/* who they are — positioned beneath the image carousel */}
            <div className="mt-8 border-t border-cream/10 pt-8 sm:mt-10">
              <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
                <div>
                  <h3 className="font-display text-2xl leading-none tracking-wide text-coral sm:text-3xl">
                    About White Chorus
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-cream/85">
                    White Chorus is an Indonesian electropop and electronic music duo formed in 2019 in Bandung. The group consists of vocalist Clara Friska Adinda and instrumentalist/producer Emir Agung Mahendra.
                  </p>
                </div>
                <div className="space-y-5">
                  {DUO_ORDER.map((id) => {
                    const c = characters.find((x) => x.id === id);
                    if (!c) return null;
                    return (
                      <div key={c.id}>
                        <h4 className="font-display text-xl leading-none tracking-wide text-cream">
                          {c.name}
                        </h4>
                        <p className="mt-1 text-xs text-cream/60">
                          {c.fullName}
                        </p>
                        <p className="mt-1.5 text-sm text-cream/75">
                          {DUO_BIO[id]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* L.U.F.S. — the new EP */}
      <section className="border-t border-cream/10 bg-plum/40 py-12 sm:py-16">
        <div className="mx-auto w-full px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold tracking-normal text-pink-neon">
              White Chorus · EP.
            </p>
            <h2 className="font-display mt-1 text-3xl font-normal leading-none uppercase tracking-wide text-cream text-balance sm:text-4xl">
              Love Under Flashing Strobe
            </h2>
            <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-cream/75">
              Six tracks. Out September 2, 2026.
            </p>
          </div>

          {/* Lead single */}
          <div className="ep-video-frame mx-auto mt-8 aspect-video w-full max-w-5xl overflow-hidden rounded-[2rem] border border-coral/30 shadow-stage sm:mt-10 sm:rounded-[2rem]">
            <YouTubeEmbed
              videoid="MI_Kvwd7zLA"
              playlabel="Play Melayang by White Chorus"
            />
          </div>
          <p className="mt-3 text-center text-xs tracking-normal text-cream/60">
            Melayang — an anthem for the ones lost in Jakarta&rsquo;s night
          </p>

          {/* Tracklist */}
          <div className="mx-auto mt-10 max-w-2xl border-y border-cream/10">
            <div className="flex items-baseline justify-between gap-4 py-3.5">
              <span className="font-display text-xl leading-none tracking-wide text-coral">
                Melayang
              </span>
              <span className="text-xs font-semibold tracking-[0.14em] text-cream/60">
                Lead single · out now
              </span>
            </div>
            <div className="border-t border-cream/10 py-3.5 text-center text-xs tracking-[0.14em] text-cream/50">
              Five more tracks, September 2
            </div>
          </div>

          <DspLinks />
        </div>
      </section>
    </main>
  );
}
