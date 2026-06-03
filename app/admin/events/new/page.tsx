import { EventForm } from "../EventForm";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await requireUser();
  return (
    <main className="min-h-screen bg-ink px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-4xl font-semibold">Create event</h1>
        <EventForm />
      </div>
    </main>
  );
}
