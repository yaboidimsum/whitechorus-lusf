import { CharacterId, CustomKaosData, SavedLook } from "./types";
import { characters, getCharacterBaseSrc, itemById, layerOrder } from "../data/characters";
import { sceneById } from "../data/assets";

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

function drawImageProp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  posX = 50,
  posY = 50,
  scale = 1
) {
  const iw = img.width;
  const ih = img.height;
  const s = Math.max(w / iw, h / ih);
  const bw = iw * s;
  const bh = ih * s;
  const shiftX = (posX - 50) * 0.008 * w;
  const shiftY = (posY - 50) * 0.008 * h;
  const finalW = bw * scale;
  const finalH = bh * scale;
  const drawX = x + w / 2 + shiftX - finalW / 2;
  const drawY = y + h / 2 + shiftY - finalH / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, drawX, drawY, finalW, finalH);
  ctx.restore();
}

function drawCustomKaos(
  ctx: CanvasRenderingContext2D,
  charId: CharacterId,
  kaosData: import("@/lib/types").CustomKaosData | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
  imgMap: Map<string, HTMLImageElement>
) {
  const baseMaskSrc = `/assets/lufs/characters/custom-kaos/base-kaos-${charId}.png`;
  const outlineSrc = `/assets/lufs/characters/custom-kaos/outline-kaos-${charId}.png`;
  const baseMaskImg = imgMap.get(baseMaskSrc);
  const outlineImg = imgMap.get(outlineSrc);

  if (!baseMaskImg) return;

  const offCanvas = document.createElement("canvas");
  offCanvas.width = 990;
  offCanvas.height = 1400;
  const offCtx = offCanvas.getContext("2d");
  if (!offCtx) return;

  // 1. Draw base silhouette
  offCtx.drawImage(baseMaskImg, 0, 0, 990, 1400);

  // 2. Fill with base fabric color inside the garment silhouette
  offCtx.globalCompositeOperation = "source-in";
  offCtx.fillStyle = kaosData?.color || "#ffffff";
  offCtx.fillRect(0, 0, 990, 1400);

  // 3. Draw artwork clipped to garment mask, layered on top of base fabric
  if (kaosData?.artworkSrc) {
    const artImg = imgMap.get(kaosData.artworkSrc);
    if (artImg) {
      const artCanvas = document.createElement("canvas");
      artCanvas.width = 990;
      artCanvas.height = 1400;
      const artCtx = artCanvas.getContext("2d");
      if (artCtx) {
        artCtx.drawImage(baseMaskImg, 0, 0, 990, 1400);
        artCtx.globalCompositeOperation = "source-in";
        artCtx.drawImage(artImg, 0, 0, 990, 1400);

        offCtx.globalCompositeOperation = "source-over";
        offCtx.drawImage(artCanvas, 0, 0, 990, 1400);
      }
    }
  }

  // 4. Draw fabric outlines, collar, and seams on top
  offCtx.globalCompositeOperation = "source-over";
  if (outlineImg) {
    offCtx.drawImage(outlineImg, 0, 0, 990, 1400);
  }

  // 5. Blit composite onto target canvas
  ctx.drawImage(offCanvas, x, y, w, h);
}

