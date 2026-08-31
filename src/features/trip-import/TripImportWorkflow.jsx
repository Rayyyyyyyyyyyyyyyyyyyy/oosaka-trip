import { lazy, Suspense } from "react";
import { MarkdownImportControls } from "./MarkdownImportControls";
import { OpenAIApiKeySettings } from "./OpenAIApiKeySettings";

const TripReviewDialog = lazy(() => import("../trip-review/TripReviewDialog").then((module) => ({ default: module.TripReviewDialog })));

export function TripImportWorkflow({ workflow }) {
  const { state, dispatch, startParse, retry, cancel, confirm } = workflow;

  return (
    <>
      <OpenAIApiKeySettings />
      <MarkdownImportControls
        state={state}
        dispatch={dispatch}
        onExtracted={startParse}
        onRetry={retry}
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
