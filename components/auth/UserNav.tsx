"use client";

import { useState } from "react";
import { LogIn, LogOut, User as UserIcon, Sparkles } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import AuthModal from "./AuthModal";

export default function UserNav() {
  const { user, profile, isAnonymous, isLoading, signOut } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (isLoading) {
    return (
      <div className="h-9 w-24 animate-pulse rounded-full bg-cream/10" />
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {user && profile ? (
          <div className="flex items-center gap-2 rounded-full border border-cream/20 bg-plum/60 py-1 pl-1.5 pr-3 text-xs font-bold text-cream backdrop-blur-md">
            <div className="flex size-7 items-center justify-center rounded-full bg-coral/20 text-coral">
              <UserIcon className="size-3.5" />
            </div>
            <span className="max-w-[120px] truncate text-coral">
              @{profile.username}
            </span>
            <button
              type="button"
              onClick={signOut}
              title="Sign Out"
              className="ml-1 flex size-6 items-center justify-center rounded-full text-cream/50 transition-colors hover:bg-cream/10 hover:text-cream"
            >
              <LogOut className="size-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAuthModal(true)}
            className="flex items-center gap-1.5 rounded-full border border-coral/40 bg-gradient-to-r from-coral/20 via-coral/30 to-coral/20 px-3.5 py-1.5 text-xs font-bold text-coral shadow-sm backdrop-blur-md transition-all hover:bg-coral hover:text-plum-deep"
          >
            <Sparkles className="size-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
