"use client";

import { characters, itemsFor, slotLabels } from "@/data/characters";
import { CharacterFigure } from "../CharacterFigure";
import { useLooks } from "../useLooks";
import { SaveAndHall } from "../SaveAndHall";

/** Paper — light/playful. The illustrated paper-doll direction: cream paper,
 *  hand-drawn-weight borders, sticker wardrobe tiles. Breaks the dark identity. */
export function Paper() {
  const { activeId, setActiveId, looks, toggleItem, save, saving, hasSelection } = useLooks();
  const character = characters.find((c) => c.id === activeId) ?? characters[0];

  return (
    <div className="min-h-screen w-full bg-[#fbf3e8] px-4 py-8 text-[#2b1b31] sm:px-6">
      <div className="proto-entrance mx-auto w-full max-w-md">
        {/* Header */}
        <header className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#e06a6a]">
            L.U.F.S. · Dress Up
          </p>
          <h1 className="mt-1 font-display text-4xl uppercase leading-none tracking-wide text-[#2b1b31]">
            Sticker studio
          </h1>
          <p className="mt-2 text-sm text-[#6b5b57]">
            Dress Emir &amp; Friska, sticker by sticker.
          </p>
        </header>

        {/* Paper stage */}
        <div className="relative mt-6 overflow-hidden rounded-[2rem] border-2 border-[#e4d7c6] bg-[radial-gradient(circle_at_50%_30%,#ffffff_0%,#f6ead9_70%)] p-6 shadow-[0_12px_32px_rgba(43,27,49,0.12)]">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[300px]">
            {/* soft paper-doll blob */}
            <div
              aria-hidden
              className="absolute inset-x-4 bottom-0 top-10 rounded-full bg-[#f0dfc8]"
            />
            <div className="absolute inset-0 flex items-end justify-center">
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
          </div>
          <p className="mt-4 text-center text-xs font-semibold text-[#8a7767]">
            {character.fullName}
          </p>
        </div>

        {/* Character switch */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          {characters.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              aria-pressed={c.id === activeId}
              className={`rounded-full border-2 px-4 py-3 text-sm font-bold transition-colors ${
                c.id === activeId
                  ? "border-[#e06a6a] bg-[#e06a6a] text-white"
                  : "border-[#d9c7b3] bg-white text-[#5b4c47] hover:border-[#c9b295]"
              }`}
            >
              Dress {c.name}
            </button>
          ))}
        </div>

        {/* Wardrobe as sticker tiles */}
        {character.slots.map((slot) => (
          <div key={slot} className="mt-6">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#8a7767]">
              {slotLabels[slot]}
            </h3>
            <div className="flex flex-wrap gap-2">
              {itemsFor(character.id, slot).map((item) => {
                const on = looks[character.id][slot] === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(slot, item.id)}
                    aria-pressed={on}
                    className={`rounded-2xl border-2 px-3 py-2 text-xs font-semibold transition-transform active:scale-95 ${
                      on
                        ? "border-[#2b1b31] bg-[#2b1b31] text-[#fbf3e8]"
                        : "border-[#e4d7c6] bg-white text-[#5b4c47] hover:-translate-y-0.5"
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-6">
          <SaveAndHall save={save} saving={saving} hasSelection={hasSelection} tone="light" />
        </div>
      </div>
    </div>
  );
}
