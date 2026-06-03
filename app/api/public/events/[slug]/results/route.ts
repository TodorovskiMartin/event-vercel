import { NextResponse } from "next/server";
import { getPublicEventBySlug } from "@/lib/data/public";
import { getRevealedResultsBySlug } from "@/lib/data/results";
import { rankResults } from "@/lib/results";
import { decodePathSegment } from "@/lib/urls";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(decodePathSegment(slug));
  if (!event) return NextResponse.json({ error: "event_not_found" }, { status: 404 });
  if (event.status !== "results_revealed") return NextResponse.json({ error: "results_not_revealed" }, { status: 403 });

  return NextResponse.json({ event, results: rankResults(await getRevealedResultsBySlug(event.slug)) }, { headers: { "Cache-Control": "no-store" } });
}
