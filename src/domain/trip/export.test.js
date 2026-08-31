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

  it("round-trips relationship, timing, partial-flight, and transit endpoint semantics", () => {
    const candidate = structuredClone(osakaTrip);
    candidate.days[0].items = [
      { id: "event-choice", kind: "event", type: "activity", title: "Choice", timing: { kind: "open_ended", start: "20:00", label: "20:00 起" }, relation: { kind: "alternative", groupId: "night-choice" }, links: [], flight: { code: "JX822" } },
      { id: "transit-choice", kind: "transit", label: "Return", from: "Station", to: "Hotel" },
    ];

    const restored = parseCanonicalExport(createCanonicalExport(candidate)).trip;
    expect(restored.days[0].items).toEqual(candidate.days[0].items);
  });
});
