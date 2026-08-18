"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { itemsFor, slotLabels } from "@/data/characters";
import type { Character, Look, SlotId } from "@/lib/types";

interface WardrobeGridProps {
  character: Character;
  look: Look;
  onSelect: (slot: SlotId, itemId: string) => void;
}

export default function WardrobeGrid({ character, look, onSelect }: WardrobeGridProps) {
  const [activeSlot, setActiveSlot] = useState<SlotId>(character.slots[0]);
  const options = itemsFor(character.id, activeSlot);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div>
      {/* Category tabs with shared layout sliding indicator */}
      <div
        role="group"
        aria-label="Wardrobe categories"
        className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {character.slots.map((slot) => {
          const selected = slot === activeSlot;
          return (
            <button
              key={slot}
              aria-pressed={selected}
              onClick={() => setActiveSlot(slot)}
              className={`relative min-h-[44px] shrink-0 rounded-full px-3.5 py-2 text-xs font-bold tracking-normal transition-colors duration-150 ${
                selected
                  ? "text-plum-deep"
                  : "border border-cream/20 bg-plum/40 text-cream/80 hover:border-cream/50 hover:text-cream"
              }`}
            >
              {selected && (
                <motion.div
                  layoutId={shouldReduceMotion ? undefined : "activeWardrobeTab"}
                  className="absolute inset-0 z-[-1] rounded-full bg-coral shadow-sm"
                  transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                />
              )}
              {slotLabels[slot]}
            </button>
          );
        })}
      </div>

      {/* Item grid with tactile interactive springs */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {options.map((item) => {
          const selected = look[item.slot] === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onSelect(item.slot, item.id)}
              aria-pressed={selected}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              className={`group relative rounded-2xl border p-1 transition-colors duration-150 ease-out ${
                selected
                  ? "border-coral bg-coral/15 ring-2 ring-coral/40"
                  : "border-cream/15 bg-plum hover:border-cream/40"
              }`}
            >
              <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-plum-deep/30">
                <Image
                  src={item.thumb}
                  alt=""
                  fill
                  sizes="(max-width: 480px) 30vw, 120px"
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </span>
              <span
                className={`mt-1.5 block truncate px-1 text-center text-xs font-semibold ${
                  selected ? "text-coral" : "text-cream/80"
                }`}
              >
                {item.name}
              </span>
              <AnimatePresence>
                {selected && (
                  <motion.span
                    initial={shouldReduceMotion ? false : { scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.3, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                    aria-hidden
                    className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral text-[11px] font-bold text-plum-deep shadow-md"
                  >
                    ✓
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
