"use client";

import Image from "next/image";
import {
  characters,
  itemById,
  itemsFor,
  layerOrder,
  layerOrderFor,
} from "@/data/characters";
import type { Character, CharacterId, Look, Scene } from "@/lib/types";

interface StageProps {
  scene: Scene;
  looks: Record<CharacterId, Look>;
  activeId: CharacterId;
}

export default function CharacterStage({
  scene,
  looks,
  activeId,
}: StageProps) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-cream/15 shadow-stage"
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

        {/* Soft vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_20%,transparent_55%,rgba(20,8,22,0.55)_100%)]"
        />

        {/* Characters */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-center px-0">
          {characters.map((character, index) => (
            <CharacterFigure
              key={character.id}
              character={character}
              look={looks[character.id]}
              active={character.id === activeId}
              index={index}
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
  index,
}: {
  character: Character;
  look: Look;
  active: boolean;
  index: number;
}) {
  const worn = layerOrder
    .map((slot) => itemById.get(look[slot] ?? ""))
    .filter(
      (item): item is NonNullable<typeof item> =>
        item?.characterId === character.id,
    );

  const description = `${character.name}${
    worn.length
      ? ` wearing ${worn.map((item) => item.name).join(", ")}`
      : ""
  }`;

  return (
    <figure
      role="img"
      aria-label={description}
      className={`
        relative
        w-[66%]
        shrink-0
        transition-[transform,opacity]
        duration-200
        ease-in-out-quart

        ${index === 1 ? "-ml-[8%]" : ""}

        ${
          active
            ? "z-20 -translate-y-1"
            : "z-10 opacity-90"
        }
      `}
    >
      <div className="relative aspect-[990/1400] w-full">
        {/* Base character */}
        <Image
          src={character.baseSrc}
          alt=""
          fill
          priority
          sizes="78vw"
          className="object-contain"
        />

        {/* Wardrobe */}
        {layerOrderFor(character.id).map((slot) =>
          itemsFor(character.id, slot).map((item) => {
            const selected = look[slot] === item.id;

            return (
              <Image
                key={item.id}
                src={item.src}
                alt=""
                fill
                sizes="78vw"
                className={`
                  object-contain
                  transition-opacity
                  duration-150
                  ease-out-quart
                  ${selected ? "opacity-100" : "opacity-0"}
                `}
              />
            );
          }),
        )}
      </div>
    </figure>
  );
}