"use client";

// Dia Browser's signature gradient, recolored to White Chorus — a drop-in.
//
// A row of N tall, heavily-blurred columns share one vertical gradient and are
// arranged in a symmetric bell curve (short at the edges, tallest in the middle).
// The whole field is anchored to the bottom and RISES UP on mount via a
// scaleY(0) → 1 transform (transform-origin: bottom), so it unfurls from the
// floor like an aurora. One inline <svg> — no canvas, no per-frame work.
// Respects prefers-reduced-motion (renders instantly, no rise).

import { useEffect, useState } from "react";

type Stop = { offset: number; color: string };

// White Chorus stops, bottom (0) → top (1): plum → ink → plum → pink-neon →
// coral → cream → transparent cream.
const WC_STOPS: Stop[] = [
  { offset: 0, color: "#241a25" }, // plum-deep
  { offset: 0.22, color: "#2b1b31" }, // ink-violet
  { offset: 0.4, color: "#3b2d38" }, // plum
  { offset: 0.58, color: "#d36daf" }, // pink-neon
  { offset: 0.72, color: "#ff9a83" }, // coral
  { offset: 0.86, color: "#f5e7e4" }, // cream
  { offset: 1, color: "#f5e7e400" }, // transparent cream
];

const VBW = 1271;
const VBH = 599;

// Height curve: a gentle power falloff (not a cosine bell), giving the flatter,
// pyramid-like rise of the original.
function bellHeights(n: number, peak: number, valley: number): number[] {
  const out: number[] = [];
  const mid = (n - 1) / 2;
  for (let i = 0; i < n; i++) {
    const t = mid === 0 ? 0 : Math.abs(i - mid) / mid; // 0 center → 1 edge
    const eased = 1 - Math.pow(t, 1.24); // 1 at center → 0 at edge
    out.push(peak * VBH * (valley + (1 - valley) * eased));
  }
  return out;
}

export function DiaGradient({
  bars = 9,
  blur = 15,
  peak = 0.98,
  valley = 0.55,
  stops = WC_STOPS,
  riseMs = 1100,
}: {
  bars?: number;
  blur?: number;
  peak?: number;
  valley?: number;
  stops?: Stop[];
  riseMs?: number;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setShown(true)),
    );
    return () => cancelAnimationFrame(id);
  }, []);

  const heights = bellHeights(bars, peak, valley);
  const colW = VBW / bars;

  return (
    <div
      aria-hidden
      style={{
        height: "100%",
        width: "100%",
        transformOrigin: "bottom",
        transform: shown ? "scaleY(1)" : "scaleY(0)",
        transition: shown
          ? `transform ${riseMs}ms cubic-bezier(0.16, 1, 0.3, 1)`
          : "none",
        willChange: "transform",
      }}
    >
      <svg
        style={{ height: "100%", width: "100%" }}
        viewBox={`0 0 ${VBW} ${VBH}`}
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* objectBoundingBox units (default): the gradient maps to each rect's
              own box, so every bar shows the full White Chorus glow over its own
              height. */}
          <linearGradient id="dia-grad" x1="0" y1="1" x2="0" y2="0">
            {stops.map((s, i) => (
              <stop key={i} offset={s.offset} stopColor={s.color} />
            ))}
          </linearGradient>
          <filter id="dia-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
        {heights.map((h, i) => (
          <g key={i} filter="url(#dia-blur)">
            <rect
              x={i * colW}
              y={VBH - h}
              width={colW * 1.23}
              height={h}
              fill="url(#dia-grad)"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
