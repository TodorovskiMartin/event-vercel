import type { ZodIssue } from "zod";
import { requireUser } from "./auth";

export function formatValidationIssues(issues: ZodIssue[]) {
  return issues
    .map((issue) => {
      const path = issue.path.join(".");
      return path ? `${path}: ${issue.message}` : issue.message;
    })
    .join(" ");
}

function withNumericSuffix(slug: string, suffix: number) {
  const suffixText = `-${suffix}`;
  return `${slug.slice(0, 80 - suffixText.length).trim()}${suffixText}`;
}

export async function getAvailableSlug(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  requestedSlug: string,
  currentEventId?: string
) {
  for (let suffix = 1; suffix <= 50; suffix += 1) {
    const candidate = suffix === 1 ? requestedSlug : withNumericSuffix(requestedSlug, suffix);
    const { data, error } = await supabase.from("events").select("id").eq("slug", candidate).maybeSingle();
    if (error) throw error;
    if (!data || data.id === currentEventId) return candidate;
  }

  return withNumericSuffix(requestedSlug, Date.now());
}