export async function downloadSavedLook(look: SavedLook): Promise<void> {
  const scene = sceneById.get(look.sceneId);
  const sceneSrc = look.customScene?.src || scene?.src;
  if (!sceneSrc) {
    throw new Error("Scene not found");
  }

  // 1. Gather all image sources to load in parallel
  const urls: string[] = [sceneSrc];

  const order = look.characterOrder ?? ["emir", "friska"];
  const orderedCharacters = order
    .map((id) => characters.find((c) => c.id === id)!)
    .filter(Boolean);

  const charLayers = orderedCharacters.map((c) => {
    const isCustomKaos = look.looks[c.id]?.top === `${c.id}-top-custom`;
    const worn = layerOrder
      .map((slot) => itemById.get(look.looks[c.id]?.[slot] ?? ""))
      .filter((item): item is NonNullable<typeof item> => item?.characterId === c.id);

    if (isCustomKaos) {
      urls.push(`/assets/lufs/characters/custom-kaos/base-kaos-${c.id}.png`);
      urls.push(`/assets/lufs/characters/custom-kaos/outline-kaos-${c.id}.png`);
      const art = look.customKaos?.[c.id]?.artworkSrc;
      if (art) urls.push(art);
    }

    return {
      c,
      isCustomKaos,
      baseSrc: getCharacterBaseSrc(c.id, look.looks[c.id]?.hair),
      wornSrcs: worn.filter((item) => item.src !== "custom").map((item) => item.src),
    };
  });

  charLayers.forEach((cl) => {
    urls.push(cl.baseSrc);
    cl.wornSrcs.forEach((src) => urls.push(src));
  });

  // 2. Load all images in parallel
  const imgMap = new Map<string, HTMLImageElement>();
  await Promise.all(
    urls.map(async (url) => {
      try {
        const img = await loadImage(url);
        imgMap.set(url, img);
      } catch (err) {
        console.error(`Failed to load image: ${url}`, err);
      }
    })
  );

  // 3. Create canvas and draw the scene
  const W = 1200;
  const H = 1500;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get 2D canvas context");
  }

  // Draw background scene with custom pan / scale offsets
  const sceneImg = imgMap.get(sceneSrc);
  if (sceneImg) {
    const posX = look.customScene?.posX ?? 50;
    const posY = look.customScene?.posY ?? 50;
    const scale = look.customScene?.scale ?? 1;
    drawImageProp(ctx, sceneImg, 0, 0, W, H, posX, posY, scale);
  } else {
    // Fallback if background fails to load
    ctx.fillStyle = "#241a25";
    ctx.fillRect(0, 0, W, H);
  }

  // Draw vignette overlay
  const grad = ctx.createRadialGradient(W / 2, H * 0.2, 0, W / 2, H * 0.2, Math.max(W, H) * 0.8);
  grad.addColorStop(0, "rgba(20, 8, 22, 0)");
  grad.addColorStop(0.55, "rgba(20, 8, 22, 0)");
  grad.addColorStop(1, "rgba(20, 8, 22, 0.55)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Draw characters
  const charWidth = 0.66 * W; // 792px
  const charHeight = (1400 / 990) * charWidth; // 1120px

  charLayers.forEach((cl) => {
    const slotIndex = order.indexOf(cl.c.id);
    const slot: "left" | "right" = slotIndex === 0 ? "left" : "right";
    const x =
      cl.c.id === "emir"
        ? (slot === "left" ? -0.1053 : 0.2247) * W
        : (slot === "left" ? 0.16 : 0.49) * W;
    const y = H - charHeight;

    // 1. Draw base character
    const baseImg = imgMap.get(cl.baseSrc);
    if (baseImg) {
      ctx.drawImage(baseImg, x, y, charWidth, charHeight);
    }

    // 2. Draw layers in strict stack order (shoes -> one-piece -> bottom -> top -> accessory)
    layerOrder.forEach((slot) => {
      if (slot === "hair") return;
      if (slot === "top" && cl.isCustomKaos) {
        drawCustomKaos(
          ctx,
          cl.c.id,
          look.customKaos?.[cl.c.id],
          x,
          y,
          charWidth,
          charHeight,
          imgMap
        );
      } else {
        const itemId = look.looks[cl.c.id]?.[slot];
        const item = itemId ? itemById.get(itemId) : undefined;
        if (item && item.characterId === cl.c.id && item.src !== "custom") {
          const layerImg = imgMap.get(item.src);
          if (layerImg) {
            ctx.drawImage(layerImg, x, y, charWidth, charHeight);
          }
        }
      }
    });
  });

  // 4. Trigger download
  const dateStr = new Date(look.savedAt).toISOString().split("T")[0];
  const filename = `white-chorus-outfit-${dateStr}-${look.id.slice(0, 6)}.png`;
  
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/** Render a 1080x1920 Instagram Story using public/insta-story-template.png */
export async function createInstagramStoryCanvas(look: SavedLook): Promise<HTMLCanvasElement> {
  const scene = sceneById.get(look.sceneId);
  const sceneSrc = look.customScene?.src || scene?.src;
  if (!sceneSrc) {
    throw new Error("Scene not found");
  }

  const templateSrc = "/insta-story-template.png";
  const urls: string[] = [templateSrc, sceneSrc];

  const order = look.characterOrder ?? ["emir", "friska"];
  const orderedCharacters = order
    .map((id) => characters.find((c) => c.id === id)!)
    .filter(Boolean);

  const charLayers = orderedCharacters.map((c) => {
    const isCustomKaos = look.looks[c.id]?.top === `${c.id}-top-custom`;
    const worn = layerOrder
      .map((slot) => itemById.get(look.looks[c.id]?.[slot] ?? ""))
      .filter((item): item is NonNullable<typeof item> => item?.characterId === c.id);

    if (isCustomKaos) {
      urls.push(`/assets/lufs/characters/custom-kaos/base-kaos-${c.id}.png`);
      urls.push(`/assets/lufs/characters/custom-kaos/outline-kaos-${c.id}.png`);
      const art = look.customKaos?.[c.id]?.artworkSrc;
      if (art) urls.push(art);
    }

    return {
      c,
      isCustomKaos,
      baseSrc: getCharacterBaseSrc(c.id, look.looks[c.id]?.hair),
      wornSrcs: worn.filter((item) => item.src !== "custom").map((item) => item.src),
    };
  });

  charLayers.forEach((cl) => {
    urls.push(cl.baseSrc);
    cl.wornSrcs.forEach((src) => urls.push(src));
  });

  const imgMap = new Map<string, HTMLImageElement>();
  await Promise.all(
    urls.map(async (url) => {
      try {
        const img = await loadImage(url);
        imgMap.set(url, img);
      } catch (err) {
        console.error(`Failed to load image for story: ${url}`, err);
      }
    })
  );

  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas 2D context");
  }

  // Canvas dimensions: 1080 x 1920
  const W = 1080;
  const H = 1920;

  // Template cutout viewport: x: 98, y: 332, width: 880, height: 1265
  const frameX = 98;
  const frameY = 332;
  const frameW = 880;
  const frameH = 1265;

  // 1. Draw Scene Background filling the empty space window with custom pan & zoom offsets
  const sceneImg = imgMap.get(sceneSrc);
  if (sceneImg) {
    const posX = look.customScene?.posX ?? 50;
    const posY = look.customScene?.posY ?? 50;
    const scale = look.customScene?.scale ?? 1;
    drawImageProp(ctx, sceneImg, frameX, frameY, frameW, frameH, posX, posY, scale);
  } else {
    ctx.fillStyle = "#241a25";
    ctx.fillRect(frameX, frameY, frameW, frameH);
  }

  // 2. Draw Vignette in the empty space window matching the stage
  const grad = ctx.createRadialGradient(
    frameX + frameW / 2,
    frameY + frameH * 0.2,
    0,
    frameX + frameW / 2,
    frameY + frameH * 0.2,
    Math.max(frameW, frameH) * 0.8
  );
  grad.addColorStop(0, "rgba(20, 8, 22, 0)");
  grad.addColorStop(0.55, "rgba(20, 8, 22, 0)");
  grad.addColorStop(1, "rgba(20, 8, 22, 0.55)");
  ctx.fillStyle = grad;
  ctx.fillRect(frameX, frameY, frameW, frameH);

  // 3. Draw Characters positioned and scaled matching the original 4:5 image, lifted slightly higher
  const charWidth = 0.66 * frameW; // 580.8px (matching original 66% width ratio)
  const charHeight = (1400 / 990) * charWidth; // 821.33px
  const y = frameY + frameH - charHeight - 65; // Lifted higher for balanced vertical composition

  charLayers.forEach((cl) => {
    const slotIndex = order.indexOf(cl.c.id);
    const slot: "left" | "right" = slotIndex === 0 ? "left" : "right";
    const x =
      frameX +
      (cl.c.id === "emir"
        ? (slot === "left" ? -0.1053 : 0.2247) * frameW
        : (slot === "left" ? 0.16 : 0.49) * frameW);

    // 1. Draw base character
    const baseImg = imgMap.get(cl.baseSrc);
    if (baseImg) {
      ctx.drawImage(baseImg, x, y, charWidth, charHeight);
    }

    // 2. Draw layers in strict stack order (shoes -> one-piece -> bottom -> top -> accessory)
    layerOrder.forEach((slot) => {
      if (slot === "hair") return;
      if (slot === "top" && cl.isCustomKaos) {
        drawCustomKaos(
          ctx,
          cl.c.id,
          look.customKaos?.[cl.c.id],
          x,
          y,
          charWidth,
          charHeight,
          imgMap
        );
      } else {
        const itemId = look.looks[cl.c.id]?.[slot];
        const item = itemId ? itemById.get(itemId) : undefined;
        if (item && item.characterId === cl.c.id && item.src !== "custom") {
          const layerImg = imgMap.get(item.src);
          if (layerImg) {
            ctx.drawImage(layerImg, x, y, charWidth, charHeight);
          }
        }
      }
    });
  });

  // 4. Draw Template Frame on top (overlaying on top of background & characters)
  const templateImg = imgMap.get(templateSrc);
  if (templateImg) {
    ctx.drawImage(templateImg, 0, 0, W, H);
  }

  return canvas;
}

