"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore, useState, useMemo, useCallback, useDeferredValue, useEffect, Suspense } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { Share2, Download, Sparkles, Plus, Eye, Search, X, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { characters } from "@/data/characters";
import {
  deleteLook,
  getLooksSnapshot,
  getServerLooksSnapshot,
  isLookAuthor,
  rateLook,
  restoreLook,
  subscribeLooks,
  syncRemoteLooks,
} from "@/lib/looks";
import { useUser } from "@/hooks/use-user";
import type { SavedLook } from "@/lib/types";
import { downloadSavedLook, shareInstagramStory } from "@/lib/export";
import { formatCount } from "@/lib/utils";
import LookPreview from "./LookPreview";
import LookDetailModal from "./LookDetailModal";
import StarRating from "./StarRating";
import { SubmissionCard } from "./SubmissionCard";
import InstagramStoryShareModal from "./InstagramStoryShareModal";
import AuthModal from "@/components/auth/AuthModal";

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
  const { user } = useUser();

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Reset page when search or sort changes
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(0);
  };

  const [spotlightIdx, setSpotlightIdx] = useState(0);

  // Sync with Supabase Postgres on mount
  useEffect(() => {
    syncRemoteLooks();
  }, []);

  // Determine if the current user has uploaded their own outfits
  const myLooks = useMemo(() => {
    return savedLooks.filter((l) => isLookAuthor(l, user?.id));
  }, [savedLooks, user?.id]);

  const hasUserUploaded = myLooks.length > 0;

  // Sync spotlightIdx when myLooks updates or justSavedId is provided
  useEffect(() => {
    if (justSavedId && myLooks.length > 0) {
      const idx = myLooks.findIndex((l) => l.id === justSavedId);
      if (idx !== -1) {
        setSpotlightIdx(idx);
        return;
      }
    }
    if (spotlightIdx >= myLooks.length && myLooks.length > 0) {
      setSpotlightIdx(myLooks.length - 1);
    }
  }, [myLooks, justSavedId, spotlightIdx]);

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
  // Supports sliding across multiple user outfits
  const spotlightLook = hasUserUploaded
    ? myLooks[Math.max(0, Math.min(myLooks.length - 1, spotlightIdx))] ?? myLooks[0]
    : null;
  const isSpotlightMine = spotlightLook ? isLookAuthor(spotlightLook, user?.id) : false;

  const handleDelete = useCallback(async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = savedLooks.find((s) => s.id === id);
    if (!target || !isLookAuthor(target, user?.id)) {
      toast.error("You can only delete your own outfits!");
      return;
    }
    const success = await deleteLook(id, user?.id);
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
  }, [savedLooks, user?.id]);

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

  const handleRate = useCallback(async (id: string, rating: number) => {
    if (!user) {
      toast.error("Please sign in to rate outfits!");
      setShowAuthModal(true);
      return;
    }
    const target = savedLooks.find((s) => s.id === id);
    if (isLookAuthor(target, user?.id)) {
      toast.error("You cannot vote on your own outfit!");
      return;
    }
    const success = await rateLook(id, rating, user?.id);
    if (success) {
      setSelectedModalLook((prev) => (prev?.id === id ? { ...prev, rating } : prev));
      toast.success(`Rated ${rating} star${rating > 1 ? "s" : ""}!`);
    }
  }, [savedLooks, user]);

  return (
    <div>
      <p role="status" className="sr-only">
        {announcement}
      </p>

      {/* Floating Detail Modal */}
      <LookDetailModal
        look={selectedModalLook}
        currentUserId={user?.id}
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

      {/* Stylist Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
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
                  currentUserId={user?.id}
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
                    {/* Header Row: Badge & Version Controls */}
                    <div className="mb-4 flex flex-wrap items-center justify-center gap-2.5">
                      <div className="inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/15 px-4 py-1.5 text-xs font-bold tracking-normal text-coral">
                        <Sparkles className="size-3.5" />
                        {justSavedId === spotlightLook.id
                          ? "🎉 Successfully Published to Hall of Fame!"
                          : myLooks.length > 1
                          ? "✨ Your Outfits Spotlight"
                          : "✨ Your Spotlight Submission"}
                      </div>

                      {/* Multi-Outfit Carousel Navigation Header */}
                      {myLooks.length > 1 && (
                        <div className="flex items-center gap-1.5 rounded-full border border-cream/20 bg-plum-deep/90 px-2 py-1 shadow-md backdrop-blur-md">
                          <button
                            type="button"
                            onClick={() => setSpotlightIdx((prev) => (prev > 0 ? prev - 1 : myLooks.length - 1))}
                            className="flex size-6 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20 hover:text-coral active:scale-90"
                            aria-label="Previous outfit version"
                          >
                            <ChevronLeft className="size-3.5" />
                          </button>
                          <span className="px-1.5 text-[11px] font-bold text-coral">
                            {spotlightIdx + 1} / {myLooks.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSpotlightIdx((prev) => (prev < myLooks.length - 1 ? prev + 1 : 0))}
                            className="flex size-6 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors hover:bg-cream/20 hover:text-coral active:scale-90"
                            aria-label="Next outfit version"
                          >
                            <ChevronRight className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stage Preview Container with Smooth Slide Transition */}
                    <div className="relative mx-auto max-w-sm">
                      {/* Left / Right Carousel Overlay Arrows on Desktop */}
                      {myLooks.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSpotlightIdx((prev) => (prev > 0 ? prev - 1 : myLooks.length - 1))}
                            className="absolute -left-12 top-1/2 z-20 hidden -translate-y-1/2 sm:flex size-9 items-center justify-center rounded-full border border-cream/20 bg-plum-deep/85 text-cream shadow-lg backdrop-blur-md transition-transform hover:scale-110 hover:border-coral hover:text-coral active:scale-95"
                            aria-label="Previous look"
                          >
                            <ChevronLeft className="size-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSpotlightIdx((prev) => (prev < myLooks.length - 1 ? prev + 1 : 0))}
                            className="absolute -right-12 top-1/2 z-20 hidden -translate-y-1/2 sm:flex size-9 items-center justify-center rounded-full border border-cream/20 bg-plum-deep/85 text-cream shadow-lg backdrop-blur-md transition-transform hover:scale-110 hover:border-coral hover:text-coral active:scale-95"
                            aria-label="Next look"
                          >
                            <ChevronRight className="size-5" />
                          </button>
                        </>
                      )}

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={spotlightLook.id}
                          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setSelectedModalLook(spotlightLook)}
                          className="group relative cursor-pointer overflow-hidden rounded-3xl border border-cream/20 shadow-stage transition-transform duration-200 hover:scale-[1.01]"
                        >
                          <LookPreview look={spotlightLook} />
                          <div className="absolute inset-0 flex items-center justify-center bg-plum-deep/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                            <span className="flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-xs font-bold text-plum-deep shadow-lg">
                              <Eye className="size-4" />
                              Open Full Preview
                            </span>
                          </div>
                        </motion.div>
                      </AnimatePresence>

                      {/* Dot Slide Indicators */}
                      {myLooks.length > 1 && (
                        <div className="mt-3 flex items-center justify-center gap-1.5">
                          {myLooks.map((l, idx) => (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => setSpotlightIdx(idx)}
                              aria-label={`Slide to outfit ${idx + 1}`}
                              className={`h-2 rounded-full transition-all duration-200 ${
                                idx === spotlightIdx
                                  ? "w-6 bg-coral shadow-[0_0_8px_rgba(255,154,131,0.6)]"
                                  : "w-2 bg-cream/25 hover:bg-cream/50"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Metadata & Interactive Rating */}
                    <div className="mt-4 flex flex-col items-center justify-between gap-3 border-b border-cream/15 pb-4 sm:flex-row">
                      <div className="text-center sm:text-left">
                        <div className="flex items-center justify-center gap-1.5 sm:justify-start">
                          <p className="text-sm font-bold text-coral sm:text-base">
                            {spotlightLook.title ? spotlightLook.title : spotlightLook.username || "@stylist"}
                          </p>
                          {spotlightLook.title && (
                            <span className="text-xs text-cream/60">
                              by {spotlightLook.username}
                            </span>
                          )}
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
                            currentUserId={user?.id}
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
