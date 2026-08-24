import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
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

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const { url: supabaseUrl, key: supabaseAnonKey } = sanitizeCredentials(rawUrl, rawKey);

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Refresh user token if expired
    await supabase.auth.getUser();
  } catch {
    // Ignore session refresh errors if network or config is unavailable
  }

  return supabaseResponse;
}
