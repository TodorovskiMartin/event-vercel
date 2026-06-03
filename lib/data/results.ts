import type { SongResult } from "../results";
import { createSupabasePublicClient } from "../supabase/server";

export async function getRevealedResultsBySlug(slug: string): Promise<SongResult[]> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.rpc("get_revealed_event_results", {
    p_event_slug: slug
  });

  if (error) {
    console.error("Public revealed results RPC failed", { slug, error: error.message });
    return [];
  }

  return (data ?? []) as SongResult[];
}
