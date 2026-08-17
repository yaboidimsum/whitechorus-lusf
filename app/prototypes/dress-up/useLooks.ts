"use client";

import { useState } from "react";
import { toast } from "sonner";
import { saveLook } from "@/lib/looks";
import type { CharacterId, Look, SlotId } from "@/lib/types";

/** Prototype-local dress-up state shared by all variants, plus a save() that
 *  writes to the production looks:v2 store and confirms with a Sonner toast. */
export function useLooks() {
  const [activeId, setActiveId] = useState<CharacterId>("emir");
  const [looks, setLooks] = useState<Record<CharacterId, Look>>({ emir: {}, friska: {} });
  const [sceneId, setSceneId] = useState("dance-floor");
  const [saving, setSaving] = useState(false);

  const toggleItem = (slot: SlotId, itemId: string) => {
    setLooks((prev) => {
      const current = prev[activeId];
      const next: Look = { ...current };
      if (next[slot] === itemId) delete next[slot];
      else next[slot] = itemId;
      return { ...prev, [activeId]: next };
    });
  };

  const hasSelection = Object.values(looks).some((l) => Object.keys(l).length > 0);

  const save = () => {
    if (!hasSelection) return;
    setSaving(true);
    saveLook(looks, sceneId);
    // Keep the button disabled for a beat so double-taps can't duplicate the save.
    window.setTimeout(() => setSaving(false), 400);
    toast.success("Outfit saved to the Hall of Fame");
  };

  return { activeId, setActiveId, looks, toggleItem, sceneId, setSceneId, save, saving, hasSelection };
}
