import Image from "next/image";
import { notFound } from "next/navigation";
import { EventVotingClient } from "./EventVotingClient";
import { getPublicEventBySlug } from "@/lib/data/public";
import { getAlbumCoverPublicUrl } from "@/lib/storage";
import { decodePathSegment } from "@/lib/urls";

export const dynamic = "force-dynamic";

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(decodePathSegment(slug));
  if (!event) notFound();
  const coverUrl = getAlbumCoverPublicUrl(event.album_cover_path);

  return (
    <main className="min-h-screen bg-ink px-4 py-6">
      <div className="mx-auto max-w-2xl">
        <div className="relative aspect-square overflow-hidden rounded-lg border border-zinc-800 bg-gradient-to-br from-zinc-900 via-stage to-zinc-950 p-6 shadow-2xl">
          {coverUrl ? (
            <Image
              alt={`${event.album_name} album cover`}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 672px"
              src={coverUrl}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
          <div className="relative flex h-full items-end">
            <div className="drop-shadow-lg">
              <p className="text-sm uppercase tracking-[0.25em] text-neon">{event.artist_name}</p>
              <h1 className="mt-2 text-4xl font-semibold text-white">{event.album_name}</h1>
              <p className="mt-2 text-zinc-300">{event.title}</p>
            </div>
          </div>
        </div>
        <EventVotingClient event={event} />
      </div>
    </main>
  );
}
