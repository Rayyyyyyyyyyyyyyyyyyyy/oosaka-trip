export const initialImportState = {
  status: "idle",
  tripId: null,
  error: null,
};

export function importReducer(state, action) {
  switch (action.type) {
    case "SELECT_FILE":
      if (state.status === "confirming") return state;
      return { status: "validating", tripId: state.tripId, error: null, requestId: action.requestId, file: action.file };
    case "VALIDATED":
      if (state.status !== "validating" || state.requestId !== action.requestId) return state;
      return { ...state, status: "extracting", error: null };
    case "EXTRACTED":
      if (state.status !== "extracting" || state.requestId !== action.requestId) return state;
      return { ...state, status: "parsing", sourceDocument: action.sourceDocument, error: null };
    case "PARSED":
      if (state.status !== "parsing" || state.requestId !== action.requestId) return state;
      return { ...state, status: "reviewing", reviewSession: action.reviewSession, error: null };
    case "PARSE_FAILED":
      if (state.status !== "parsing" || state.requestId !== action.requestId) return state;
      return { ...state, status: "parse_error", error: action.error };
    case "RETRY_PARSE":
      if (state.status !== "parse_error" || !state.sourceDocument || !action.requestId) return state;
      return { ...state, status: "parsing", requestId: action.requestId, error: null };
    case "CONFIRM":
      if (state.status !== "reviewing" || (action.requestId && state.requestId !== action.requestId)) return state;
      return { ...state, status: "confirming", confirmationId: action.confirmationId, reviewSession: action.reviewSession ?? state.reviewSession, error: null };
    case "VIEW_TRIP":
      if (state.status !== "confirming" || state.confirmationId !== action.confirmationId) return state;
      return { status: "viewing", tripId: action.tripId, error: null };
    case "RETURN_TO_IDLE":
      if (state.status !== "parse_error") return state;
      return state.tripId ? viewingImportState(state.tripId) : initialImportState;
    case "FAIL":
      if (action.confirmationId) {
        if (state.status !== "confirming" || state.confirmationId !== action.confirmationId) return state;
      } else if (action.requestId) {
        if (!["validating", "extracting", "parsing", "parse_error"].includes(state.status) || state.requestId !== action.requestId) return state;
      }
      return { ...state, status: action.recoverTo ?? state.status, confirmationId: undefined, error: action.error };
    case "CANCEL":
      return state.tripId ? viewingImportState(state.tripId) : initialImportState;
    case "DISMISS_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export function viewingImportState(tripId) {
  return { status: "viewing", tripId, error: null };
}
