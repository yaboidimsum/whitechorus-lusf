"use client";

import Image from "next/image";
import { itemById, layerOrder } from "@/data/characters";
import type { Character, Look } from "@/lib/types";

/** Renders one character: transparent base body + worn layers, plus an
 *  active-focus ring. Shared by all variants (each frames it differently). */
export function CharacterFigure({
  character,
  look,
  active,
  className = "",
  sizes = "(max-width: 640px) 55vw, 320px",
}: {
  character: Character;
  look: Look;
  active: boolean;
  className?: string;
  sizes?: string;
}) {
  const worn = layerOrder
    .map((slot) => itemById.get(look[slot] ?? ""))
    .filter((item): item is NonNullable<typeof item> => item?.characterId === character.id);

  const label = `${character.name}${worn.length ? ` wearing ${worn.map((w) => w.name).join(", ")}` : ""}`;

  return (
    <figure role="img" aria-label={label} className={`relative ${className}`}>
      <div className="relative w-full" style={{ aspectRatio: "990 / 1400" }}>
        <Image src={character.baseSrc} alt="" fill sizes={sizes} className="object-contain" />
        {worn.map((item) => (
          <Image key={item.id} src={item.src} alt="" fill sizes={sizes} className="object-contain" />
        ))}
      </div>
      {active ? (
        <span
          aria-hidden
          className="absolute -inset-1 rounded-2xl border-2 border-coral shadow-[0_0_24px_rgba(255,154,131,0.5)]"
        />
      ) : null}
    </figure>
  );
}
