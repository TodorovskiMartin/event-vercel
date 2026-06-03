import { NextResponse } from "next/server";
import { formatValidationIssues, getAvailableSlug } from "@/lib/admin-events";
import { requireUser } from "@/lib/auth";
import { eventInputSchema } from "@/lib/validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const parsed = eventInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: formatValidationIssues(parsed.error.issues), issues: parsed.error.flatten() }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("events")
    .select("id")
    .eq("id", id)
    .eq("created_by", user.id)
    .single();
  if (!existing) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const { songs, ...eventInput } = parsed.data;
  const { data: voteRows } = await supabase.from("votes").select("id").eq("event_id", id).limit(1);
  const hasVotes = (voteRows ?? []).length > 0;
  if (hasVotes) {
    const { data: currentSongs } = await supabase.from("songs").select("track_number,title").eq("event_id", id).order("track_number");
    const currentSignature = JSON.stringify((currentSongs ?? []).map((song) => ({ track_number: song.track_number, title: song.title })));
    const nextSignature = JSON.stringify(songs.map((song) => ({ track_number: song.track_number, title: song.title })));
    if (currentSignature !== nextSignature) {
      return NextResponse.json({ error: "Track list cannot be edited after votes exist. Reset test votes first, or create a new event." }, { status: 409 });
    }
  }

  const slug = await getAvailableSlug(supabase, eventInput.slug, id);
  const { data: event, error } = await supabase
    .from("events")
    .update({ ...eventInput, slug })
    .eq("id", id)
    .eq("created_by", user.id)
    .select("id")
    .single();
  if (error || !event) return NextResponse.json({ error: error?.message ?? "Could not update event." }, { status: 400 });

  if (!hasVotes) {
    const { error: deleteSongsError } = await supabase.from("songs").delete().eq("event_id", id);
    if (deleteSongsError) return NextResponse.json({ error: deleteSongsError.message }, { status: 400 });
    const { error: insertSongsError } = await supabase.from("songs").insert(songs.map((song) => ({ ...song, event_id: id })));
    if (insertSongsError) return NextResponse.json({ error: insertSongsError.message }, { status: 400 });
  }

  return NextResponse.json({ id: event.id });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const body = (await request.json().catch(() => null)) as { confirmation?: string } | null;
  if (body?.confirmation !== "DELETE EVENT") return NextResponse.json({ error: "Confirmation phrase required." }, { status: 400 });

  const { error } = await supabase.from("events").delete().eq("id", id).eq("created_by", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
