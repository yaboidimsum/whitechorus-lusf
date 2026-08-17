"use client";

import Image from "next/image";
import { useState } from "react";
import { sceneById, scenes } from "@/data/assets";
import { characters } from "@/data/characters";
import { saveLook } from "@/lib/looks";
import type { CharacterId, Look, SlotId } from "@/lib/types";
import CharacterStage from "./CharacterStage";
import WardrobeGrid from "./WardrobeGrid";

const emptyLooks = (): Record<CharacterId, Look> => ({ emir: {}, friska: {} });

export default function DressUp() {
  const [activeId, setActiveId] = useState<CharacterId>("emir");
  const [looks, setLooks] = useState<Record<CharacterId, Look>>(emptyLooks);
  const [sceneId, setSceneId] = useState(scenes[0].id);
  const [announcement, setAnnouncement] = useState("");

  const scene = sceneById.get(sceneId) ?? scenes[0];
  const character = characters.find((c) => c.id === activeId) ?? characters[0];
  const hasSelection = Object.values(looks).some((l) => Object.keys(l).length > 0);

  const toggleItem = (slot: SlotId, itemId: string) => {
    setLooks((prev) => {
      const current = prev[activeId];
      const next: Look = { ...current };
      if (next[slot] === itemId) {
        delete next[slot]; // tap again to undress
      } else {
        next[slot] = itemId;
      }
      return { ...prev, [activeId]: next };
    });
  };

  const handleSave = () => {
    saveLook(looks, sceneId);
    setAnnouncement("Outfit saved to the Hall of Fame.");
  };

  return (
    <div className="w-full py-12 sm:py-16">
      {/* Screen-reader announcements */}
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 lg:max-w-6xl">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start">
          {/* Stage preview — first on mobile, right column on desktop */}
          <div className="lg:order-2 lg:sticky lg:top-6 lg:self-start">
            <CharacterStage scene={scene} looks={looks} activeId={activeId} />
          </div>

          {/* Controls — left column on desktop */}
          <div className="flex flex-col gap-3 lg:order-1">
            {/* Character switcher */}
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Choose who to dress">
              {characters.map((c) => {
                const active = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    aria-pressed={active}
                    className={`rounded-full border px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] transition-colors ${
                      active
                        ? "border-coral bg-coral text-plum-deep"
                        : "border-cream/25 text-cream/85 hover:border-cream/60"
                    }`}
                  >
                    Dress {c.name}
                  </button>
                );
              })}
            </div>

            {/* Scene carousel */}
            <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Scene">
              {scenes.map((s) => {
                const selected = s.id === sceneId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSceneId(s.id)}
                    aria-pressed={selected}
                    className={`relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-2xl border transition-colors ${
                      selected ? "border-coral" : "border-cream/20 hover:border-cream/50"
                    }`}
                  >
                    <Image
                      src={s.src}
                      alt={s.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-plum-deep/70 px-1.5 py-1 text-xs font-semibold text-cream/90">
                      {s.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Wardrobe */}
            <WardrobeGrid key={character.id} character={character} look={looks[character.id]} onSelect={toggleItem} />

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={!hasSelection}
              className="rounded-full bg-coral px-5 py-3.5 text-sm font-extrabold uppercase tracking-[0.14em] text-plum-deep transition-[transform,opacity] duration-150 ease-out-quart hover:opacity-85 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100"
            >
              Save Outfit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
