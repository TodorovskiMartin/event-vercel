import Link from "next/link";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const { supabase, user } = await requireUser();
  const { data: events } = await supabase.from("events").select("id,title,artist_name,album_name,slug,status,created_at").eq("created_by", user.id).order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-ink px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl font-semibold">Events</h1>
          <Link className="rounded-md bg-brass px-4 py-3 font-semibold text-ink" href="/admin/events/new">Create event</Link>
        </div>
        <div className="mt-6 grid gap-3">
          {(events ?? []).map((event) => (
            <Link key={event.id} href={`/admin/events/${event.id}`} className="rounded-lg border border-zinc-800 bg-stage p-4 hover:border-neon">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold">{event.title}</p>
                  <p className="text-zinc-300">{event.artist_name} - {event.album_name}</p>
                </div>
                <span className="rounded-full bg-zinc-950 px-3 py-1 text-sm">{event.status}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
