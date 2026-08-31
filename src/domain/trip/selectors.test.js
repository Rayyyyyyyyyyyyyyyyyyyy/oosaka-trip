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

  it("provides a clearly marked Maps search fallback for an unresolved place", () => {
    const candidate = structuredClone(osakaTrip);
    const event = candidate.days[0].items[0];
    event.place = "大阪市北區某地址";
    event.links = [];

    const selected = selectViewerModel(candidate).days[0].events[0];
    expect(selected.map).toBe("https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E9%98%AA%E5%B8%82%E5%8C%97%E5%8D%80%E6%9F%90%E5%9C%B0%E5%9D%80");
    expect(selected.mapIsFallback).toBe(true);
  });

  it("renders partial flight facts without undefined placeholders", () => {
    const candidate = structuredClone(osakaTrip);
    candidate.days[0].items[0].flight = { code: "JX822", origin: "TPE" };

    const [flight] = selectViewerModel(candidate).trip.flights;
    expect(flight.code).toBe("JX822");
    expect(flight.route).toBe("TPE");
    expect(flight.route).not.toContain("undefined");
  });
});
