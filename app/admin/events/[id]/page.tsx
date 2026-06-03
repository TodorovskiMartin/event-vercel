import Link from "next/link";
import { EventControls } from "./EventControls";
import { ResultsCharts } from "./ResultsCharts";
import { requireUser } from "@/lib/auth";
import { rankResults } from "@/lib/results";
import { audienceResultsPath, projectorPath } from "@/lib/urls";

export const dynamic = "force-dynamic";

export default async function AdminEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { data: event } = await supabase
    .from("events")
    .select("id,title,artist_name,album_name,slug,status,songs(id,track_number,title)")
    .eq("id", id)
    .eq("created_by", user.id)
    .single();
  if (!event) return <main className="min-h-screen bg-ink p-6">Event not found.</main>;

  const { data: voteRows } = await supabase.from("votes").select("id", { count: "exact" }).eq("event_id", id);
  const { data: resultRows } = await supabase.from("event_results").select("*").eq("event_id", id);
  const results = rankResults(resultRows ?? []);
  const confirmedVotes = voteRows?.length ?? 0;
  const totalSelections = results.reduce((sum, result) => sum + result.vote_count, 0);

  return (
    <main className="min-h-screen bg-ink px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <section>
          <Link className="text-neon underline" href="/admin/events">Back to events</Link>
          <h1 className="mt-3 text-4xl font-semibold">{event.title}</h1>
          <p className="mt-1 text-zinc-300">{event.artist_name} - {event.album_name}</p>
          <div className="mt-6"><EventControls eventId={event.id} initialStatus={event.status} /></div>
          <div className="mt-6 rounded-lg border border-zinc-800 bg-stage p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Private results</h2>
                <p className="mt-2 text-zinc-300">Confirmed voters: {confirmedVotes}. Total selections: {totalSelections}.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a className="rounded-md border border-zinc-700 px-4 py-2" href={`/api/admin/events/${event.id}/export`}>Export CSV</a>
                <Link className="rounded-md border border-zinc-700 px-4 py-2" href={`/admin/events/${event.id}/qr`}>QR Page</Link>
                <Link className="rounded-md border border-zinc-700 px-4 py-2" href={audienceResultsPath(event.slug)}>Audience Results</Link>
                <Link className="rounded-md border border-zinc-700 px-4 py-2" href={projectorPath(event.slug)}>Projector</Link>
              </div>
            </div>
            <ResultsCharts confirmedVotes={confirmedVotes} results={results} />
          </div>
        </section>
      </div>
    </main>
  );
}
