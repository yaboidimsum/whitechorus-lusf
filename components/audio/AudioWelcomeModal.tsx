"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Volume2, VolumeX, Disc3, Sparkles } from "lucide-react";
import { useAudioPlayer } from "@/hooks/use-audio-player";

const STORAGE_KEY_SEEN = "wc:audio:welcome_seen_v1";

export default function AudioWelcomeModal() {
  const { togglePlay, isPlaying } = useAudioPlayer();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY_SEEN);
      if (!seen) {
        // Small delay to let the page settle before showing prompt
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handlePlay = async () => {
    try {
      localStorage.setItem(STORAGE_KEY_SEEN, "true");
    } catch {}
    setIsOpen(false);
    if (!isPlaying) {
      togglePlay();
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY_SEEN, "true");
    } catch {}
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-plum-deep/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-coral/40 bg-plum-deep/95 p-6 sm:p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
          >
            {/* Ambient Background Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-20 -top-20 size-60 rounded-full bg-coral/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -bottom-20 size-60 rounded-full bg-pink-neon/20 blur-3xl"
            />

            {/* Glowing Icon */}
            <div className="relative mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-coral/40 bg-plum shadow-inner">
              <Disc3 className="size-8 text-coral animate-[spin_6s_linear_infinite]" />
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-coral text-[10px] text-plum-deep shadow">
                <Sparkles className="size-3" />
              </span>
            </div>

            {/* Title & Badge */}
            <span className="inline-block rounded-full bg-coral/15 px-3 py-1 text-[11px] font-bold text-coral border border-coral/30">
              White Chorus Discography
            </span>
            <h2 className="font-display mt-3 text-3xl font-normal leading-none tracking-wide text-cream">
              Play background music?
            </h2>

            {/* Description & Floating Pill Hint */}
            <p className="mt-3 text-sm leading-relaxed text-cream/80 text-pretty">
              Immerse yourself in the dress-up machine with 13 official tracks from{" "}
              <strong className="text-coral">L.U.F.S.</strong>,{" "}
              <strong className="text-pink-neon">LIMBO +</strong>, and{" "}
              <strong className="text-cream">FASTFOOD</strong>.
            </p>

            <div className="mt-4 rounded-2xl border border-cream/10 bg-plum/50 p-3 text-xs text-cream/70">
              💡 <span>You can pause, change songs, or adjust volume anytime using the <strong>floating music player</strong> at the bottom left.</span>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={handlePlay}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-coral px-5 py-3.5 text-sm font-bold text-plum-deep shadow-[0_4px_16px_rgba(255,154,131,0.4)] transition-all hover:bg-coral/95 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Volume2 className="size-4" />
                <span>Play Music</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="flex items-center justify-center gap-2 rounded-2xl border border-cream/20 bg-plum/60 px-5 py-3.5 text-sm font-bold text-cream/75 transition-all hover:bg-plum hover:text-cream active:scale-[0.98]"
              >
                <VolumeX className="size-4" />
                <span>Mute for Now</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
