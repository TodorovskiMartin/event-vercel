import { createSupabasePublicClient } from "../supabase/server";
import type { PublicEvent } from "../types";

export async function getPublicEventBySlug(slug: string): Promise<PublicEvent | null> {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("id,slug,title,artist_name,album_name,album_cover_path,status,max_selections,songs(id,track_number,title)")
    .eq("slug", slug)
    .neq("status", "draft")
    .neq("status", "archived")
    .single();

  if (error || !data) return null;
  return { ...data, songs: [...(data.songs ?? [])].sort((a, b) => a.track_number - b.track_number) } as PublicEvent;
}
