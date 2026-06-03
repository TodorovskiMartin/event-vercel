import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createQrSvg, publicEventUrl } from "@/lib/qr";

export const dynamic = "force-dynamic";

export default async function EventQrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { data: event } = await supabase
    .from("events")
    .select("id,title,artist_name,album_name,slug")
    .eq("id", id)
    .eq("created_by", user.id)
    .single();

  if (!event) return <main className="min-h-screen bg-white p-8 text-ink">Event not found.</main>;

  const url = publicEventUrl(event.slug);
  const qrSvg = await createQrSvg(url, 720);

  return (
    <main className="min-h-screen bg-white px-6 py-6 text-ink">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-5xl flex-col">
        <nav className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link className="rounded-md border border-zinc-300 px-4 py-2" href={`/admin/events/${event.id}`}>
            Back to event
          </Link>
          <div className="flex flex-wrap gap-2">
            <a className="rounded-md bg-ink px-4 py-2 text-white" href={`/api/admin/events/${event.id}/qr?format=pdf`}>
              Download PDF
            </a>
            <a className="rounded-md border border-zinc-300 px-4 py-2" href={`/api/admin/events/${event.id}/qr?format=png`}>
              Download PNG
            </a>
            <a className="rounded-md border border-zinc-300 px-4 py-2" href={`/api/admin/events/${event.id}/qr?format=svg`}>
              Download SVG
            </a>
          </div>
        </nav>

        <section className="grid flex-1 place-items-center py-8 text-center">
          <div>
            <p className="text-3xl font-semibold">{event.artist_name}</p>
            <h1 className="mt-2 text-5xl font-bold">{event.album_name}</h1>
            <p className="mt-3 text-2xl text-zinc-700">{event.title}</p>
            <div className="mx-auto mt-8 w-full max-w-[560px]" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            <p className="mt-6 text-3xl font-semibold">Scan to vote after the presentation</p>
            <p className="mx-auto mt-4 max-w-2xl break-all text-base text-zinc-600">{url}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
