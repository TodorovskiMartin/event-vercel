"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function deleteEvent() {
    const confirmation = prompt('Type "DELETE EVENT" to permanently delete this event and all votes.');
    if (confirmation !== "DELETE EVENT") return;

    setDeleting(true);
    setMessage("");
    const response = await fetch(`/api/admin/events/${eventId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation })
    });
    const data = await response.json();
    setDeleting(false);

    if (response.ok) window.location.href = "/admin/events";
    else setMessage(data.error ?? "Could not delete event.");
  }

  return (
    <div>
      <Button className="bg-rose text-white" disabled={deleting} type="button" onClick={deleteEvent}>
        {deleting ? "Deleting..." : "Delete Event"}
      </Button>
      {message ? <p className="mt-2 text-sm text-rose">{message}</p> : null}
    </div>
  );
}
