import { describe, expect, it } from "vitest";
import { osakaTrip } from "../../fixtures/osakaTrip";
import { getTripRuntime, selectNextConfirmedEvent, selectRuntimeCandidates } from "./runtime";

describe("trip runtime", () => {
  it("uses the confirmed trip timezone", () => {
    expect(getTripRuntime(osakaTrip, new Date("2026-09-11T15:30:00Z"))).toMatchObject({
      date: "2026-09-12",
      phase: "during",
      minutes: 30,
    });
  });

  it("does not call flexible Uji time NOW", () => {
    const day = osakaTrip.days.find((item) => item.date === "2026-09-12");
    const result = selectRuntimeCandidates(day, 14 * 60 + 30);
    expect(result.current).toBeNull();
    expect(result.next?.title).toBe("清次郎 北新地店");
  });

  it("selects the earliest future exact event even when source order differs", () => {
    const day = {
      items: [
        { id: "late", kind: "event", timing: { kind: "exact", start: "19:06" } },
        { id: "early", kind: "event", timing: { kind: "exact", start: "18:00" } },
      ],
    };

    expect(selectRuntimeCandidates(day, 17 * 60).next?.id).toBe("early");
  });

  it("derives the pre-trip next event from canonical data", () => {
    const result = selectNextConfirmedEvent(osakaTrip, getTripRuntime(osakaTrip, new Date("2026-08-31T00:00:00Z")));
    expect(result).toMatchObject({ date: "2026-09-10", event: { id: "event-jx822" } });
  });
});
