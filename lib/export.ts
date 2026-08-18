import { SavedLook } from "./types";
import { characters, itemById, layerOrder } from "../data/characters";
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
  offsetX = 0.5,
  offsetY = 0.5
) {
  const iw = img.width;
  const ih = img.height;
  const r = Math.min(w / iw, h / ih);
  let nw = iw * r;
  let nh = ih * r;
  let cx = 0;
  let cy = 0;
  let cw = iw;
  let ch = ih;

  if (nw < w) {
    const r2 = w / nw;
    nw = w;
    nh = nh * r2;
  }
  if (nh < h) {
    const r2 = h / nh;
    nh = h;
    nw = nw * r2;
  }

  cx = (iw - (w / nw) * iw) * offsetX;
  cy = (ih - (h / nh) * ih) * offsetY;
  cw = (w / nw) * iw;
  ch = (h / nh) * ih;

  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

export async function downloadSavedLook(look: SavedLook): Promise<void> {
  const scene = sceneById.get(look.sceneId);
  if (!scene) {
    throw new Error("Scene not found");
  }

  // 1. Gather all image sources to load in parallel
  const urls: string[] = [scene.src];

  const charLayers = characters.map((c) => {
    const worn = layerOrder
      .map((slot) => itemById.get(look.looks[c.id]?.[slot] ?? ""))
      .filter((item): item is NonNullable<typeof item> => item?.characterId === c.id);

    return {
      c,
      baseSrc: c.baseSrc,
      wornSrcs: worn.map((item) => item.src),
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

  // Draw background scene
  const sceneImg = imgMap.get(scene.src);
  if (sceneImg) {
    drawImageProp(ctx, sceneImg, 0, 0, W, H);
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
  const overlap = 0.08 * W; // 96px
  const totalWidth = charWidth * 2 - overlap; // 1488px
  const startX = (W - totalWidth) / 2; // -144px

  charLayers.forEach((cl, index) => {
    const x = startX + index * (charWidth - overlap);
    const y = H - charHeight;

    // Draw base
    const baseImg = imgMap.get(cl.baseSrc);
    if (baseImg) {
      ctx.drawImage(baseImg, x, y, charWidth, charHeight);
    }

    // Draw worn clothing/accessory layers
    cl.wornSrcs.forEach((src) => {
      const layerImg = imgMap.get(src);
      if (layerImg) {
        ctx.drawImage(layerImg, x, y, charWidth, charHeight);
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
  if (!scene) {
    throw new Error("Scene not found");
  }

  const templateSrc = "/insta-story-template.png";
  const urls: string[] = [templateSrc, scene.src];

  const charLayers = characters.map((c) => {
    const worn = layerOrder
      .map((slot) => itemById.get(look.looks[c.id]?.[slot] ?? ""))
      .filter((item): item is NonNullable<typeof item> => item?.characterId === c.id);

    return {
      c,
      baseSrc: c.baseSrc,
      wornSrcs: worn.map((item) => item.src),
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

  // Viewport inside template: x: 97, y: 331, width: 880, height: 1173
  const frameX = 97;
  const frameY = 331;
  const frameW = 880;
  const frameH = 1173;

  ctx.save();
  ctx.beginPath();
  ctx.rect(frameX, frameY, frameW, frameH);
  ctx.clip();

  // 1. Draw Scene Background in the viewport
  const sceneImg = imgMap.get(scene.src);
  if (sceneImg) {
    drawImageProp(ctx, sceneImg, frameX, frameY, frameW, frameH);
  } else {
    ctx.fillStyle = "#241a25";
    ctx.fillRect(frameX, frameY, frameW, frameH);
  }

  // 2. Draw Vignette in the viewport
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

  // 3. Draw Characters inside viewport
  const charWidth = 0.66 * frameW; // 580.8px
  const charHeight = (1400 / 990) * charWidth; // 821.3px
  const overlap = 0.08 * frameW; // 70.4px
  const totalWidth = charWidth * 2 - overlap; // 1091.2px
  const startX = frameX + (frameW - totalWidth) / 2; // -8.6px

  charLayers.forEach((cl, index) => {
    const x = startX + index * (charWidth - overlap);
    const y = frameY + frameH - charHeight;

    const baseImg = imgMap.get(cl.baseSrc);
    if (baseImg) {
      ctx.drawImage(baseImg, x, y, charWidth, charHeight);
    }

    cl.wornSrcs.forEach((src) => {
      const layerImg = imgMap.get(src);
      if (layerImg) {
        ctx.drawImage(layerImg, x, y, charWidth, charHeight);
      }
    });
  });

  ctx.restore();

  // 4. Draw Template Frame on top
  const templateImg = imgMap.get(templateSrc);
  if (templateImg) {
    ctx.drawImage(templateImg, 0, 0, 1080, 1920);
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

export async function shareInstagramStory(look: SavedLook): Promise<boolean> {
  const canvas = await createInstagramStoryCanvas(look);
  const dateStr = new Date(look.savedAt).toISOString().split("T")[0];
  const filename = `white-chorus-story-${dateStr}-${look.id.slice(0, 6)}.png`;

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        await downloadInstagramStory(look);
        resolve(false);
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
            text: "Styled Emir & Friska for the Jakarta afterglow #WhiteChorus #LUFS",
          });
          resolve(true);
          return;
        } catch {
          // User cancelled or share failed, fallback to download
        }
      }

      // Fallback: download file
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      resolve(false);
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
