import { describe, expect, it } from "vitest";
import { osakaTrip } from "../../fixtures/osakaTrip";
import { createCanonicalExport, parseCanonicalExport } from "./export";

describe("CanonicalExport", () => {
  it("projects only portable allowlisted data", () => {
    const result = createCanonicalExport(
      { ...osakaTrip, provenance: [{ sourceId: "private", locator: "raw:1-99" }] },
      new Date("2026-08-30T00:00:00Z"),
    );
    expect(result.trip).not.toHaveProperty("provenance");
    expect(JSON.stringify(result)).not.toContain("raw:1-99");
  });

  it("rejects unsupported export versions", () => {
    const valid = createCanonicalExport(osakaTrip);
    expect(() => parseCanonicalExport({ ...valid, exportVersion: 2 })).toThrow();
  });
});