export async function downloadInstagramStory(look: SavedLook): Promise<void> {
  const canvas = await createInstagramStoryCanvas(look);
  const dateStr = new Date(look.savedAt).toISOString().split("T")[0];
  const filename = `white-chorus-story-${dateStr}-${look.id.slice(0, 6)}.png`;
  
  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export type ShareResult = "shared" | "downloaded" | "cancelled";

export async function shareInstagramStory(look: SavedLook): Promise<ShareResult> {
  const canvas = await createInstagramStoryCanvas(look);
  const dateStr = new Date(look.savedAt).toISOString().split("T")[0];
  const filename = `white-chorus-story-${dateStr}-${look.id.slice(0, 6)}.png`;

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        await downloadInstagramStory(look);
        resolve("downloaded");
        return;
      }

      const file = new File([blob], filename, { type: "image/png" });

      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            files: [file],
            title: "White Chorus Outfit",
            text: getStoryShareCaption(look.username),
          });
          resolve("shared");
          return;
        } catch (err: any) {
          // If the user cancelled the native share sheet, do not trigger fallback download
          if (err?.name === "AbortError") {
            resolve("cancelled");
            return;
          }
          console.warn("Native share error, falling back to download", err);
        }
      }

      // Fallback: download file
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      resolve("downloaded");
    }, "image/png");
  });
}

