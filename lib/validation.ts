import { z } from "zod";
import { eventStatusSchema } from "./status";

export const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(80)
  .refine((slug) => !/[/?#\\]/.test(slug), "Do not use /, ?, #, or \\ in the slug.");

export const songInputSchema = z.object({
  track_number: z.number().int().min(1).max(100),
  title: z.string().trim().min(1).max(160)
});

export const eventInputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  slug: slugSchema,
  artist_name: z.string().trim().min(1).max(160),
  album_name: z.string().trim().min(1).max(160),
  album_cover_path: z.string().nullable().optional(),
  songs: z
    .array(songInputSchema)
    .min(3, "Add at least 3 songs so guests can choose 3 favorites.")
    .max(100, "Use 100 songs or fewer.")
    .refine((songs) => new Set(songs.map((song) => song.track_number)).size === songs.length, "Track numbers must be unique.")
});

export const votePayloadSchema = z.object({
  songIds: z
    .array(z.string().uuid())
    .length(3)
    .refine((ids) => new Set(ids).size === 3, "Choose 3 different songs.")
});

export const statusPayloadSchema = z.object({
  status: eventStatusSchema
});
