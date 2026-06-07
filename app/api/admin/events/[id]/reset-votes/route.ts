import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const body = (await request.json().catch(() => null)) as { confirmation?: string } | null;
  if (body?.confirmation !== "RESET TEST VOTES") return NextResponse.json({ error: "Confirmation phrase required." }, { status: 400 });

  const { data: event } = await supabase.from("events").select("id,status").eq("id", id).eq("created_by", user.id).single();
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (event.status === "archived") {
    return NextResponse.json({ error: "Votes cannot be reset after an event is archived." }, { status: 409 });
  }

  const { data, error } = await supabase.rpc("reset_event_votes", {
    p_event_id: id
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = Array.isArray(data) ? data[0] : data;
  if (result?.result !== "success") return NextResponse.json({ error: "Reset is not allowed for this event." }, { status: 403 });

  return NextResponse.json({ ok: true, deletedCount: result.deleted_count ?? 0 });
}
