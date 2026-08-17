"use client";

import Image from "next/image";
import { characters, itemsFor, slotLabels } from "@/data/characters";
import { sceneById, scenes } from "@/data/assets";
import { CharacterFigure } from "../CharacterFigure";
import { useLooks } from "../useLooks";
import { SaveAndHall } from "../SaveAndHall";

/** Poster — typographic/editorial. Gig-poster masthead, hairline rules,
 *  the stage as a poster centerpiece, controls as an index. */
export function Poster() {
  const { activeId, setActiveId, looks, toggleItem, sceneId, setSceneId, save, saving, hasSelection } = useLooks();
  const scene = sceneById.get(sceneId) ?? scenes[0];
  const character = characters.find((c) => c.id === activeId) ?? characters[0];

  return (
    <div className="min-h-screen w-full px-6 py-12 sm:px-10">
      <div className="proto-entrance mx-auto max-w-4xl">
        {/* Masthead */}
        <header className="border-b border-cream/15 pb-6">
          <p className="font-display text-5xl uppercase leading-[0.9] tracking-wide text-cream sm:text-7xl">
            Dress
            <br />
            the duo
          </p>
          <p className="mt-3 text-sm text-cream/60">White Chorus — L.U.S.F.</p>
        </header>

        {/* Stage as poster centerpiece */}
        <div className="relative mx-auto mt-10 aspect-[4/5] w-full max-w-lg border border-cream/15">
          <Image src={scene.src} alt={scene.name} fill className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-black/25" />
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
        </div>

        {/* Controls as index */}
        <div className="mt-12 grid gap-10 sm:grid-cols-2">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream/40">
              Who
            </h3>
            <div className="mt-3 divide-y divide-cream/10 border-y border-cream/10">
              {characters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  aria-pressed={c.id === activeId}
                  className={`flex w-full items-center justify-between py-3 text-left transition-colors ${
                    c.id === activeId ? "text-coral" : "text-cream/80 hover:text-cream"
                  }`}
                >
                  <span className="font-display text-2xl uppercase tracking-wide">
                    {c.name}
                  </span>
                  <span className="text-xs text-cream/40">{c.fullName}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream/40">
              Scene
            </h3>
            <div className="mt-3 flex gap-3">
              {scenes.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSceneId(s.id)}
                  aria-pressed={s.id === sceneId}
                  className={`relative aspect-[3/4] w-20 shrink-0 overflow-hidden border ${
                    s.id === sceneId ? "border-coral" : "border-cream/15"
                  }`}
                >
                  <Image src={s.src} alt={s.name} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {character.slots.map((slot) => (
            <div key={slot}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-cream/40">
                {slotLabels[slot]}
              </h3>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {itemsFor(character.id, slot).map((item) => {
                  const on = looks[character.id][slot] === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(slot, item.id)}
                      aria-pressed={on}
                      className={`border-b pb-1 text-sm transition-colors ${
                        on
                          ? "border-coral text-coral"
                          : "border-transparent text-cream/70 hover:border-cream/40 hover:text-cream"
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="sm:col-span-2">
            <SaveAndHall save={save} saving={saving} hasSelection={hasSelection} />
          </div>
        </div>
      </div>
    </div>
  );
}
