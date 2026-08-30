export const initialImportState = {
  status: "idle",
  tripId: null,
  error: null,
};

export function importReducer(state, action) {
  switch (action.type) {
    case "SELECT_FILE":
      return { status: "validating", tripId: state.tripId, error: null, requestId: action.requestId, file: action.file };
    case "VALIDATED":
      if (state.requestId !== action.requestId) return state;
      return { ...state, status: "extracting", error: null };
    case "EXTRACTED":
      if (state.requestId !== action.requestId) return state;
      return { ...state, status: "parsing", sourceDocument: action.sourceDocument, error: null };
    case "PARSED":
      if (state.requestId !== action.requestId) return state;
      return { ...state, status: "reviewing", reviewSession: action.reviewSession, error: null };
    case "PARSE_FAILED":
      if (state.requestId !== action.requestId) return state;
      return { ...state, status: "parse_error", error: action.error };
    case "RETRY_PARSE":
      if (!state.sourceDocument) return state;
      return { ...state, status: "parsing", error: null };
    case "CONFIRM":
      return { ...state, status: "confirming", reviewSession: action.reviewSession ?? state.reviewSession, error: null };
    case "VIEW_TRIP":
      return { status: "viewing", tripId: action.tripId, error: null };
    case "RETURN_TO_IDLE":
      return initialImportState;
    case "FAIL":
      if (action.requestId && state.requestId !== action.requestId) return state;
      return { ...state, status: action.recoverTo ?? state.status, error: action.error };
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
