import DressUp from "@/components/dress-up/DressUp";

export default function Home() {
  return (
    <main className="flex-1 px-4 py-10 sm:px-6">
      <header className="mx-auto mb-10 max-w-5xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
          White Chorus
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-black">
          Dress up Clara Friska &amp; Emir Agung
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-balance text-black/60">
          Mix and match the wardrobe, then save the looks you love. Looks are
          stored privately in your browser.
        </p>
      </header>
      <DressUp />
    </main>
  );
}
