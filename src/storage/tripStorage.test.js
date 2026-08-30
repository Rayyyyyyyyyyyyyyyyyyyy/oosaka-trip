import { beforeEach, describe, expect, it } from "vitest";
import { createCanonicalExport } from "../domain/trip/export";
import { osakaTrip } from "../fixtures/osakaTrip";
import {
  ACTIVE_TRIP_STORAGE_KEY,
  clearLocalTripData,
  importCanonicalJson,
  loadCanonicalTrip,
  saveCanonicalTrip,
} from "./tripStorage";

describe("tripStorage", () => {
  beforeEach(() => localStorage.clear());

  it("restores a validated canonical trip", () => {
    saveCanonicalTrip(osakaTrip);
    expect(loadCanonicalTrip()?.id).toBe(osakaTrip.id);
  });

  it("does not replace a valid trip when import is invalid", () => {
    saveCanonicalTrip(osakaTrip);
    expect(() => importCanonicalJson('{"exportVersion":99}')).toThrow();
    expect(loadCanonicalTrip()?.id).toBe(osakaTrip.id);
  });

  it("imports a supported canonical export", () => {
    const another = { ...osakaTrip, id: "another-trip", title: "Another Trip" };
    importCanonicalJson(JSON.stringify(createCanonicalExport(another)));
    expect(loadCanonicalTrip()?.title).toBe("Another Trip");
  });

  it("clears repository-owned trip data", () => {
    localStorage.setItem(ACTIVE_TRIP_STORAGE_KEY, "trip");
    localStorage.setItem("trip-runtime:trip:x:todos", "todos");
    localStorage.setItem("unrelated", "keep");
    clearLocalTripData();
    expect(localStorage.getItem(ACTIVE_TRIP_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem("trip-runtime:trip:x:todos")).toBeNull();
    expect(localStorage.getItem("unrelated")).toBe("keep");
  });

  it("surfaces storage quota failure without corrupting an existing value", () => {
    const storage = {
      value: JSON.stringify(osakaTrip),
      setItem() { throw new DOMException("Quota exceeded", "QuotaExceededError"); },
      getItem() { return this.value; },
    };
    expect(() => saveCanonicalTrip({ ...osakaTrip, title: "Changed" }, storage)).toThrow("Quota exceeded");
    expect(JSON.parse(storage.value).title).toBe(osakaTrip.title);
  });

  it("treats migration or stored-data read failure as no local trip", () => {
    expect(loadCanonicalTrip({ getItem() { throw new Error("storage blocked"); } })).toBeNull();
  });
});
