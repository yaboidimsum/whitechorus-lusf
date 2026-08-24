"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Disc3,
} from "lucide-react";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import AudioWelcomeModal from "@/components/audio/AudioWelcomeModal";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export default function MusicPlayer() {
  const {
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    isMuted,
    volume,
    progress,
    duration,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    toggleMute,
    setVolume,
    seek,
  } = useAudioPlayer();

  const [expanded, setExpanded] = useState(false);

  const currentTime = duration ? duration * progress : 0;

  return (
    <>
      {/* First-Visit Audio Welcome & Consent Prompt */}
      <AudioWelcomeModal />

      <aside
        aria-label="Audio player"
        className="fixed bottom-4 left-4 z-40 flex flex-col items-start gap-2 sm:bottom-6 sm:left-6"
      >
      {/* Expandable Flyout Drawer */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[300px] overflow-hidden rounded-3xl border border-coral/30 bg-plum-deep/95 p-4 shadow-2xl backdrop-blur-xl sm:w-[340px]"
          >
            {/* Header / Track Info */}
            <div className="flex items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl border border-cream/20 shadow-md">
                <Image
                  src={currentTrack.cover}
                  alt={currentTrack.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-cream">
                  {currentTrack.title}
                </p>
                <p className="truncate text-xs text-pink-neon">
                  {currentTrack.artist}
                  {currentTrack.album && (
                    <span className="text-cream/50 font-normal ml-1">
                      · {currentTrack.album}
                    </span>
                  )}
                </p>
              </div>
              {currentTrack.spotifyUrl && (
                <a
                  href={currentTrack.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open on Spotify"
                  title="Open on Spotify"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-cream/20 bg-plum/60 text-cream transition-colors hover:border-coral hover:text-coral"
                >
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>

            {/* Scrubber Timeline */}
            <div className="mt-4">
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const fraction = (e.clientX - rect.left) / rect.width;
                  seek(fraction);
                }}
                className="group relative h-2 w-full cursor-pointer rounded-full bg-cream/15"
              >
                <div
                  style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
                  className="relative h-full rounded-full bg-gradient-to-r from-pink-neon to-coral transition-all"
                >
                  <div className="absolute -right-1 -top-0.5 size-3 rounded-full bg-cream shadow-md transition-transform group-hover:scale-125" />
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-cream/50 tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transport Controls */}
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={prevTrack}
                  disabled={tracks.length <= 1}
                  aria-label="Previous track"
                  className="flex size-8 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream disabled:opacity-30"
                >
                  <SkipBack className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? "Pause" : "Play"}
                  className="flex size-10 items-center justify-center rounded-full bg-coral text-plum-deep shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="size-5 fill-current" />
                  ) : (
                    <Play className="size-5 fill-current ml-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={nextTrack}
                  disabled={tracks.length <= 1}
                  aria-label="Next track"
                  className="flex size-8 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream disabled:opacity-30"
                >
                  <SkipForward className="size-4" />
                </button>
              </div>

              {/* Volume Slider & Mute */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  className="flex size-7 items-center justify-center rounded-full text-cream/70 transition-colors hover:text-cream"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="size-4 text-cream/40" />
                  ) : (
                    <Volume2 className="size-4 text-coral" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="Volume slider"
                  className="h-1.5 w-16 cursor-pointer appearance-none rounded-full bg-cream/20 accent-coral"
                />
              </div>
            </div>

            {/* Multi-Track Playlist List */}
            {tracks.length > 1 && (
              <div className="mt-3 border-t border-cream/10 pt-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cream/50">
                    Tracklist ({tracks.length} Songs)
                  </p>
                  <span className="text-[10px] text-pink-neon">White Chorus Discography</span>
                </div>
                <div className="max-h-44 space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,154,131,0.3)_transparent]">
                  {tracks.map((t, idx) => {
                    const isSelected = idx === currentTrackIndex;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => playTrack(idx)}
                        className={`group flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-all ${
                          isSelected
                            ? "bg-coral/20 font-bold text-coral"
                            : "text-cream/75 hover:bg-cream/5 hover:text-cream"
                        }`}
                      >
                        <div className="min-w-0 flex-1 truncate pr-2">
                          <span className="tabular-nums opacity-60 mr-1.5">{idx + 1}.</span>
                          <span>{t.title}</span>
                          {t.album && (
                            <span className="ml-1.5 text-[10px] opacity-40 font-normal">
                              · {t.album}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] tabular-nums text-cream/40">
                            {formatTime(t.durationSec)}
                          </span>
                          {isSelected && isPlaying ? (
                            <span className="flex items-center gap-0.5">
                              <span className="h-2 w-0.5 animate-pulse bg-coral" />
                              <span className="h-3 w-0.5 animate-pulse bg-coral" style={{ animationDelay: "150ms" }} />
                              <span className="h-2 w-0.5 animate-pulse bg-coral" style={{ animationDelay: "300ms" }} />
                            </span>
                          ) : (
                            <Play className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Main Pill */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`group flex items-center gap-2.5 rounded-full border border-coral/40 bg-plum-deep/90 py-1.5 pl-2 pr-3 shadow-2xl backdrop-blur-xl transition-all ${
          isPlaying
            ? "border-coral shadow-[0_0_24px_rgba(255,154,131,0.3)] ring-1 ring-coral/30"
            : "hover:border-coral/60"
        }`}
      >
        {/* Spinning Vinyl Cover Button */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause music" : "Play music"}
          className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-cream/20 bg-plum shadow-inner"
        >
          {currentTrack.cover ? (
            <Image
              src={currentTrack.cover}
              alt={currentTrack.title}
              fill
              className={`object-cover ${isPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`}
            />
          ) : (
            <Disc3 className={`size-4 text-coral ${isPlaying ? "animate-[spin_4s_linear_infinite]" : ""}`} />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-plum-deep/40 opacity-0 transition-opacity group-hover:opacity-100">
            {isPlaying ? (
              <Pause className="size-3.5 fill-cream text-cream" />
            ) : (
              <Play className="size-3.5 fill-cream text-cream ml-0.5" />
            )}
          </div>
        </button>

        {/* Track Title & Equalizer Click to Expand */}
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-2 text-left focus:outline-none"
        >
          <div className="flex flex-col">
            <span className="max-w-[110px] truncate text-xs font-bold text-cream sm:max-w-[150px]">
              {currentTrack.title}
            </span>
            <span className="text-[10px] font-semibold text-pink-neon">
              {isPlaying ? "Playing BGM" : "White Chorus"}
            </span>
          </div>

          {/* Animated 4-Bar Soundwave Equalizer */}
          <div className="flex h-3.5 items-end gap-0.5 px-1" aria-hidden="true">
            <span
              className={`w-0.5 rounded-full bg-coral transition-all ${
                isPlaying ? "h-3 animate-[pulse_0.6s_ease-in-out_infinite]" : "h-1"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-pink-neon transition-all ${
                isPlaying ? "h-3.5 animate-[pulse_0.45s_ease-in-out_infinite_150ms]" : "h-1.5"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-coral transition-all ${
                isPlaying ? "h-2.5 animate-[pulse_0.5s_ease-in-out_infinite_300ms]" : "h-1"
              }`}
            />
            <span
              className={`w-0.5 rounded-full bg-pink-neon transition-all ${
                isPlaying ? "h-3.5 animate-[pulse_0.7s_ease-in-out_infinite_100ms]" : "h-1.5"
              }`}
            />
          </div>

          {/* Expand Chevron */}
          <div className="text-cream/50 transition-colors group-hover:text-cream">
            {expanded ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronUp className="size-3.5" />
            )}
          </div>
        </button>
      </motion.div>
    </aside>
    </>
  );
}
