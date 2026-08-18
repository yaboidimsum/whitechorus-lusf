/**
 * Client-side image compression utility using HTML Canvas.
 * Shrinks raw camera/gallery photos (often 5-15MB) to lightweight, optimized
 * JPEG data URLs (~80-150KB, max 1500px dimension) for instant local processing
 * and safe localStorage persistence without server round-trips.
 */

export async function compressImageFile(
  file: File,
  maxDimension = 1500,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selected file is not an image."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error("Image read resulted in empty source."));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error("Failed to decode image."));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate scaling factor to fit within maxDimension
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to acquire 2D canvas context for compression."));
          return;
        }

        // Draw with smooth bicubic interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to lightweight JPEG data URL
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };
      img.src = src;
    };

    reader.readAsDataURL(file);
  });
}
