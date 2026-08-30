import { describe, expect, it } from "vitest";
import { osakaTrip } from "../../fixtures/osakaTrip";
import { getTripRuntime, selectRuntimeCandidates } from "./runtime";

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
});
