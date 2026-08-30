import { describe, expect, it } from "vitest";
import { importReducer, initialImportState, viewingImportState } from "./importReducer";

describe("importReducer shell", () => {
  it("represents idle and viewing without owning viewer state", () => {
    expect(importReducer(initialImportState, { type: "VIEW_TRIP", tripId: "trip-1" })).toEqual(
      viewingImportState("trip-1"),
    );
  });

  it("keeps errors scoped and recoverable", () => {
    const failed = importReducer(viewingImportState("trip-1"), { type: "FAIL", error: "Invalid import" });
    expect(importReducer(failed, { type: "DISMISS_ERROR" })).toEqual(viewingImportState("trip-1"));
  });

  it("ignores stale extraction results", () => {
    const active = importReducer(initialImportState, { type: "SELECT_FILE", requestId: "new", file: {} });
    expect(importReducer(active, { type: "EXTRACTED", requestId: "old", sourceDocument: {} })).toBe(active);
  });

  it("moves through validation and extraction", () => {
    const selected = importReducer(initialImportState, { type: "SELECT_FILE", requestId: "one", file: {} });
    const validated = importReducer(selected, { type: "VALIDATED", requestId: "one" });
    expect(importReducer(validated, { type: "EXTRACTED", requestId: "one", sourceDocument: { blocks: [] } })).toMatchObject({ status: "parsing" });
  });

  it("ignores a stale parsed response and exposes a retryable parse error", () => {
    const active = { status: "parsing", tripId: "trip-1", requestId: "new", sourceDocument: { blocks: [] }, error: null };
    expect(importReducer(active, { type: "PARSED", requestId: "old", reviewSession: {} })).toBe(active);
    const failed = importReducer(active, { type: "PARSE_FAILED", requestId: "new", error: "Provider unavailable" });
    expect(failed).toMatchObject({ status: "parse_error", error: "Provider unavailable" });
    expect(importReducer(failed, { type: "RETRY_PARSE" })).toMatchObject({ status: "parsing", error: null });
  });
});
