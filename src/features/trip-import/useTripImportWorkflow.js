import { useCallback, useEffect, useReducer, useRef } from "react";
import { saveCanonicalTrip as persistCanonicalTrip } from "../../storage/tripStorage";
import { importReducer, initialImportState, viewingImportState } from "./importReducer";

function requestId() {
  return globalThis.crypto?.randomUUID?.() ?? `request-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function parseServices(overrides) {
  const [parserModule, reviewModule] = await Promise.all([
    overrides.parseTrip ? null : import("../../services/parseTrip"),
    overrides.createReviewSession ? null : import("../../domain/trip/review"),
  ]);
  return {
    parseTrip: overrides.parseTrip ?? parserModule.parseTrip,
    createReviewSession: overrides.createReviewSession ?? reviewModule.createReviewSession,
  };
}

async function confirmationServices(overrides) {
  const reviewModule = overrides.confirmReviewSession ? null : await import("../../domain/trip/review");
  return {
    confirmReviewSession: overrides.confirmReviewSession ?? reviewModule.confirmReviewSession,
    saveCanonicalTrip: overrides.saveCanonicalTrip ?? persistCanonicalTrip,
  };
}

export function useTripImportWorkflow({ tripId = null, onTripConfirmed, services = {} } = {}) {
  const [state, rawDispatch] = useReducer(
    importReducer,
    tripId,
    (initialTripId) => initialTripId ? viewingImportState(initialTripId) : initialImportState,
  );
  const stateRef = useRef(state);
  const controllerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, []);

  const dispatch = useCallback((action) => {
    if (!mountedRef.current) return;
    if (action.type === "SELECT_FILE") {
      controllerRef.current?.abort();
      controllerRef.current = null;
    }
    stateRef.current = importReducer(stateRef.current, action);
    rawDispatch(action);
  }, []);

  const startParse = useCallback(async (sourceDocument, activeRequestId) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    try {
      const resolved = await parseServices(services);
      if (!mountedRef.current || controller.signal.aborted) return;
      const { draft } = await resolved.parseTrip({ sourceDocument, signal: controller.signal });
      if (!mountedRef.current || controller.signal.aborted) return;
      if (stateRef.current.status !== "parsing" || stateRef.current.requestId !== activeRequestId) return;
      dispatch({
        type: "PARSED",
        requestId: activeRequestId,
        reviewSession: resolved.createReviewSession(sourceDocument, draft),
      });
    } catch (error) {
      if (!mountedRef.current || controller.signal.aborted) return;
      dispatch({ type: "PARSE_FAILED", requestId: activeRequestId, error: error.message });
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, [dispatch, services]);

  const retry = useCallback(() => {
    if (stateRef.current.status !== "parse_error" || !stateRef.current.sourceDocument) return;
    const retryRequestId = requestId();
    const sourceDocument = stateRef.current.sourceDocument;
    dispatch({ type: "RETRY_PARSE", requestId: retryRequestId });
    void startParse(sourceDocument, retryRequestId);
  }, [dispatch, startParse]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    dispatch({ type: "CANCEL" });
  }, [dispatch]);

  const confirm = useCallback(async (session) => {
    const current = stateRef.current;
    if (current.status !== "reviewing") return;
    const confirmationId = requestId();
    dispatch({ type: "CONFIRM", requestId: current.requestId, confirmationId, reviewSession: session });
    try {
      const resolved = await confirmationServices(services);
      const canonicalTrip = resolved.confirmReviewSession(session);
      if (!mountedRef.current || stateRef.current.status !== "confirming" || stateRef.current.confirmationId !== confirmationId) return;
      const persistedTrip = resolved.saveCanonicalTrip(canonicalTrip);
      if (!mountedRef.current || stateRef.current.status !== "confirming" || stateRef.current.confirmationId !== confirmationId) return;
      dispatch({ type: "VIEW_TRIP", confirmationId, tripId: persistedTrip.id });
      onTripConfirmed?.(persistedTrip);
    } catch (error) {
      dispatch({ type: "FAIL", confirmationId, recoverTo: "reviewing", error: error.message });
    }
  }, [dispatch, onTripConfirmed, services]);

  return { state, dispatch, startParse, retry, cancel, confirm };
}
