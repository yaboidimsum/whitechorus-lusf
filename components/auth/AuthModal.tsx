"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import { X, Sparkles, LogIn, UserPlus, Mail, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/use-user";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { isAnonymous, signInWithGoogle, signInWithPassword, signUpWithPassword, linkPermanentAccount } = useUser();
  const [mode, setMode] = useState<"signin" | "signup">(isAnonymous ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in email and password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        if (isAnonymous) {
          const { error } = await linkPermanentAccount(email, password, username || undefined);
          if (error) throw error;
          toast.success("Account connected! Your outfits are now permanently saved.");
        } else {
          const { error } = await signUpWithPassword(email, password, username || email.split("@")[0]);
          if (error) throw error;
          toast.success("Account created successfully!");
        }
      } else {
        const { error } = await signInWithPassword(email, password);
        if (error) throw error;
        toast.success("Signed in successfully!");
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const res = await signInWithGoogle();
      if (res?.error) {
        toast.error(res.error.message || "Google Sign-In failed. Please check if Google provider is enabled in your Supabase Dashboard.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to initialize Google Sign In");
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
          className="relative z-10 flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-cream/20 bg-plum/80 p-5 shadow-2xl backdrop-blur-2xl sm:p-7"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cream/10 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-coral" />
              <h2 className="text-base font-bold text-cream sm:text-lg">
                {isAnonymous ? "Save Your Outfits" : mode === "signin" ? "Stylist Sign In" : "Create Stylist Account"}
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

          {/* Mode Switcher Tabs */}
          <div className="mt-5 grid grid-cols-2 gap-1 rounded-full border border-cream/20 bg-plum-deep/60 p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition-all ${
                mode === "signin"
                  ? "bg-coral text-plum-deep shadow-md"
                  : "text-cream/80 hover:text-cream"
              }`}
            >
              <LogIn className="size-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition-all ${
                mode === "signup"
                  ? "bg-coral text-plum-deep shadow-md"
                  : "text-cream/80 hover:text-cream"
              }`}
            >
              <UserPlus className="size-3.5" />
              <span>{isAnonymous ? "Link Account" : "Sign Up"}</span>
            </button>
          </div>

          {/* Google OAuth Button */}
          <div className="mt-5">
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="flex w-full min-h-[44px] items-center justify-center gap-2.5 rounded-2xl border border-cream/25 bg-cream/5 px-4 py-2.5 text-xs font-bold text-cream shadow-sm backdrop-blur-md transition-all hover:border-cream/40 hover:bg-cream/15 active:scale-[0.99]"
            >
              <svg className="size-4" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="h-[1px] w-full bg-cream/10" />
            <span className="absolute bg-plum px-3 text-[11px] font-semibold text-cream/40">
              or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {mode === "signup" && (
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-cream/40" />
                <Input
                  type="text"
                  placeholder="Stylist Handle (e.g. fashion_lover)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 text-xs"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-cream/40" />
              <Input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 text-xs"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-cream/40" />
              <Input
                type="password"
                placeholder="Password (min 6 characters)"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 text-xs"
              />
            </div>

            <Button
              type="submit"
              variant="coral"
              disabled={loading}
              className="mt-2 w-full text-xs font-bold"
            >
              {loading ? "Processing..." : mode === "signin" ? "Sign In to White Chorus" : "Create Account & Save Looks"}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
