"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Camera,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createInstagramStoryCanvas,
  downloadInstagramStory,
  shareInstagramStory,
  openInstagramStoryCamera,
  getStoryShareCaption,
  canNativeShareFiles,
} from "@/lib/export";
import type { SavedLook } from "@/lib/types";

interface InstagramStoryShareModalProps {
  look: SavedLook | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InstagramStoryShareModal({
  look,
  isOpen,
  onClose,
}: InstagramStoryShareModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const isNativeShareSupported = typeof window !== "undefined" && canNativeShareFiles();

  // Generate 9:16 Canvas Preview Data URL when modal opens
  useEffect(() => {
    if (!isOpen || !look) {
      setPreviewUrl(null);
      return;
    }

    let isSubscribed = true;
    setGenerating(true);

    createInstagramStoryCanvas(look)
      .then((canvas) => {
        if (isSubscribed) {
          setPreviewUrl(canvas.toDataURL("image/png"));
          setGenerating(false);
        }
      })
      .catch((err) => {
        console.error("Failed to generate story preview canvas", err);
        if (isSubscribed) setGenerating(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, look]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!look) return null;

  const captionText = getStoryShareCaption(look.username);

  const handleCopyTag = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setCopied(true);
      toast.success("Copied @whitechorus tags to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    const toastId = toast.loading("Downloading 1080×1920 Story PNG...");
    try {
      await downloadInstagramStory(look);
      toast.success("Story image saved to Photos/Downloads!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Download failed.", { id: toastId });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    const toastId = toast.loading("Opening Story sharing...");
    try {
      const shared = await shareInstagramStory(look);
      if (shared) {
        toast.success("Share sheet opened!", { id: toastId });
      } else {
        toast.success("Story PNG downloaded! Select it in Instagram.", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Share failed.", { id: toastId });
    } finally {
      setSharing(false);
    }
  };

  const handleOpenInstagramApp = () => {
    toast("Opening Instagram...", { duration: 1500 });
    openInstagramStoryCamera();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          key="instagram-story-modal-root"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
        >
          {/* Backdrop */}
          <motion.div
            key="story-modal-backdrop"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-plum-deep/85 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            key="story-modal-container"
            role="dialog"
            aria-modal="true"
            aria-label="Instagram Story Sharing Guide"
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, scale: 0.94, y: 12 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              shouldReduceMotion
                ? undefined
                : { opacity: 0, scale: 0.94, y: 12, transition: { duration: 0.15 } }
            }
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cream/20 bg-plum/70 p-4 shadow-[0_24px_64px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)_inset] backdrop-blur-2xl sm:p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cream/10 pb-3 sm:pb-4">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-coral/20 text-coral">
                  <Camera className="size-4" />
                </div>
                <div>
                  <h3 className="font-display text-base tracking-normal text-cream sm:text-lg">
                    Instagram Story Share
                  </h3>
                  <p className="text-xs text-cream/60">
                    Official 9:16 Afterglow Story Template (1080 × 1920)
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="flex size-9 items-center justify-center rounded-2xl border border-cream/15 bg-cream/5 text-cream/80 backdrop-blur-md transition-colors hover:border-cream/40 hover:bg-cream/15 hover:text-cream active:scale-95 sm:size-10"
              >
                <X className="size-4 sm:size-5" />
              </button>
            </div>

            {/* Content: 2 Columns on Tablet/Desktop */}
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[200px_1fr] sm:gap-6">
              {/* Left Column: Live 9:16 Story Template Preview */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative aspect-[9/16] w-full max-w-[200px] overflow-hidden rounded-2xl border-2 border-cream/20 shadow-2xl bg-plum-deep/80">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Story preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center text-xs text-cream/50">
                      <Sparkles className="size-6 animate-pulse text-coral mb-2" />
                      {generating ? "Rendering 9:16 story..." : "Loading preview..."}
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 rounded-full bg-plum-deep/80 px-2 py-0.5 text-[9px] font-bold text-cream backdrop-blur-md">
                    1080 × 1920
                  </span>
                </div>
              </div>

              {/* Right Column: Step-by-Step Guidance & Actions */}
              <div className="space-y-4">
                {/* Visual Step Cards */}
                <div className="space-y-2.5">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 rounded-2xl border border-cream/10 bg-plum-deep/40 p-3 backdrop-blur-md">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-coral/20 text-xs font-bold text-coral">
                      1
                    </span>
                    <div className="text-xs">
                      <p className="font-bold text-cream">Save the 9:16 Template</p>
                      <p className="text-cream/60">
                        High-resolution ready-to-post template composited with your styling.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 rounded-2xl border border-cream/10 bg-plum-deep/40 p-3 backdrop-blur-md">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-coral/20 text-xs font-bold text-coral">
                      2
                    </span>
                    <div className="text-xs">
                      <p className="font-bold text-cream">Open Instagram Story Camera</p>
                      <p className="text-cream/60">
                        Select the saved image from your gallery in the Story editor.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3 rounded-2xl border border-coral/30 bg-coral/10 p-3 backdrop-blur-md">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-coral text-xs font-bold text-plum-deep">
                      3
                    </span>
                    <div className="text-xs">
                      <p className="font-bold text-coral">Tag @whitechorus to get reposted</p>
                      <p className="text-cream/70">
                        Tag the band in your story for a chance to be featured on their official account!
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1-Tap Copy Tag Bar */}
                <div className="flex items-center justify-between gap-2 rounded-2xl border border-cream/15 bg-plum-deep/60 p-2.5 backdrop-blur-md">
                  <div className="flex items-center gap-2 truncate text-xs font-mono text-coral pl-1">
                    <Tag className="size-3.5 shrink-0" />
                    <span className="truncate">@whitechorus #LUFS #WhiteChorusDressUp</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyTag}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-cream/20 bg-plum/60 px-3 py-1.5 text-xs font-bold text-cream shadow-sm backdrop-blur-md transition-all hover:border-cream/40 hover:bg-plum/90 active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-coral" />
                        <span>Copy Tag</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-1">
                  {/* Primary Action: Open Instagram App */}
                  <Button
                    variant="coral"
                    onClick={handleOpenInstagramApp}
                    className="w-full text-xs font-bold shadow-[0_4px_16px_rgba(255,154,131,0.3)]"
                  >
                    <ExternalLink className="size-4" />
                    Open Instagram App
                  </Button>

                  {/* Secondary Action: Save Story Image */}
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full text-xs font-bold"
                  >
                    <Download className="size-4 text-coral" />
                    {downloading ? "Saving..." : "Save Story Image"}
                  </Button>
                </div>

                {/* Native share sheet trigger if supported */}
                {isNativeShareSupported && (
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleShare}
                      disabled={sharing}
                      className="text-[11px] font-semibold text-coral underline hover:text-coral/80"
                    >
                      {sharing ? "Opening..." : "Or open via System Share Sheet"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
