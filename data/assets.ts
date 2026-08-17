import type { Scene } from "@/lib/types";

/** Typed asset manifest for the L.U.F.S. dress-up asset pack. */
export const scenes: Scene[] = [
  {
    id: "dance-floor",
    name: "Dance Floor",
    src: "/assets/lufs/scenes/dance-floor.jpg",
  },
  {
    id: "stage",
    name: "Stage",
    src: "/assets/lufs/scenes/stage.jpg",
  },
];

export const sceneById = new Map(scenes.map((s) => [s.id, s]));

export const branding = {
  signage: {
    src: "/assets/lufs/branding/dress-up-machine-signage.png",
    /** Square source; content is centered with transparency. */
    width: 1200,
    height: 1200,
  },
};

/** 9:16 frame used for generated shareables. */
export const shareFrame = {
  src: "/assets/lufs/sharing/frame.png",
  width: 405,
  height: 720,
};
