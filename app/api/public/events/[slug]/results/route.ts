import { NextResponse } from "next/server";
import { getPublicEventBySlug } from "@/lib/data/public";
import { rankResults } from "@/lib/results";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import { decodePathSegment } from "@/lib/urls";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(decodePathSegment(slug));
  if (!event) return NextResponse.json({ error: "event_not_found" }, { status: 404 });
  if (event.status !== "results_revealed") return NextResponse.json({ error: "results_not_revealed" }, { status: 403 });

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.from("event_results").select("*").eq("event_id", event.id);
  if (error) return NextResponse.json({ error: "results_unavailable" }, { status: 500 });
  return NextResponse.json({ event, results: rankResults(data ?? []) }, { headers: { "Cache-Control": "no-store" } });
}
