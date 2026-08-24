import { createBrowserClient as createClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

function sanitizeCredentials(
  rawUrl: string | undefined,
  rawKey: string | undefined
): { url: string | null; key: string | null } {
  let val1 = rawUrl?.trim().replace(/^["']|["']$/g, "") || "";
  let val2 = rawKey?.trim().replace(/^["']|["']$/g, "") || "";

  // Auto-detect if user swapped URL and Key
  let finalUrl = val1;
  let finalKey = val2;

  if (
    (val1.startsWith("sb_publishable_") || val1.startsWith("eyJ")) &&
    (val2.includes("supabase.co") || val2.startsWith("http"))
  ) {
    // Swapped: val1 is key, val2 is url
    finalUrl = val2;
    finalKey = val1;
  } else if (
    (val2.startsWith("sb_publishable_") || val2.startsWith("eyJ")) &&
    (val1.includes("supabase.co") || val1.startsWith("http"))
  ) {
    finalUrl = val1;
    finalKey = val2;
  }

  // Ensure URL has protocol and is not a key
  if (finalUrl && !finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
    finalUrl = `https://${finalUrl}`;
  }

  let validUrl: string | null = null;
  try {
    const parsed = new URL(finalUrl);
    if (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      !parsed.hostname.startsWith("sb_publishable_") &&
      !parsed.hostname.startsWith("eyj")
    ) {
      validUrl = finalUrl;
    }
  } catch {
    validUrl = null;
  }

  const validKey =
    finalKey && !finalKey.includes("your-anon-key") && !finalKey.includes("supabase.co")
      ? finalKey
      : null;

  return { url: validUrl, key: validKey };
}

export function createBrowserClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const { url: supabaseUrl, key: supabaseAnonKey } = sanitizeCredentials(rawUrl, rawKey);

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== "undefined") {
      console.warn(
        "Supabase configuration issue in .env.local.\n" +
          "• NEXT_PUBLIC_SUPABASE_URL should be: https://<project-ref>.supabase.co\n" +
          "• NEXT_PUBLIC_SUPABASE_ANON_KEY should be: sb_publishable_... or eyJhbG...\n" +
          "Current raw values:",
        { rawUrl, rawKey: rawKey ? `${rawKey.slice(0, 15)}...` : undefined }
      );
    }
    return null;
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn("Could not initialize Supabase browser client:", err);
    return null;
  }
}
