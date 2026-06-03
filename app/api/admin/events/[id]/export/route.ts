import { requireUser } from "@/lib/auth";
import { rankResults } from "@/lib/results";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { data: event } = await supabase.from("events").select("id,title").eq("id", id).eq("created_by", user.id).single();
  if (!event) return new Response("Event not found", { status: 404 });
  const { data } = await supabase.from("event_results").select("*").eq("event_id", id);
  const rows = rankResults(data ?? []);
  const csv = ["rank,track_number,title,vote_count,tied", ...rows.map((row) => [row.rank, row.track_number, JSON.stringify(row.title), row.vote_count, row.tied].join(","))].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-results.csv"`
    }
  });
}
