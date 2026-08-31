import { describe, expect, it } from "vitest";
import { loadPersistedCanonicalTrip, osakaSampleTrip } from "./tripData";

describe("trip entry data", () => {
  it("keeps the bundled Osaka trip explicit instead of treating it as persisted", () => {
    expect(loadPersistedCanonicalTrip()).toBeNull();
    expect(osakaSampleTrip.id).toBe("osaka-uji-nara-2026");
  });
});
