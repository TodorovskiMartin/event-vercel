"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, cn } from "@/components/ui";
import type { EventStatus } from "@/lib/status";
import type { PublicEvent } from "@/lib/types";
import { publicResultsPath, encodePathSegment } from "@/lib/urls";

type VoteResult = "idle" | "submitting" | "success" | "error" | "already_voted" | "closed";

export function EventVotingClient({ event }: { event: PublicEvent }) {
  const [status, setStatus] = useState<EventStatus>(event.status);
  const [connectionWarning, setConnectionWarning] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [voteResult, setVoteResult] = useState<VoteResult>("idle");
  const selectedSongs = useMemo(() => event.songs.filter((song) => selected.includes(song.id)), [event.songs, selected]);

  useEffect(() => {
    if (voteResult === "success" || status === "results_revealed" || status === "archived") return;
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const response = await fetch(`/api/public/events/${encodePathSegment(event.slug)}/status`, { cache: "no-store" });
        if (!response.ok) throw new Error("status failed");
        const data = (await response.json()) as { status: EventStatus };
        if (!cancelled) {
          setStatus(data.status);
          setConnectionWarning("");
        }
      } catch {
        if (!cancelled) setConnectionWarning("Connection issue. Retrying...");
      } finally {
        if (!cancelled) timeout = setTimeout(poll, 8000 + Math.random() * 2000);
      }
    };

    timeout = setTimeout(poll, 800 + Math.random() * 1200);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [event.slug, status, voteResult]);

  function toggleSong(songId: string) {
    if (voteResult === "success") return;
    setSelected((current) => {
      if (current.includes(songId)) return current.filter((id) => id !== songId);
      if (current.length >= 3) return current;
      return [...current, songId];
    });
  }

  async function submitVote() {
    if (selected.length !== 3) return;
    setVoteResult("submitting");
    try {
      const response = await fetch(`/api/public/events/${encodePathSegment(event.slug)}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songIds: selected })
      });
      const data = (await response.json()) as { result: string };
      if (response.ok && data.result === "success") setVoteResult("success");
      else if (data.result === "already_voted") setVoteResult("already_voted");
      else if (data.result === "voting_closed") setVoteResult("closed");
      else setVoteResult("error");
    } catch {
      setVoteResult("error");
    }
  }

  const votingOpen = status === "voting_open";
  const canSelect = votingOpen && voteResult !== "success" && voteResult !== "submitting";

  return (
    <section className="mt-6">
      {connectionWarning ? <p className="mb-3 rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-amber-100">{connectionWarning}</p> : null}

      <div className="mb-4 rounded-lg border border-zinc-800 bg-stage p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-zinc-400">{votingOpen ? "Voting is open" : "Tracklist"}</p>
            <h2 className="mt-1 text-2xl font-semibold">{votingOpen ? "Choose your 3 favorite songs" : "Voting will open after the presentation."}</h2>
          </div>
          {votingOpen || voteResult === "success" ? (
            <span className="shrink-0 rounded-full bg-zinc-950 px-3 py-1 text-sm text-zinc-200">{selected.length} / 3 selected</span>
          ) : null}
        </div>
        {!votingOpen && voteResult !== "success" ? (
          <div className="mt-3 text-zinc-300">
            <p>{status === "results_revealed" ? "Results are ready." : "Keep this page open. The list below becomes your ballot when voting starts."}</p>
          {status === "results_revealed" ? <a className="mt-4 inline-block text-neon underline" href={publicResultsPath(event.slug)}>View results</a> : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3">
        {event.songs.map((song) => {
          const active = selected.includes(song.id);
          return (
            <button
              aria-pressed={active}
              disabled={!canSelect}
              key={song.id}
              onClick={() => toggleSong(song.id)}
              className={cn(
                "flex min-h-16 items-center gap-4 rounded-lg border p-4 text-left transition disabled:cursor-default",
                active ? "border-neon bg-neon/15" : "border-zinc-800 bg-stage",
                canSelect && !active ? "hover:border-zinc-600" : "",
                !votingOpen && voteResult !== "success" ? "opacity-95" : ""
              )}
            >
              <span className="w-8 text-center text-lg font-semibold text-brass">{song.track_number}</span>
              <span className="flex-1 text-lg text-white">{song.title}</span>
              {votingOpen || voteResult === "success" ? (
                <span className={cn("grid h-7 w-7 place-items-center rounded-full border text-sm", active ? "border-neon bg-neon text-ink" : "border-zinc-600 text-zinc-500")}>
                  {active ? "✓" : ""}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {votingOpen || voteResult === "success" ? (
        <div>
          <Button className="mt-5 w-full" disabled={selected.length !== 3 || voteResult === "submitting" || voteResult === "success"} onClick={submitVote}>
            {voteResult === "submitting" ? "Submitting..." : "Submit vote"}
          </Button>
        </div>
      ) : null}

      {voteResult === "success" ? (
        <div className="mt-5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4">
          <p className="font-semibold text-emerald-100">Your vote has been received.</p>
          <ul className="mt-2 list-inside list-disc text-emerald-50">
            {selectedSongs.map((song) => <li key={song.id}>{song.track_number}. {song.title}</li>)}
          </ul>
        </div>
      ) : null}
      {voteResult === "error" ? <p className="mt-4 rounded-md border border-rose/50 bg-rose/10 p-3">Your vote has not been submitted yet. Please retry.</p> : null}
      {voteResult === "already_voted" ? <p className="mt-4 rounded-md border border-amber-500/50 bg-amber-500/10 p-3">This browser has already voted for this event.</p> : null}
      {voteResult === "closed" ? <p className="mt-4 rounded-md border border-zinc-700 bg-zinc-900 p-3">Voting is closed.</p> : null}
    </section>
  );
}
