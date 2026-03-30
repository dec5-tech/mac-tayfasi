import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl === "https://placeholder.supabase.co"
  ) {
    // Return a minimal mock during build/SSR when env vars aren't set
    if (typeof window === "undefined") {
      return {} as ReturnType<typeof createBrowserClient>;
    }
    throw new Error(
      "Supabase URL ve Anon Key ayarlanmalı. .env.local dosyasını kontrol edin."
    );
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
