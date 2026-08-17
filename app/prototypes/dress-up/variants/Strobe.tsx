"use client";

import Image from "next/image";
import { characters, itemsFor, slotLabels } from "@/data/characters";
import { sceneById, scenes } from "@/data/assets";
import { CharacterFigure } from "../CharacterFigure";
import { useLooks } from "../useLooks";

/** Strobe — immersive/theater. Dark stage-forward, characters dominate, neon glow. */
export function Strobe() {
  const { activeId, setActiveId, looks, toggleItem, sceneId, setSceneId } = useLooks();
  const scene = sceneById.get(sceneId) ?? scenes[0];
  const character = characters.find((c) => c.id === activeId) ?? characters[0];

  return (
    <div className="min-h-screen w-full px-4 py-8 sm:px-6">
      <div className="proto-entrance mx-auto w-full max-w-5xl">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-stage">
          <Image src={scene.src} alt={scene.name} fill priority className="object-cover" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_20%,transparent_50%,rgba(20,8,22,0.6)_100%)]"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center px-2">
            {characters.map((c) => (
              <CharacterFigure
                key={c.id}
                character={c}
                look={looks[c.id]}
                active={c.id === activeId}
                className="w-[52%]"
              />
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          <div className="grid grid-cols-2 gap-2">
            {characters.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                aria-pressed={c.id === activeId}
                className={`rounded-full border px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] transition-colors ${
                  c.id === activeId
                    ? "border-coral bg-coral text-plum-deep"
                    : "border-cream/25 text-cream/85 hover:border-cream/60"
                }`}
              >
                Dress {c.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {scenes.map((s) => (
              <button
                key={s.id}
                onClick={() => setSceneId(s.id)}
                aria-pressed={s.id === sceneId}
                className={`relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-2xl border ${
                  s.id === sceneId ? "border-coral" : "border-cream/20"
                }`}
              >
                <Image src={s.src} alt={s.name} fill sizes="96px" className="object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-plum-deep/70 px-1 py-0.5 text-[10px] font-semibold text-cream/90">
                  {s.name}
                </span>
              </button>
            ))}
          </div>

          {character.slots.map((slot) => (
            <div key={slot}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-cream/50">
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
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        on
                          ? "border-coral bg-coral/15 text-coral"
                          : "border-cream/20 text-cream/75 hover:border-cream/50"
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
