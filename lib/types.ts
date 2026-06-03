import type { EventStatus } from "./status";

export type PublicSong = {
  id: string;
  track_number: number;
  title: string;
};

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  artist_name: string;
  album_name: string;
  album_cover_path: string | null;
  status: EventStatus;
  max_selections: number;
  songs: PublicSong[];
};
