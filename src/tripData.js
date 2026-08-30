import { parseCanonicalTrip } from "./domain/trip/schema";
import { selectViewerModel } from "./domain/trip/selectors";
import { osakaTrip } from "./fixtures/osakaTrip";
import { loadCanonicalTrip } from "./storage/tripStorage";

export const canonicalTrip = parseCanonicalTrip(loadCanonicalTrip() ?? osakaTrip);

const viewerModel = selectViewerModel(canonicalTrip);

export const trip = viewerModel.trip;
export const days = viewerModel.days;
export const reservations = viewerModel.reservations;
export const initialTodos = viewerModel.initialTodos;
