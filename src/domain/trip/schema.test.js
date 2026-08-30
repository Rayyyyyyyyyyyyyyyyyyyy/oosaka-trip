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
});
