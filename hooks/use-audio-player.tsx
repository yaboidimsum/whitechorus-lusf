"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { toast } from "sonner";
import { TRACKS, type Track } from "@/data/tracks";

interface AudioContextType {
  tracks: Track[];
  currentTrack: Track;
  currentTrackIndex: number;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  progress: number;
  duration: number;
  togglePlay: () => void;
  playTrack: (index: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleMute: () => void;
  setVolume: (val: number) => void;
  seek: (progressFraction: number) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

const STORAGE_KEY_VOLUME = "wc:audio:volume";
const STORAGE_KEY_MUTED = "wc:audio:muted";

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const currentTrackIndexRef = useRef(currentTrackIndex);
  currentTrackIndexRef.current = currentTrackIndex;

  const currentTrack = TRACKS[currentTrackIndex] || TRACKS[0];

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [progress, setProgress] = useState(0);
  // Default to the track's known duration so it never displays 0:00
  const [duration, setDuration] = useState(currentTrack.durationSec || 230);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize saved preferences
  useEffect(() => {
    try {
      const savedVol = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (savedVol !== null) setVolumeState(Number(savedVol));
      const savedMuted = localStorage.getItem(STORAGE_KEY_MUTED);
      if (savedMuted !== null) setIsMuted(savedMuted === "true");
    } catch {}
  }, []);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle Play/Pause
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        if (!audio.src || !audio.src.endsWith(currentTrack.src)) {
          audio.src = currentTrack.src;
          audio.load();
        }
        await audio.play();
        setIsPlaying(true);
      } catch (err: any) {
        console.warn("Audio playback error:", err);
        setIsPlaying(false);
        toast.info(
          `Playing "${currentTrack.title}" by ${currentTrack.artist}`,
          {
            description: currentTrack.album,
          }
        );
      }
    }
  }, [isPlaying, currentTrack]);

  const playTrack = useCallback((index: number) => {
    if (index < 0 || index >= TRACKS.length) return;
    const targetTrack = TRACKS[index];
    setCurrentTrackIndex(index);
    currentTrackIndexRef.current = index;
    setProgress(0);
    // Immediately set duration to the track's precomputed duration
    setDuration(targetTrack.durationSec);
    setIsPlaying(true);

    const audio = audioRef.current;
    if (audio) {
      audio.src = targetTrack.src;
      audio.load();
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Audio play error:", err);
          setIsPlaying(false);
        });
    }
  }, []);

  const nextTrack = useCallback(() => {
    const nextIdx = (currentTrackIndexRef.current + 1) % TRACKS.length;
    playTrack(nextIdx);
  }, [playTrack]);

  const prevTrack = useCallback(() => {
    const prevIdx = (currentTrackIndexRef.current - 1 + TRACKS.length) % TRACKS.length;
    playTrack(prevIdx);
  }, [playTrack]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY_MUTED, String(next));
      } catch {}
      return next;
    });
  }, []);

  const setVolume = useCallback((val: number) => {
    const clean = Math.max(0, Math.min(1, val));
    setVolumeState(clean);
    setIsMuted(false);
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, String(clean));
      localStorage.setItem(STORAGE_KEY_MUTED, "false");
    } catch {}
  }, []);

  const seek = useCallback((progressFraction: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clean = Math.max(0, Math.min(1, progressFraction));
    const effectiveDuration = audio.duration && !isNaN(audio.duration) && audio.duration > 0
      ? audio.duration
      : currentTrack.durationSec;
    audio.currentTime = clean * effectiveDuration;
    setProgress(clean);
  }, [currentTrack]);

  const updateDuration = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
      setDuration(audio.duration);
    }
  }, []);

  return (
    <AudioContext.Provider
      value={{
        tracks: TRACKS,
        currentTrack,
        currentTrackIndex,
        isPlaying,
        isMuted,
        volume,
        progress,
        duration: duration || currentTrack.durationSec,
        togglePlay,
        playTrack,
        nextTrack,
        prevTrack,
        toggleMute,
        setVolume,
        seek,
      }}
    >
      {/* Hidden Global Audio Element */}
      <audio
        ref={audioRef}
        src={TRACKS[0].src}
        preload="auto"
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (audio) {
            const effDuration = audio.duration && !isNaN(audio.duration) && audio.duration > 0
              ? audio.duration
              : currentTrack.durationSec;
            if (effDuration > 0) {
              setProgress(audio.currentTime / effDuration);
            }
          }
        }}
        onLoadedMetadata={updateDuration}
        onDurationChange={updateDuration}
        onCanPlay={updateDuration}
        onEnded={() => {
          nextTrack();
        }}
        onError={(e) => {
          console.warn("Audio playback issue:", e);
        }}
      />
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioProvider");
  }
  return context;
}
