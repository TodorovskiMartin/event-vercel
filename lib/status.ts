import { z } from "zod";

export const eventStatuses = ["draft", "ready", "waiting", "voting_open", "voting_closed", "results_revealed", "archived"] as const;
export const eventStatusSchema = z.enum(eventStatuses);
export type EventStatus = z.infer<typeof eventStatusSchema>;

const allowedTransitions: Record<EventStatus, EventStatus[]> = {
  draft: ["ready", "waiting", "archived"],
  ready: ["waiting", "draft", "archived"],
  waiting: ["voting_open", "draft", "archived"],
  voting_open: ["voting_closed"],
  voting_closed: ["voting_open", "results_revealed", "waiting", "archived"],
  results_revealed: ["voting_closed", "archived"],
  archived: []
};

export function canTransitionStatus(from: EventStatus, to: EventStatus) {
  return allowedTransitions[from].includes(to);
}

export function isPublicEventStatus(status: EventStatus) {
  return status !== "draft" && status !== "archived";
}
