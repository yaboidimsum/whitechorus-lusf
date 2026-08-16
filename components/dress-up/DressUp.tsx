"use client";

import Image from "next/image";
import { useSyncExternalStore, useState } from "react";
import { sceneById, scenes } from "@/data/assets";
import { characters } from "@/data/characters";
import {
  deleteLook,
  getLooksSnapshot,
  getServerLooksSnapshot,
  restoreLook,
  saveLook,
  subscribeLooks,
} from "@/lib/looks";
import type { CharacterId, Look, SavedLook, SlotId } from "@/lib/types";
import CharacterStage from "./CharacterStage";
import WardrobeGrid from "./WardrobeGrid";

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const emptyLooks = (): Record<CharacterId, Look> => ({ emir: {}, friska: {} });

export default function DressUp() {
  const [activeId, setActiveId] = useState<CharacterId>("emir");
  const [looks, setLooks] = useState<Record<CharacterId, Look>>(emptyLooks);
  const [sceneId, setSceneId] = useState(scenes[0].id);
  // Client-only store (localStorage) — server/hydration snapshot is empty,
  // so the initial render never diverges from the server HTML.
  const savedLooks = useSyncExternalStore(
    subscribeLooks,
    getLooksSnapshot,
    getServerLooksSnapshot,
  );
  const [pendingDelete, setPendingDelete] = useState<SavedLook | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const scene = sceneById.get(sceneId) ?? scenes[0];
  const character = characters.find((c) => c.id === activeId) ?? characters[0];
  const hasSelection = Object.values(looks).some((l) => Object.keys(l).length > 0);

  const toggleItem = (slot: SlotId, itemId: string) => {
    setLooks((prev) => {
      const current = prev[activeId];
      const next: Look = { ...current };
      if (next[slot] === itemId) {
        delete next[slot]; // tap again to undress
      } else {
        next[slot] = itemId;
      }
      return { ...prev, [activeId]: next };
    });
  };

  const handleSave = () => {
    saveLook(looks, sceneId);
    setAnnouncement("Outfit saved to the Hall of Fame.");
  };

  const handleDelete = (id: string) => {
    const target = savedLooks.find((s) => s.id === id);
    if (!target) return;
    deleteLook(id);
    setPendingDelete(target);
    setAnnouncement("Outfit deleted.");
  };

  const handleUndo = () => {
    if (!pendingDelete) return;
    restoreLook(pendingDelete);
    setPendingDelete(null);
    setAnnouncement("Outfit restored.");
  };

  return (
    <div className="w-full">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 lg:max-w-5xl">
        {/* Screen-reader announcements */}
        <p role="status" className="sr-only">
          {announcement}
        </p>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start">
        {/* Stage preview — first on mobile, right column on desktop */}
        <div className="lg:order-2 lg:sticky lg:top-6 lg:self-start">
          <CharacterStage scene={scene} looks={looks} activeId={activeId} />
        </div>

        {/* Controls — left column on desktop */}
        <div className="flex flex-col gap-5 lg:order-1">
          {/* Character switcher */}
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Choose who to dress">
            {characters.map((c) => {
              const active = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  aria-pressed={active}
                  className={`rounded-full border px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] transition-colors ${
                    active
                      ? "border-coral bg-coral text-plum-deep"
                      : "border-cream/25 text-cream/85 hover:border-cream/60"
                  }`}
                >
                  Dress {c.name}
                </button>
              );
            })}
          </div>

          {/* Scene carousel */}
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Scene">
            {scenes.map((s) => {
              const selected = s.id === sceneId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSceneId(s.id)}
                  aria-pressed={selected}
                  className={`relative aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-2xl border transition-colors ${
                    selected ? "border-coral" : "border-cream/20 hover:border-cream/50"
                  }`}
                >
                  <Image
                    src={s.src}
                    alt={s.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-plum-deep/70 px-1.5 py-1 text-xs font-semibold text-cream/90">
                    {s.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Wardrobe */}
          <WardrobeGrid key={character.id} character={character} look={looks[character.id]} onSelect={toggleItem} />

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={!hasSelection}
            className="rounded-full bg-coral px-5 py-3.5 text-sm font-extrabold uppercase tracking-[0.14em] text-plum-deep transition-[transform,opacity] duration-150 ease-out-quart hover:opacity-85 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100"
          >
            Save Outfit
          </button>

          {/* Undo toast */}
          {pendingDelete ? (
            <div className="animate-enter flex items-center justify-between rounded-2xl border border-cream/20 bg-plum px-4 py-3">
              <p className="text-sm text-cream/85">Outfit deleted</p>
              <button
                onClick={handleUndo}
                className="rounded-full px-3 py-1 text-sm font-bold text-coral hover:bg-coral/10"
              >
                Undo
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>

    {/* Hall of Fame band */}
    <section className="-mx-4 mt-16 border-y border-cream/10 bg-plum/40 py-16 sm:-mx-6 sm:py-20">
        <div className="mx-auto w-full max-w-2xl lg:max-w-5xl">
          <h2 className="font-display text-2xl font-normal uppercase leading-none tracking-wide text-cream sm:text-3xl">
            Hall of Fame
          </h2>
          <p className="mt-2 max-w-md text-pretty text-sm text-cream/65">
            Your saved looks, kept private in your browser.
          </p>
          {savedLooks.length > 0 ? (
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {savedLooks.map((s) => {
                const savedScene = sceneById.get(s.sceneId);
                return (
                  <li key={s.id} className="overflow-hidden rounded-2xl border border-cream/15 bg-plum">
                    <div className="relative aspect-[3/4] w-full">
                      {savedScene ? (
                        <Image
                          src={savedScene.src}
                          alt={savedScene.name}
                          fill
                          sizes="(max-width: 480px) 45vw, 200px"
                          className="object-cover"
                        />
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 bg-plum-deep/80 px-2 py-1.5">
                        <p className="text-xs font-bold text-cream">{dateTimeFormat.format(s.savedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2">
                      <span className="text-[11px] text-cream/60">
                        {characters.map((c) => c.name).join(" & ")}
                      </span>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-pink-neon hover:bg-pink-neon/10"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-cream/25 p-6 text-center text-sm text-cream/55">
              No outfits yet — dress the duo and save your first look.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
