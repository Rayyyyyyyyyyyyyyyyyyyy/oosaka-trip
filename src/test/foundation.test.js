import { describe, expect, it } from "vitest";

describe("test foundation", () => {
  it("provides a browser-like storage boundary", () => {
    localStorage.setItem("trip-runtime-test", "ready");

    expect(localStorage.getItem("trip-runtime-test")).toBe("ready");
  });
});
