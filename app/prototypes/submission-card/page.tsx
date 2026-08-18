"use client";

import { useState, useEffect, useRef, useSyncExternalStore, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { Download, Eye, Sparkles, Trash2, Disc3, Radio, Sliders, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { characters } from "@/data/characters";
import LookPreview from "@/components/dress-up/LookPreview";
import LookDetailModal from "@/components/dress-up/LookDetailModal";
import StarRating from "@/components/dress-up/StarRating";
import {
  deleteLook,
  getLooksSnapshot,
  getServerLooksSnapshot,
  rateLook,
  restoreLook,
  subscribeLooks,
} from "@/lib/looks";
import { downloadSavedLook } from "@/lib/export";
import type { SavedLook } from "@/lib/types";

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

// ==========================================
// VARIANT 1: FLOATING GLASS
// Axis: Minimalist Depth & Modern Glassmorphism
// ==========================================
function FloatingGlassCard({
  look,
  onOpenModal,
  onDownload,
  onDelete,
  onRate,
}: {
  look: SavedLook;
  onOpenModal: (look: SavedLook) => void;
  onDownload: (look: SavedLook, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRate: (id: string, rating: number) => void;
}) {
  return (
    <motion.li
      layout="position"
      onClick={() => onOpenModal(look)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-cream/15 bg-plum/40 p-2 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-coral/40 hover:bg-plum/70 hover:shadow-xl"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
        <LookPreview look={look} />

        {/* Floating Glass Badges */}
        <div className="absolute inset-x-2 top-2 flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-full bg-plum-deep/80 px-2.5 py-1 text-[11px] font-bold text-cream backdrop-blur-md">
            <span className="text-coral">★</span>
            <span className="tabular-nums">{(look.ratingAvg ?? 0) > 0 ? (look.ratingAvg ?? 0).toFixed(1) : "—"}</span>
            <span className="text-[10px] text-cream/50">({look.ratingsCount ?? 0})</span>
          </div>

          {look.demo ? (
            <span className="rounded-full bg-coral/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-coral backdrop-blur-md">
              Official
            </span>
          ) : null}
        </div>

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-plum-deep/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-cream px-3.5 py-1.5 text-xs font-bold text-plum-deep shadow-md">
            <Eye className="size-3.5" /> View Look
          </span>
        </div>
      </div>

      {/* Glass Bottom Bar */}
      <div className="p-2 space-y-2">
        <div className="flex items-center justify-between gap-1">
          <p className="truncate text-xs font-bold text-coral">{look.username || "@stylist"}</p>
          <p className="shrink-0 text-[10px] text-cream/50 tabular-nums">{dateTimeFormat.format(look.savedAt)}</p>
        </div>

        {/* Interactive Star Rating & Actions */}
        <div className="flex items-center justify-between border-t border-cream/10 pt-1.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <StarRating
              rating={look.rating ?? 0}
              onRatingChange={(r) => onRate(look.id, r)}
              size="sm"
            />
            <span className="text-[10px] text-cream/60">
              {look.rating && look.rating > 0 ? `(${look.rating}★)` : ""}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onDownload(look, e)}
              className="h-7 px-2 text-[11px] text-coral hover:bg-coral/15"
            >
              Save
            </Button>
            {!look.demo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => onDelete(look.id, e)}
                className="h-7 px-2 text-[11px] text-pink-neon hover:bg-pink-neon/15"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}

// ==========================================
// VARIANT 2: VINYL SLEEVE
// Axis: Tangible Music Physicality & 12" EP Jacket Packaging
// ==========================================
function VinylSleeveCard({
  look,
  onOpenModal,
  onDownload,
  onDelete,
  onRate,
}: {
  look: SavedLook;
  onOpenModal: (look: SavedLook) => void;
  onDownload: (look: SavedLook, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRate: (id: string, rating: number) => void;
}) {
  return (
    <motion.li
      layout="position"
      onClick={() => onOpenModal(look)}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-cream/20 bg-plum-deep p-3 shadow-md transition-all duration-200 hover:border-cream/50 hover:shadow-2xl"
    >
      {/* Vinyl Disc subtle peek on hover */}
      <div className="absolute right-0 top-6 size-20 translate-x-3 rounded-full border border-cream/30 bg-black opacity-30 transition-transform duration-300 group-hover:translate-x-1 sm:opacity-50">
        <Disc3 className="size-full animate-spin-slow text-cream/20" />
      </div>

      {/* Catalog Number Header */}
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-cream/60">
        <span className="flex items-center gap-1 text-coral">
          <Hash className="size-3" />
          WC-HOF-{look.id.padStart(3, "0")}
        </span>
        <span>{look.demo ? "EP // PROMO" : "FAN // CUT"}</span>
      </div>

      {/* Stage Artwork Frame with Vinyl Outer Jacket Border */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-cream/10 bg-black">
        <LookPreview look={look} />

        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover:opacity-100">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-coral">
            [ Inspect Track ]
          </span>
        </div>
      </div>

      {/* Record Jacket Footer with Rating & Creator */}
      <div className="mt-2.5 space-y-1.5 font-mono">
        <div className="flex items-baseline justify-between">
          <p className="truncate text-xs font-bold text-cream">{look.username || "@stylist"}</p>
          <span className="text-[10px] text-cream/40 tabular-nums">{dateTimeFormat.format(look.savedAt)}</span>
        </div>

        <div className="flex items-center justify-between border-t border-cream/10 pt-1.5">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-coral">★ {(look.ratingAvg ?? 0) > 0 ? (look.ratingAvg ?? 0).toFixed(1) : "—"}</span>
            <span className="text-[10px] text-cream/50">({look.ratingsCount ?? 0})</span>
          </div>

          <div className="flex items-center gap-1 font-sans" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => onDownload(look, e)}
              className="rounded px-2 py-0.5 text-[10px] font-bold text-coral transition-colors hover:bg-coral/20"
            >
              RIP
            </button>
            {!look.demo && (
              <button
                onClick={(e) => onDelete(look.id, e)}
                className="rounded px-2 py-0.5 text-[10px] font-bold text-pink-neon transition-colors hover:bg-pink-neon/20"
              >
                DEL
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.li>
  );
}

// ==========================================
// VARIANT 3: CLUB FLYER
// Axis: High-Energy Bandung/Jakarta Rave Typography & Punchy Contrast
// ==========================================
function ClubFlyerCard({
  look,
  onOpenModal,
  onDownload,
  onDelete,
  onRate,
}: {
  look: SavedLook;
  onOpenModal: (look: SavedLook) => void;
  onDownload: (look: SavedLook, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRate: (id: string, rating: number) => void;
}) {
  return (
    <motion.li
      layout="position"
      onClick={() => onOpenModal(look)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-coral bg-plum p-0 shadow-lg transition-transform duration-200 hover:-rotate-1 hover:scale-[1.02] hover:border-pink-neon hover:shadow-2xl"
    >
      {/* Angled Neon Badge */}
      <div className="absolute -right-8 top-3 z-10 rotate-45 bg-pink-neon px-8 py-0.5 text-[9px] font-black uppercase tracking-widest text-cream shadow-md">
        {look.demo ? "OFFICIAL" : "VIBE"}
      </div>

      <div className="relative aspect-[4/5] overflow-hidden">
        <LookPreview look={look} />

        {/* Dynamic Club Flyer Score Sticker */}
        <div className="absolute bottom-2 left-2 z-10 rounded-md bg-plum-deep/90 px-2.5 py-1 text-xs font-black tracking-tight text-cream shadow-lg backdrop-blur-md">
          <span className="text-coral">★ {(look.ratingAvg ?? 0) > 0 ? (look.ratingAvg ?? 0).toFixed(1) : "NEW"}</span>
          <span className="ml-1 text-[10px] font-normal text-cream/60">({look.ratingsCount ?? 0})</span>
        </div>
      </div>

      {/* High-Contrast Bottom Rave Banner */}
      <div className="bg-plum-deep p-2.5">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-bold uppercase tracking-wider text-coral">
            {look.username || "@stylist"}
          </p>
          <span className="text-[10px] font-bold text-cream/50 tabular-nums">
            {dateTimeFormat.format(look.savedAt)}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-cream/15 pt-2" onClick={(e) => e.stopPropagation()}>
          <StarRating
            rating={Math.round(look.ratingAvg ?? look.rating ?? 0)}
            onRatingChange={(r) => onRate(look.id, r)}
            size="sm"
          />

          <Button
            variant="coral"
            size="sm"
            onClick={(e) => onDownload(look, e)}
            className="h-6 px-2 text-[10px] font-black uppercase"
          >
            Save IMG
          </Button>
        </div>
      </div>
    </motion.li>
  );
}

// ==========================================
// VARIANT 4: POLAROID SNAPSHOT
// Axis: Tangible Nostalgia & Analog Photo Frame
// ==========================================
function PolaroidSnapshotCard({
  look,
  onOpenModal,
  onDownload,
  onDelete,
  onRate,
}: {
  look: SavedLook;
  onOpenModal: (look: SavedLook) => void;
  onDownload: (look: SavedLook, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRate: (id: string, rating: number) => void;
}) {
  return (
    <motion.li
      layout="position"
      onClick={() => onOpenModal(look)}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-cream/30 bg-[#fbf7f0] p-2.5 pb-4 text-plum-deep shadow-md transition-all duration-200 hover:-translate-y-1 hover:rotate-1 hover:shadow-2xl"
    >
      {/* Translucent Washi Tape on top corner */}
      <div className="absolute left-1/2 top-0 h-3 w-12 -translate-x-1/2 -translate-y-1 rotate-2 bg-coral/40 backdrop-blur-[1px]" />

      {/* Photo Frame */}
      <div className="relative aspect-[4/5] overflow-hidden rounded border border-black/10 bg-plum shadow-inner">
        <LookPreview look={look} />
      </div>

      {/* Handwritten / Marker Polaroid Caption Bottom */}
      <div className="mt-3 px-1">
        <div className="flex items-baseline justify-between">
          <p className="font-serif text-sm font-bold italic tracking-tight text-plum-deep">
            {look.username || "@stylist"}
          </p>
          <span className="font-mono text-[10px] text-plum-deep/60 tabular-nums">
            {dateTimeFormat.format(look.savedAt)}
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-1.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <span className="text-xs font-black text-coral">★ {(look.ratingAvg ?? 0) > 0 ? (look.ratingAvg ?? 0).toFixed(1) : "—"}</span>
            <span className="text-[10px] text-plum-deep/50">({look.ratingsCount ?? 0})</span>
          </div>

          <button
            onClick={(e) => onDownload(look, e)}
            className="text-[11px] font-bold text-plum-deep/80 hover:text-coral hover:underline"
          >
            Save Photo
          </button>
        </div>
      </div>
    </motion.li>
  );
}

// ==========================================
// VARIANT 5: SYNTH RACK
// Axis: Retro Hardware Synthesizer / Audio Gear Interface
// ==========================================
function SynthRackCard({
  look,
  onOpenModal,
  onDownload,
  onDelete,
  onRate,
}: {
  look: SavedLook;
  onOpenModal: (look: SavedLook) => void;
  onDownload: (look: SavedLook, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRate: (id: string, rating: number) => void;
}) {
  return (
    <motion.li
      layout="position"
      onClick={() => onOpenModal(look)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-cream/20 bg-[#161219] p-3 shadow-md transition-all duration-200 hover:border-coral hover:shadow-2xl"
    >
      {/* Hardware Screw Rivets in 4 Corners */}
      <div className="absolute left-2 top-2 size-2 rounded-full border border-cream/30 bg-cream/10" />
      <div className="absolute right-2 top-2 size-2 rounded-full border border-cream/30 bg-cream/10" />

      {/* Top Gear Header */}
      <div className="mb-2 flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-widest text-cream/70">
        <span className="flex items-center gap-1.5">
          <Radio className="size-3 text-coral" /> MODULE-0{look.id}
        </span>
        <span className="rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-coral">
          {look.sceneId.toUpperCase()}
        </span>
      </div>

      {/* Display Screen */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-cream/15 bg-black">
        <LookPreview look={look} />
      </div>

      {/* Synth Control Deck */}
      <div className="mt-2.5 space-y-2 rounded-xl border border-cream/10 bg-black/40 p-2">
        <div className="flex items-center justify-between">
          <p className="truncate font-mono text-xs font-bold text-coral">{look.username || "@stylist"}</p>
          <span className="font-mono text-[10px] text-cream/40 tabular-nums">{dateTimeFormat.format(look.savedAt)}</span>
        </div>

        {/* VU-Meter / Level Bar Rating */}
        <div className="flex items-center justify-between border-t border-cream/10 pt-1.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-coral tabular-nums">
              ★ {(look.ratingAvg ?? 0) > 0 ? (look.ratingAvg ?? 0).toFixed(1) : "0.0"}
            </span>
            <span className="font-mono text-[10px] text-cream/50">[{look.ratingsCount ?? 0} VOTES]</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => onDownload(look, e)}
              className="h-6 rounded-md border-cream/20 px-2 text-[10px] font-mono hover:border-coral"
            >
              EXP
            </Button>
          </div>
        </div>
      </div>
    </motion.li>
  );
}

// ==========================================
// PROTOTYPE HARNESS & VERBATIM PICKER
// ==========================================
const variantNames = [
  "Floating Glass",
  "Vinyl Sleeve",
  "Club Flyer",
  "Polaroid Snapshot",
  "Synth Rack",
];

function PrototypeContent() {
  const searchParams = useSearchParams();
  const initialIndex = Math.max(
    0,
    Math.min(
      variantNames.length - 1,
      (parseInt(searchParams.get("v") || "1", 10) || 1) - 1
    )
  );

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [selectedModalLook, setSelectedModalLook] = useState<SavedLook | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [remountKey, setRemountKey] = useState(0);

  const pickerRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const savedLooks = useSyncExternalStore(
    subscribeLooks,
    getLooksSnapshot,
    getServerLooksSnapshot
  );

  const previewLooks = [...savedLooks].reverse().slice(0, 6);

  const updateHighlight = () => {
    const el = itemsRef.current[activeIndex];
    const highlight = highlightRef.current;
    if (el && highlight) {
      highlight.style.width = `${el.offsetWidth}px`;
      highlight.style.transform = `translateX(${el.offsetLeft}px)`;
    }
  };

  useEffect(() => {
    updateHighlight();
  }, [activeIndex]);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        pickerRef.current?.setAttribute("data-ready", "");
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  const changeVariant = (index: number) => {
    if (index < 0 || index >= variantNames.length) return;
    setActiveIndex(index);
    setRemountKey((k) => k + 1);

    const url = new URL(window.location.href);
    url.searchParams.set("v", String(index + 1));
    window.history.replaceState(null, "", url.toString());
  };

  const handleReplay = () => {
    setRemountKey((k) => k + 1);
  };

  // Keyboard navigation strictly following PICKER.md
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName) ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= variantNames.length) {
        changeVariant(num - 1);
      } else if (e.key === "ArrowRight") {
        changeVariant((activeIndex + 1) % variantNames.length);
      } else if (e.key === "ArrowLeft") {
        changeVariant((activeIndex - 1 + variantNames.length) % variantNames.length);
      } else if (e.key === "r" || e.key === "R") {
        handleReplay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = savedLooks.find((s) => s.id === id);
    if (!target) return;
    deleteLook(id);
    toast("Outfit deleted from Hall of Fame", {
      action: {
        label: "Undo",
        onClick: () => restoreLook(target),
      },
    });
  };

  const handleDownload = async (s: SavedLook, e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloadingId) return;
    setDownloadingId(s.id);
    const toastId = toast.loading("Generating your download...");
    try {
      await downloadSavedLook(s);
      toast.success("Outfit downloaded!", { id: toastId });
    } catch {
      toast.error("Failed to generate download.", { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRate = (id: string, rating: number) => {
    rateLook(id, rating);
    toast.success(`Rated ${rating} stars!`);
  };

  return (
    <div className="min-h-screen pb-28 pt-8">
      {/* In-Context Surrounding Page */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <header className="mb-8 border-b border-cream/10 pb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-pink-neon">
            Design Exploration Prototype
          </p>
          <h1 className="font-display mt-1 text-3xl font-normal uppercase tracking-wide text-cream sm:text-4xl">
            Submission Card Variants
          </h1>
          <p className="mt-2 text-sm text-cream/70">
            Previewing: <strong className="text-coral">{variantNames[activeIndex]}</strong> (Variant {activeIndex + 1} of {variantNames.length})
          </p>
        </header>

        {/* Real Surrounding Card Grid */}
        <div key={remountKey}>
          <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {previewLooks.map((look) => {
                switch (activeIndex) {
                  case 0:
                    return (
                      <FloatingGlassCard
                        key={look.id}
                        look={look}
                        onOpenModal={setSelectedModalLook}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onRate={handleRate}
                      />
                    );
                  case 1:
                    return (
                      <VinylSleeveCard
                        key={look.id}
                        look={look}
                        onOpenModal={setSelectedModalLook}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onRate={handleRate}
                      />
                    );
                  case 2:
                    return (
                      <ClubFlyerCard
                        key={look.id}
                        look={look}
                        onOpenModal={setSelectedModalLook}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onRate={handleRate}
                      />
                    );
                  case 3:
                    return (
                      <PolaroidSnapshotCard
                        key={look.id}
                        look={look}
                        onOpenModal={setSelectedModalLook}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onRate={handleRate}
                      />
                    );
                  case 4:
                    return (
                      <SynthRackCard
                        key={look.id}
                        look={look}
                        onOpenModal={setSelectedModalLook}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onRate={handleRate}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </AnimatePresence>
          </ul>
        </div>
      </div>

      {/* Floating Detail Modal */}
      <LookDetailModal
        look={selectedModalLook}
        isOpen={!!selectedModalLook}
        onClose={() => setSelectedModalLook(null)}
        onRate={handleRate}
        onDelete={(id) => handleDelete(id, { stopPropagation: () => {} } as any)}
      />

      {/* PICKER SPEC HARNESS VERBATIM */}
      <nav ref={pickerRef} className="proto-picker" aria-label="Prototype variants">
        <span ref={highlightRef} className="proto-picker-highlight" aria-hidden="true" />
        {variantNames.map((name, i) => (
          <button
            key={name}
            ref={(el) => {
              itemsRef.current[i] = el;
            }}
            onClick={() => changeVariant(i)}
            className="proto-picker-item"
            data-active={i === activeIndex ? "" : undefined}
            aria-current={i === activeIndex ? "true" : undefined}
          >
            {name}
          </button>
        ))}
        <span className="proto-picker-divider" aria-hidden="true" />
        <button
          onClick={handleReplay}
          className="proto-picker-item proto-picker-replay"
          aria-label="Replay animation (R)"
        >
          ↻
        </button>
      </nav>

      {/* Picker Styles strictly from PICKER.md */}
      <style jsx global>{`
        .proto-picker {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2147483647;
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 4px;
          border-radius: 999px;
          background: rgba(10, 10, 10, 0.82);
          -webkit-backdrop-filter: blur(12px) saturate(1.4);
          backdrop-filter: blur(12px) saturate(1.4);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.08) inset,
            0 8px 24px rgba(0, 0, 0, 0.24),
            0 2px 6px rgba(0, 0, 0, 0.12);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 13px;
          line-height: 1;
          -webkit-font-smoothing: antialiased;
          user-select: none;
          -webkit-user-select: none;
        }

        .proto-picker-highlight {
          position: absolute;
          top: 4px;
          left: 0;
          height: 28px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          will-change: transform;
        }

        .proto-picker[data-ready] .proto-picker-highlight {
          transition:
            transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
            width 250ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          .proto-picker[data-ready] .proto-picker-highlight {
            transition: none;
          }
        }

        .proto-picker-item {
          position: relative;
          display: flex;
          align-items: center;
          height: 28px;
          padding: 0 12px;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: rgba(255, 255, 255, 0.55);
          font: inherit;
          cursor: pointer;
          transition: color 150ms ease-out;
        }

        .proto-picker-item:hover {
          color: rgba(255, 255, 255, 0.85);
        }

        .proto-picker-item:active {
          transform: scale(0.97);
        }

        .proto-picker-item:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.4);
          outline-offset: 2px;
        }

        .proto-picker-item[data-active] {
          color: #fff;
        }

        .proto-picker-divider {
          width: 1px;
          height: 16px;
          margin: 0 4px;
          background: rgba(255, 255, 255, 0.12);
        }

        .proto-picker-replay {
          padding: 0 10px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

export default function SubmissionCardPrototypePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-cream/60">Loading prototype...</div>}>
      <PrototypeContent />
    </Suspense>
  );
}
