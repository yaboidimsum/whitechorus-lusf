"use client";

import Image from "next/image";
import { characters, getCharacterBaseSrc, itemById, layerOrder } from "@/data/characters";
import { sceneById } from "@/data/assets";
import type { SavedLook } from "@/lib/types";
import { getCharacterLeftPercent } from "./CharacterStage";

/** Mini stage for a saved look: scene backdrop + both characters wearing
 *  their saved items. Layer images are already cached from dressing. */
export default function LookPreview({ look }: { look: SavedLook }) {
  const scene = sceneById.get(look.sceneId);
  const isCustom = (look.sceneId === "custom" || !scene) && Boolean(look.customScene?.src);

  return (
    <div className="relative aspect-[990/1400] w-full overflow-hidden bg-plum-deep/80">
      {isCustom && look.customScene?.src ? (
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={look.customScene.src}
            alt="Custom Background"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none origin-center"
            style={{
              transform: `translate3d(${(look.customScene.posX - 50) * 0.8}%, ${(look.customScene.posY - 50) * 0.8}%, 0) scale(${look.customScene.scale ?? 1})`,
            }}
          />
        </div>
      ) : scene ? (
        <Image
          src={scene.src}
          alt={scene.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
          className="object-cover pointer-events-none select-none"
        />
      ) : null}

      {/* Soft vignette matching stage */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_20%,transparent_55%,rgba(20,8,22,0.55)_100%)]"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-0 select-none">
        {characters.map((c) => {
          const order = look.characterOrder ?? ["emir", "friska"];
          const slotIndex = order.indexOf(c.id);
          const slot: "left" | "right" = slotIndex === 0 ? "left" : "right";
          const leftOffset = getCharacterLeftPercent(c.id, slot);

          const isCustomKaos = look.looks[c.id]?.top === `${c.id}-top-custom`;
          const customKaosData = look.customKaos?.[c.id];
          const baseMaskSrc = `/assets/lufs/characters/custom-kaos/base-kaos-${c.id}.png`;
          const outlineSrc = `/assets/lufs/characters/custom-kaos/outline-kaos-${c.id}.png`;

          const worn = layerOrder
            .map((slotId) => itemById.get(look.looks[c.id]?.[slotId] ?? ""))
            .filter((item): item is NonNullable<typeof item> => item?.characterId === c.id);

          return (
            <figure
              key={c.id}
              style={{
                left: leftOffset,
                zIndex: slot === "left" ? 10 : 11,
              }}
              className="absolute bottom-0 w-[66%] shrink-0"
            >
              <div className="relative aspect-[990/1400] w-full">
                <Image
                  src={getCharacterBaseSrc(c.id, look.looks[c.id]?.hair)}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
                  className="object-contain"
                />

                {/* Wardrobe layers in strict stack order (shoes -> one-piece -> bottom -> top -> accessory) */}
                {layerOrder.map((slot) => {
                  if (slot === "hair") return null;
                  if (slot === "top" && isCustomKaos) {
                    return (
                      <div key="custom-kaos-layer" className="absolute inset-0 pointer-events-none select-none">
                        {/* Fabric Base Color Fill */}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundColor: customKaosData?.color || "#ffffff",
                            maskImage: `url(${baseMaskSrc})`,
                            WebkitMaskImage: `url(${baseMaskSrc})`,
                            maskSize: "100% 100%",
                            WebkitMaskSize: "100% 100%",
                          }}
                        />

                        {/* Artwork Layer (Pattern or Paint) inside Fixed Mask */}
                        {customKaosData?.artworkSrc && (
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              maskImage: `url(${baseMaskSrc})`,
                              WebkitMaskImage: `url(${baseMaskSrc})`,
                              maskSize: "100% 100%",
                              WebkitMaskSize: "100% 100%",
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={customKaosData.artworkSrc}
                              alt="Custom Kaos Artwork"
                              className="absolute inset-0 h-full w-full object-contain select-none"
                            />
                          </div>
                        )}

                        {/* Fabric Outlines, Collar & Seams */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={outlineSrc}
                          alt="Fabric Outline"
                          className="absolute inset-0 h-full w-full object-contain select-none opacity-90"
                        />
                      </div>
                    );
                  }

                  const itemId = look.looks[c.id]?.[slot];
                  const item = itemId ? itemById.get(itemId) : undefined;
                  if (!item || item.characterId !== c.id || item.src === "custom") return null;

                  return (
                    <Image
                      key={item.id}
                      src={item.src}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
                      className="object-contain"
                    />
                  );
                })}
              </div>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
