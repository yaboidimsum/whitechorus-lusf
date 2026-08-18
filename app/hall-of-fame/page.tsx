import HallOfFame from "@/components/dress-up/HallOfFame";

export default function HallOfFamePage() {
  return (
    <main id="main" className="flex-1 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 text-center">
          <p className="text-xs font-bold tracking-normal text-pink-neon">
            White Chorus
          </p>
          <h1 className="font-display mt-1 text-4xl font-normal leading-none uppercase tracking-wide text-cream text-balance">
            Hall of Fame
          </h1>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-cream/75">
            Browse outfits created by the community and publish your own styled looks.
          </p>
        </header>
        <HallOfFame variant="full" />
      </div>
    </main>
  );
}
