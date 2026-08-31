import { parseCanonicalTrip } from "./domain/trip/schema";
import { osakaTrip } from "./fixtures/osakaTrip";
import { loadCanonicalTrip } from "./storage/tripStorage";

export const osakaSampleTrip = parseCanonicalTrip(osakaTrip);
export function loadPersistedCanonicalTrip(storage) {
  return loadCanonicalTrip(storage);
}
