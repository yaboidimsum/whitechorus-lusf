"use client";

import { useState } from "react";
import type { CharacterId, Look, SlotId } from "@/lib/types";

/** Prototype-local dress-up state shared by all variants. */
export function useLooks() {
  const [activeId, setActiveId] = useState<CharacterId>("emir");
  const [looks, setLooks] = useState<Record<CharacterId, Look>>({ emir: {}, friska: {} });
  const [sceneId, setSceneId] = useState("dance-floor");

  const toggleItem = (slot: SlotId, itemId: string) => {
    setLooks((prev) => {
      const current = prev[activeId];
      const next: Look = { ...current };
      if (next[slot] === itemId) delete next[slot];
      else next[slot] = itemId;
      return { ...prev, [activeId]: next };
    });
  };

  return { activeId, setActiveId, looks, toggleItem, sceneId, setSceneId };
}
