"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
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

export function getCharacterLeftPercent(characterId: CharacterId, slot: "left" | "right"): string {
  if (characterId === "emir") {
    return slot === "left" ? "-10.5%" : "22.5%";
  }
  return slot === "left" ? "16%" : "49%";
}

interface StageProps {
  scene: Scene;
  looks: Record<CharacterId, Look>;
  activeId: CharacterId;
  characterOrder?: CharacterId[];
  customScene?: CustomSceneData | null;
  customKaos?: Partial<Record<CharacterId, CustomKaosData>> | null;
  onAdjustBg?: (updater: (prev: CustomSceneData) => CustomSceneData) => void;
  isAdjustingBg?: boolean;
  onDoneAdjusting?: () => void;
}

export default function CharacterStage({
  scene,
  looks,
  activeId,
  characterOrder,
  customScene,
  customKaos,
  onAdjustBg,
  isAdjustingBg = false,
  onDoneAdjusting,
}: StageProps) {
  const isCustom = scene.id === "custom" && Boolean(customScene?.src);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureStateRef = useRef<{
    stageWidth: number;
    stageHeight: number;
    initialPosX: number;
    initialPosY: number;
    initialScale: number;
    startX: number;
    startY: number;
    initialPinchDistance: number;
    initialMidpointX: number;
    initialMidpointY: number;
  } | null>(null);

  const order = characterOrder ?? ["emir", "friska"];
  const orderedCharacters = order
    .map((id) => characters.find((c) => c.id === id)!)
    .filter(Boolean);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isAdjustingBg || !onAdjustBg || !customScene) return;
    e.preventDefault();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const stageWidth = rect.width || 340;
    const stageHeight = rect.height || 480;

    const pointers = Array.from(pointersRef.current.values());

    if (pointers.length === 1) {
      gestureStateRef.current = {
        stageWidth,
        stageHeight,
        initialPosX: customScene.posX,
        initialPosY: customScene.posY,
        initialScale: customScene.scale ?? 1,
        startX: pointers[0].x,
        startY: pointers[0].y,
        initialPinchDistance: 0,
        initialMidpointX: pointers[0].x,
        initialMidpointY: pointers[0].y,
      };
    } else if (pointers.length === 2) {
      const p1 = pointers[0];
      const p2 = pointers[1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      gestureStateRef.current = {
        stageWidth,
        stageHeight,
        initialPosX: customScene.posX,
        initialPosY: customScene.posY,
        initialScale: customScene.scale ?? 1,
        startX: (p1.x + p2.x) / 2,
        startY: (p1.y + p2.y) / 2,
        initialPinchDistance: Math.max(dist, 10),
        initialMidpointX: (p1.x + p2.x) / 2,
        initialMidpointY: (p1.y + p2.y) / 2,
      };
    }
  }, [isAdjustingBg, onAdjustBg, customScene]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const state = gestureStateRef.current;
    if (!state || !onAdjustBg) return;
    e.preventDefault();

    const pointers = Array.from(pointersRef.current.values());

    if (pointers.length === 1) {
      // 1-finger 1:1 mathematical direct tracking
      const dx = pointers[0].x - state.startX;
      const dy = pointers[0].y - state.startY;

      const stepX = 0.008 * state.stageWidth;
      const stepY = 0.008 * state.stageHeight;

      const deltaPosX = stepX > 0 ? dx / stepX : 0;
      const deltaPosY = stepY > 0 ? dy / stepY : 0;

      const newPosX = Math.max(0, Math.min(100, state.initialPosX + deltaPosX));
      const newPosY = Math.max(0, Math.min(100, state.initialPosY + deltaPosY));

      onAdjustBg((prev) => ({
        ...prev,
        posX: Math.round(newPosX),
        posY: Math.round(newPosY),
      }));
    } else if (pointers.length >= 2) {
      // 2-finger pinch-to-zoom + simultaneous midpoint pan
      const p1 = pointers[0];
      const p2 = pointers[1];
      const currentDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const currentMidX = (p1.x + p2.x) / 2;
      const currentMidY = (p1.y + p2.y) / 2;

      // 1. Zoom ratio
      const scaleRatio = state.initialPinchDistance > 0 ? currentDist / state.initialPinchDistance : 1;
      const rawScale = state.initialScale * scaleRatio;
      const newScale = Math.max(0.5, Math.min(2.5, Number(rawScale.toFixed(2))));

      // 2. Midpoint pan
      const dx = currentMidX - state.initialMidpointX;
      const dy = currentMidY - state.initialMidpointY;
      const stepX = 0.008 * state.stageWidth;
      const stepY = 0.008 * state.stageHeight;
      const deltaPosX = stepX > 0 ? dx / stepX : 0;
      const deltaPosY = stepY > 0 ? dy / stepY : 0;

      const newPosX = Math.max(0, Math.min(100, state.initialPosX + deltaPosX));
      const newPosY = Math.max(0, Math.min(100, state.initialPosY + deltaPosY));

      onAdjustBg((prev) => ({
        ...prev,
        scale: newScale,
        posX: Math.round(newPosX),
        posY: Math.round(newPosY),
      }));
    }
  }, [onAdjustBg]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const remaining = Array.from(pointersRef.current.values());
    if (remaining.length === 1 && customScene) {
      // Re-baseline to remaining single pointer seamlessly
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      gestureStateRef.current = {
        stageWidth: rect.width || 340,
        stageHeight: rect.height || 480,
        initialPosX: customScene.posX,
        initialPosY: customScene.posY,
        initialScale: customScene.scale ?? 1,
        startX: remaining[0].x,
        startY: remaining[0].y,
        initialPinchDistance: 0,
        initialMidpointX: remaining[0].x,
        initialMidpointY: remaining[0].y,
      };
    } else if (remaining.length === 0) {
      gestureStateRef.current = null;
    }
  }, [customScene]);

  return (
    <section
      className={`relative select-none overflow-hidden rounded-3xl border border-cream/15 shadow-stage transition-all duration-200 ${
        isAdjustingBg
          ? "cursor-grab active:cursor-grabbing ring-2 ring-coral shadow-[0_0_35px_rgba(255,154,131,0.25)] touch-none"
          : ""
      }`}
      aria-label="Dress-up preview stage"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div className="relative aspect-[990/1400] w-full overflow-hidden rounded-3xl bg-plum-deep/80">
        {/* Stage scene background */}
        {!isCustom && (
          <Image
            src={scene.src}
            alt=""
            fill
            priority
            draggable={false}
            sizes="(max-width: 640px) 100vw, 448px"
            className="object-cover select-none pointer-events-none"
          />
        )}

        {/* Custom uploaded background */}
        {isCustom && customScene?.src && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={customScene.src}
              alt="Custom Background"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none origin-center"
              style={{
                transform: `translate3d(${(customScene.posX - 50) * 0.8}%, ${(customScene.posY - 50) * 0.8}%, 0) scale(${customScene.scale ?? 1})`,
                transition: isAdjustingBg ? "none" : "transform 0.15s ease-out",
              }}
            />
          </div>
        )}

        {/* Viewfinder crop guide border when adjusting background */}
        {isAdjustingBg && (
          <div className="pointer-events-none absolute inset-0 z-20 rounded-3xl border-2 border-dashed border-coral/80 shadow-[inset_0_0_24px_rgba(255,154,131,0.25)] select-none" />
        )}

        {/* Adjusting overlay helper badge */}
        {isAdjustingBg && (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-30 flex justify-center select-none">
            <span className="rounded-full bg-plum-deep/90 px-3.5 py-1 text-[11px] font-bold text-coral shadow-lg backdrop-blur-md border border-coral/30">
              ✋ 1-finger pan · 🤏 2-finger zoom
            </span>
          </div>
        )}

        {/* Floating Done Button on stage overlay when adjusting background */}
        {isAdjustingBg && onDoneAdjusting && (
          <div className="absolute inset-x-0 bottom-4 z-30 flex justify-center select-none pointer-events-auto">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDoneAdjusting();
              }}
              className="flex items-center gap-2 rounded-full border border-coral/40 bg-plum-deep/95 px-5 py-2.5 text-xs font-bold text-coral shadow-[0_6px_24px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all hover:bg-coral hover:text-plum-deep active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <Check className="size-4" />
              <span>Done Adjusting</span>
            </button>
          </div>
        )}

        {/* Soft vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none bg-[radial-gradient(120%_90%_at_50%_20%,transparent_55%,rgba(20,8,22,0.55)_100%)]"
        />

        {/* Characters */}
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 top-0 select-none ${
            isAdjustingBg ? "opacity-60 transition-opacity" : ""
          }`}
        >
          {characters.map((character) => {
            const slotIndex = order.indexOf(character.id);
            const slot: "left" | "right" = slotIndex === 0 ? "left" : "right";
            const leftOffset = getCharacterLeftPercent(character.id, slot);

            return (
              <CharacterFigure
                key={character.id}
                character={character}
                look={looks[character.id]}
                customKaosData={customKaos?.[character.id]}
                active={character.id === activeId}
                leftOffset={leftOffset}
                zIndex={character.id === activeId ? 20 : slot === "left" ? 10 : 11}
              />
            );
          })}
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
  leftOffset,
  zIndex,
}: {
  character: Character;
  look: Look;
  customKaosData?: CustomKaosData;
  active: boolean;
  leftOffset: string;
  zIndex: number;
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
          ? { opacity: active ? 1 : 0.9, left: leftOffset }
          : {
              y: active ? -6 : 0,
              opacity: active ? 1 : 0.88,
              left: leftOffset,
            }
      }
      transition={{
        left: { type: "spring", duration: 0.45, bounce: 0.15 },
        opacity: { duration: 0.2 },
        y: { type: "spring", duration: 0.35, bounce: 0.1 },
      }}
      style={{ zIndex }}
      className="absolute bottom-0 w-[66%] shrink-0"
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