import { lazy, Suspense, useRef } from "react";
import { saveCanonicalTrip } from "../../storage/tripStorage";
import { MarkdownImportControls } from "./MarkdownImportControls";
import { OpenAIApiKeySettings } from "./OpenAIApiKeySettings";

const TripReviewDialog = lazy(() => import("../trip-review/TripReviewDialog").then((module) => ({ default: module.TripReviewDialog })));

export function TripImportWorkflow({ state, dispatch }) {
  const parseController = useRef(null);

  const startParse = async (sourceDocument, requestId) => {
    parseController.current?.abort();
    const controller = new AbortController();
    parseController.current = controller;
    try {
      const [{ parseTrip }, { createReviewSession }] = await Promise.all([
        import("../../services/parseTrip"),
        import("../../domain/trip/review"),
      ]);
      const { draft } = await parseTrip({ sourceDocument, signal: controller.signal });
      if (!controller.signal.aborted) {
        dispatch({ type: "PARSED", requestId, reviewSession: createReviewSession(sourceDocument, draft) });
      }
    } catch (error) {
      if (!controller.signal.aborted) dispatch({ type: "PARSE_FAILED", requestId, error: error.message });
    } finally {
      if (parseController.current === controller) parseController.current = null;
    }
  };

  const cancel = () => {
    parseController.current?.abort();
    parseController.current = null;
    dispatch({ type: "CANCEL" });
  };

  const confirm = async (session) => {
    dispatch({ type: "CONFIRM", reviewSession: session });
    try {
      const { confirmReviewSession } = await import("../../domain/trip/review");
      const canonicalTrip = confirmReviewSession(session);
      saveCanonicalTrip(canonicalTrip);
      dispatch({ type: "VIEW_TRIP", tripId: canonicalTrip.id });
      window.location.reload();
    } catch (error) {
      dispatch({ type: "FAIL", recoverTo: "reviewing", error: error.message });
    }
  };

  return (
    <>
      <OpenAIApiKeySettings />
      <MarkdownImportControls
        state={state}
        dispatch={dispatch}
        onExtracted={startParse}
        onRetry={() => {
          dispatch({ type: "RETRY_PARSE" });
          void startParse(state.sourceDocument, state.requestId);
        }}
        onCancel={cancel}
      />
      {state.status === "reviewing" && state.reviewSession && (
        <Suspense fallback={null}>
          <TripReviewDialog initialSession={state.reviewSession} onCancel={cancel} onConfirm={confirm} />
        </Suspense>
      )}
    </>
  );
}
