"use client";

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAnonymous: boolean;
}

let globalState: AuthState = {
  user: null,
  profile: null,
  isLoading: true,
  isAnonymous: false,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function updateGlobalState(partial: Partial<AuthState>) {
  globalState = { ...globalState, ...partial };
  notify();
}

let authInitialized = false;

async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = createBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }
  return data;
}

async function initAuth() {
  if (authInitialized) return;
  authInitialized = true;

  const supabase = createBrowserClient();
  if (!supabase) {
    updateGlobalState({ isLoading: false });
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      updateGlobalState({
        user: session.user,
        profile,
        isAnonymous: session.user.is_anonymous || false,
        isLoading: false,
      });
    } else {
      updateGlobalState({
        user: null,
        profile: null,
        isAnonymous: false,
        isLoading: false,
      });
    }

    // Subscribe to auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        updateGlobalState({
          user: session.user,
          profile,
          isAnonymous: session.user.is_anonymous || false,
          isLoading: false,
        });
      } else {
        updateGlobalState({
          user: null,
          profile: null,
          isAnonymous: false,
          isLoading: false,
        });
      }
    });
  } catch (err) {
    console.warn("Auth initialization error:", err);
    updateGlobalState({ isLoading: false });
  }
}

const SERVER_AUTH_SNAPSHOT: AuthState = {
  user: null,
  profile: null,
  isLoading: true,
  isAnonymous: false,
};

function getServerAuthSnapshot(): AuthState {
  return SERVER_AUTH_SNAPSHOT;
}

function getAuthSnapshot(): AuthState {
  return globalState;
}

export function useUser() {
  useEffect(() => {
    initAuth();
  }, []);

  const state = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    getAuthSnapshot,
    getServerAuthSnapshot
  );

  const supabase = createBrowserClient();

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: new Error("Supabase client not available") };
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  }, [supabase]);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: new Error("Supabase client not available") };
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error && data.user) {
        const profile = await fetchProfile(data.user.id);
        updateGlobalState({ user: data.user, profile, isAnonymous: false });
      }
      return { error };
    },
    [supabase]
  );

  const signUpWithPassword = useCallback(
    async (email: string, password: string, username: string) => {
      if (!supabase) return { error: new Error("Supabase client not available") };
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_name: username,
            name: username,
          },
        },
      });
      if (!error && data.user) {
        const profile = await fetchProfile(data.user.id);
        updateGlobalState({ user: data.user, profile, isAnonymous: false });
      }
      return { error };
    },
    [supabase]
  );

  const linkPermanentAccount = useCallback(
    async (email: string, password: string, username?: string) => {
      if (!supabase) return { error: new Error("Supabase client not available") };
      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
        data: username ? { user_name: username, name: username } : undefined,
      });
      if (!error && data.user) {
        const profile = await fetchProfile(data.user.id);
        updateGlobalState({ user: data.user, profile, isAnonymous: false });
      }
      return { error };
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    updateGlobalState({ user: null, profile: null, isAnonymous: false });
    // Re-sign-in anonymously for continued browsing
    await supabase.auth.signInAnonymously();
  }, [supabase]);

  return {
    user: state.user,
    profile: state.profile,
    isLoading: state.isLoading,
    isAnonymous: state.isAnonymous,
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword,
    linkPermanentAccount,
    signOut,
  };
}
