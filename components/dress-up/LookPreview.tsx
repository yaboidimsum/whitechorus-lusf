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
    <div className="relative aspect-[3/4] w-full overflow-hidden">
      {scene ? (
        <Image
          src={scene.src}
          alt={scene.name}
          fill
          sizes="(max-width: 480px) 45vw, 200px"
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center">
        {characters.map((c) => {
          const worn = layerOrder
            .map((slot) => itemById.get(look.looks[c.id][slot] ?? ""))
            .filter((item): item is NonNullable<typeof item> => Boolean(item));
          return (
            <figure key={c.id} className="relative w-[48%]">
              <div className="relative w-full" style={{ aspectRatio: "990 / 1400" }}>
                <Image
                  src={c.baseSrc}
                  alt=""
                  fill
                  sizes="(max-width: 480px) 45vw, 200px"
                  className="object-contain"
                />
                {worn.map((item) => (
                  <Image
                    key={item.id}
                    src={item.src}
                    alt=""
                    fill
                    sizes="(max-width: 480px) 45vw, 200px"
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
