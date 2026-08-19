"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore, useState, useMemo, useCallback, useDeferredValue, Suspense } from "react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { Share2, Download, Sparkles, Plus, Eye, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { characters } from "@/data/characters";
import {
  deleteLook,
  getLooksSnapshot,
  getServerLooksSnapshot,
  isMyLook,
  rateLook,
  restoreLook,
  subscribeLooks,
} from "@/lib/looks";
import type { SavedLook } from "@/lib/types";
import { downloadSavedLook, shareInstagramStory } from "@/lib/export";
import { formatCount } from "@/lib/utils";
import LookPreview from "./LookPreview";
import LookDetailModal from "./LookDetailModal";
import StarRating from "./StarRating";
import { SubmissionCard } from "./SubmissionCard";
import InstagramStoryShareModal from "./InstagramStoryShareModal";

const PAGE_SIZE = 9;
const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const sortOptions = [
  { value: "recent", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "rating-high", label: "Highest Rated (5★ → 1★)" },
  { value: "rating-low", label: "Lowest Rated (1★ → 5★)" },
];

function HallOfFameContent({ variant = "full" }: { variant?: "full" | "preview" }) {
  const searchParams = useSearchParams();
  const justSavedId = searchParams.get("justSaved");

  const savedLooks = useSyncExternalStore(
    subscribeLooks,
    getLooksSnapshot,
    getServerLooksSnapshot,
  );
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const [sortBy, setSortBy] = useState("recent");
  const [announcement, setAnnouncement] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [selectedModalLook, setSelectedModalLook] = useState<SavedLook | null>(null);
  const [storyModalLook, setStoryModalLook] = useState<SavedLook | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Reset page when search or sort changes
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(0);
  };

  // Determine if the current user has uploaded their own outfits
  const myLooks = useMemo(() => {
    return savedLooks.filter((l) => isMyLook(l.id));
  }, [savedLooks]);

  const hasUserUploaded = myLooks.length > 0;

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setPage(0);
  };

  const filteredAndSortedLooks = useMemo(() => {
    let list = [...savedLooks];

    // If current user hasn't uploaded any outfit, only show outfits uploaded by people (exclude demo looks)
    if (!hasUserUploaded) {
      list = list.filter((item) => !item.demo);
    }

    // Filter by username search (using deferredSearchQuery for smooth typing)
    if (deferredSearchQuery.trim()) {
      const q = deferredSearchQuery.trim().toLowerCase();
      list = list.filter((item) => (item.username || "").toLowerCase().includes(q));
    }

    // Sort list
    list.sort((a, b) => {
      if (sortBy === "recent") {
        return b.savedAt - a.savedAt;
      }
      if (sortBy === "oldest") {
        return a.savedAt - b.savedAt;
      }
      if (sortBy === "rating-high") {
        const rateA = a.ratingAvg ?? a.rating ?? 0;
        const rateB = b.ratingAvg ?? b.rating ?? 0;
        if (rateB !== rateA) return rateB - rateA;
        return b.savedAt - a.savedAt;
      }
      if (sortBy === "rating-low") {
        const rateA = a.ratingAvg ?? a.rating ?? 0;
        const rateB = b.ratingAvg ?? b.rating ?? 0;
        if (rateA !== rateB) return rateA - rateB;
        return b.savedAt - a.savedAt;
      }
      return b.savedAt - a.savedAt;
    });

    return list;
  }, [savedLooks, deferredSearchQuery, sortBy, hasUserUploaded]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedLooks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageLooks = filteredAndSortedLooks.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );
  const previewLooks = savedLooks.slice(-3).reverse();

  // Find spotlight look: ONLY displayed if the current user has uploaded their own outfit.
  // If the current user has not uploaded any outfit, spotlightLook is null (TOP SHOW is empty).
  const userNewestLook = hasUserUploaded ? myLooks[myLooks.length - 1] : null;

  const spotlightLook = hasUserUploaded
    ? (justSavedId ? myLooks.find((s) => s.id === justSavedId) : null) ?? userNewestLook
    : null;
  const isSpotlightMine = spotlightLook ? isMyLook(spotlightLook.id) : false;

  const handleDelete = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isMyLook(id)) {
      toast.error("You can only delete your own outfits!");
      return;
    }
    const target = savedLooks.find((s) => s.id === id);
    if (!target) return;
    const success = deleteLook(id);
    if (success) {
      setSelectedModalLook((prev) => (prev?.id === id ? null : prev));
      setAnnouncement("Outfit deleted.");
      toast("Outfit deleted from Hall of Fame", {
        action: {
          label: "Undo",
          onClick: () => {
            restoreLook(target);
            setAnnouncement("Outfit restored.");
            toast.success("Outfit restored");
          },
        },
      });
    }
  }, [savedLooks]);

  const handleDownload = useCallback(async (s: SavedLook, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (downloadingId) return;
    setDownloadingId(s.id);
    const toastId = toast.loading("Generating your high-resolution download...");
    try {
      await downloadSavedLook(s);
      toast.success("Outfit downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate download.", { id: toastId });
    } finally {
      setDownloadingId(null);
    }
  }, [downloadingId]);

  const handleShareStory = useCallback(
    async (s: SavedLook, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (sharingId) return;
      setSharingId(s.id);
      const toastId = toast.loading("Opening system share sheet...");
      try {
        const result = await shareInstagramStory(s);
        if (result === "shared") {
          toast.success("Shared successfully!", { id: toastId });
        } else if (result === "downloaded") {
          toast.success("Story image saved! Opening share guide...", { id: toastId });
          setStoryModalLook(s);
        } else {
          toast.dismiss(toastId);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to open share sheet.", { id: toastId });
        setStoryModalLook(s);
      } finally {
        setSharingId(null);
      }
    },
    [sharingId]
  );

  const handleRate = useCallback((id: string, rating: number) => {
    if (isMyLook(id)) {
      toast.error("You cannot vote on your own outfit!");
      return;
    }
    const success = rateLook(id, rating);
    if (success) {
      setSelectedModalLook((prev) => (prev?.id === id ? { ...prev, rating } : prev));
      toast.success(`Rated ${rating} star${rating > 1 ? "s" : ""}!`);
    }
  }, []);

  return (
    <div>
      <p role="status" className="sr-only">
        {announcement}
      </p>

      {/* Floating Detail Modal */}
      <LookDetailModal
        look={selectedModalLook}
        isOpen={!!selectedModalLook}
        onClose={() => setSelectedModalLook(null)}
        onRate={handleRate}
        onDelete={handleDelete}
      />

      {/* Guided Instagram Story Share Modal */}
      <InstagramStoryShareModal
        look={storyModalLook}
        isOpen={!!storyModalLook}
        onClose={() => setStoryModalLook(null)}
      />

      {variant === "preview" ? (
        <div className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-normal uppercase leading-none tracking-wide text-cream sm:text-3xl">
                Hall of Fame
              </h2>
              <p className="mt-2 max-w-md text-pretty text-sm text-cream/65">
                Saved community and official looks, stored in your browser.
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/hall-of-fame">
                View all
              </Link>
            </Button>
          </div>
          {savedLooks.length > 0 ? (
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previewLooks.map((look) => (
                <SubmissionCard
                  key={look.id}
                  look={look}
                  isDownloading={downloadingId === look.id}
                  onOpenModal={setSelectedModalLook}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  onRate={handleRate}
                />
              ))}
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
            <div className="space-y-12">
              {/* TOP MIDDLE SPOTLIGHT / RECENT SUBMISSION HERO */}
              {spotlightLook && (
                <section aria-label="Spotlight submission" className="mx-auto w-full max-w-xl text-center">
                  <div className="relative">
                    {/* Badge */}
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/15 px-4 py-1.5 text-xs font-bold tracking-normal text-coral">
                      <Sparkles className="size-3.5" />
                      {justSavedId === spotlightLook.id
                        ? "🎉 Successfully Published to Hall of Fame!"
                        : "✨ Your Spotlight Submission"}
                    </div>

                    {/* Stage Preview Container */}
                    <div
                      onClick={() => setSelectedModalLook(spotlightLook)}
                      className="group relative mx-auto max-w-sm cursor-pointer overflow-hidden rounded-3xl border border-cream/20 shadow-stage transition-transform duration-200 hover:scale-[1.01]"
                    >
                      <LookPreview look={spotlightLook} />
                      <div className="absolute inset-0 flex items-center justify-center bg-plum-deep/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                        <span className="flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-xs font-bold text-plum-deep shadow-lg">
                          <Eye className="size-4" />
                          Open Full Preview
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Interactive Rating */}
                    <div className="mt-4 flex flex-col items-center justify-between gap-3 border-b border-cream/15 pb-4 sm:flex-row">
                      <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                          <p className="text-sm font-bold text-coral sm:text-base">
                            {spotlightLook.username || "@stylist"}
                          </p>
                          {isSpotlightMine && (
                            <span className="rounded-md bg-coral/20 px-1.5 py-0.5 text-[10px] font-bold tracking-normal text-coral">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-cream/60 tabular-nums">
                          {dateTimeFormat.format(spotlightLook.savedAt)} · {characters.map((c) => c.name).join(" & ")}
                        </p>
                      </div>

                      <div className="flex flex-col items-center sm:items-end">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-cream tabular-nums">
                            ★ {(spotlightLook.ratingAvg ?? 0) > 0 ? (spotlightLook.ratingAvg ?? 0).toFixed(1) : "—"}
                          </span>
                          <span className="text-xs text-cream/60 tabular-nums">
                            ({formatCount(spotlightLook.ratingsCount ?? 0)} {spotlightLook.ratingsCount === 1 ? "vote" : "votes"})
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          {isSpotlightMine ? (
                            <StarRating
                              rating={Math.round(spotlightLook.ratingAvg ?? 0)}
                              readOnly
                              size="md"
                            />
                          ) : (
                            <>
                              <span className="text-[11px] text-cream/70">
                                {spotlightLook.rating && spotlightLook.rating > 0 ? "Your rating:" : "Rate:"}
                              </span>
                              <StarRating
                                rating={spotlightLook.rating ?? 0}
                                onRatingChange={(r) => handleRate(spotlightLook.id, r)}
                                size="md"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      {/* Primary Share Action */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleShareStory(spotlightLook)}
                        disabled={sharingId === spotlightLook.id}
                        className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-coral px-4 py-2.5 text-xs font-bold text-plum-deep shadow-[0_4px_16px_rgba(255,154,131,0.3)] transition-all hover:bg-coral/95 hover:shadow-[0_6px_22px_rgba(255,154,131,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral/40 disabled:opacity-50"
                      >
                        <Share2 className="size-4 shrink-0" />
                        <span className="truncate">{sharingId === spotlightLook.id ? "Opening Share Sheet..." : "Share Outfit"}</span>
                      </motion.button>

                      {/* Download Action */}
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleDownload(spotlightLook)}
                        disabled={downloadingId === spotlightLook.id}
                        className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-cream/20 bg-plum/60 px-4 py-2.5 text-xs font-bold text-cream shadow-sm backdrop-blur-md transition-all hover:border-cream/40 hover:bg-plum/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/30 disabled:opacity-50"
                      >
                        <Download className="size-4 shrink-0 text-coral" />
                        <span className="truncate">{downloadingId === spotlightLook.id ? "Exporting..." : "Download PNG"}</span>
                      </motion.button>

                      {/* Style Another Link */}
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        <Link
                          href="/"
                          className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-cream/20 bg-plum/60 px-4 py-2.5 text-xs font-bold text-cream/90 shadow-sm backdrop-blur-md transition-all hover:border-cream/40 hover:bg-plum/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/30"
                        >
                          <Plus className="size-4 shrink-0 text-pink-neon" />
                          <span className="truncate">Style Another</span>
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </section>
              )}

              {/* BOTTOM SECTION: ALL EXISTING SUBMISSIONS */}
              <section aria-label="All submissions">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-2xl uppercase tracking-wide text-cream">
                      All Submissions
                    </h2>
                    <p className="text-xs text-cream/60">
                      Browse, search, and rate outfits created by the community.
                    </p>
                  </div>
                  <span className="self-start rounded-full border border-cream/15 bg-cream/5 px-3 py-1 text-xs font-bold text-cream/80 sm:self-auto">
                    {filteredAndSortedLooks.length} {filteredAndSortedLooks.length === 1 ? "Outfit" : "Outfits"}
                  </span>
                </div>

                {/* SEARCH, FILTER & SORT CONTROL BAR */}
                <div className="relative z-30 mb-6 rounded-3xl border border-cream/15 bg-plum/30 p-3.5 shadow-sm backdrop-blur-md sm:p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
                    {/* Username Search Input */}
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-cream/40" />
                      <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by creator (e.g. @whitechorus)..."
                        className="pl-10 pr-9"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => handleSearchChange("")}
                          aria-label="Clear search"
                          className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-xl border border-cream/15 bg-cream/5 text-cream/60 transition-colors hover:border-cream/30 hover:bg-cream/15 hover:text-cream"
                        >
                          <X className="size-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Sort Order Select */}
                    <div>
                      <Select
                        value={sortBy}
                        onChange={handleSortChange}
                        options={sortOptions}
                        aria-label="Sort submissions"
                      />
                    </div>
                  </div>

                  {searchQuery && (
                    <div className="mt-3 flex items-center justify-between border-t border-cream/10 pt-2.5 text-xs text-cream/60">
                      <p>
                        Showing matches for &ldquo;<span className="font-semibold text-coral">{searchQuery}</span>&rdquo;
                      </p>
                      <button
                        onClick={() => handleSearchChange("")}
                        className="rounded-xl border border-coral/30 bg-coral/10 px-2.5 py-1 text-xs font-bold text-coral transition-colors hover:bg-coral/20"
                      >
                        Reset search
                      </button>
                    </div>
                  )}
                </div>

                {/* Submissions Grid or Empty Filter State */}
                {filteredAndSortedLooks.length > 0 ? (
                  <>
                    <motion.div
                      key={`${safePage}_${sortBy}`}
                      initial={shouldReduceMotion ? false : { opacity: 0.75 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5">
                        {pageLooks.map((look) => (
                          <SubmissionCard
                            key={look.id}
                            look={look}
                            isDownloading={downloadingId === look.id}
                            onOpenModal={setSelectedModalLook}
                            onDownload={handleDownload}
                            onDelete={handleDelete}
                            onRate={handleRate}
                          />
                        ))}
                      </ul>
                    </motion.div>

                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-center gap-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(0, p - 1))}
                          disabled={safePage === 0}
                        >
                          Prev
                        </Button>
                        <span className="text-sm text-cream/60 tabular-nums">
                          Page {safePage + 1} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                          disabled={safePage === totalPages - 1}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-3xl border border-dashed border-cream/20 bg-plum/20 p-10 text-center backdrop-blur-sm">
                    <p className="text-sm text-cream/80">
                      No submissions found matching your search.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setSortBy("recent");
                        setPage(0);
                      }}
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-cream/25 p-12 text-center">
              <p className="text-base text-cream/80">
                No outfits in the Hall of Fame yet.
              </p>
              <Button variant="coral" size="lg" asChild className="mt-4">
                <Link href="/">Dress Emir & Friska</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HallOfFame({ variant = "full" }: { variant?: "full" | "preview" }) {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-cream/60">Loading Hall of Fame...</div>}>
      <HallOfFameContent variant={variant} />
    </Suspense>
  );
}
