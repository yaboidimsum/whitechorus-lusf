"use client";

import { useEffect, useMemo, useState } from "react";
import { characters, wardrobe } from "@/data/characters";
import { deleteLook, loadLooks, saveLook, subscribeLooks } from "@/lib/looks";
import type { Look, SavedLook, SlotId, WardrobeItem } from "@/lib/types";

const slotLabels: Record<SlotId, string> = {
  hair: "Hair",
  top: "Top",
  bottom: "Bottom",
  shoes: "Shoes",
  accessory: "Accessory",
};

// Index maps built once at module load — O(1) lookups in render (rule `js-index-maps`)
const itemById = new Map(wardrobe.map((w) => [w.id, w]));
const itemsBySlot = new Map<SlotId, WardrobeItem[]>();
for (const item of wardrobe) {
  const list = itemsBySlot.get(item.slot);
  if (list) list.push(item);
  else itemsBySlot.set(item.slot, [item]);
}

/** Base body placeholder for each character while no image assets exist. */
const baseColor: Record<string, string> = {
  clara: "#f3c6a5",
  emir: "#e0b18e",
};

export default function DressUp() {
  const [characterId, setCharacterId] = useState("clara");
  const [look, setLook] = useState<Look>({});
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>(() => loadLooks());

  // Cross-tab sync (rule `client-localstorage-schema`)
  useEffect(() => subscribeLooks(() => setSavedLooks(loadLooks())), []);

  const character = useMemo(
    () => characters.find((c) => c.id === characterId) ?? characters[0],
    [characterId],
  );

  const itemFor = (slot: SlotId): WardrobeItem | undefined =>
    look[slot] ? itemById.get(look[slot]!) : undefined;

  const selectItem = (slot: SlotId, itemId: string) => {
    setLook((prev) => {
      const next = { ...prev };
      if (next[slot] === itemId) {
        delete next[slot]; // tap again to undress
      } else {
        next[slot] = itemId;
      }
      return next;
    });
  };

  const switchCharacter = (id: string) => {
    setCharacterId(id);
    setLook({});
  };

  const handleSave = () => {
    const saved = saveLook(characterId, look);
    setSavedLooks((prev) => [...prev, saved]);
  };

  const handleDelete = (id: string) => {
    deleteLook(id);
    setSavedLooks((prev) => prev.filter((s) => s.id !== id));
  };

  const itemsForSlot = (slot: SlotId) => itemsBySlot.get(slot) ?? [];

  return (
    <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_320px]">
      {/* Canvas */}
      <section className="rounded-3xl border border-black/10 bg-gradient-to-b from-pink-50 to-white p-6">
        <div className="mb-4 flex gap-2">
          {characters.map((c) => (
            <button
              key={c.id}
              onClick={() => switchCharacter(c.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                c.id === characterId
                  ? "bg-black text-white"
                  : "bg-black/5 text-black/70 hover:bg-black/10"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Layered character render (rule `bundle-conditional`: assets load only when slotted) */}
        <div className="relative mx-auto aspect-[3/4] w-64 overflow-hidden rounded-2xl bg-[#fdf2f8]">
          <div
            className="absolute inset-x-10 bottom-0 top-8"
            style={{ backgroundColor: baseColor[characterId] }}
            aria-hidden
          />
          {character.slots.map((slot) => {
            const item = itemFor(slot);
            if (!item) return null;
            return item.image ? (
              // eslint-disable-next-line @next/next/no-img-element -- placeholder until next/image with real assets
              <img
                key={item.id}
                src={item.image}
                alt={item.name}
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <div
                key={item.id}
                className="absolute inset-0"
                style={{ backgroundColor: item.color }}
                aria-label={item.name}
              />
            );
          })}
          <p className="absolute bottom-3 left-0 right-0 text-center text-sm font-medium text-black/50">
            {character.name}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={Object.keys(look).length === 0}
          className="mt-6 w-full rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-30"
        >
          Save look
        </button>
      </section>

      {/* Wardrobe */}
      <aside className="flex flex-col gap-6">
        {character.slots.map((slot) => {
          const options = itemsForSlot(slot);
          return (
            <div key={slot}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-black/40">
                {slotLabels[slot]}
              </h2>
              <div className="flex flex-wrap gap-2">
                {options.map((item) => {
                  const active = itemFor(slot)?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => selectItem(slot, item.id)}
                      aria-pressed={active}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "border-black bg-black text-white"
                          : "border-black/15 text-black/70 hover:border-black/40"
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </aside>

      {/* Saved looks */}
      {savedLooks.length > 0 ? (
        <section className="md:col-span-2">
          <h2 className="mb-3 text-sm font-semibold text-black/60">
            Saved looks
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {savedLooks.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-2xl border border-black/10 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-black/80">
                    {characters.find((c) => c.id === s.characterId)?.name}
                  </p>
                  <p className="text-xs text-black/40">
                    {new Date(s.savedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="rounded-full px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
