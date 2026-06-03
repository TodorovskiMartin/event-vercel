import { redirect } from "next/navigation";
import { createSupabaseUserClient } from "./supabase/server";

export async function requireUser() {
  const supabase = await createSupabaseUserClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();
  if (error || !user) redirect("/admin/login");
  return { supabase, user };
}
