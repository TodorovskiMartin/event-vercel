import { NextResponse } from "next/server";
import { getPublicEventBySlug } from "@/lib/data/public";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import { decodePathSegment } from "@/lib/urls";
import { votePayloadSchema } from "@/lib/validation";
import { createVoterHash, getOrCreateVoterToken } from "@/lib/voter";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const slug = decodePathSegment(rawSlug);
  const event = await getPublicEventBySlug(slug);
  if (!event) return NextResponse.json({ result: "event_not_found" }, { status: 404 });

  const parsed = votePayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    console.warn("Invalid vote payload", { slug, issues: parsed.error.issues });
    return NextResponse.json({ result: "invalid_selection", issues: parsed.error.flatten() }, { status: 400 });
  }

  const token = await getOrCreateVoterToken();
  const voterHash = createVoterHash(event.id, token);
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.rpc("submit_event_vote", {
    p_event_slug: slug,
    p_voter_hash: voterHash,
    p_song_ids: parsed.data.songIds
  });

  if (error) {
    console.error("Vote submission RPC failed", { slug, code: error.code, message: error.message });
    return NextResponse.json({ result: "internal_error" }, { status: 500 });
  }

  const result = Array.isArray(data) ? data[0]?.result : data?.result ?? data;
  const status = result === "success" ? 200 : result === "already_voted" ? 409 : result === "voting_closed" ? 403 : 400;
  return NextResponse.json({ result }, { status });
}
