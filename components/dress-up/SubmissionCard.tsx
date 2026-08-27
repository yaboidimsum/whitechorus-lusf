"use client";

import React from "react";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import LookPreview from "./LookPreview";
import StarRating from "./StarRating";
import { isLookAuthor } from "@/lib/looks";
import { formatCount } from "@/lib/utils";
import type { SavedLook } from "@/lib/types";

interface SubmissionCardProps {
  look: SavedLook;
  currentUserId?: string | null;
  isDownloading?: boolean;
  onOpenModal: (look: SavedLook) => void;
  onDownload: (look: SavedLook, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onRate: (id: string, rating: number) => void;
}

const shortDateFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

function SubmissionCardComponent({
  look,
  currentUserId,
  isDownloading = false,
  onOpenModal,
  onDownload,
  onDelete,
  onRate,
}: SubmissionCardProps) {
  const isMine = isLookAuthor(look, currentUserId);
  const voteCountStr = formatCount(look.ratingsCount ?? 0);

  return (
    <li
      onClick={() => onOpenModal(look)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-cream/15 bg-plum/40 p-1.5 sm:p-2 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-coral/40 hover:bg-plum/70 hover:shadow-xl active:scale-[0.99]"
    >
      <div className="relative overflow-hidden rounded-2xl">
        <LookPreview look={look} />

        {/* Floating Glass Badges */}
        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-plum-deep/80 px-2.5 py-1 text-[11px] font-bold text-cream backdrop-blur-md shadow-md">
          <span className="text-coral">★</span>
          <span className="tabular-nums">
            {(look.ratingAvg ?? 0) > 0 ? (look.ratingAvg ?? 0).toFixed(1) : "—"}
          </span>
          <span className="text-[10px] text-cream/50">({voteCountStr})</span>
        </div>

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-plum-deep/50 opacity-0 backdrop-blur-[2px] transition-opacity duration-150 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-cream px-3.5 py-1.5 text-xs font-bold text-plum-deep shadow-md">
            <Eye className="size-3.5" /> View Details
          </span>
        </div>
      </div>

      {/* Glass Bottom Bar */}
      <div className="p-2 space-y-2">
        {/* Row 1: Creator & Short Date */}
        <div className="flex items-center justify-between gap-1 min-w-0">
          <div className="flex min-w-0 items-center gap-1 truncate">
            <p className="truncate text-xs font-bold text-coral">{look.username || "@stylist"}</p>
            {isMine && (
              <span className="shrink-0 rounded-md bg-coral/20 px-1.5 py-0.5 text-[9px] font-bold text-coral">
                You
              </span>
            )}
          </div>
          <p className="shrink-0 text-[10px] text-cream/50 tabular-nums">
            {shortDateFormat.format(look.savedAt)}
          </p>
        </div>

        {/* Row 2: Star Rating & Voter Count */}
        <div
          className="flex items-center justify-between gap-1 border-t border-cream/10 pt-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            {isMine ? (
              <StarRating
                rating={Math.round(look.ratingAvg ?? 0)}
                readOnly
                size="sm"
              />
            ) : (
              <StarRating
                rating={look.rating ?? 0}
                onRatingChange={(r) => onRate(look.id, r)}
                size="sm"
              />
            )}
            <span className="text-[10px] font-semibold text-cream/60 tabular-nums">
              ({voteCountStr})
            </span>
          </div>
        </div>

        {/* Row 3: Action Buttons (Save IMG / Delete) stacked with flex-1 */}
        <div
          className="flex items-center gap-1.5 pt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => onDownload(look, e)}
            disabled={isDownloading}
            aria-label="Save image"
            className="flex h-7 flex-1 items-center justify-center rounded-xl border border-cream/20 bg-plum-deep/60 px-2 text-[11px] font-bold text-coral shadow-sm backdrop-blur-md transition-all hover:border-coral/40 hover:bg-plum-deep active:scale-95 disabled:opacity-50"
          >
            {isDownloading ? "..." : "Save IMG"}
          </button>
          {isMine && (
            <button
              type="button"
              onClick={(e) => onDelete(look.id, e)}
              aria-label="Delete outfit"
              className="flex h-7 flex-1 items-center justify-center rounded-xl border border-pink-neon/25 bg-plum-deep/60 px-2 text-[11px] font-bold text-pink-neon shadow-sm backdrop-blur-md transition-all hover:border-pink-neon/50 hover:bg-pink-neon/15 active:scale-95"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export const SubmissionCard = React.memo(SubmissionCardComponent);
