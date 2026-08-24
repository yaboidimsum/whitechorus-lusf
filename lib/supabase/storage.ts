import { createBrowserClient } from "./client";

/**
 * Uploads a base64 or data URL image to the Supabase outfit-assets bucket.
 * Falls back to returning the dataUrl if Supabase client/storage is not configured.
 */
export async function uploadOutfitAsset(
  userId: string,
  dataUrlOrBase64: string,
  assetPrefix: "bg" | "kaos_emir" | "kaos_friska"
): Promise<string> {
  const supabase = createBrowserClient();
  if (!supabase || !dataUrlOrBase64.startsWith("data:")) {
    // If not configured or already a remote URL, return as is
    return dataUrlOrBase64;
  }

  try {
    // Convert Data URL to Blob
    const res = await fetch(dataUrlOrBase64);
    const blob = await res.blob();
    const extension = blob.type.split("/")[1] || "webp";
    const filename = `${userId}/${assetPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("outfit-assets")
      .upload(filename, blob, {
        contentType: blob.type,
        cacheControl: "31536000",
        upsert: true,
      });

    if (uploadError) {
      console.warn("Supabase Storage upload warning, falling back to data URL:", uploadError.message);
      return dataUrlOrBase64;
    }

    const { data: publicUrlData } = supabase.storage
      .from("outfit-assets")
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.warn("Storage upload error fallback:", err);
    return dataUrlOrBase64;
  }
}
