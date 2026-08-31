import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTripImportWorkflow } from "./useTripImportWorkflow";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function beginParse(workflow, sourceDocument = { source: { id: "source" }, blocks: [] }, requestId = "request-1") {
  workflow.dispatch({ type: "SELECT_FILE", requestId, file: {} });
  workflow.dispatch({ type: "VALIDATED", requestId });
  workflow.dispatch({ type: "EXTRACTED", requestId, sourceDocument });
  return workflow.startParse(sourceDocument, requestId);
}

describe("useTripImportWorkflow", () => {
  it("retains parsing ownership across presentation rerenders and cancels explicitly", async () => {
    const pending = deferred();
    let activeSignal;
    const parseTrip = vi.fn(({ signal }) => {
      activeSignal = signal;
      return pending.promise;
    });
    const { result, rerender } = renderHook(() => useTripImportWorkflow({
      tripId: "existing-trip",
      services: { parseTrip, createReviewSession: vi.fn() },
    }));

    await act(async () => {
      void beginParse(result.current);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current.state.status).toBe("parsing");
    rerender();
    expect(result.current.state.status).toBe("parsing");
    act(() => result.current.cancel());
    expect(activeSignal.aborted).toBe(true);
    expect(result.current.state).toMatchObject({ status: "viewing", tripId: "existing-trip" });

    await act(async () => pending.resolve({ draft: {} }));
    expect(result.current.state.status).toBe("viewing");
  });

  it("aborts the active request when its stable owner unmounts", async () => {
    let activeSignal;
    const parseTrip = vi.fn(({ signal }) => {
      activeSignal = signal;
      return new Promise(() => {});
    });
    const { result, unmount } = renderHook(() => useTripImportWorkflow({
      services: { parseTrip, createReviewSession: vi.fn() },
    }));
    await act(async () => {
      void beginParse(result.current);
      await Promise.resolve();
      await Promise.resolve();
    });
    unmount();
    expect(activeSignal.aborted).toBe(true);
  });

  it("ignores a stale response after a newer request starts", async () => {
    const first = deferred();
    const second = deferred();
    const parseTrip = vi.fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    const createReviewSession = vi.fn((source, draft) => ({ id: draft.id, source }));
    const { result } = renderHook(() => useTripImportWorkflow({ services: { parseTrip, createReviewSession } }));

    await act(async () => {
      void beginParse(result.current, { source: { id: "old" }, blocks: [] }, "old");
      await Promise.resolve();
      await Promise.resolve();
    });
    act(() => { void beginParse(result.current, { source: { id: "new" }, blocks: [] }, "new"); });
    await act(async () => first.resolve({ draft: { id: "old-draft" } }));
    expect(result.current.state.status).toBe("parsing");
    await act(async () => second.resolve({ draft: { id: "new-draft" } }));
    expect(result.current.state).toMatchObject({ status: "reviewing", reviewSession: { id: "new-draft" } });
  });

  it("persists before updating the root trip and preserves the previous trip on failure", async () => {
    const onTripConfirmed = vi.fn();
    const saveCanonicalTrip = vi.fn(() => { throw new DOMException("Quota exceeded", "QuotaExceededError"); });
    const services = {
      confirmReviewSession: vi.fn(() => ({ id: "replacement" })),
      saveCanonicalTrip,
    };
    const { result } = renderHook(() => useTripImportWorkflow({ tripId: "existing-trip", onTripConfirmed, services }));
    act(() => {
      result.current.dispatch({ type: "SELECT_FILE", requestId: "review", file: {} });
      result.current.dispatch({ type: "VALIDATED", requestId: "review" });
      result.current.dispatch({ type: "EXTRACTED", requestId: "review", sourceDocument: {} });
      result.current.dispatch({ type: "PARSED", requestId: "review", reviewSession: { id: "session" } });
    });

    await act(async () => result.current.confirm({ id: "session" }));
    expect(saveCanonicalTrip).toHaveBeenCalledOnce();
    expect(onTripConfirmed).not.toHaveBeenCalled();
    expect(result.current.state).toMatchObject({ status: "reviewing", tripId: "existing-trip", error: "Quota exceeded" });
  });

  it("updates the root only after a successful persistence write", async () => {
    const calls = [];
    const onTripConfirmed = vi.fn(() => calls.push("root"));
    const services = {
      confirmReviewSession: vi.fn(() => ({ id: "replacement" })),
      saveCanonicalTrip: vi.fn((trip) => { calls.push("persist"); return trip; }),
    };
    const { result } = renderHook(() => useTripImportWorkflow({ tripId: "existing-trip", onTripConfirmed, services }));
    act(() => {
      result.current.dispatch({ type: "SELECT_FILE", requestId: "review", file: {} });
      result.current.dispatch({ type: "VALIDATED", requestId: "review" });
      result.current.dispatch({ type: "EXTRACTED", requestId: "review", sourceDocument: {} });
      result.current.dispatch({ type: "PARSED", requestId: "review", reviewSession: { id: "session" } });
    });
    await act(async () => result.current.confirm({ id: "session" }));
    expect(calls).toEqual(["persist", "root"]);
    expect(result.current.state).toMatchObject({ status: "viewing", tripId: "replacement" });
  });
});
