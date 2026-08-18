"use client";

import { useState, useEffect, useRef, useSyncExternalStore, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import {
  Share2,
  Download,
  Plus,
  Sparkles,
  Play,
  ArrowRight,
  Sliders,
  Radio,
  FileDown,
  RefreshCw,
  Eye,
  Disc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { characters } from "@/data/characters";
import LookPreview from "@/components/dress-up/LookPreview";
import StarRating from "@/components/dress-up/StarRating";
import {
  getLooksSnapshot,
  getServerLooksSnapshot,
  rateLook,
  subscribeLooks,
} from "@/lib/looks";
import { downloadSavedLook, shareInstagramStory } from "@/lib/export";
import type { SavedLook } from "@/lib/types";

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

// ==========================================
// VARIANT 1: FROSTED GLASS BUTTONS
// Axis: Modern Minimalist Floating Glass Button Trio
// ==========================================
function FloatingPillDockButtons({
  look,
  isSharing,
  isDownloading,
  onShare,
  onDownload,
}: {
  look: SavedLook;
  isSharing: boolean;
  isDownloading: boolean;
  onShare: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="mx-auto mt-6 grid max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-3">
      {/* Primary Share Action */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onShare}
        disabled={isSharing}
        className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-coral px-4 py-2.5 text-xs font-bold text-plum-deep shadow-[0_4px_16px_rgba(255,154,131,0.3)] transition-all hover:bg-coral/95 hover:shadow-[0_6px_22px_rgba(255,154,131,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40 disabled:opacity-50"
      >
        <Share2 className="size-4 shrink-0" />
        <span className="truncate">{isSharing ? "Preparing..." : "Share to IG Story"}</span>
      </motion.button>

      {/* Download Action */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onDownload}
        disabled={isDownloading}
        className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-cream/20 bg-plum/60 px-4 py-2.5 text-xs font-bold text-cream shadow-sm backdrop-blur-md transition-all hover:border-cream/40 hover:bg-plum/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/30 disabled:opacity-50"
      >
        <Download className="size-4 shrink-0 text-coral" />
        <span className="truncate">{isDownloading ? "Exporting..." : "Download PNG"}</span>
      </motion.button>

      {/* Style Another Link */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
        <Link
          href="/"
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-cream/20 bg-plum/60 px-4 py-2.5 text-xs font-bold text-cream/90 shadow-sm backdrop-blur-md transition-all hover:border-cream/40 hover:bg-plum/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/30"
        >
          <Plus className="size-4 shrink-0 text-pink-neon" />
          <span className="truncate">Style Another</span>
        </Link>
      </motion.div>
    </div>
  );
}

// ==========================================
// VARIANT 2: HARDWARE AUDIO RACK TOGGLES
// Axis: Retro Synth & Studio Console Switches
// ==========================================
function HardwareRackButtons({
  look,
  isSharing,
  isDownloading,
  onShare,
  onDownload,
}: {
  look: SavedLook;
  isSharing: boolean;
  isDownloading: boolean;
  onShare: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="mx-auto mt-6 rounded-2xl border-2 border-cream/20 bg-[#120a14] p-3 shadow-2xl">
      <div className="mb-2 flex items-center justify-between border-b border-cream/10 pb-1.5 font-mono text-[9px] uppercase tracking-widest text-cream/50">
        <span className="flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-coral animate-pulse" />
          OUTPUT CONTROL BUS
        </span>
        <span>CHANNEL 01/02</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 font-mono">
        <button
          type="button"
          onClick={onShare}
          disabled={isSharing}
          className="group relative flex items-center justify-between rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 text-left text-xs font-bold text-coral transition-all hover:border-coral hover:bg-coral/20 active:translate-y-0.5"
        >
          <div className="flex items-center gap-2">
            <Radio className="size-3.5" />
            <span className="tracking-wider">[ IG-STORY ]</span>
          </div>
          <span className="size-2 rounded-full bg-coral shadow-[0_0_8px_rgba(255,154,131,0.8)]" />
        </button>

        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          className="group relative flex items-center justify-between rounded-xl border border-cream/15 bg-cream/5 px-3 py-2 text-left text-xs font-bold text-cream/90 transition-all hover:border-cream/30 hover:bg-cream/10 active:translate-y-0.5"
        >
          <div className="flex items-center gap-2">
            <FileDown className="size-3.5 text-cream/60" />
            <span className="tracking-wider">[ EXP.PNG ]</span>
          </div>
          <span className="size-2 rounded-full bg-cream/30" />
        </button>

        <Link
          href="/"
          className="group relative flex items-center justify-between rounded-xl border border-pink-neon/30 bg-pink-neon/10 px-3 py-2 text-left text-xs font-bold text-pink-neon transition-all hover:border-pink-neon hover:bg-pink-neon/20 active:translate-y-0.5"
        >
          <div className="flex items-center gap-2">
            <Plus className="size-3.5" />
            <span className="tracking-wider">[ +PATCH ]</span>
          </div>
          <span className="size-2 rounded-full bg-pink-neon shadow-[0_0_8px_rgba(255,59,119,0.8)]" />
        </Link>
      </div>
    </div>
  );
}

// ==========================================
// VARIANT 3: EDITORIAL SPLIT STACK
// Axis: Bold Hero Call-To-Action Hierarchy
// ==========================================
function EditorialSplitStackButtons({
  look,
  isSharing,
  isDownloading,
  onShare,
  onDownload,
}: {
  look: SavedLook;
  isSharing: boolean;
  isDownloading: boolean;
  onShare: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="mx-auto mt-6 max-w-lg space-y-2.5">
      {/* Dominant Primary Hero Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        onClick={onShare}
        disabled={isSharing}
        className="relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-coral via-coral to-[#ffb19e] p-4 text-plum-deep shadow-[0_8px_24px_rgba(255,154,131,0.4)] transition-all hover:shadow-[0_12px_32px_rgba(255,154,131,0.5)] disabled:opacity-50"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="flex size-10 items-center justify-center rounded-xl bg-plum-deep/15">
            <Share2 className="size-5 text-plum-deep" />
          </div>
          <div>
            <span className="block text-sm font-extrabold uppercase tracking-wide">
              {isSharing ? "Generating Story..." : "Share to Instagram Story"}
            </span>
            <span className="block text-[11px] font-medium opacity-80">
              Ready-to-post 9:16 afterglow template
            </span>
          </div>
        </div>
        <ArrowRight className="size-5 shrink-0" />
      </motion.button>

      {/* Secondary Split Utility Row */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          variant="outline"
          size="lg"
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full rounded-2xl border-cream/20 bg-plum/40 text-xs font-bold backdrop-blur-md hover:bg-cream/10"
        >
          <Download className="size-4" />
          {isDownloading ? "Exporting..." : "Download High-Res"}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          asChild
          className="w-full rounded-2xl text-xs font-bold"
        >
          <Link href="/">
            <Plus className="size-4" />
            Dress New Outfit
          </Link>
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// VARIANT 4: CASSETTE TRANSPORT DECK
// Axis: Physical Music Tape Mechanical Controls
// ==========================================
function CassetteTransportButtons({
  look,
  isSharing,
  isDownloading,
  onShare,
  onDownload,
}: {
  look: SavedLook;
  isSharing: boolean;
  isDownloading: boolean;
  onShare: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="mx-auto mt-6 max-w-md rounded-2xl border-2 border-cream/25 bg-[#180f1b] p-2.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_12px_28px_rgba(0,0,0,0.5)]">
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onShare}
          disabled={isSharing}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-coral/50 bg-gradient-to-b from-coral to-[#e87d65] p-3 text-plum-deep shadow-[0_4px_0_#b55b46] active:translate-y-1 active:shadow-none"
        >
          <Play className="size-4 fill-plum-deep" />
          <span className="text-[10px] font-black uppercase tracking-wider">
            {isSharing ? "TAPE ON" : "SHARE"}
          </span>
        </button>

        <button
          type="button"
          onClick={onDownload}
          disabled={isDownloading}
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-cream/20 bg-gradient-to-b from-plum-deep to-[#1b101e] p-3 text-cream shadow-[0_4px_0_#0a040c] active:translate-y-1 active:shadow-none hover:border-cream/40"
        >
          <Download className="size-4 text-coral" />
          <span className="text-[10px] font-black uppercase tracking-wider">
            {isDownloading ? "RECORD" : "SAVE PNG"}
          </span>
        </button>

        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-cream/20 bg-gradient-to-b from-plum-deep to-[#1b101e] p-3 text-cream shadow-[0_4px_0_#0a040c] active:translate-y-1 active:shadow-none hover:border-pink-neon/40 hover:text-pink-neon"
        >
          <RefreshCw className="size-4 text-pink-neon" />
          <span className="text-[10px] font-black uppercase tracking-wider">
            RESTYLE
          </span>
        </Link>
      </div>
    </div>
  );
}

// ==========================================
// VARIANT 5: GLOW RIM CAPSULE
// Axis: Nocturnal Neon Club Glow & Floating Glass
// ==========================================
function GlowRimCapsuleButtons({
  look,
  isSharing,
  isDownloading,
  onShare,
  onDownload,
}: {
  look: SavedLook;
  isSharing: boolean;
  isDownloading: boolean;
  onShare: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="mx-auto mt-6 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
      {/* Share Capsule */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={onShare}
        disabled={isSharing}
        className="group relative flex items-center justify-center gap-2 rounded-2xl border-2 border-coral bg-coral/15 px-4 py-3 text-xs font-black uppercase tracking-wider text-coral shadow-[0_0_20px_rgba(255,154,131,0.25)] backdrop-blur-xl transition-all hover:bg-coral hover:text-plum-deep hover:shadow-[0_0_30px_rgba(255,154,131,0.6)]"
      >
        <Share2 className="size-4 shrink-0 transition-transform group-hover:rotate-12" />
        <span className="truncate">{isSharing ? "Sharing..." : "IG Story"}</span>
      </motion.button>

      {/* Download Capsule */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={onDownload}
        disabled={isDownloading}
        className="group relative flex items-center justify-center gap-2 rounded-2xl border border-cream/25 bg-cream/5 px-4 py-3 text-xs font-bold uppercase tracking-wider text-cream shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all hover:border-cream/60 hover:bg-cream/15"
      >
        <Download className="size-4 shrink-0 text-coral transition-transform group-hover:-translate-y-0.5" />
        <span className="truncate">{isDownloading ? "Saving..." : "Save Image"}</span>
      </motion.button>

      {/* Restyle Capsule */}
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
        <Link
          href="/"
          className="group relative flex items-center justify-center gap-2 rounded-2xl border border-pink-neon/40 bg-pink-neon/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-pink-neon shadow-[0_0_15px_rgba(255,59,119,0.15)] backdrop-blur-xl transition-all hover:border-pink-neon hover:bg-pink-neon hover:text-plum-deep hover:shadow-[0_0_25px_rgba(255,59,119,0.5)]"
        >
          <Plus className="size-4 shrink-0 transition-transform group-hover:rotate-90" />
          <span className="truncate">Restyle</span>
        </Link>
      </motion.div>
    </div>
  );
}

// ==========================================
// PROTOTYPE HARNESS & VERBATIM PICKER
// ==========================================
const variantNames = [
  "Frosted Glass Buttons",
  "Hardware Rack",
  "Editorial Split Stack",
  "Cassette Transport",
  "Glow Rim Capsule",
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
  const [remountKey, setRemountKey] = useState(0);
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const pickerRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const savedLooks = useSyncExternalStore(
    subscribeLooks,
    getLooksSnapshot,
    getServerLooksSnapshot
  );

  const newestFirst = [...savedLooks].reverse();
  const spotlightLook = newestFirst[0] || null;

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

  const handleShare = async () => {
    if (!spotlightLook || sharing) return;
    setSharing(true);
    const toastId = toast.loading("Compositing Instagram Story...");
    try {
      const shared = await shareInstagramStory(spotlightLook);
      if (shared) toast.success("Story shared!", { id: toastId });
      else toast.success("Story PNG downloaded!", { id: toastId });
    } catch {
      toast.error("Failed to share.", { id: toastId });
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    if (!spotlightLook || downloading) return;
    setDownloading(true);
    const toastId = toast.loading("Generating PNG download...");
    try {
      await downloadSavedLook(spotlightLook);
      toast.success("Outfit downloaded!", { id: toastId });
    } catch {
      toast.error("Failed to download.", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  if (!spotlightLook) {
    return (
      <div className="py-24 text-center text-sm text-cream/60">
        No spotlight look found. Dress Emir & Friska first.
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 pt-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <header className="mb-8 border-b border-cream/10 pb-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-pink-neon">
            Spotlight Hero Exploration
          </p>
          <h1 className="font-display mt-1 text-2xl font-normal uppercase tracking-wide text-cream sm:text-3xl">
            Spotlight Hero Action Buttons
          </h1>
          <p className="mt-1.5 text-xs text-cream/70">
            Previewing: <strong className="text-coral">{variantNames[activeIndex]}</strong> (Variant {activeIndex + 1} of {variantNames.length})
          </p>
        </header>

        {/* REAL SURROUNDING CONTEXT: SPOTLIGHT HERO CARD */}
        <section aria-label="Spotlight submission" className="mx-auto w-full max-w-xl text-center">
          <div className="relative">
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/15 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-coral">
              <Sparkles className="size-3.5" />
              🎉 Successfully Published to Hall of Fame!
            </div>

            {/* Stage Preview Container */}
            <div className="group relative mx-auto max-w-sm overflow-hidden rounded-3xl border border-cream/20 shadow-stage">
              <LookPreview look={spotlightLook} />
            </div>

            {/* Metadata & Interactive Rating */}
            <div className="mt-4 flex flex-col items-center justify-between gap-3 border-b border-cream/15 pb-4 sm:flex-row">
              <div className="text-left">
                <p className="text-sm font-bold text-coral sm:text-base">
                  {spotlightLook.username || "@stylist"}
                </p>
                <p className="text-xs text-cream/60 tabular-nums">
                  {dateTimeFormat.format(spotlightLook.savedAt)} · {characters.map((c) => c.name).join(" & ")}
                </p>
              </div>

              <div className="flex flex-col items-center sm:items-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-cream tabular-nums">
                    ★ {(spotlightLook.ratingAvg ?? 0) > 0 ? (spotlightLook.ratingAvg ?? 0).toFixed(1) : "—"}
                  </span>
                  <span className="text-xs text-cream/60 tabular-nums">
                    ({spotlightLook.ratingsCount ?? 0} ratings)
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[11px] text-cream/70">Your rating:</span>
                  <StarRating
                    rating={spotlightLook.rating ?? 0}
                    onRatingChange={(r) => rateLook(spotlightLook.id, r)}
                    size="md"
                  />
                </div>
              </div>
            </div>

            {/* THE DIVERGING ACTION BUTTON VARIANT */}
            <div key={remountKey}>
              {activeIndex === 0 && (
                <FloatingPillDockButtons
                  look={spotlightLook}
                  isSharing={sharing}
                  isDownloading={downloading}
                  onShare={handleShare}
                  onDownload={handleDownload}
                />
              )}
              {activeIndex === 1 && (
                <HardwareRackButtons
                  look={spotlightLook}
                  isSharing={sharing}
                  isDownloading={downloading}
                  onShare={handleShare}
                  onDownload={handleDownload}
                />
              )}
              {activeIndex === 2 && (
                <EditorialSplitStackButtons
                  look={spotlightLook}
                  isSharing={sharing}
                  isDownloading={downloading}
                  onShare={handleShare}
                  onDownload={handleDownload}
                />
              )}
              {activeIndex === 3 && (
                <CassetteTransportButtons
                  look={spotlightLook}
                  isSharing={sharing}
                  isDownloading={downloading}
                  onShare={handleShare}
                  onDownload={handleDownload}
                />
              )}
              {activeIndex === 4 && (
                <GlowRimCapsuleButtons
                  look={spotlightLook}
                  isSharing={sharing}
                  isDownloading={downloading}
                  onShare={handleShare}
                  onDownload={handleDownload}
                />
              )}
            </div>
          </div>
        </section>
      </div>

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

export default function SpotlightButtonsPrototypePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-cream/60">Loading prototype...</div>}>
      <PrototypeContent />
    </Suspense>
  );
}
