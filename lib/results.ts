export type SongResult = {
  song_id: string;
  track_number: number;
  title: string;
  vote_count: number;
};

export type RankedSongResult = SongResult & {
  rank: number;
  tied: boolean;
};

export function rankResults(results: SongResult[]): RankedSongResult[] {
  const sorted = [...results].sort((a, b) => b.vote_count - a.vote_count || a.track_number - b.track_number);
  return sorted.map((result, index) => {
    const previous = sorted[index - 1];
    const sameAsPrevious = previous?.vote_count === result.vote_count;
    const rank = sameAsPrevious ? sorted.findIndex((item) => item.vote_count === result.vote_count) + 1 : index + 1;
    const tied = sorted.some((item, itemIndex) => itemIndex !== index && item.vote_count === result.vote_count);
    return { ...result, rank, tied };
  });
}
