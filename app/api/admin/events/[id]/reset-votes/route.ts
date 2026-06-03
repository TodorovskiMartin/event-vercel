import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const body = (await request.json().catch(() => null)) as { confirmation?: string } | null;
  if (body?.confirmation !== "RESET TEST VOTES") return NextResponse.json({ error: "Confirmation phrase required." }, { status: 400 });

  const { data: event } = await supabase.from("events").select("id,status").eq("id", id).eq("created_by", user.id).single();
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (event.status === "results_revealed" || event.status === "archived") {
    return NextResponse.json({ error: "Votes cannot be reset after results are revealed or archived." }, { status: 409 });
  }

  const { error } = await supabase.from("votes").delete().eq("event_id", id);
  if (error) return NextResponse.json({ error: "Reset failed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
