import type { RankedSongResult } from "@/lib/results";

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians)
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

const palette = ["#4dd0e1", "#d6a94a", "#e05a7a", "#7dd3fc", "#a7f3d0", "#f0abfc", "#fde68a", "#c4b5fd"];

export function ResultsCharts({ results, confirmedVotes }: { results: RankedSongResult[]; confirmedVotes: number }) {
  const totalSelections = results.reduce((sum, result) => sum + result.vote_count, 0);
  const maxVotes = Math.max(1, ...results.map((result) => result.vote_count));
  let currentAngle = 0;
  const nonZeroResults = results.filter((result) => result.vote_count > 0);

  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-[360px_1fr]">
      <section className="rounded-lg border border-zinc-800 bg-stage p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-semibold">Vote Share</h2>
          <span className="text-sm text-zinc-400">{totalSelections} selections</span>
        </div>
        <div className="mt-5 grid place-items-center">
          {totalSelections > 0 ? (
            <svg aria-label="Vote share pie chart" className="h-64 w-64" viewBox="0 0 240 240" role="img">
              <circle cx="120" cy="120" r="82" fill="none" stroke="#181b24" strokeWidth="44" />
              {nonZeroResults.map((result, index) => {
                const start = currentAngle;
                const sweep = (result.vote_count / totalSelections) * 360;
                currentAngle += sweep;
                return (
                  <path
                    d={describeArc(120, 120, 82, start, currentAngle)}
                    fill="none"
                    key={result.song_id}
                    stroke={palette[index % palette.length]}
                    strokeLinecap="round"
                    strokeWidth="44"
                  />
                );
              })}
              <text fill="#f7f2e8" fontSize="26" fontWeight="700" textAnchor="middle" x="120" y="116">
                {confirmedVotes}
              </text>
              <text fill="#a1a1aa" fontSize="12" textAnchor="middle" x="120" y="138">
                voters
              </text>
            </svg>
          ) : (
            <div className="grid h-64 w-64 place-items-center rounded-full border border-dashed border-zinc-700 text-center text-zinc-400">
              No votes yet
            </div>
          )}
        </div>
        <div className="mt-4 grid gap-2">
          {results.slice(0, 8).map((result, index) => (
            <div className="flex items-center gap-2 text-sm" key={result.song_id}>
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
              <span className="min-w-0 flex-1 truncate">{result.track_number}. {result.title}</span>
              <span className="text-zinc-400">{result.vote_count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-stage p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-semibold">Ranking Bars</h2>
          <span className="text-sm text-zinc-400">Top songs by confirmed votes</span>
        </div>
        <div className="mt-5 grid gap-3">
          {results.map((result) => (
            <div key={result.song_id}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">
                  #{result.rank} {result.track_number}. {result.title}{result.tied ? " (tie)" : ""}
                </span>
                <span className="shrink-0 text-zinc-300">{result.vote_count}</span>
              </div>
              <div className="h-3 rounded-full bg-zinc-950">
                <div
                  className="h-3 rounded-full bg-neon"
                  style={{ width: `${Math.max(3, (result.vote_count / maxVotes) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