/** Check if current browser supports native file sharing (Web Share API Level 2) */
export function canNativeShareFiles(): boolean {
  if (typeof navigator === "undefined" || !navigator.canShare) return false;
  try {
    const dummyFile = new File([""], "dummy.png", { type: "image/png" });
    return navigator.canShare({ files: [dummyFile] });
  } catch {
    return false;
  }
}

/** Open Instagram Stories camera directly via deep link, falling back to profile/web */
export function openInstagramStoryCamera(): void {
  if (typeof window === "undefined") return;
  
  // Try deep link to Instagram camera
  const deepLink = "instagram://story-camera";
  const webFallback = "https://instagram.com";

  const start = Date.now();
  window.location.href = deepLink;

  // Fallback to web if app doesn't open within 1.5s
  setTimeout(() => {
    if (Date.now() - start < 2000 && document.hasFocus()) {
      window.open(webFallback, "_blank");
    }
  }, 1500);
}

/** Pre-formatted caption and tags for fans tagging White Chorus on Instagram */
export function getStoryShareCaption(username?: string): string {
  const author = username || "@stylist";
  return `Styled Emir & Friska on the @whitechorus dress-up stage! ✨ #WhiteChorus #LUFS #LimboAfterGlow #WhiteChorusDressUp`;
}
