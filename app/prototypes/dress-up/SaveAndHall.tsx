"use client";

import Link from "next/link";

/** Shared form-actions for the prototype variants: Save (submit) + Hall of
 *  Fame link. `tone="light"` for the Paper variant's cream surface. */
export function SaveAndHall({
  save,
  saving,
  hasSelection,
  tone = "dark",
}: {
  save: () => void;
  saving: boolean;
  hasSelection: boolean;
  tone?: "dark" | "light";
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        onClick={save}
        disabled={!hasSelection || saving}
        className="flex-1 rounded-full bg-coral px-5 py-3.5 text-sm font-extrabold uppercase tracking-[0.14em] text-plum-deep transition-[transform,opacity] duration-150 ease-out-quart hover:opacity-85 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100"
      >
        {saving ? "Saving…" : "Save Outfit"}
      </button>
      <Link
        href="/hall-of-fame"
        className={`shrink-0 rounded-full border px-4 py-3 text-sm font-semibold transition-colors active:scale-[0.97] ${
          tone === "light"
            ? "border-[#2b1b31]/25 text-[#2b1b31] hover:border-[#2b1b31]/50"
            : "border-cream/25 text-cream/85 hover:border-cream/60"
        }`}
      >
        Hall of Fame
      </Link>
    </div>
  );
}
