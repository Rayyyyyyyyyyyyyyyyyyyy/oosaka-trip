import { describe, expect, it } from "vitest";
import { osakaTrip } from "../../fixtures/osakaTrip";
import { selectViewerModel } from "./selectors";

describe("trip selectors", () => {
  const model = selectViewerModel(osakaTrip);

  it("derives presentation labels instead of storing them canonically", () => {
    expect(model.trip.period).toBe("SEP 10 — SEP 15");
    expect(model.days[0]).toMatchObject({ n: "10", dow: "THU", label: "大阪" });
    expect(model.days[4].special).toBe(true);
  });

  it("keeps optional events outside the main timeline", () => {
    const uji = model.days.find((day) => day.date === "2026-09-12");
    expect(uji.optional).toHaveLength(5);
    expect(uji.events.some((event) => event.title === "宇治川")).toBe(false);
  });

  it("preserves exact source-provided URLs", () => {
    const nara = model.days.find((day) => day.date === "2026-09-13");
    expect(nara.events.find((event) => event.title === "東大寺・二月堂").map).toContain("%E6%9D%B1%E5%A4%A7%E5%AF%BA");
  });
});
