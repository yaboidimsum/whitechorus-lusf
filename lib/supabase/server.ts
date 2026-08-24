import { createServerClient as createClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

function sanitizeCredentials(
  rawUrl: string | undefined,
  rawKey: string | undefined
): { url: string | null; key: string | null } {
  let val1 = rawUrl?.trim().replace(/^["']|["']$/g, "") || "";
  let val2 = rawKey?.trim().replace(/^["']|["']$/g, "") || "";

  let finalUrl = val1;
  let finalKey = val2;

  if (
    (val1.startsWith("sb_publishable_") || val1.startsWith("eyJ")) &&
    (val2.includes("supabase.co") || val2.startsWith("http"))
  ) {
    finalUrl = val2;
    finalKey = val1;
  } else if (
    (val2.startsWith("sb_publishable_") || val2.startsWith("eyJ")) &&
    (val1.includes("supabase.co") || val1.startsWith("http"))
  ) {
    finalUrl = val1;
    finalKey = val2;
  }

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

export async function createServerClient() {
  const cookieStore = await cookies();
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const { url: supabaseUrl, key: supabaseAnonKey } = sanitizeCredentials(rawUrl, rawKey);

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    });
  } catch (err) {
    console.warn("Could not initialize Supabase server client:", err);
    return null;
  }
}
