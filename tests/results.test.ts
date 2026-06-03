import { describe, expect, it } from "vitest";
import { rankResults } from "@/lib/results";

describe("rankResults", () => {
  it("sorts by vote count and preserves tie labels", () => {
    const ranked = rankResults([
      { song_id: "a", track_number: 1, title: "One", vote_count: 5 },
      { song_id: "b", track_number: 2, title: "Two", vote_count: 7 },
      { song_id: "c", track_number: 3, title: "Three", vote_count: 5 }
    ]);
    expect(ranked.map((item) => item.song_id)).toEqual(["b", "a", "c"]);
    expect(ranked.map((item) => item.rank)).toEqual([1, 2, 2]);
    expect(ranked[1].tied).toBe(true);
  });
});
