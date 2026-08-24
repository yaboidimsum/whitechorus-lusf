"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Toaster } from "sonner";
import "./picker.css";
import { Strobe } from "./variants/Strobe";
import { Poster } from "./variants/Poster";
import { Paper } from "./variants/Paper";
import { Machine } from "./variants/Machine";
import { Quiet } from "./variants/Quiet";

const variants = [
  { name: "Strobe", Component: Strobe },
  { name: "Poster", Component: Poster },
  { name: "Paper", Component: Paper },
  { name: "Machine", Component: Machine },
  { name: "Quiet", Component: Quiet },
];

export default function PrototypeDressUpPage() {
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    try {
      const v = Number.parseInt(new URLSearchParams(window.location.search).get("v") || "1", 10);
      const i = Number.isNaN(v) ? 1 : v;
      setCurrent(Math.min(Math.max(i - 1, 0), variants.length - 1));
    } catch {}
  }, []);

  // Position the sliding highlight; enabled only after first paint (data-ready).
  useLayoutEffect(() => {
    const el = itemRefs.current[current];
    const hl = highlightRef.current;
    if (el && hl) {
      hl.style.width = `${el.offsetWidth}px`;
      hl.style.transform = `translateX(${el.offsetLeft}px)`;
    }
  }, [current, ready]);

  useEffect(() => {
    const raf1 = requestAnimationFrame(() =>
      requestAnimationFrame(() => setReady(true)),
    );
    return () => cancelAnimationFrame(raf1);
  }, []);

  // Persist selection in the URL (?v=N).
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(current + 1));
    window.history.replaceState(null, "", url);
  }, [current]);

  // Keyboard: 1-5, arrows, R.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const num = Number.parseInt(e.key, 10);
      if (num >= 1 && num <= variants.length) setCurrent(num - 1);
      else if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % variants.length);
      else if (e.key === "ArrowLeft") setCurrent((c) => (c - 1 + variants.length) % variants.length);
      else if (e.key === "r" || e.key === "R") setReplayKey((k) => k + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const Active = variants[current].Component;

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      {/* Variant surface — remounted on switch/replay so entrances re-run */}
      <Active key={`${current}-${replayKey}`} />

      {/* Picker chrome (verbatim) */}
      <nav className="proto-picker" aria-label="Prototype variants" data-ready={ready || undefined}>
        <span ref={highlightRef} className="proto-picker-highlight" aria-hidden="true" />
        {variants.map((v, i) => (
          <button
            key={v.name}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="proto-picker-item"
            data-active={i === current || undefined}
            aria-current={i === current ? "true" : undefined}
            onClick={() => setCurrent(i)}
          >
            {v.name}
          </button>
        ))}
        <span className="proto-picker-divider" aria-hidden="true" />
        <button
          className="proto-picker-item proto-picker-replay"
          aria-label="Replay animation (R)"
          onClick={() => setReplayKey((k) => k + 1)}
        >
          ↻
        </button>
      </nav>

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: { background: "#3b2d38", border: "1px solid rgba(245,231,228,0.15)", color: "#f5e7e4" },
        }}
      />
    </main>
  );
}
