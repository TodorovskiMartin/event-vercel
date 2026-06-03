import { describe, expect, it } from "vitest";
import { pdfSafeText, safeDownloadName } from "@/lib/qr";

describe("QR export helpers", () => {
  it("keeps response download filenames ASCII-safe", () => {
    expect(safeDownloadName("албум промоција")).toBe("event");
    expect(safeDownloadName("My Event 2026")).toBe("my-event-2026");
  });

  it("keeps PDF built-in-font text safe", () => {
    expect(pdfSafeText("Настан")).toBe("Event");
    expect(pdfSafeText("Nova Echo")).toBe("Nova Echo");
  });
});
