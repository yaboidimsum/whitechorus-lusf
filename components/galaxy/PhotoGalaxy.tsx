"use client";

import { useEffect, useRef } from "react";
import { ImageGalaxy } from "./image-galaxy";

const PHOTOS = [
  "/photograph-1.jpg",
  "/photograph-2.jpg",
  "/photograph-3.jpg",
  "/photograph-4.png",
  "/photograph-5.png",
  "/album-1.png",
  "/album-2.png",
  "/album-3.png",
  "/album-4.png",
];

/** Number of drifting photo particles (the 3 photos repeat). */
const COUNT = 12;

/**
 * Decorative perspective field of the band photographs drifting behind content.
 * Auto-drifts vertically with depth parallax (plain DOM transforms). Frozen
 * (static grid) under prefers-reduced-motion.
 */
export default function PhotoGalaxy({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wrappers: HTMLElement[] = [];
    const overlays: HTMLElement[] = [];

    for (let i = 0; i < COUNT; i++) {
      const wrap = document.createElement("div");
      wrap.style.position = "absolute";
      wrap.style.width = "110px";
      wrap.style.height = "140px";
      wrap.style.borderRadius = "10px";
      wrap.style.overflow = "hidden";
      wrap.style.border = "1px solid rgba(255,255,255,0.18)";
      wrap.style.boxShadow = "0 10px 24px rgba(0,0,0,0.35)";
      wrap.style.pointerEvents = "none";

      const img = document.createElement("img");
      img.src = PHOTOS[i % PHOTOS.length];
      img.alt = "";
      img.loading = "lazy";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      img.style.display = "block";

      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.inset = "0";
      overlay.style.background = "#fff";

      wrap.appendChild(img);
      wrap.appendChild(overlay);
      container.appendChild(wrap);

      wrappers.push(wrap);
      overlays.push(overlay);
    }

    const galaxy = new ImageGalaxy(container, wrappers, overlays);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) galaxy.start();

    return () => {
      galaxy.destroy();
      wrappers.forEach((el) => el.remove());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
