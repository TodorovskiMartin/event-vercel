"use client";

import { useState } from "react";
import { Button, TextInput } from "@/components/ui";

const demoSongs = [
  "Signal in the Static",
  "Velvet Hour",
  "North Window",
  "After Midnight",
  "Silver Lines",
  "Room Tone",
  "Low Sun",
  "Mirrors Awake",
  "Last Train Lights",
  "The Long Echo"
];

type EventFormProps = {
  eventId?: string;
  initialAlbum?: string;
  initialArtist?: string;
  initialCoverPath?: string | null;
  initialSlug?: string;
  initialSongs?: string[];
  initialTitle?: string;
  mode?: "create" | "edit";
};

export function EventForm({
  eventId,
  initialAlbum = "After Midnight",
  initialArtist = "Nova Echo",
  initialCoverPath = null,
  initialSlug = "demo",
  initialSongs = demoSongs,
  initialTitle = "Album Launch Night",
  mode = "create"
}: EventFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [artist, setArtist] = useState(initialArtist);
  const [album, setAlbum] = useState(initialAlbum);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [songs, setSongs] = useState(initialSongs.length >= 3 ? initialSongs : demoSongs.slice(0, 3));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateSong(index: number, value: string) {
    setSongs((current) => current.map((song, itemIndex) => (itemIndex === index ? value : song)));
  }

  function addSong() {
    setSongs((current) => [...current, ""]);
  }

  function removeSong(index: number) {
    setSongs((current) => current.filter((_song, itemIndex) => itemIndex !== index));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    let albumCoverPath: string | null = null;

    if (coverFile) {
      const formData = new FormData();
      formData.append("file", coverFile);
      const uploadResponse = await fetch("/api/admin/uploads/album-cover", {
        method: "POST",
        body: formData
      });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        setSaving(false);
        setError(uploadData.error ?? "Could not upload album cover.");
        return;
      }
      albumCoverPath = uploadData.path;
    }

    const cleanedSongs = songs.map((song) => song.trim()).filter(Boolean);
    if (cleanedSongs.length < 3) {
      setSaving(false);
      setError("Add at least 3 song titles before creating the event.");
      return;
    }

    const response = await fetch(mode === "edit" && eventId ? `/api/admin/events/${eventId}` : "/api/admin/events", {
      method: mode === "edit" ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        artist_name: artist,
        album_name: album,
        album_cover_path: albumCoverPath ?? initialCoverPath,
        songs: cleanedSongs.map((song, index) => ({ track_number: index + 1, title: song }))
      })
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) setError(data.error ?? "Could not create event.");
    else window.location.href = `/admin/events/${data.id}`;
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <label className="grid gap-2"><span>Event title</span><TextInput value={title} onChange={(event) => setTitle(event.target.value)} /></label>
      <label className="grid gap-2"><span>Slug</span><TextInput value={slug} onChange={(event) => setSlug(event.target.value)} /></label>
      <label className="grid gap-2"><span>Artist</span><TextInput value={artist} onChange={(event) => setArtist(event.target.value)} /></label>
      <label className="grid gap-2"><span>Album</span><TextInput value={album} onChange={(event) => setAlbum(event.target.value)} /></label>
      <label className="grid gap-2">
        <span>Album cover</span>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-3 text-zinc-50 file:mr-4 file:rounded-md file:border-0 file:bg-brass file:px-3 file:py-2 file:font-semibold file:text-ink"
          type="file"
          onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)}
        />
        <span className="text-sm text-zinc-400">{initialCoverPath ? "Choose a new file to replace the current cover. " : ""}JPG, PNG, or WebP. Max 5 MB.</span>
      </label>
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <span>Tracks</span>
          <Button className="min-h-9 px-3 py-1 text-sm" type="button" onClick={addSong}>Add Song</Button>
        </div>
        {songs.map((song, index) => (
          <div className="flex gap-2" key={index}>
            <div className="grid w-12 place-items-center rounded-md border border-zinc-800 bg-zinc-950 text-sm text-brass">{index + 1}</div>
            <TextInput value={song} onChange={(event) => updateSong(index, event.target.value)} />
            <Button
              className="min-h-11 bg-zinc-800 px-3 text-zinc-100 disabled:opacity-40"
              disabled={songs.length <= 3}
              type="button"
              onClick={() => removeSong(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <span className="text-sm text-zinc-400">Add at least 3 songs. Guests will still choose exactly 3 favorites.</span>
      </div>
      {error ? <p className="rounded-md border border-rose/50 bg-rose/10 p-3">{error}</p> : null}
      <Button disabled={saving}>{saving ? "Saving..." : mode === "edit" ? "Save changes" : "Create event"}</Button>
    </form>
  );
}
