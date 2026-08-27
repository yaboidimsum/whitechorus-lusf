"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { Sparkles, X, Dices, ImagePlus, SlidersHorizontal, RotateCcw, ZoomIn, Paintbrush, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sceneById, scenes } from "@/data/assets";
import { characters, itemsFor } from "@/data/characters";
import { saveLook } from "@/lib/looks";
import { compressImageFile } from "@/lib/image-compress";
import type { CharacterId, CustomKaosData, CustomSceneData, Look, Scene, SlotId } from "@/lib/types";
import CharacterStage from "./CharacterStage";
import WardrobeGrid from "./WardrobeGrid";
import CustomKaosModal from "./CustomKaosModal";
import AuthModal from "@/components/auth/AuthModal";
import { useUser } from "@/hooks/use-user";

const emptyLooks = (): Record<CharacterId, Look> => ({ emir: {}, friska: {} });

export default function DressUp() {
  const router = useRouter();
  const { user, profile } = useUser();
  const [activeId, setActiveId] = useState<CharacterId>("emir");
  const [characterOrder, setCharacterOrder] = useState<CharacterId[]>(["emir", "friska"]);
  const [looks, setLooks] = useState<Record<CharacterId, Look>>(emptyLooks);
  const [sceneId, setSceneId] = useState(scenes[0].id);
  const [customBg, setCustomBg] = useState<CustomSceneData | null>(null);
  const [customKaos, setCustomKaos] = useState<Partial<Record<CharacterId, CustomKaosData>>>({});
  const [showKaosModal, setShowKaosModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAdjustingBg, setIsAdjustingBg] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [saving, setSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [username, setUsername] = useState("");
  const [lookTitle, setLookTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const savedName = localStorage.getItem("stylist:username");
    if (savedName) setUsername(savedName);

    // Load cached custom kaos artwork
    try {
      const cachedEmir = localStorage.getItem("stylist:custom-kaos:emir");
      const cachedFriska = localStorage.getItem("stylist:custom-kaos:friska");
      const initialKaos: Partial<Record<CharacterId, CustomKaosData>> = {};
      if (cachedEmir) initialKaos.emir = JSON.parse(cachedEmir);
      if (cachedFriska) initialKaos.friska = JSON.parse(cachedFriska);
      setCustomKaos(initialKaos);
    } catch {}
  }, []);

  const scene: Scene = sceneId === "custom" && customBg
    ? { id: "custom", name: "Custom Photo", src: customBg.src }
    : (sceneById.get(sceneId) ?? scenes[0]);

  const character = characters.find((c) => c.id === activeId) ?? characters[0];
  const hasSelection = Object.values(looks).some((l) => Object.keys(l).length > 0);

  const toggleItem = (slot: SlotId, itemId: string) => {
    setLooks((prev) => {
      const current = prev[activeId];
      const next: Look = { ...current };
      if (slot === "hair") {
        next.hair = itemId;
      } else if (next[slot] === itemId) {
        delete next[slot]; // tap again to undress
      } else {
        next[slot] = itemId;
        // If user selects custom kaos, auto-open customizer modal if not configured yet
        if (itemId === `${activeId}-top-custom` && !customKaos[activeId]) {
          setShowKaosModal(true);
        }
      }
      return { ...prev, [activeId]: next };
    });
  };

  const handleApplyCustomKaos = (data: CustomKaosData) => {
    setCustomKaos((prev) => {
      const next = { ...prev, [activeId]: data };
      try {
        localStorage.setItem(`stylist:custom-kaos:${activeId}`, JSON.stringify(data));
      } catch {}
      return next;
    });

    // Ensure custom top is equipped
    setLooks((prev) => ({
      ...prev,
      [activeId]: {
        ...prev[activeId],
        top: `${activeId}-top-custom`,
      },
    }));
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

  const handleUploadBg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("Optimizing custom background...", { id: "compress-bg" });
      const compressedSrc = await compressImageFile(file, 1500, 0.82);
      setCustomBg({
        src: compressedSrc,
        posX: 50,
        posY: 50,
        scale: 1,
      });
      setSceneId("custom");
      setIsAdjustingBg(true);
      toast.success("Custom background applied! Drag to adjust.", { id: "compress-bg" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image", { id: "compress-bg" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleResetBgPosition = () => {
    if (!customBg) return;
    setCustomBg((prev) => (prev ? { ...prev, posX: 50, posY: 50, scale: 1 } : null));
    toast.success("Background position reset to center");
  };

  const handleOpenSave = () => {
    if (!hasSelection) return;
    if (!user) {
      toast.error("Please sign in to save your outfit to the Hall of Fame!");
      setShowAuthModal(true);
      return;
    }
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

  const handleConfirmSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (saving) return;
    if (!user) {
      toast.error("Please sign in to save your outfit!");
      setShowSaveModal(false);
      setShowAuthModal(true);
      return;
    }
    setSaving(true);
    const cleanName = profile?.username
      ? `@${profile.username}`
      : username.trim()
      ? username.startsWith("@")
        ? username.trim()
        : `@${username.trim()}`
      : "@stylist";

    try {
      localStorage.setItem("stylist:username", cleanName);
    } catch {
      // localStorage error fallback
    }

    const saved = await saveLook(
      looks,
      sceneId,
      cleanName,
      0,
      customBg || undefined,
      customKaos,
      lookTitle.trim() || "Untitled Look",
      characterOrder
    );
    setAnnouncement("Outfit saved to the Hall of Fame.");
    toast.success("Outfit saved to the Hall of Fame!");
    setShowSaveModal(false);
    setSaving(false);

    // Redirect to Hall of Fame with justSaved highlight parameter
    router.push(`/hall-of-fame?justSaved=${saved.id}`);
  };

  const handleSwapPositions = () => {
    setCharacterOrder((prev) =>
      prev[0] === "emir" ? ["friska", "emir"] : ["emir", "friska"]
    );
    setAnnouncement(
      `Swapped positions: ${
        characterOrder[0] === "emir" ? "Friska and Emir" : "Emir and Friska"
      }`
    );
  };

  return (
    <div className="w-full px-4 py-8 sm:px-6 sm:py-16">
      {/* Hidden file input for custom background */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label="Upload custom background image"
        onChange={handleUploadBg}
        className="hidden"
      />

      {/* Custom Kaos Editor Modal */}
      <CustomKaosModal
        isOpen={showKaosModal}
        onClose={() => setShowKaosModal(false)}
        characterId={activeId}
        characterName={character.name}
        initialData={customKaos[activeId]}
        onApply={handleApplyCustomKaos}
      />

      {/* Screen-reader announcements */}
      <p role="status" className="sr-only">
        {announcement}
      </p>

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 lg:max-w-5xl">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start">
          {/* Stage preview — first on mobile, right column on desktop */}
          <div className="relative lg:order-2 lg:sticky lg:top-6 lg:self-start">
            <CharacterStage
              scene={scene}
              looks={looks}
              activeId={activeId}
              characterOrder={characterOrder}
              customScene={customBg}
              customKaos={customKaos}
              onAdjustBg={(updater) => setCustomBg((prev) => (prev ? updater(prev) : null))}
              isAdjustingBg={isAdjustingBg && sceneId === "custom"}
              onDoneAdjusting={() => {
                setIsAdjustingBg(false);
                toast.success("Background position locked! 🔒", { duration: 1500 });
              }}
            />
            {/* Swap positions button */}
            <motion.button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={handleSwapPositions}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Swap character positions"
              className="absolute left-3.5 top-3.5 z-30 flex items-center gap-1.5 rounded-2xl border border-cream/20 bg-plum-deep/85 px-3.5 py-2 text-xs font-bold text-coral shadow-[0_4px_16px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all hover:bg-coral hover:text-plum-deep hover:shadow-[0_6px_22px_rgba(255,154,131,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40"
            >
              <ArrowLeftRight className="size-4" />
              <span>Swap</span>
            </motion.button>
            {/* Randomize button */}
            <motion.button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
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

            {/* Custom Kaos Studio Trigger Bar (if equipped) */}
            {looks[activeId]?.top === `${activeId}-top-custom` && (
              <motion.button
                type="button"
                onClick={() => setShowKaosModal(true)}
                initial={shouldReduceMotion ? false : { scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-coral/40 bg-gradient-to-r from-coral/20 via-coral/30 to-coral/20 p-2.5 text-xs font-bold text-coral shadow-md backdrop-blur-md transition-all hover:bg-coral hover:text-plum-deep"
              >
                <Paintbrush className="size-4" />
                <span>🎨 Customize {character.name}&apos;s T-Shirt (Paint / Pattern)</span>
              </motion.button>
            )}

            {/* Stage Scene / Background options */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cream/70">
                  Background
                </span>
                {sceneId === "custom" && customBg && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isAdjustingBg) {
                        setIsAdjustingBg(false);
                        toast.success("Background position locked! 🔒", { duration: 1500 });
                      } else {
                        setIsAdjustingBg(true);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                      isAdjustingBg
                        ? "bg-coral text-plum-deep"
                        : "border border-cream/20 bg-plum/60 text-cream/80 hover:text-cream"
                    }`}
                  >
                    <SlidersHorizontal className="size-3" />
                    <span>{isAdjustingBg ? "Done Adjusting" : "Adjust Position"}</span>
                  </button>
                )}
              </div>

              <div
                className="grid grid-cols-3 gap-2 sm:gap-3"
                role="group"
                aria-label="Stage background scenes"
              >
                {scenes.map((s) => {
                  const selected = s.id === sceneId;
                  return (
                    <motion.button
                      key={s.id}
                      onClick={() => {
                        setSceneId(s.id);
                        setIsAdjustingBg(false);
                      }}
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
                          sizes="(max-width: 640px) 30vw, 150px"
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

                {/* Custom Background Option Tile */}
                <motion.button
                  type="button"
                  onClick={() => {
                    if (customBg) {
                      setSceneId("custom");
                    } else {
                      fileInputRef.current?.click();
                    }
                  }}
                  aria-pressed={sceneId === "custom"}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
                  className={`group relative rounded-2xl border p-1 transition-colors duration-150 ease-out ${
                    sceneId === "custom"
                      ? "border-coral bg-coral/15 ring-2 ring-coral/40"
                      : "border-cream/15 bg-plum hover:border-cream/40"
                  }`}
                >
                  <span className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl bg-plum-deep/50">
                    {customBg ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={customBg.src}
                        alt="Custom"
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-coral">
                        <ImagePlus className="size-5" />
                        <span className="text-[10px] font-bold">Upload</span>
                      </div>
                    )}
                  </span>
                  <span
                    className={`mt-1.5 block truncate px-1 text-center text-xs font-semibold ${
                      sceneId === "custom" ? "text-coral" : "text-cream/80"
                    }`}
                  >
                    {customBg ? "Custom" : "+ Custom"}
                  </span>
                  <AnimatePresence>
                    {sceneId === "custom" && (
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
              </div>

              {/* Interactive Pan & Zoom Controls for Custom Background */}
              <AnimatePresence>
                {sceneId === "custom" && customBg && isAdjustingBg && (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 flex flex-col gap-2.5 rounded-2xl border border-cream/20 bg-plum/70 p-3 backdrop-blur-md"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cream">
                        Background Zoom & Pan
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-coral hover:underline"
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={handleResetBgPosition}
                          className="flex items-center gap-1 text-xs text-cream/70 hover:text-cream"
                        >
                          <RotateCcw className="size-3" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>

                    {/* Zoom slider */}
                    <div className="flex items-center gap-3">
                      <ZoomIn className="size-4 text-cream/60 shrink-0" />
                      <input
                        type="range"
                        min="0.5"
                        max="2.5"
                        step="0.05"
                        value={customBg.scale}
                        onChange={(e) =>
                          setCustomBg((prev) =>
                            prev ? { ...prev, scale: parseFloat(e.target.value) } : null
                          )
                        }
                        aria-label="Background zoom scale"
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-cream/20 accent-coral"
                      />
                      <span className="w-9 text-right text-xs font-bold text-cream/80">
                        {customBg.scale.toFixed(1)}x
                      </span>
                    </div>

                    <p className="text-[11px] text-cream/60">
                      💡 <strong>Tip:</strong> Drag directly on the stage preview above to pan the background into position.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wardrobe */}
            <WardrobeGrid key={character.id} character={character} look={looks[character.id]} onSelect={toggleItem} />

            {/* Actions with shadcn Button */}
            <div className="mt-1 grid grid-cols-2 gap-2.5 sm:gap-3">
              <Button
                variant="coral"
                size="lg"
                onClick={handleOpenSave}
                disabled={!hasSelection || saving}
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
                  <label htmlFor="outfit-title" className="block text-xs font-bold tracking-normal text-cream/80">
                    Outfit Version Title
                  </label>
                  <div className="mt-1.5 relative">
                    <input
                      id="outfit-title"
                      type="text"
                      value={lookTitle}
                      onChange={(e) => setLookTitle(e.target.value)}
                      placeholder="e.g. Night Club Glow, Cyber Afterglow..."
                      maxLength={40}
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full rounded-2xl border border-cream/20 bg-plum px-4 py-3 text-base sm:text-sm text-cream placeholder:text-cream/40 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/40 [touch-action:manipulation]"
                    />
                  </div>
                </div>

                {!profile && (
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
                        className="w-full rounded-2xl border border-cream/20 bg-plum px-4 py-3 text-base sm:text-sm text-cream placeholder:text-cream/40 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/40 [touch-action:manipulation]"
                      />
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-cream/60">
                  {profile
                    ? `Publishing as @${profile.username}. Your outfit will be showcased in the Hall of Fame.`
                    : "Your name or handle will be showcased alongside your styled outfit in the Hall of Fame."}
                </p>

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

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
