import { describe, expect, it } from "vitest";
import { canonicalTripSchema, parseCanonicalTrip } from "./schema";
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

  it("rejects timezones that Intl runtime formatters cannot use", () => {
    expect(() => parseCanonicalTrip({ ...osakaTrip, timezone: "not/a-timezone" })).toThrow(/timezone/i);
  });

  it.each(["http://example.com", "javascript:alert(1)", "data:text/plain,trip", "ftp://example.com/trip"])(
    "rejects unsupported external-link protocol in %s",
    (url) => {
      const candidate = structuredClone(osakaTrip);
      candidate.days[0].items[1].links[0].url = url;
      expect(() => parseCanonicalTrip(candidate)).toThrow(/https/i);
    },
  );

  it("retains an accepted exact HTTPS source URL byte-for-byte", () => {
    const candidate = structuredClone(osakaTrip);
    const exact = "https://www.google.com/maps/search/?api=1&query=Aloft%20Osaka%20Dojima%20Osaka";
    candidate.days[0].items[1].links[0].url = exact;
    expect(parseCanonicalTrip(candidate).days[0].items[1].links[0].url).toBe(exact);
  });

  it.each([
    ["days", (trip) => { trip.days[1].id = trip.days[0].id; }],
    ["days.0.items", (trip) => { trip.days[0].items[1].id = trip.days[0].items[0].id; }],
    ["links", (trip) => { trip.days[0].items[3].links[0].id = trip.days[0].items[1].links[0].id; }],
    ["reservations", (trip) => { trip.reservations[1].id = trip.reservations[0].id; }],
    ["todos", (trip) => { trip.todos[1].id = trip.todos[0].id; }],
  ])("rejects duplicate canonical IDs in %s", (path, mutate) => {
    const candidate = structuredClone(osakaTrip);
    mutate(candidate);
    const result = canonicalTripSchema.safeParse(candidate);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((issue) => issue.path.join(".").includes(path))).toBe(true);
  });

  it("rejects duplicate or out-of-order day dates", () => {
    const duplicate = structuredClone(osakaTrip);
    duplicate.days[1].date = duplicate.days[0].date;
    expect(() => parseCanonicalTrip(duplicate)).toThrow(/day date/i);

    const outOfOrder = structuredClone(osakaTrip);
    [outOfOrder.days[0], outOfOrder.days[1]] = [outOfOrder.days[1], outOfOrder.days[0]];
    expect(() => parseCanonicalTrip(outOfOrder)).toThrow(/chronological/i);
  });

  it("rejects reservation references to unknown todos", () => {
    const candidate = structuredClone(osakaTrip);
    candidate.reservations[0].todoId = "missing-todo";
    const result = canonicalTripSchema.safeParse(candidate);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toEqual(["reservations", 0, "todoId"]);
  });

  it("rejects one relation group reused with inconsistent kinds", () => {
    const candidate = structuredClone(osakaTrip);
    candidate.days[0].items[0].relation = { kind: "alternative", groupId: "arrival-choice" };
    candidate.days[0].items[1].relation = { kind: "fallback", groupId: "arrival-choice" };
    expect(() => parseCanonicalTrip(candidate)).toThrow(/relation group/i);
  });
});
