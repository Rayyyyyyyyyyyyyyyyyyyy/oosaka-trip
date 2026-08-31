import { describe, expect, it } from "vitest";
import { osakaSampleTrip, persistedCanonicalTrip } from "./tripData";

describe("trip entry data", () => {
  it("keeps the bundled Osaka trip explicit instead of treating it as persisted", () => {
    expect(persistedCanonicalTrip).toBeNull();
    expect(osakaSampleTrip.id).toBe("osaka-uji-nara-2026");
  });
});
