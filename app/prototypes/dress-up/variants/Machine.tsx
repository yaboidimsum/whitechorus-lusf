"use client";

import Image from "next/image";
import { characters, itemsFor, slotLabels } from "@/data/characters";
import { sceneById, scenes } from "@/data/assets";
import { branding } from "@/data/assets";
import { CharacterFigure } from "../CharacterFigure";
import { useLooks } from "../useLooks";
import { SaveAndHall } from "../SaveAndHall";

/** Machine — arcade cabinet. The "Dress Up Machine" signage becomes a cabinet:
 *  marquee frame, slot-style select, big tactile buttons. */
export function Machine() {
  const { activeId, setActiveId, looks, toggleItem, sceneId, setSceneId, save, saving, hasSelection } = useLooks();
  const scene = sceneById.get(sceneId) ?? scenes[0];
  const character = characters.find((c) => c.id === activeId) ?? characters[0];

  return (
    <div className="min-h-screen w-full px-4 py-10 sm:px-6">
      <div className="proto-entrance mx-auto w-full max-w-lg">
        {/* Marquee */}
        <div className="flex items-center justify-center gap-3 rounded-t-2xl border-4 border-b-0 border-coral/60 bg-plum px-4 py-3">
          <Image
            src={branding.signage.src}
            alt="L.U.F.S. Dress Up Machine"
            width={56}
            height={56}
            className="opacity-90"
          />
          <p className="font-display text-xl tracking-wide text-coral">
            Dress Up Machine
          </p>
        </div>

        {/* Cabinet screen */}
        <div className="relative aspect-[4/5] w-full overflow-hidden border-4 border-coral/60 bg-black">
          <Image src={scene.src} alt={scene.name} fill className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,154,131,0.18),transparent_60%)]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
            {characters.map((c) => (
              <CharacterFigure
                key={c.id}
                character={c}
                look={looks[c.id]}
                active={c.id === activeId}
                className="w-[50%]"
              />
            ))}
          </div>
          {/* CRT scanline tint */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] bg-[repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]" />
        </div>

        {/* Control deck */}
        <div className="rounded-b-2xl border-4 border-t-0 border-coral/60 bg-plum px-4 py-5">
          <div className="grid grid-cols-2 gap-3">
            {characters.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                aria-pressed={c.id === activeId}
                className={`rounded-xl border-2 px-4 py-3 text-sm font-bold tracking-[0.1em] transition-transform active:translate-y-0.5 ${
                  c.id === activeId
                    ? "border-coral bg-coral text-plum-deep"
                    : "border-cream/30 text-cream/85 hover:border-cream/60"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            {scenes.map((s) => (
              <button
                key={s.id}
                onClick={() => setSceneId(s.id)}
                aria-pressed={s.id === sceneId}
                className={`flex-1 rounded-lg border-2 px-2 py-2 text-xs font-semibold transition-colors ${
                  s.id === sceneId
                    ? "border-pink-neon bg-pink-neon/15 text-pink-neon"
                    : "border-cream/20 text-cream/70 hover:border-cream/50"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {character.slots.map((slot) => (
              <div key={slot}>
                <p className="mb-1 text-[10px] font-bold tracking-[0.16em] text-cream/45">
                  {slotLabels[slot]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {itemsFor(character.id, slot).map((item) => {
                    const on = looks[character.id][slot] === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(slot, item.id)}
                        aria-pressed={on}
                        className={`rounded-md border-2 px-2.5 py-1 text-[11px] font-semibold transition-transform active:scale-95 ${
                          on
                            ? "border-coral bg-coral/15 text-coral"
                            : "border-cream/20 text-cream/70 hover:border-cream/50"
                        }`}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <SaveAndHall save={save} saving={saving} hasSelection={hasSelection} />
          </div>
        </div>
      </div>
    </div>
  );
}
