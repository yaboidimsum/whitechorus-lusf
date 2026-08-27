"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { X, Sparkles } from "lucide-react";
import { useUser } from "@/hooks/use-user";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { isAnonymous, signInWithGoogle } = useUser();
  const [isConnecting, setIsConnecting] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleGoogleAuth = async () => {
    setIsConnecting(true);
    try {
      const res = await signInWithGoogle();
      if (res?.error) {
        toast.error(
          res.error.message ||
            "Google Sign-In failed. Please check if Google provider is enabled in your Supabase Dashboard."
        );
        setIsConnecting(false);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to initialize Google Sign In");
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        key="auth-modal-root"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      >
        {/* Backdrop */}
        <motion.div
          key="auth-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-plum-deep/85 backdrop-blur-md"
        />

        {/* Dialog Container */}
        <motion.div
          key="auth-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Stylist Account"
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
          className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-cream/20 bg-plum/85 p-6 shadow-2xl backdrop-blur-2xl sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cream/10 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-coral" />
              <h2 className="text-base font-bold text-cream sm:text-lg">
                {isAnonymous ? "Save Your Outfits" : "Stylist Sign In"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-cream/10 text-cream/70 transition-colors hover:bg-cream/20 hover:text-cream"
              aria-label="Close authentication modal"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="mt-5 text-center sm:text-left">
            <p className="text-sm leading-relaxed text-cream/80 text-pretty">
              Sign in with your Google account to save your styled outfits, publish looks to the Hall of Fame, and rate creations from the community.
            </p>
          </div>

          {/* Google OAuth Button */}
          <div className="mt-6">
            <motion.button
              type="button"
              whileHover={shouldReduceMotion || isConnecting ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion || isConnecting ? undefined : { scale: 0.98 }}
              onClick={handleGoogleAuth}
              disabled={isConnecting}
              className="flex min-h-[48px] w-full items-center justify-center gap-3 rounded-2xl border border-cream/25 bg-cream/10 px-5 py-3 text-xs sm:text-sm font-bold text-cream shadow-sm backdrop-blur-md transition-all hover:border-coral/50 hover:bg-cream/15 active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>{isConnecting ? "Connecting to Google..." : "Continue with Google"}</span>
            </motion.button>
          </div>

          {/* Footer Note */}
          <div className="mt-5 rounded-2xl border border-cream/10 bg-plum-deep/50 p-3 text-center text-xs text-cream/60">
            🔒 <span>Quick & secure 1-click login · No password required</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
