import { createCanonicalExport, parseCanonicalExport } from "../domain/trip/export";
import { parseCanonicalTrip } from "../domain/trip/schema";
import { ACTIVE_TRIP_STORAGE_KEY, LEGACY_OSAKA_TODO_KEY, TRIP_STORAGE_PREFIX } from "./tripStorageKeys";

export { ACTIVE_TRIP_STORAGE_KEY, TRIP_STORAGE_PREFIX } from "./tripStorageKeys";

export function saveCanonicalTrip(trip, storage = globalThis.localStorage) {
  const validated = parseCanonicalTrip(trip);
  const serialized = JSON.stringify(validated);
  storage?.setItem(ACTIVE_TRIP_STORAGE_KEY, serialized);
  return validated;
}

export function loadCanonicalTripState(storage = globalThis.localStorage) {
  let serialized;
  try {
    serialized = storage?.getItem(ACTIVE_TRIP_STORAGE_KEY);
  } catch (error) {
    return { trip: null, status: "unavailable", error };
  }
  if (!serialized) return { trip: null, status: "empty", error: null };
  try {
    return { trip: parseCanonicalTrip(JSON.parse(serialized)), status: "ready", error: null };
  } catch (error) {
    return { trip: null, status: "invalid", error };
  }
}

export function loadCanonicalTrip(storage = globalThis.localStorage) {
  return loadCanonicalTripState(storage).trip;
}

export function exportCanonicalJson(trip, space = 2) {
  return JSON.stringify(createCanonicalExport(trip), null, space);
}

export function importCanonicalJson(serialized, storage = globalThis.localStorage) {
  const candidate = parseCanonicalExport(JSON.parse(serialized));
  return saveCanonicalTrip(candidate.trip, storage);
}

export function clearLocalTripData(storage = globalThis.localStorage) {
  if (!storage) return;
  const keys = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(TRIP_STORAGE_PREFIX)) keys.push(key);
  }
  keys.forEach((key) => storage.removeItem(key));
  storage.removeItem(ACTIVE_TRIP_STORAGE_KEY);
  storage.removeItem(LEGACY_OSAKA_TODO_KEY);
}
