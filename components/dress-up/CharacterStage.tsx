"use client";

import Image from "next/image";
import { characters, itemById, itemsFor, layerOrder } from "@/data/characters";
import type { Character, CharacterId, Look, Scene } from "@/lib/types";

interface StageProps {
  scene: Scene;
  looks: Record<CharacterId, Look>;
  activeId: CharacterId;
}

export default function CharacterStage({ scene, looks, activeId }: StageProps) {
  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-cream/15 shadow-stage"
      aria-label="Dressing room stage"
    >
      {/* Scene backdrop */}
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={scene.src}
          alt={scene.name}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 448px"
          className="object-cover"
        />
        {/* Soft vignette for depth and legibility */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_20%,transparent_55%,rgba(20,8,22,0.55)_100%)]"
        />

        {/* Both artists, always visible */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center px-2">
          {characters.map((c) => (
            <CharacterFigure
              key={c.id}
              character={c}
              look={looks[c.id]}
              active={c.id === activeId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CharacterFigure({
  character,
  look,
  active,
}: {
  character: Character;
  look: Look;
  active: boolean;
}) {
  const worn = layerOrder
    .map((slot) => itemById.get(look[slot] ?? ""))
    .filter((item): item is NonNullable<typeof item> => item?.characterId === character.id);

  const description = `${character.name}${worn.length ? ` wearing ${worn.map((w) => w.name).join(", ")}` : ""}`;

  return (
    <figure
      role="img"
      aria-label={description}
      className={`relative w-[65%] max-w-[480px] transition-[transform,opacity] duration-200 ease-in-out-quart ${
        active ? "z-10 -translate-y-1" : "opacity-90"
      }`}
    >
      <div className="relative aspect-[990/1400] w-full">
        <Image
          src={character.baseSrc}
          alt=""
          fill
          priority
          sizes="(max-width: 640px) 65vw, 480px"
          className="object-contain"
        />
        {/* Wardrobe — all layers rendered and cached, visibility toggled by
            opacity. Switching clothes is a pure opacity crossfade: no on-demand
            network fetch, no hard cut (fixes the first-click glitch). */}
        {layerOrder.map((slot) =>
          itemsFor(character.id, slot).map((item) => {
            const selected = look[slot] === item.id;
            return (
              <Image
                key={item.id}
                src={item.src}
                alt=""
                fill
                sizes="(max-width: 640px) 65vw, 480px"
                className={`object-contain transition-opacity duration-150 ease-out-quart ${
                  selected ? "opacity-100" : "opacity-0"
                }`}
              />
            );
          }),
        )}
      </div>
      {active ? (
        <span
          aria-hidden
          className="absolute -inset-1 rounded-2xl border-2 border-coral shadow-[0_0_24px_rgba(255,154,131,0.45)] transition-[opacity,transform] duration-200 ease-out-quart"
        />
      ) : null}
    </figure>
  );
}
