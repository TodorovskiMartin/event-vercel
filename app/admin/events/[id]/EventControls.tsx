"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import type { EventStatus } from "@/lib/status";

const statusLabels: Record<EventStatus, string> = {
  draft: "Draft",
  ready: "Ready",
  waiting: "Waiting",
  voting_open: "Voting open",
  voting_closed: "Voting closed",
  results_revealed: "Results revealed",
  archived: "Archived"
};

export function EventControls({ eventId, initialStatus }: { eventId: string; initialStatus: EventStatus }) {
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");

  async function changeStatus(nextStatus: EventStatus) {
    const warning =
      status === "results_revealed" && nextStatus === "voting_closed"
        ? "This will hide public results and return the event to Voting closed. You can reopen voting after that."
        : `Change event status to ${statusLabels[nextStatus]}?`;
    if (!confirm(warning)) return;
    setMessage("");
    const response = await fetch(`/api/admin/events/${eventId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    const data = await response.json();
    if (response.ok) {
      setStatus(data.status);
      setMessage("Status updated.");
    } else {
      setMessage(data.error ?? "Status update failed.");
    }
  }

  async function resetVotes() {
    const confirmation = prompt('Type "RESET TEST VOTES" to delete rehearsal votes.');
    if (confirmation !== "RESET TEST VOTES") return;
    const response = await fetch(`/api/admin/events/${eventId}/reset-votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation })
    });
    const data = await response.json();
    setMessage(response.ok ? `Votes reset. Deleted ${data.deletedCount ?? 0} vote records.` : data.error ?? "Reset failed.");
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-stage p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg font-semibold">Status</span>
        <span className="rounded-full bg-zinc-950 px-3 py-1 text-sm">{statusLabels[status]}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {["draft", "ready", "voting_closed"].includes(status) ? (
          <Button onClick={() => changeStatus("waiting")}>Set Waiting</Button>
        ) : null}
        {["waiting", "voting_closed"].includes(status) ? (
          <Button onClick={() => changeStatus("voting_open")}>{status === "voting_closed" ? "Reopen Voting" : "Open Voting"}</Button>
        ) : null}
        {status === "voting_open" ? <Button onClick={() => changeStatus("voting_closed")}>Close Voting</Button> : null}
        {status === "voting_closed" ? <Button onClick={() => changeStatus("results_revealed")}>Reveal Results</Button> : null}
        {status === "results_revealed" ? (
          <Button className="bg-zinc-200" onClick={() => changeStatus("voting_closed")}>Back to Voting Closed</Button>
        ) : null}
        <Button className="bg-rose text-white" onClick={resetVotes}>Reset Test Votes</Button>
      </div>
      {message ? <p className="mt-3 text-sm text-zinc-300">{message}</p> : null}
    </div>
  );
}
