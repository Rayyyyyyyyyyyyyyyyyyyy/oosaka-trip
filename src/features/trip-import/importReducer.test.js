import { describe, expect, it } from "vitest";
import { importReducer, initialImportState, viewingImportState } from "./importReducer";

describe("importReducer shell", () => {
  it("represents idle and viewing without owning viewer state", () => {
    const confirming = { ...initialImportState, status: "confirming", confirmationId: "confirmation" };
    expect(importReducer(confirming, { type: "VIEW_TRIP", confirmationId: "confirmation", tripId: "trip-1" })).toEqual(
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
    expect(importReducer(failed, { type: "RETRY_PARSE", requestId: "retry" })).toMatchObject({ status: "parsing", requestId: "retry", error: null });
  });

  it("requires both request identity and expected status for every async transition", () => {
    const validating = importReducer(initialImportState, { type: "SELECT_FILE", requestId: "one", file: {} });
    expect(importReducer(validating, { type: "EXTRACTED", requestId: "one", sourceDocument: {} })).toBe(validating);
    const extracting = importReducer(validating, { type: "VALIDATED", requestId: "one" });
    expect(importReducer(extracting, { type: "PARSED", requestId: "one", reviewSession: {} })).toBe(extracting);
    const parsing = importReducer(extracting, { type: "EXTRACTED", requestId: "one", sourceDocument: {} });
    expect(importReducer(parsing, { type: "VALIDATED", requestId: "one" })).toBe(parsing);
  });

  it("assigns retries a new request identity and ignores the superseded response", () => {
    const failed = { status: "parse_error", tripId: "trip-1", requestId: "old", sourceDocument: { blocks: [] }, error: "failed" };
    const retrying = importReducer(failed, { type: "RETRY_PARSE", requestId: "retry" });
    expect(retrying).toMatchObject({ status: "parsing", requestId: "retry" });
    expect(importReducer(retrying, { type: "PARSED", requestId: "old", reviewSession: {} })).toBe(retrying);
  });

  it("does not confirm or view from an unexpected status", () => {
    const viewing = viewingImportState("trip-1");
    expect(importReducer(viewing, { type: "CONFIRM", requestId: "confirm", reviewSession: {} })).toBe(viewing);
    expect(importReducer(viewing, { type: "VIEW_TRIP", requestId: "confirm", tripId: "trip-2" })).toBe(viewing);
  });
});
