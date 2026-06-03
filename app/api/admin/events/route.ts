import { NextResponse } from "next/server";
import { formatValidationIssues, getAvailableSlug } from "@/lib/admin-events";
import { requireUser } from "@/lib/auth";
import { eventInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const { supabase, user } = await requireUser();
  const parsed = eventInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: formatValidationIssues(parsed.error.issues), issues: parsed.error.flatten() }, { status: 400 });
  }

  const { songs, ...eventInput } = parsed.data;
  const slug = await getAvailableSlug(supabase, eventInput.slug);
  const { data: event, error } = await supabase
    .from("events")
    .insert({ ...eventInput, slug, created_by: user.id, status: "waiting", max_selections: 3 })
    .select("id,slug")
    .single();
  if (error || !event) {
    const duplicateSlug = error?.message?.includes("events_slug_key");
    return NextResponse.json({ error: duplicateSlug ? "That slug is already in use. Try creating again and the app will choose the next available URL." : error?.message ?? "Could not create event." }, { status: 400 });
  }

  const { error: songsError } = await supabase.from("songs").insert(songs.map((song) => ({ ...song, event_id: event.id })));
  if (songsError) return NextResponse.json({ error: songsError.message }, { status: 400 });

  return NextResponse.json({ id: event.id, slug: event.slug });
}
