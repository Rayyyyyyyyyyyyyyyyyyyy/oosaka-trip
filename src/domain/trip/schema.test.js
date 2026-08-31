import { describe, expect, it } from "vitest";
import { canonicalTripSchema } from "./schema";
import { osakaTrip } from "../../fixtures/osakaTrip";

describe("canonicalTripSchema", () => {
  it("accepts the Osaka canonical fixture", () => {
    expect(canonicalTripSchema.parse(osakaTrip)).toEqual(osakaTrip);
  });

  it.each(["n", "dow", "period", "dayCount", "runtime", "special", "className"])(
    "rejects presentation-only field %s",
    (field) => {
      expect(() => canonicalTripSchema.parse({ ...osakaTrip, [field]: "forbidden" })).toThrow();
    },
  );

  it("preserves open-ended, cross-midnight, relationship, and transit endpoint semantics", () => {
    const candidate = structuredClone(osakaTrip);
    candidate.days[0].items = [
      {
        id: "event-night-market",
        kind: "event",
        type: "activity",
        title: "夜市",
        timing: { kind: "open_ended", start: "21:00", label: "21:00 起" },
        relation: { kind: "alternative", groupId: "dinner-choice" },
        links: [],
      },
      {
        id: "event-late-train",
        kind: "event",
        type: "transport",
        title: "夜行列車",
        timing: { kind: "range", start: "23:30", end: "01:00", label: "23:30–01:00", crossesMidnight: true },
        links: [],
      },
      { id: "transit-station", kind: "transit", label: "前往車站", from: "飯店", to: "大阪站" },
    ];

    expect(canonicalTripSchema.parse(candidate).days[0].items).toEqual(candidate.days[0].items);
  });

  it("accepts source-supported partial flight entities", () => {
    const candidate = structuredClone(osakaTrip);
    candidate.days[0].items[0].flight = { code: "JX822", origin: "TPE" };
    expect(canonicalTripSchema.parse(candidate).days[0].items[0].flight).toEqual({ code: "JX822", origin: "TPE" });
  });
});
