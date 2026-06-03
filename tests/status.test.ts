import { describe, expect, it } from "vitest";
import { canTransitionStatus } from "@/lib/status";

describe("event status transitions", () => {
  it("allows the live event happy path", () => {
    expect(canTransitionStatus("waiting", "voting_open")).toBe(true);
    expect(canTransitionStatus("voting_open", "voting_closed")).toBe(true);
    expect(canTransitionStatus("voting_closed", "results_revealed")).toBe(true);
  });

  it("allows reopening voting after closing it", () => {
    expect(canTransitionStatus("voting_closed", "voting_open")).toBe(true);
  });

  it("rejects reopening voting after results are revealed", () => {
    expect(canTransitionStatus("results_revealed", "voting_open")).toBe(false);
  });
});
