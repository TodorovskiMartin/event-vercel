import { getPublicEventBySlug } from "@/lib/data/public";
import { rankResults } from "@/lib/results";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import { decodePathSegment } from "@/lib/urls";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublicResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(decodePathSegment(slug));
  if (!event) notFound();
  if (event.status !== "results_revealed") {
    return <main className="min-h-screen bg-ink p-6 text-xl">Results will be revealed live by the artist.</main>;
  }

  const supabase = createSupabasePublicClient();
  const { data } = await supabase.from("event_results").select("*").eq("event_id", event.id);
  const results = rankResults(data ?? []);

  return (
    <main className="min-h-screen bg-ink px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-neon">{event.artist_name} - {event.album_name}</p>
        <h1 className="mt-2 text-4xl font-semibold">Results</h1>
        <div className="mt-6 grid gap-3">
          {results.map((result) => (
            <div key={result.song_id} className="rounded-lg border border-zinc-800 bg-stage p-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold">#{result.rank}{result.tied ? " tie" : ""}</span>
                <span className="text-brass">{result.vote_count} votes</span>
              </div>
              <p className="mt-2 text-xl">{result.track_number}. {result.title}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
