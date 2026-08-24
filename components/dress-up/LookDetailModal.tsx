"use client";

import { useEffect, useState } from "react";
import { X, Download, Share2, Trash2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { characters, itemById, layerOrder } from "@/data/characters";
import { sceneById } from "@/data/assets";
import { downloadSavedLook, shareInstagramStory } from "@/lib/export";
import { isLookAuthor } from "@/lib/looks";
import { formatCount } from "@/lib/utils";
import type { SavedLook } from "@/lib/types";
import LookPreview from "./LookPreview";
import StarRating from "./StarRating";
import InstagramStoryShareModal from "./InstagramStoryShareModal";

interface LookDetailModalProps {
  look: SavedLook | null;
  currentUserId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRate?: (lookId: string, rating: number) => void;
  onDelete?: (lookId: string) => void;
}

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function LookDetailModal({
  look,
  currentUserId,
  isOpen,
  onClose,
  onRate,
  onDelete,
}: LookDetailModalProps) {
  const [downloadingImg, setDownloadingImg] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [sharingStory, setSharingStory] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!look) return null;

  const isMine = isLookAuthor(look, currentUserId);
  const scene = sceneById.get(look.sceneId);

  const handleDownloadImg = async () => {
    if (downloadingImg) return;
    setDownloadingImg(true);
    const toastId = toast.loading("Generating high-resolution PNG...");
    try {
      await downloadSavedLook(look);
      toast.success("Outfit image downloaded!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to download image.", { id: toastId });
    } finally {
      setDownloadingImg(false);
    }
  };

  const handleShareStory = async () => {
    if (sharingStory) return;
    setSharingStory(true);
    const toastId = toast.loading("Opening system share sheet...");
    try {
      const result = await shareInstagramStory(look);
      if (result === "shared") {
        toast.success("Ready to share!", { id: toastId });
      } else if (result === "downloaded") {
        toast.success("Story template saved! Opening guide...", { id: toastId });
        setShowStoryModal(true);
      } else {
        toast.dismiss(toastId);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to open share sheet.", { id: toastId });
      setShowStoryModal(true);
    } finally {
      setSharingStory(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            key="look-detail-modal-root"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
          >
            {/* Backdrop blur */}
            <motion.div
              key="look-detail-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="absolute inset-0 bg-plum-deep/80 backdrop-blur-md"
            />

            {/* Dialog Container */}
            <motion.div
              key="look-detail-dialog"
              role="dialog"
              aria-modal="true"
              aria-label={`Outfit preview by ${look.username ?? "Stylist"}`}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: 15 }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.95, y: 15 }
              }
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-cream/20 bg-plum/60 p-4 shadow-[0_24px_64px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)_inset] backdrop-blur-2xl sm:p-6"
            >
              {/* Header with Creator & Close Button */}
              <div className="flex items-center justify-between border-b border-cream/10 pb-3 sm:pb-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-coral sm:text-base">
                      {look.username || "@stylist"}
                    </span>
                    {isMine && (
                      <span className="rounded-md bg-coral/20 px-1.5 py-0.5 text-[10px] font-bold tracking-normal text-coral">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-cream/50 tabular-nums">
                    Added on {dateTimeFormat.format(look.savedAt)}
                  </p>
                </div>

                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="flex size-9 items-center justify-center rounded-2xl border border-cream/15 bg-cream/5 text-cream/80 backdrop-blur-md transition-colors hover:border-cream/40 hover:bg-cream/15 hover:text-cream active:scale-95 sm:size-10"
                >
                  <X className="size-4 sm:size-5" />
                </button>
              </div>

              {/* Stage Preview */}
              <div className="mt-4 overflow-hidden rounded-2xl border border-cream/15 bg-plum-deep/40 shadow-inner backdrop-blur-md">
                <LookPreview look={look} />
              </div>

              {/* Rating Section in Frosted Glass Card */}
              <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-cream/15 bg-plum-deep/60 p-3.5 shadow-sm backdrop-blur-md sm:flex-row">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-cream tabular-nums">
                      ★ {(look.ratingAvg ?? 0) > 0 ? (look.ratingAvg ?? 0).toFixed(1) : "—"}
                    </span>
                    <span className="text-xs text-cream/50 tabular-nums">
                      ({formatCount(look.ratingsCount ?? 0)} {look.ratingsCount === 1 ? "vote" : "votes"})
                    </span>
                  </div>
                  <p className="text-[11px] text-cream/60">
                    {isMine
                      ? "Community rating"
                      : look.rating && look.rating > 0
                      ? `Your rating: ${look.rating} stars`
                      : "Tap to rate this look"}
                  </p>
                </div>
                <StarRating
                  rating={isMine ? Math.round(look.ratingAvg ?? 0) : (look.rating ?? 0)}
                  onRatingChange={(r) => onRate?.(look.id, r)}
                  readOnly={isMine}
                  size="lg"
                />
              </div>

              {/* Wardrobe Breakdown */}
              <div className="mt-4 space-y-2 rounded-2xl border border-cream/10 bg-plum-deep/30 p-3.5 text-xs backdrop-blur-sm">
                <div className="flex justify-between border-b border-cream/10 pb-1.5">
                  <span className="text-cream/60">Stage Scene:</span>
                  <span className="font-semibold text-cream">{scene?.name ?? "Dance Floor"}</span>
                </div>
                {characters.map((c) => {
                  const wornItems = layerOrder
                    .map((slot) => itemById.get(look.looks[c.id]?.[slot] ?? ""))
                    .filter((item): item is NonNullable<typeof item> => item?.characterId === c.id);

                  return (
                    <div key={c.id} className="flex flex-col gap-0.5">
                      <span className="font-bold text-coral">{c.name}:</span>
                      <p className="text-cream/80">
                        {wornItems.length > 0
                          ? wornItems.map((item) => item.name).join(" · ")
                          : "Base styling"}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Button
                  variant="coral"
                  onClick={handleShareStory}
                  disabled={sharingStory}
                  className="w-full text-xs font-bold shadow-[0_4px_16px_rgba(255,154,131,0.25)]"
                >
                  <Share2 className="size-4" />
                  {sharingStory ? "Opening Share..." : "Share Outfit"}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleDownloadImg}
                  disabled={downloadingImg}
                  className="w-full border-cream/20 bg-cream/5 text-xs font-bold backdrop-blur-md hover:bg-cream/10"
                >
                  <Download className="size-4" />
                  {downloadingImg ? "Exporting..." : "Download PNG"}
                </Button>
              </div>

              {isMine && onDelete && (
                <div className="mt-3 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(look.id);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-pink-neon/25 bg-plum-deep/60 px-4 py-2 text-xs font-bold text-pink-neon/90 shadow-sm backdrop-blur-md transition-all hover:border-pink-neon/50 hover:bg-pink-neon/15 active:scale-95"
                  >
                    <Trash2 className="size-3.5" />
                    Delete outfit from gallery
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Guided Instagram Story Share Modal (rendered in its own top-level portal/fragment) */}
      <InstagramStoryShareModal
        look={look}
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
      />
    </>
  );
}
