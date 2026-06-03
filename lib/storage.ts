import { createSupabasePublicClient } from "./supabase/server";

export const ALBUM_COVERS_BUCKET = "album-covers";

export function getAlbumCoverPublicUrl(path: string | null) {
  if (!path) return null;
  const supabase = createSupabasePublicClient();
  const { data } = supabase.storage.from(ALBUM_COVERS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
