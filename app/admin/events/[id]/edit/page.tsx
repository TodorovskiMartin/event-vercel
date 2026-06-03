import Link from "next/link";
import { EventForm } from "../../EventForm";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { data: event } = await supabase
    .from("events")
    .select("id,title,artist_name,album_name,slug,album_cover_path,songs(track_number,title)")
    .eq("id", id)
    .eq("created_by", user.id)
    .single();

  if (!event) return <main className="min-h-screen bg-ink p-6">Event not found.</main>;

  const songs = [...(event.songs ?? [])].sort((a, b) => a.track_number - b.track_number).map((song) => song.title);

  return (
    <main className="min-h-screen bg-ink px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <Link className="text-neon underline" href={`/admin/events/${event.id}`}>Back to event</Link>
        <h1 className="mb-6 mt-3 text-4xl font-semibold">Edit event</h1>
        <EventForm
          eventId={event.id}
          initialAlbum={event.album_name}
          initialArtist={event.artist_name}
          initialCoverPath={event.album_cover_path}
          initialSlug={event.slug}
          initialSongs={songs}
          initialTitle={event.title}
          mode="edit"
        />
      </div>
    </main>
  );
}
