"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
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
  const shouldReduceMotion = useReducedMotion();
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
    <motion.figure
      role="img"
      aria-label={description}
      animate={
        shouldReduceMotion
          ? { opacity: active ? 1 : 0.9 }
          : {
              y: active ? -6 : 0,
              opacity: active ? 1 : 0.88,
            }
      }
      transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
      className={`
        relative
        w-[66%]
        shrink-0
        ${index === 1 ? "-ml-[8%]" : ""}
        ${active ? "z-20" : "z-10"}
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
    </motion.figure>
  );
}