import HallOfFame from "@/components/dress-up/HallOfFame";

export default function HallOfFamePage() {
  return (
    <main id="main" className="flex-1 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-pink-neon">
            White Chorus
          </p>
          <h1 className="font-display mt-1 text-4xl font-normal uppercase leading-none tracking-wide text-cream text-balance">
            Hall of Fame
          </h1>
          <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-cream/75">
            Your saved looks, kept private in your browser.
          </p>
        </header>
        <HallOfFame variant="full" />
      </div>
    </main>
  );
}
