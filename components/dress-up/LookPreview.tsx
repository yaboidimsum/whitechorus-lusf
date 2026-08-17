"use client";

import Image from "next/image";
import { characters, itemById, layerOrder } from "@/data/characters";
import { sceneById } from "@/data/assets";
import type { SavedLook } from "@/lib/types";

/** Mini stage for a saved look: scene backdrop + both characters wearing
 *  their saved items. Layer images are already cached from dressing. */
export default function LookPreview({ look }: { look: SavedLook }) {
  const scene = sceneById.get(look.sceneId);
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden">
      {scene ? (
        <Image
          src={scene.src}
          alt={scene.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
          className="object-cover"
        />
      ) : null}

      {/* Soft vignette matching stage */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_20%,transparent_55%,rgba(20,8,22,0.55)_100%)]"
      />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center px-0">
        {characters.map((c, index) => {
          const worn = layerOrder
            .map((slot) => itemById.get(look.looks[c.id]?.[slot] ?? ""))
            .filter((item): item is NonNullable<typeof item> => item?.characterId === c.id);
          return (
            <figure
              key={c.id}
              className={`
                relative
                w-[66%]
                shrink-0
                ${index === 1 ? "-ml-[8%]" : ""}
              `}
            >
              <div className="relative aspect-[990/1400] w-full">
                <Image
                  src={c.baseSrc}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
                  className="object-contain"
                />
                {worn.map((item) => (
                  <Image
                    key={item.id}
                    src={item.src}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
                    className="object-contain"
                  />
                ))}
              </div>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
