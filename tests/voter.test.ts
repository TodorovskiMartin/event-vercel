import { describe, expect, it, vi } from "vitest";

vi.stubEnv("VOTER_HASH_SECRET", "a-long-secret-used-only-for-unit-tests");

describe("voter hash", () => {
  it("is deterministic and event-scoped", async () => {
    const { createVoterHash } = await import("@/lib/voter");
    const first = createVoterHash("event-1", "token");
    expect(createVoterHash("event-1", "token")).toBe(first);
    expect(createVoterHash("event-2", "token")).not.toBe(first);
  });
});
