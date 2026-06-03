import { createBrowserClient } from "@supabase/ssr";
import { env, getSupabasePublishableKey } from "../config";

export function createSupabaseBrowserClient() {
  const publishableKey = getSupabasePublishableKey();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !publishableKey) {
    throw new Error("Missing public Supabase environment variables.");
  }
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, publishableKey);
}
