"use client";

import Image from "next/image";
import { useState } from "react";
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

  return (
    <div>
      {/* Category tabs */}
      <div
        role="group"
        aria-label="Wardrobe categories"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {character.slots.map((slot) => {
          const selected = slot === activeSlot;
          return (
            <button
              key={slot}
              aria-pressed={selected}
              onClick={() => setActiveSlot(slot)}
              className={`min-h-[44px] shrink-0 rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-[transform,colors] duration-150 ease-out-quart active:scale-[0.97] ${
                selected
                  ? "border-coral bg-coral text-plum-deep"
                  : "border-cream/25 text-cream/80 hover:border-cream/60"
              }`}
            >
              {slotLabels[slot]}
            </button>
          );
        })}
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-3 gap-2">
        {options.map((item) => {
          const selected = look[item.slot] === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.slot, item.id)}
              aria-pressed={selected}
              className={`group relative rounded-2xl border p-1 transition-[transform,colors] duration-150 ease-out-quart active:scale-[0.96] ${
                selected
                  ? "border-coral bg-coral/10"
                  : "border-cream/15 bg-plum hover:border-cream/40"
              }`}
            >
              <span className="relative block aspect-square w-full overflow-hidden rounded-xl">
                <Image
                  src={item.thumb}
                  alt=""
                  fill
                  sizes="(max-width: 480px) 30vw, 120px"
                  className="object-contain p-1"
                />
              </span>
              <span
                className={`mt-1.5 block truncate px-1 text-center text-xs font-semibold ${
                  selected ? "text-coral" : "text-cream/80"
                }`}
              >
                {item.name}
              </span>
              {selected ? (
                <span
                  aria-hidden
                  className="animate-enter absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral text-[11px] font-bold text-plum-deep"
                >
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
