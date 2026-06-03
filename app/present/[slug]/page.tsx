import { ProjectorClient } from "./ProjectorClient";
import { requireUser } from "@/lib/auth";
import { env } from "@/lib/config";
import { getPublicEventBySlug } from "@/lib/data/public";
import { rankResults } from "@/lib/results";
import { decodePathSegment, publicEventPath } from "@/lib/urls";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, user } = await requireUser();
  const event = await getPublicEventBySlug(decodePathSegment(slug));
  if (!event) notFound();
  const { data: owned } = await supabase.from("events").select("id").eq("id", event.id).eq("created_by", user.id).single();
  if (!owned) notFound();
  const { data } = await supabase.from("event_results").select("*").eq("event_id", event.id);
  return <ProjectorClient event={event} results={rankResults(data ?? [])} publicUrl={`${env.NEXT_PUBLIC_APP_URL}${publicEventPath(event.slug)}`} />;
}
