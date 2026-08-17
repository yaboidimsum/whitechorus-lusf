"use client";

import Link from "next/link";
import { useSyncExternalStore, useState } from "react";
import { characters } from "@/data/characters";
import {
  deleteLook,
  getLooksSnapshot,
  getServerLooksSnapshot,
  restoreLook,
  subscribeLooks,
} from "@/lib/looks";
import type { SavedLook } from "@/lib/types";
import LookPreview from "./LookPreview";

const PAGE_SIZE = 9;
const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

/** Saved-look gallery, self-contained (reads the localStorage store).
 *  `full` = 3×3 grid + pagination; `preview` = latest 3 + "View all" link. */
export default function HallOfFame({ variant = "full" }: { variant?: "full" | "preview" }) {
  const savedLooks = useSyncExternalStore(
    subscribeLooks,
    getLooksSnapshot,
    getServerLooksSnapshot,
  );
  const [page, setPage] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<SavedLook | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const newestFirst = [...savedLooks].reverse();
  const totalPages = Math.max(1, Math.ceil(savedLooks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageLooks = newestFirst.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );
  const previewLooks = newestFirst.slice(0, 3);

  const handleDelete = (id: string) => {
    const target = savedLooks.find((s) => s.id === id);
    if (!target) return;
    deleteLook(id);
    setPendingDelete(target);
    setAnnouncement("Outfit deleted.");
  };

  const handleUndo = () => {
    if (!pendingDelete) return;
    restoreLook(pendingDelete);
    setPendingDelete(null);
    setAnnouncement("Outfit restored.");
  };

  const card = (s: SavedLook) => (
    <li
      key={s.id}
      className="relative overflow-hidden rounded-2xl border border-cream/15 bg-plum"
    >
      <LookPreview look={s} />
      {s.demo ? (
        <span className="absolute right-2 top-2 rounded-full bg-plum-deep/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cream/80">
          Example
        </span>
      ) : null}
      <div className="flex items-center justify-between gap-2 p-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-cream">
            {dateTimeFormat.format(s.savedAt)}
          </p>
          <p className="text-xs text-cream/60">
            {characters.map((c) => c.name).join(" & ")}
          </p>
        </div>
        <button
          onClick={() => handleDelete(s.id)}
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold text-pink-neon hover:bg-pink-neon/10"
        >
          Delete
        </button>
      </div>
    </li>
  );

  return (
    <div>
      <p role="status" className="sr-only">
        {announcement}
      </p>

      {variant === "preview" ? (
        <div className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-normal uppercase leading-none tracking-wide text-cream sm:text-3xl">
                Hall of Fame
              </h2>
              <p className="mt-2 max-w-md text-pretty text-sm text-cream/65">
                Your saved looks, kept private in your browser.
              </p>
            </div>
            <Link
              href="/hall-of-fame"
              className="shrink-0 rounded-full border border-cream/20 px-4 py-2 text-sm font-semibold text-cream/80 transition-colors hover:border-cream/50"
            >
              View all
            </Link>
          </div>
          {savedLooks.length > 0 ? (
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previewLooks.map(card)}
            </ul>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-cream/25 p-6 text-center text-sm text-cream/75">
              No outfits yet — dress the duo and save your first look.
            </p>
          )}
        </div>
      ) : (
        <div>
          {savedLooks.length > 0 ? (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {pageLooks.map(card)}
              </ul>
              {totalPages > 1 ? (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={safePage === 0}
                    className="rounded-full border border-cream/20 px-4 py-2 text-sm font-semibold text-cream/80 transition-colors hover:border-cream/50 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Prev
                  </button>
                  <span className="text-sm text-cream/60">
                    Page {safePage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={safePage === totalPages - 1}
                    className="rounded-full border border-cream/20 px-4 py-2 text-sm font-semibold text-cream/80 transition-colors hover:border-cream/50 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <p className="rounded-2xl border border-dashed border-cream/25 p-6 text-center text-sm text-cream/75">
              No outfits yet — dress the duo and save your first look.
            </p>
          )}
        </div>
      )}

      {pendingDelete ? (
        <div className="animate-enter mt-4 flex items-center justify-between rounded-2xl border border-cream/20 bg-plum px-4 py-3">
          <p className="text-sm text-cream/85">Outfit deleted</p>
          <button
            onClick={handleUndo}
            className="rounded-full px-3 py-1 text-sm font-bold text-coral hover:bg-coral/10"
          >
            Undo
          </button>
        </div>
      ) : null}
    </div>
  );
}
