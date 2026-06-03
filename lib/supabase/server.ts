import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { assertServerSupabaseEnv, env, getSupabasePublishableKey } from "../config";

export function createSupabasePublicClient() {
  const publishableKey = getSupabasePublishableKey();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !publishableKey) {
    throw new Error("Missing public Supabase environment variables.");
  }
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, publishableKey, {
    auth: { persistSession: false }
  });
}

export async function createSupabaseUserClient() {
  const publishableKey = getSupabasePublishableKey();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !publishableKey) {
    throw new Error("Missing public Supabase environment variables.");
  }
  const cookieStore = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot write cookies. Route handlers and server actions can,
          // and auth reads still work here; failed refresh writes should not crash rendering.
        }
      }
    }
  });
}

export function createSupabaseServiceClient() {
  assertServerSupabaseEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  });
}
