import { describe, expect, it } from "vitest";
import { createCanonicalExport } from "./export";
import { osakaTrip } from "../../fixtures/osakaTrip";
import { viewerSemanticTrips } from "../../fixtures/viewerSemanticTrips";
import {
  selectJourneyLabels,
  selectNearestFixedAnchor,
  selectReadinessAttention,
  selectViewerModel,
} from "./selectors";

describe("trip selectors", () => {
  const model = selectViewerModel(osakaTrip);

  it("derives presentation labels instead of storing them canonically", () => {
    expect(model.trip.period).toBe("SEP 10 — SEP 15");
    expect(model.days[0]).toMatchObject({ n: "10", dow: "THU", label: "大阪" });
    expect(model.days[4].special).toBe(true);
  });

  it("derives an honest ordered journey from canonical destination labels and place codes", () => {
    expect(selectJourneyLabels(osakaTrip)).toEqual([
      "大阪",
      "宇治",
      "奈良",
      "USJ",
    ]);
  });

  it("selects only the first current readiness item", () => {
    const attention = selectReadinessAttention(
      model.reservations,
      model.initialTodos,
    );
    expect(attention).toMatchObject({
      todoId: "usj-ticket",
      status: "尚未確認門票",
    });
    const allReady = model.initialTodos.map((todo) => ({
      ...todo,
      done: true,
    }));
    expect(selectReadinessAttention(model.reservations, allReady)).toBeNull();
  });

  it("points to the canonical fixed event and omits the pointer when none exists", () => {
    expect(selectNearestFixedAnchor(osakaTrip.days[2])).toMatchObject({
      eventId: "event-seijiro",
      time: "19:30",
      title: "清次郎 北新地店",
    });
    expect(
      selectNearestFixedAnchor(viewerSemanticTrips.noFixedAnchor.days[2]),
    ).toBeNull();
  });

  it("keeps every presentation-only field out of CanonicalExport", () => {
    const exported = createCanonicalExport(
      osakaTrip,
      new Date("2026-09-01T00:00:00Z"),
    );
    expect(exported.trip).not.toHaveProperty("journeyLabels");
    expect(exported.trip.days[2]).not.toHaveProperty("fixedAnchor");
    expect(JSON.stringify(exported)).not.toContain("FIXED TIME");
  });

  it("uses the same presentation grammar regardless of source provenance", () => {
    const canonicalJsonTrip = structuredClone(osakaTrip);
    canonicalJsonTrip.provenance = [
      { sourceId: "canonical-json-import", locator: "local-export.json" },
    ];
    expect(selectViewerModel(canonicalJsonTrip)).toEqual(
      selectViewerModel(osakaTrip),
    );
  });

  it("provides canonical stress fixtures for the accepted semantic states", () => {
    const {
      missingAnchors,
      noFixedAnchor,
      approximateOpenEnded,
      alternativeConditional,
    } = viewerSemanticTrips;
    expect(selectViewerModel(missingAnchors).trip).toMatchObject({
      flights: [],
      stay: null,
    });
    expect(selectViewerModel(noFixedAnchor).days[2].fixedAnchor).toBeNull();
    expect(
      selectViewerModel(approximateOpenEnded)
        .days[5].events.filter((event) => event.semantic)
        .map((event) => event.semantic.timing),
    ).toEqual(
      expect.arrayContaining(["OPEN ENDED", "APPROXIMATE", "FIXED TIME"]),
    );
    expect(
      selectViewerModel(alternativeConditional)
        .days[1].events.filter((event) => event.semantic)
        .map((event) => event.semantic.relation),
    ).toEqual(expect.arrayContaining(["conditional", "alternative"]));
  });

  it("keeps optional events outside the main timeline", () => {
    const uji = model.days.find((day) => day.date === "2026-09-12");
    expect(uji.optional).toHaveLength(5);
    expect(uji.events.some((event) => event.title === "宇治川")).toBe(false);
  });

  it("preserves exact source-provided URLs", () => {
    const nara = model.days.find((day) => day.date === "2026-09-13");
    expect(
      nara.events.find((event) => event.title === "東大寺・二月堂").map,
    ).toContain("%E6%9D%B1%E5%A4%A7%E5%AF%BA");
  });

  it("provides a clearly marked Maps search fallback for an unresolved place", () => {
    const candidate = structuredClone(osakaTrip);
    const event = candidate.days[0].items[0];
    event.place = "大阪市北區某地址";
    event.links = [];

    const selected = selectViewerModel(candidate).days[0].events[0];
    expect(selected.map).toBe(
      "https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E9%98%AA%E5%B8%82%E5%8C%97%E5%8D%80%E6%9F%90%E5%9C%B0%E5%9D%80",
    );
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

  it("preserves distinct canonical IDs for partial flights without codes", () => {
    const candidate = structuredClone(osakaTrip);
    candidate.days[0].items[0].flight = { origin: "TPE" };
    candidate.days[5].items[2].flight = { destination: "TPE" };
    const flights = selectViewerModel(candidate).trip.flights;
    expect(flights.map((flight) => flight.id)).toEqual([
      "event-jx822",
      "event-jx821",
    ]);
    expect(flights.map((flight) => flight.code)).toEqual(["Flight", "Flight"]);
  });

  it("preserves reservation identity when display titles match", () => {
    const candidate = structuredClone(osakaTrip);
    candidate.reservations[1].title = candidate.reservations[0].title;
    expect(
      selectViewerModel(candidate)
        .reservations.slice(0, 2)
        .map((item) => item.id),
    ).toEqual(["reservation-museum", "reservation-seijiro"]);
  });

  it("keeps timeline identity stable when source order changes", () => {
    const candidate = structuredClone(osakaTrip);
    const before = selectViewerModel(candidate).days[0].events.map(
      (event) => event.id,
    );
    candidate.days[0].items.reverse();
    const after = selectViewerModel(candidate).days[0].events.map(
      (event) => event.id,
    );
    expect(after).toEqual([...before].reverse());
  });

  it("preserves distinct optional-place IDs when labels match", () => {
    const candidate = structuredClone(osakaTrip);
    candidate.days[2].items[5].title = candidate.days[2].items[4].title;
    const optional = selectViewerModel(candidate).days[2].optional;
    expect(optional.slice(0, 2).map((place) => place.id)).toEqual([
      "event-optional-uji-river",
      "event-optional-uji-island",
    ]);
  });
});
