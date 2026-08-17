"use client";

import Image from "next/image";
import { characters, itemsFor, slotLabels } from "@/data/characters";
import { sceneById, scenes } from "@/data/assets";
import { CharacterFigure } from "../CharacterFigure";
import { useLooks } from "../useLooks";

/** Quiet — density/restraint. Clean dark stage, characters centered, controls
 *  tucked in a slim bar, one coral accent, generous air. */
export function Quiet() {
  const { activeId, setActiveId, looks, toggleItem, sceneId, setSceneId } = useLooks();
  const scene = sceneById.get(sceneId) ?? scenes[0];
  const character = characters.find((c) => c.id === activeId) ?? characters[0];

  return (
    <div className="min-h-screen w-full px-6 py-16 sm:py-20">
      <div className="proto-entrance mx-auto w-full max-w-3xl">
        {/* Stage, quiet and centered */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-cream/10">
          <Image src={scene.src} alt={scene.name} fill className="object-cover" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_25%,transparent_45%,rgba(20,8,22,0.5)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
            {characters.map((c) => (
              <CharacterFigure
                key={c.id}
                character={c}
                look={looks[c.id]}
                active={c.id === activeId}
                className="w-[54%]"
              />
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs uppercase tracking-[0.3em] text-cream/40">
          {character.fullName}
        </p>

        {/* Slim control bar */}
        <div className="mx-auto mt-5 max-w-md space-y-5">
          <div className="flex justify-center gap-2">
            {characters.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                aria-pressed={c.id === activeId}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  c.id === activeId
                    ? "bg-cream text-plum-deep"
                    : "text-cream/60 hover:text-cream"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex justify-center gap-3">
            {scenes.map((s) => (
              <button
                key={s.id}
                onClick={() => setSceneId(s.id)}
                aria-pressed={s.id === sceneId}
                className={`relative aspect-[3/4] w-14 overflow-hidden rounded-lg transition-opacity ${
                  s.id === sceneId ? "opacity-100 ring-1 ring-coral" : "opacity-50 hover:opacity-90"
                }`}
              >
                <Image src={s.src} alt={s.name} fill sizes="56px" className="object-cover" />
              </button>
            ))}
          </div>

          {character.slots.map((slot) => (
            <div key={slot} className="flex items-baseline justify-center gap-3">
              <span className="w-24 shrink-0 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-cream/40">
                {slotLabels[slot]}
              </span>
              <div className="flex flex-wrap gap-2">
                {itemsFor(character.id, slot).map((item) => {
                  const on = looks[character.id][slot] === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(slot, item.id)}
                      aria-pressed={on}
                      className={`text-sm transition-colors ${
                        on ? "text-coral" : "text-cream/60 hover:text-cream"
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
