import { NextResponse } from "next/server";
import { getPublicEventBySlug } from "@/lib/data/public";
import { decodePathSegment } from "@/lib/urls";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(decodePathSegment(slug));
  if (!event) return NextResponse.json({ error: "event_not_found" }, { status: 404 });
  return NextResponse.json(
    { status: event.status, votingOpen: event.status === "voting_open", resultsRevealed: event.status === "results_revealed" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
