import Image from "next/image";
import DressUp from "@/components/dress-up/DressUp";
import { branding } from "@/data/assets";

export default function Home() {
  return (
    <main
      id="main"
      className="flex-1 px-4 py-8 pb-[env(safe-area-inset-bottom)] sm:px-6"
    >
      <header className="mx-auto mb-6 flex max-w-md flex-col items-center text-center">
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
    </main>
  );
}
