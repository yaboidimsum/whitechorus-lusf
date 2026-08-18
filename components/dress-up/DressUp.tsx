"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { Sparkles, X, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sceneById, scenes } from "@/data/assets";
import { characters, itemsFor } from "@/data/characters";
import { saveLook } from "@/lib/looks";
import type { CharacterId, Look, SlotId } from "@/lib/types";
import CharacterStage from "./CharacterStage";
import WardrobeGrid from "./WardrobeGrid";

const emptyLooks = (): Record<CharacterId, Look> => ({ emir: {}, friska: {} });

export default function DressUp() {
  const router = useRouter();
  const [activeId, setActiveId] = useState<CharacterId>("emir");
  const [looks, setLooks] = useState<Record<CharacterId, Look>>(emptyLooks);
  const [sceneId, setSceneId] = useState(scenes[0].id);
  const [announcement, setAnnouncement] = useState("");
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [username, setUsername] = useState("");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
    const savedName = localStorage.getItem("stylist:username");
    if (savedName) setUsername(savedName);
  }, []);

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

  const handleRandomize = () => {
    const nextLooks: Record<CharacterId, Look> = { emir: {}, friska: {} };
    for (const c of characters) {
      for (const slot of c.slots) {
        const items = itemsFor(c.id, slot);
        if (items.length > 0) {
          const randItem = items[Math.floor(Math.random() * items.length)];
          nextLooks[c.id][slot] = randItem.id;
        }
      }
    }
    const randScene = scenes[Math.floor(Math.random() * scenes.length)];
    setSceneId(randScene.id);
    setLooks(nextLooks);
    setAnnouncement("Randomized outfits for Emir & Friska.");
    toast("✨ Outfits randomized!", { duration: 1500 });
  };

  const handleOpenSave = () => {
    if (!hasSelection) return;
    setShowSaveModal(true);
  };

  // Close Save Modal on Escape key press
  useEffect(() => {
    if (!showSaveModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowSaveModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSaveModal]);

  const handleConfirmSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (saving) return;
    setSaving(true);
    const cleanName = username.trim() || "Anonymous Stylist";
    try {
      localStorage.setItem("stylist:username", cleanName);
    } catch {
      // localStorage error fallback
    }

    const saved = saveLook(looks, sceneId, cleanName, 0);
    setAnnouncement("Outfit saved to the Hall of Fame.");
    toast.success("Outfit saved to the Hall of Fame!");
    setShowSaveModal(false);
    setSaving(false);
    
    // Redirect to Hall of Fame with justSaved highlight parameter
    router.push(`/hall-of-fame?justSaved=${saved.id}`);
  };

  return (
    <div className="w-full px-4 py-8 sm:px-6 sm:py-16">
      {/* Screen-reader announcements */}
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 lg:max-w-5xl">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start">
          {/* Stage preview — first on mobile, right column on desktop */}
          <div className="relative lg:order-2 lg:sticky lg:top-6 lg:self-start">
            <CharacterStage scene={scene} looks={looks} activeId={activeId} />
            <motion.button
              type="button"
              onClick={handleRandomize}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Randomize outfits"
              className="absolute right-3.5 top-3.5 z-30 flex items-center gap-1.5 rounded-2xl border border-cream/20 bg-plum-deep/85 px-3.5 py-2 text-xs font-bold text-coral shadow-[0_4px_16px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all hover:bg-coral hover:text-plum-deep hover:shadow-[0_6px_22px_rgba(255,154,131,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40"
            >
              <Dices className="size-4" />
              <span>Randomize</span>
            </motion.button>
          </div>

          {/* Controls — left column on desktop */}
          <div className="flex flex-col gap-3 lg:order-1">
            {/* Character switcher with sliding indicator */}
            <div
              className="relative grid grid-cols-2 gap-1.5 rounded-full border border-cream/20 bg-plum/60 p-1 backdrop-blur-sm"
              role="group"
              aria-label="Choose who to dress"
            >
              {characters.map((c) => {
                const active = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    aria-pressed={active}
                    className="relative z-10 flex min-h-[44px] items-center justify-center rounded-full px-3 py-2.5 text-xs font-bold tracking-normal transition-colors duration-150 sm:px-4 sm:py-3 sm:text-sm"
                  >
                    {active && (
                      <motion.div
                        layoutId={shouldReduceMotion ? undefined : "activeCharacterTab"}
                        className="absolute inset-0 z-[-1] rounded-full bg-coral shadow-sm"
                        transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
                      />
                    )}
                    <span className={active ? "text-plum-deep" : "text-cream/80 hover:text-cream"}>
                      Dress {c.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Stage Scene / Background options styled identically to outfit cards */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-cream/70">
                Background
              </span>
              <div
                className="grid grid-cols-2 gap-2 sm:gap-3"
                role="group"
                aria-label="Stage background scenes"
              >
                {scenes.map((s) => {
                  const selected = s.id === sceneId;
                  return (
                    <motion.button
                      key={s.id}
                      onClick={() => setSceneId(s.id)}
                      aria-pressed={selected}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                      className={`group relative rounded-2xl border p-1 transition-colors duration-150 ease-out ${
                        selected
                          ? "border-coral bg-coral/15 ring-2 ring-coral/40"
                          : "border-cream/15 bg-plum hover:border-cream/40"
                      }`}
                    >
                      <span className="relative block aspect-[16/10] w-full overflow-hidden rounded-xl bg-plum-deep/30">
                        <Image
                          src={s.src}
                          alt={s.name}
                          fill
                          sizes="(max-width: 640px) 45vw, 200px"
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      </span>
                      <span
                        className={`mt-1.5 block truncate px-1 text-center text-xs font-semibold ${
                          selected ? "text-coral" : "text-cream/80"
                        }`}
                      >
                        {s.name}
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

            {/* Wardrobe */}
            <WardrobeGrid key={character.id} character={character} look={looks[character.id]} onSelect={toggleItem} />

            {/* Actions with shadcn Button */}
            <div className="mt-1 grid grid-cols-2 gap-2.5 sm:gap-3">
              <Button
                variant="coral"
                size="lg"
                onClick={handleOpenSave}
                disabled={!mounted || !hasSelection || saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Outfit"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full"
              >
                <Link href="/hall-of-fame">
                  Hall of Fame
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Outfit Name Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <div
            key="save-outfit-modal-root"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              key="save-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)}
              className="absolute inset-0 bg-plum-deep/80 backdrop-blur-md"
            />

            <motion.div
              key="save-modal-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="save-modal-title"
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: 15 }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: 15 }
              }
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-cream/20 bg-plum-deep p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-cream/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-coral/20 text-coral">
                    <Sparkles className="size-4" />
                  </div>
                  <h3 id="save-modal-title" className="font-display text-xl tracking-normal text-cream">
                    Submit to Hall of Fame
                  </h3>
                </div>
                <button
                  onClick={() => setShowSaveModal(false)}
                  aria-label="Close"
                  className="flex size-9 items-center justify-center rounded-2xl border border-cream/15 bg-cream/5 text-cream/70 backdrop-blur-md transition-colors hover:border-cream/40 hover:bg-cream/15 hover:text-cream active:scale-95 sm:size-10"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form
                onSubmit={handleConfirmSave}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleConfirmSave();
                  }
                }}
                className="mt-4 flex flex-col gap-4"
              >
                <div>
                  <label htmlFor="stylist-username" className="block text-xs font-bold tracking-normal text-cream/80">
                    Stylist / Creator Username
                  </label>
                  <div className="mt-1.5 relative">
                    <input
                      id="stylist-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="@yourname or handle"
                      maxLength={30}
                      autoComplete="off"
                      spellCheck={false}
                      data-lpignore="true"
                      autoFocus={typeof window !== "undefined" && !("ontouchstart" in window)}
                      className="w-full rounded-2xl border border-cream/20 bg-plum px-4 py-3 text-base sm:text-sm text-cream placeholder:text-cream/40 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/40 [touch-action:manipulation]"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-cream/60">
                    Your name or handle will be showcased alongside your styled outfit in the Hall of Fame. Press <kbd className="rounded bg-cream/10 px-1 py-0.5 font-mono text-[10px] text-cream/70">Enter</kbd> or <kbd className="rounded bg-cream/10 px-1 py-0.5 font-mono text-[10px] text-cream/70">⌘+Enter</kbd> to publish.
                  </p>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setShowSaveModal(false)}
                    className="w-full text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="coral"
                    size="lg"
                    disabled={saving}
                    className="w-full text-xs font-bold"
                  >
                    {saving ? "Publishing..." : "Publish Look"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
