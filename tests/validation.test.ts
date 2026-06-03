import { describe, expect, it } from "vitest";
import { eventInputSchema, votePayloadSchema } from "@/lib/validation";

describe("validation", () => {
  it("requires exactly three unique vote selections", () => {
    expect(votePayloadSchema.safeParse({ songIds: ["not-a-uuid"] }).success).toBe(false);
    expect(votePayloadSchema.safeParse({ songIds: [
      "00000000-0000-0000-0000-000000000001",
      "00000000-0000-0000-0000-000000000001",
      "00000000-0000-0000-0000-000000000002"
    ] }).success).toBe(false);
    expect(votePayloadSchema.safeParse({ songIds: [
      "00000000-0000-0000-0000-000000000001",
      "00000000-0000-0000-0000-000000000002",
      "00000000-0000-0000-0000-000000000003"
    ] }).success).toBe(true);
  });

  it("requires at least three tracks for events", () => {
    const songs = Array.from({ length: 3 }, (_, index) => ({ track_number: index + 1, title: `Track ${index + 1}` }));
    expect(eventInputSchema.safeParse({ title: "Event", slug: "event", artist_name: "Artist", album_name: "Album", songs }).success).toBe(true);
    expect(eventInputSchema.safeParse({ title: "Event", slug: "event", artist_name: "Artist", album_name: "Album", songs: songs.slice(0, 2) }).success).toBe(false);
  });

  it("allows Cyrillic slugs", () => {
    const songs = Array.from({ length: 3 }, (_, index) => ({ track_number: index + 1, title: `Track ${index + 1}` }));
    expect(eventInputSchema.safeParse({ title: "Event", slug: "албум-промоција", artist_name: "Artist", album_name: "Album", songs }).success).toBe(true);
  });
});
