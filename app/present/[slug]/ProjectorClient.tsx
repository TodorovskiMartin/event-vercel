"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import type { RankedSongResult } from "@/lib/results";
import type { PublicEvent } from "@/lib/types";

export function ProjectorClient({ event, results, publicUrl }: { event: PublicEvent; results: RankedSongResult[]; publicUrl: string }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [simple, setSimple] = useState(false);
  const revealOrder = useMemo(() => [...results].reverse(), [results]);
  const visible = revealOrder.slice(0, visibleCount);
  const maxVotes = Math.max(1, ...results.map((result) => result.vote_count));

  if (event.status !== "results_revealed") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink p-10 text-center">
        <section>
          <p className="text-3xl text-neon">{event.artist_name}</p>
          <h1 className="mt-3 text-7xl font-semibold">{event.album_name}</h1>
          <p className="mt-8 text-4xl">{event.status === "voting_open" ? "Voting is open" : "Scan to vote after the presentation"}</p>
          <p className="mt-4 text-2xl text-zinc-300">{publicUrl}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl text-neon">{event.artist_name} - {event.album_name}</p>
            <h1 className="text-6xl font-semibold">Live Results</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setVisibleCount((value) => Math.min(results.length, value + 1))}>Reveal Next Position</Button>
            <Button onClick={() => setVisibleCount(results.length)}>Reveal All</Button>
            <Button onClick={() => setVisibleCount(0)}>Reset Reveal Animation</Button>
            <Button onClick={() => setSimple((value) => !value)}>Fallback Table</Button>
          </div>
        </div>
        <div className="mt-8 grid gap-3">
          {(simple ? results : visible).map((result) => (
            <div key={result.song_id} className="rounded-lg border border-zinc-800 bg-stage p-4">
              <div className="flex items-center gap-5">
                <span className="w-24 text-4xl font-bold text-brass">#{result.rank}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-3xl">
                    <span>{result.track_number}. {result.title}{result.tied ? " (tie)" : ""}</span>
                    <span>{result.vote_count}</span>
                  </div>
                  <div className="mt-3 h-5 rounded-full bg-zinc-950">
                    <div className="h-5 rounded-full bg-neon transition-all duration-700" style={{ width: `${(result.vote_count / maxVotes) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
