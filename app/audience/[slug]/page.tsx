import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicEventBySlug } from "@/lib/data/public";
import { getRevealedResultsBySlug } from "@/lib/data/results";
import { rankResults } from "@/lib/results";
import { getAlbumCoverPublicUrl } from "@/lib/storage";
import { decodePathSegment } from "@/lib/urls";

export const dynamic = "force-dynamic";

export default async function AudienceResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(decodePathSegment(slug));
  if (!event) notFound();

  if (event.status !== "results_revealed") {
    return (
      <main className="grid min-h-screen place-items-center bg-ink px-8 text-center">
        <section>
          <p className="text-2xl text-neon">{event.artist_name}</p>
          <h1 className="mt-3 text-6xl font-semibold text-white">{event.album_name}</h1>
          <p className="mt-8 text-3xl text-zinc-300">Results will be revealed soon.</p>
        </section>
      </main>
    );
  }

  const results = rankResults(await getRevealedResultsBySlug(event.slug));
  const maxVotes = Math.max(1, ...results.map((result) => result.vote_count));
  const totalVotes = results.reduce((sum, result) => sum + result.vote_count, 0);
  const winner = totalVotes > 0 ? results[0] : null;
  const coverUrl = getAlbumCoverPublicUrl(event.album_cover_path);

  return (
    <main className="min-h-screen bg-ink text-white">
      <section className="relative min-h-screen overflow-hidden px-8 py-10">
        {coverUrl ? (
          <Image alt={`${event.album_name} album cover`} className="object-cover opacity-20 blur-sm" fill priority sizes="100vw" src={coverUrl} />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-ink/95 to-ink" />

        <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col">
          <header className="text-center">
            <p className="text-2xl uppercase tracking-[0.22em] text-neon">{event.artist_name}</p>
            <h1 className="mt-3 text-6xl font-bold">{event.album_name}</h1>
            <p className="mt-3 text-2xl text-zinc-300">{event.title}</p>
          </header>

          {winner ? (
            <section className="mt-10 rounded-lg border border-brass/40 bg-brass/10 p-6 text-center shadow-2xl">
              <p className="text-xl uppercase tracking-[0.18em] text-brass">Winner</p>
              <h2 className="mt-3 text-6xl font-bold">{winner.track_number}. {winner.title}</h2>
              <p className="mt-3 text-3xl text-brass">{winner.vote_count} votes{winner.tied ? " - tied" : ""}</p>
            </section>
          ) : null}

          <section className="mt-8 grid flex-1 content-center gap-3">
            {results.map((result) => (
              <div className="rounded-lg border border-zinc-800 bg-stage/90 p-4" key={result.song_id}>
                <div className="flex items-center gap-5">
                  <span className="w-24 text-center text-4xl font-bold text-brass">#{result.rank}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-6">
                      <p className="truncate text-3xl font-semibold">{result.track_number}. {result.title}{result.tied ? " (tie)" : ""}</p>
                      <p className="shrink-0 text-2xl text-zinc-300">{result.vote_count}</p>
                    </div>
                    <div className="mt-3 h-4 rounded-full bg-zinc-950">
                      <div className="h-4 rounded-full bg-neon" style={{ width: `${Math.max(3, (result.vote_count / maxVotes) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          <footer className="mt-6 text-center text-lg text-zinc-400">Total selections: {totalVotes}</footer>
        </div>
      </section>
    </main>
  );
}
