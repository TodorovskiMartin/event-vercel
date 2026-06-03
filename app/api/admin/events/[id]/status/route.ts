import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { canTransitionStatus } from "@/lib/status";
import { statusPayloadSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const parsed = statusPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status." }, { status: 400 });

  const { data: event } = await supabase.from("events").select("id,status,songs(id)").eq("id", id).eq("created_by", user.id).single();
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (!canTransitionStatus(event.status, parsed.data.status)) return NextResponse.json({ error: `Cannot transition from ${event.status} to ${parsed.data.status}.` }, { status: 409 });
  if (["waiting", "voting_open"].includes(parsed.data.status) && event.songs.length < 3) {
    return NextResponse.json({ error: "Event must have at least 3 songs." }, { status: 400 });
  }

  const timestamps =
    parsed.data.status === "voting_open"
      ? { voting_opened_at: new Date().toISOString() }
      : parsed.data.status === "voting_closed"
        ? { voting_closed_at: new Date().toISOString() }
        : parsed.data.status === "results_revealed"
          ? { results_revealed_at: new Date().toISOString() }
          : {};

  const { data, error } = await supabase.from("events").update({ status: parsed.data.status, ...timestamps }).eq("id", id).eq("created_by", user.id).select("status").single();
  if (error || !data) {
    console.error("Status transition failed", { id, to: parsed.data.status, error: error?.message });
    return NextResponse.json({ error: "Status update failed." }, { status: 500 });
  }
  return NextResponse.json({ status: data.status });
}
