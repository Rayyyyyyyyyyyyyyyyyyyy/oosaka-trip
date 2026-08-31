import { parseCanonicalTrip } from "./domain/trip/schema";
import { osakaTrip } from "./fixtures/osakaTrip";
import { loadCanonicalTrip } from "./storage/tripStorage";

export const persistedCanonicalTrip = loadCanonicalTrip();
export const osakaSampleTrip = parseCanonicalTrip(osakaTrip);
