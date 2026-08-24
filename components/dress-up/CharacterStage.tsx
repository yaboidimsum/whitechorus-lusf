"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  characters,
  getCharacterBaseSrc,
  itemById,
  itemsFor,
  layerOrder,
  layerOrderFor,
} from "@/data/characters";
import type { Character, CharacterId, CustomKaosData, CustomSceneData, Look, Scene } from "@/lib/types";
import { useCallback, useRef } from "react";

interface StageProps {
  scene: Scene;
  looks: Record<CharacterId, Look>;
  activeId: CharacterId;
  customScene?: CustomSceneData | null;
  customKaos?: Partial<Record<CharacterId, CustomKaosData>> | null;
  onAdjustBg?: (updater: (prev: CustomSceneData) => CustomSceneData) => void;
  isAdjustingBg?: boolean;
}

export default function CharacterStage({
  scene,
  looks,
  activeId,
  customScene,
  customKaos,
  onAdjustBg,
  isAdjustingBg = false,
}: StageProps) {
  const isCustom = scene.id === "custom" && Boolean(customScene?.src);
  const dragRef = useRef<{ startX: number; startY: number; initialPosX: number; initialPosY: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isAdjustingBg || !onAdjustBg || !customScene) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: customScene.posX,
      initialPosY: customScene.posY,
    };
  }, [isAdjustingBg, onAdjustBg, customScene]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current || !onAdjustBg) return;
    e.preventDefault();
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    // Smooth 1:1 proportional 2D drag shift across both X and Y axes
    const deltaX = (dx / 3.5);
    const deltaY = (dy / 3.5);

    const newPosX = Math.max(0, Math.min(100, dragRef.current.initialPosX + deltaX));
    const newPosY = Math.max(0, Math.min(100, dragRef.current.initialPosY + deltaY));

    onAdjustBg((prev) => ({
      ...prev,
      posX: Math.round(newPosX),
      posY: Math.round(newPosY),
    }));
  }, [onAdjustBg]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  }, []);

  return (
    <section
      className={`relative select-none overflow-hidden rounded-3xl border border-cream/15 shadow-stage ${
        isAdjustingBg
          ? "ring-2 ring-coral cursor-grab active:cursor-grabbing touch-none"
          : ""
      }`}
      aria-label="Dressing room stage"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Scene backdrop */}
      <div className="relative aspect-[4/5] w-full overflow-hidden select-none">
        {isCustom && customScene ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={customScene.src}
            alt="Custom Background"
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none origin-center transition-transform duration-75"
            style={{
              transform: `translate3d(${(customScene.posX - 50) * 0.8}%, ${(customScene.posY - 50) * 0.8}%, 0) scale(${customScene.scale})`,
            }}
          />
        ) : (
          <Image
            src={scene.src}
            alt={scene.name}
            fill
            priority
            draggable={false}
            sizes="(max-width: 640px) 100vw, 448px"
            className="object-cover select-none pointer-events-none"
          />
        )}

        {/* Adjusting overlay helper badge */}
        {isAdjustingBg && (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center select-none">
            <span className="rounded-full bg-plum-deep/90 px-3.5 py-1 text-[11px] font-bold text-coral shadow-lg backdrop-blur-md border border-coral/30">
              ✋ Drag anywhere (↔ ↕) to pan background
            </span>
          </div>
        )}

        {/* Soft vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none bg-[radial-gradient(120%_90%_at_50%_20%,transparent_55%,rgba(20,8,22,0.55)_100%)]"
        />

        {/* Characters */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center px-0 select-none ${
            isAdjustingBg ? "opacity-60 transition-opacity" : ""
          }`}
        >
          {characters.map((character, index) => (
            <CharacterFigure
              key={character.id}
              character={character}
              look={looks[character.id]}
              customKaosData={customKaos?.[character.id]}
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
  customKaosData,
  active,
  index,
}: {
  character: Character;
  look: Look;
  customKaosData?: CustomKaosData;
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

  const isCustomKaos = look.top === `${character.id}-top-custom`;
  const baseMaskSrc = `/assets/lufs/characters/custom-kaos/base-kaos-${character.id}.png`;
  const outlineSrc = `/assets/lufs/characters/custom-kaos/outline-kaos-${character.id}.png`;

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
          src={getCharacterBaseSrc(character.id, look.hair)}
          alt=""
          fill
          priority
          draggable={false}
          sizes="78vw"
          className="object-contain select-none pointer-events-none"
        />

        {/* Wardrobe in strict stack order (shoes -> one-piece -> bottom -> top -> accessory) */}
        {layerOrderFor(character.id).map((slot) => {
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
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-contain select-none"
                    />
                  </div>
                )}

                {/* Fabric Outlines, Collar & Seams */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={outlineSrc}
                  alt="Fabric Outline"
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-contain select-none opacity-90"
                />
              </div>
            );
          }

          return itemsFor(character.id, slot).map((item) => {
            if (item.src === "custom") return null;
            const selected = look[slot] === item.id;

            return (
              <Image
                key={item.id}
                src={item.src}
                alt=""
                fill
                draggable={false}
                sizes="78vw"
                className={`
                  object-contain
                  select-none
                  pointer-events-none
                  transition-opacity
                  duration-150
                  ${selected ? "opacity-100" : "pointer-events-none opacity-0"}
                `}
              />
            );
          });
        })}
      </div>
    </motion.figure>
  );
}