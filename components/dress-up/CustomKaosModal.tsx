"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import {
  X,
  Upload,
  Paintbrush,
  Palette,
  Eraser,
  Undo2,
  Trash2,
  ZoomIn,
  Move,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressImageFile } from "@/lib/image-compress";
import type { CharacterId, CustomKaosData } from "@/lib/types";

interface CustomKaosModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: CharacterId;
  characterName: string;
  initialData?: CustomKaosData;
  onApply: (data: CustomKaosData) => void;
}

const PRESET_COLORS = [
  "#ffffff", // Clean White
  "#19151c", // Deep Charcoal
  "#ff9a83", // Band Coral
  "#4ef2d2", // Neon Cyan
  "#f0ff52", // Acid Yellow
  "#d4b2d8", // L.U.F.S. Lilac
  "#ff3b77", // Hot Magenta
  "#60a5fa", // Electric Blue
  "#22c55e", // Toxic Mint
];

export default function CustomKaosModal({
  isOpen,
  onClose,
  characterId,
  characterName,
  initialData,
  onApply,
}: CustomKaosModalProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<"pattern" | "paint" | "color">(
    initialData?.mode || "paint"
  );

  // Pattern upload state
  const [patternSrc, setPatternSrc] = useState<string>(
    initialData?.editorPatternSrc || (initialData?.mode === "pattern" ? initialData.artworkSrc || "" : "")
  );
  const [posX, setPosX] = useState<number>(initialData?.posX ?? 50);
  const [posY, setPosY] = useState<number>(initialData?.posY ?? 50);
  const [scale, setScale] = useState<number>(initialData?.scale ?? 1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paint studio state
  const [selectedColor, setSelectedColor] = useState<string>("#ff9a83");
  const [brushSize, setBrushSize] = useState<number>(12);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Solid color mode
  const [bgColor, setBgColor] = useState<string>(
    initialData?.color || "#ffffff"
  );

  // Tight, close-up 600x600 editor assets
  const editorBaseMaskSrc = `/assets/lufs/characters/custom-kaos/editor-base-${characterId}.png`;
  const editorOutlineSrc = `/assets/lufs/characters/custom-kaos/editor-outline-${characterId}.png`;

  // Initialize paint canvas with existing artwork if mode was paint
  useEffect(() => {
    if (!isOpen) return;
    const existingDrawing = initialData?.editorArtworkSrc || (initialData?.mode === "paint" ? initialData.artworkSrc : undefined);
    if (initialData?.mode === "paint" && existingDrawing) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        saveHistoryState();
      };
      img.src = existingDrawing;
    }
  }, [isOpen, initialData]);

  // Helper to push history state for undo
  const saveHistoryState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), imgData]);
  }, []);

  const handleUndo = () => {
    if (history.length <= 1) {
      handleClearCanvas();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const nextHistory = [...history];
    nextHistory.pop(); // Remove current
    const previousState = nextHistory[nextHistory.length - 1];
    setHistory(nextHistory);
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
    }
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  };

  // Drawing event handlers with touch & mouse support
  const getCanvasCoordinates = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const pt = getCanvasCoordinates(e);
    lastPointRef.current = pt;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = selectedColor;
    }
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pt = getCanvasCoordinates(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (isEraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = selectedColor;
    }

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();

    lastPointRef.current = pt;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    saveHistoryState();
  };

  // Upload pattern file handler
  const handleUploadPattern = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      toast.loading("Optimizing pattern...", { id: "compress-kaos" });
      const compressed = await compressImageFile(file, 1200, 0.85);
      setPatternSrc(compressed);
      setActiveTab("pattern");
      toast.success("Pattern loaded! Pan and zoom below.", { id: "compress-kaos" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to load image", { id: "compress-kaos" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Project 600x600 editor artwork onto 990x1400 full character layer
  const projectToFullCanvas = async (
    source: HTMLCanvasElement | string,
    isPattern = false
  ): Promise<string> => {
    return new Promise((resolve) => {
      const fullCanvas = document.createElement("canvas");
      fullCanvas.width = 990;
      fullCanvas.height = 1400;
      const ctx = fullCanvas.getContext("2d");
      if (!ctx) {
        resolve("");
        return;
      }

      // Exact pixel-aligned bounding boxes
      // Emir: x: 468, y: 302, size: 389
      // Friska: x: 80, y: 366, size: 315
      const box =
        characterId === "emir"
          ? { x: 468, y: 302, size: 389 }
          : { x: 80, y: 366, size: 315 };

      if (source instanceof HTMLCanvasElement) {
        ctx.drawImage(source, box.x, box.y, box.size, box.size);
        resolve(fullCanvas.toDataURL("image/png"));
      } else {
        const img = new Image();
        img.onload = () => {
          if (isPattern) {
            // Draw pattern in 600x600 space with exact cover + pan and scale
            const off = document.createElement("canvas");
            off.width = 600;
            off.height = 600;
            const offCtx = off.getContext("2d");
            if (offCtx) {
              const iw = img.naturalWidth || img.width;
              const ih = img.naturalHeight || img.height;
              const baseScale = Math.max(600 / iw, 600 / ih);
              const finalW = iw * baseScale * scale;
              const finalH = ih * baseScale * scale;
              const x = 300 + ((posX - 50) / 100) * 600 - finalW / 2;
              const y = 300 + ((posY - 50) / 100) * 600 - finalH / 2;
              offCtx.drawImage(img, x, y, finalW, finalH);
              ctx.drawImage(off, box.x, box.y, box.size, box.size);
            }
          } else {
            ctx.drawImage(img, box.x, box.y, box.size, box.size);
          }
          resolve(fullCanvas.toDataURL("image/png"));
        };
        img.src = source;
      }
    });
  };

  // Submit and export current design
  const handleApply = async () => {
    let finalData: CustomKaosData;

    if (activeTab === "pattern") {
      if (!patternSrc) {
        toast.error("Please upload an image pattern first.");
        return;
      }
      toast.loading("Projecting pattern to stage...", { id: "apply-kaos" });
      const projected = await projectToFullCanvas(patternSrc, true);
      finalData = {
        mode: "pattern",
        artworkSrc: projected,
        editorPatternSrc: patternSrc,
        color: bgColor,
        posX,
        posY,
        scale,
      };
      toast.dismiss("apply-kaos");
    } else if (activeTab === "paint") {
      const canvas = canvasRef.current;
      const editorPaintData = canvas ? canvas.toDataURL("image/png") : undefined;
      let projected: string | undefined = undefined;
      if (canvas) {
        toast.loading("Projecting painting to stage...", { id: "apply-kaos" });
        projected = await projectToFullCanvas(canvas, false);
        toast.dismiss("apply-kaos");
      }
      finalData = {
        mode: "paint",
        artworkSrc: projected,
        editorArtworkSrc: editorPaintData,
        color: bgColor,
      };
    } else {
      finalData = {
        mode: "color",
        color: bgColor,
      };
    }

    onApply(finalData);
    toast.success(`Custom Kaos applied to ${characterName}!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        key="custom-kaos-modal-root"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      >
        {/* Backdrop */}
        <motion.div
          key="custom-kaos-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-plum-deep/85 backdrop-blur-md"
        />

        {/* Dialog Container */}
        <motion.div
          key="custom-kaos-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={`Custom Kaos Studio for ${characterName}`}
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
          className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-cream/20 bg-plum/70 shadow-2xl backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cream/10 px-5 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-coral" />
              <h2 className="text-base font-bold text-cream sm:text-lg">
                Custom Kaos Studio — {characterName}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-cream/10 text-cream/70 transition-colors hover:bg-cream/20 hover:text-cream"
              aria-label="Close custom kaos studio"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadPattern}
          />

          {/* Body: Two columns on desktop */}
          <div className="grid flex-1 overflow-y-auto p-4 sm:p-6 md:grid-cols-[300px_1fr] md:gap-6">
            {/* Left Column: Tightly Cropped Full-Bleed T-Shirt Preview Stage */}
            <div className="flex flex-col items-center justify-center">
              <span className="mb-2 text-xs font-bold text-cream/70">
                Live T-Shirt Mask Preview
              </span>
              <div className="relative aspect-square w-full max-w-[270px] sm:max-w-[300px] overflow-hidden rounded-2xl border border-cream/15 bg-plum-deep/80 p-1 shadow-inner">
                {/* Background Color Fill */}
                <div
                  className="absolute inset-0 transition-colors duration-150"
                  style={{
                    backgroundColor: bgColor,
                    maskImage: `url(${editorBaseMaskSrc})`,
                    WebkitMaskImage: `url(${editorBaseMaskSrc})`,
                    maskSize: "100% 100%",
                    WebkitMaskSize: "100% 100%",
                  }}
                />

                {/* Pattern Artwork Masked Layer (Inside Static Mask Container) */}
                {activeTab === "pattern" && patternSrc && (
                  <div
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                    style={{
                      maskImage: `url(${editorBaseMaskSrc})`,
                      WebkitMaskImage: `url(${editorBaseMaskSrc})`,
                      maskSize: "100% 100%",
                      WebkitMaskSize: "100% 100%",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={patternSrc}
                      alt="Custom Pattern"
                      className="absolute inset-0 h-full w-full object-cover origin-center select-none"
                      style={{
                        transform: `translate3d(${posX - 50}%, ${posY - 50}%, 0) scale(${scale})`,
                      }}
                    />
                  </div>
                )}

                {/* Paint Artwork Live Overlay Layer */}
                {activeTab === "paint" && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      maskImage: `url(${editorBaseMaskSrc})`,
                      WebkitMaskImage: `url(${editorBaseMaskSrc})`,
                      maskSize: "100% 100%",
                      WebkitMaskSize: "100% 100%",
                    }}
                  >
                    {/* Live Paint Mirror */}
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={600}
                      className="h-full w-full object-contain pointer-events-auto touch-none cursor-crosshair"
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                    />
                  </div>
                )}

                {/* Fabric Outlines, Collar & Seams Layer */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editorOutlineSrc}
                  alt="Fabric Outline"
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none opacity-90"
                />
              </div>

              {/* Shirt Base Color Picker Pill Row */}
              <div className="mt-3 flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-semibold text-cream/60">
                  Shirt Fabric Base Color
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBgColor(c)}
                      className={`size-6 rounded-full border transition-all ${
                        bgColor === c
                          ? "border-coral ring-2 ring-coral scale-110"
                          : "border-cream/20 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Select base color ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Customization Controls */}
            <div className="mt-4 flex flex-col gap-4 md:mt-0">
              {/* Mode Selector Tabs */}
              <div className="grid grid-cols-3 gap-1 rounded-full border border-cream/20 bg-plum-deep/60 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("paint")}
                  className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition-all ${
                    activeTab === "paint"
                      ? "bg-coral text-plum-deep shadow-md"
                      : "text-cream/80 hover:text-cream"
                  }`}
                >
                  <Paintbrush className="size-3.5" />
                  <span>Paint & Draw</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("pattern")}
                  className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition-all ${
                    activeTab === "pattern"
                      ? "bg-coral text-plum-deep shadow-md"
                      : "text-cream/80 hover:text-cream"
                  }`}
                >
                  <Upload className="size-3.5" />
                  <span>Pattern Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("color")}
                  className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition-all ${
                    activeTab === "color"
                      ? "bg-coral text-plum-deep shadow-md"
                      : "text-cream/80 hover:text-cream"
                  }`}
                >
                  <Palette className="size-3.5" />
                  <span>Solid Color</span>
                </button>
              </div>

              {/* Tab 1: Paint & Doodle Studio Controls */}
              {activeTab === "paint" && (
                <div className="flex flex-col gap-3 rounded-2xl border border-cream/15 bg-plum-deep/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cream">
                      Paint Palette & Tools
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleUndo}
                        className="flex items-center gap-1 rounded-lg border border-cream/15 bg-cream/5 px-2 py-1 text-xs text-cream/80 transition-colors hover:bg-cream/15"
                        title="Undo stroke"
                      >
                        <Undo2 className="size-3" />
                        <span>Undo</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClearCanvas}
                        className="flex items-center gap-1 rounded-lg border border-cream/15 bg-cream/5 px-2 py-1 text-xs text-coral transition-colors hover:bg-coral/15"
                        title="Clear drawing"
                      >
                        <Trash2 className="size-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Color Swatches */}
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setSelectedColor(c);
                          setIsEraser(false);
                        }}
                        className={`size-7 rounded-full border transition-all ${
                          selectedColor === c && !isEraser
                            ? "border-coral ring-2 ring-coral scale-110"
                            : "border-cream/20 hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={`Select brush color ${c}`}
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsEraser(true)}
                      className={`flex size-7 items-center justify-center rounded-full border transition-all ${
                        isEraser
                          ? "border-coral bg-coral text-plum-deep ring-2 ring-coral"
                          : "border-cream/20 bg-cream/10 text-cream/70 hover:text-cream"
                      }`}
                      title="Eraser"
                    >
                      <Eraser className="size-3.5" />
                    </button>
                  </div>

                  {/* Brush Size Slider */}
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs font-semibold text-cream/70">
                      Brush Size:
                    </span>
                    <input
                      type="range"
                      min="3"
                      max="36"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-cream/20 accent-coral"
                    />
                    <span className="w-8 text-right text-xs font-bold text-cream">
                      {brushSize}px
                    </span>
                  </div>

                  <p className="text-[11px] text-cream/60">
                    💡 <strong>Tip:</strong> Draw or doodle directly inside the live t-shirt preview on the left!
                  </p>
                </div>
              )}

              {/* Tab 2: Pattern Upload & Position Controls */}
              {activeTab === "pattern" && (
                <div className="flex flex-col gap-3 rounded-2xl border border-cream/15 bg-plum-deep/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cream">
                      Image Pattern
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 gap-1 text-xs"
                    >
                      <Upload className="size-3.5" />
                      <span>{patternSrc ? "Change Pattern" : "Upload Image"}</span>
                    </Button>
                  </div>

                  {patternSrc ? (
                    <div className="flex flex-col gap-3 pt-1">
                      {/* Zoom Slider */}
                      <div className="flex items-center gap-3">
                        <ZoomIn className="size-4 text-cream/60 shrink-0" />
                        <span className="text-xs font-semibold text-cream/70 w-12">
                          Scale:
                        </span>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.05"
                          value={scale}
                          onChange={(e) => setScale(parseFloat(e.target.value))}
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-cream/20 accent-coral"
                        />
                        <span className="w-8 text-right text-xs font-bold text-cream">
                          {scale.toFixed(1)}x
                        </span>
                      </div>

                      {/* Pan X Slider */}
                      <div className="flex items-center gap-3">
                        <Move className="size-4 text-cream/60 shrink-0" />
                        <span className="text-xs font-semibold text-cream/70 w-12">
                          Pan X:
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={posX}
                          onChange={(e) => setPosX(parseInt(e.target.value))}
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-cream/20 accent-coral"
                        />
                        <span className="w-8 text-right text-xs font-bold text-cream">
                          {posX}%
                        </span>
                      </div>

                      {/* Pan Y Slider */}
                      <div className="flex items-center gap-3">
                        <Move className="size-4 text-cream/60 shrink-0" />
                        <span className="text-xs font-semibold text-cream/70 w-12">
                          Pan Y:
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={posY}
                          onChange={(e) => setPosY(parseInt(e.target.value))}
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-cream/20 accent-coral"
                        />
                        <span className="w-8 text-right text-xs font-bold text-cream">
                          {posY}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-cream/25 p-6 text-center transition-colors hover:border-coral hover:bg-cream/5"
                    >
                      <Upload className="size-6 text-coral" />
                      <span className="text-xs font-bold text-cream">
                        Upload custom pattern or graphic
                      </span>
                      <span className="text-[11px] text-cream/60">
                        Supports PNG, JPG, WebP photos & graphics
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Solid Color Controls */}
              {activeTab === "color" && (
                <div className="flex flex-col gap-3 rounded-2xl border border-cream/15 bg-plum-deep/40 p-4">
                  <span className="text-xs font-bold text-cream">
                    Solid Shirt Color
                  </span>
                  <p className="text-xs text-cream/70">
                    Choose a clean solid color base for a minimalist chic t-shirt silhouette.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto flex items-center justify-end gap-2.5 pt-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="coral" size="sm" onClick={handleApply} className="gap-1.5">
                  <Check className="size-4" />
                  <span>Apply to Outfit</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
