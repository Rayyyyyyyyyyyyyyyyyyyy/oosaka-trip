import { createCanonicalExport, parseCanonicalExport } from "../domain/trip/export";
import { parseCanonicalTrip } from "../domain/trip/schema";
import { LEGACY_OSAKA_TODO_KEY } from "../features/trip-viewer/todoState";

export const ACTIVE_TRIP_STORAGE_KEY = "trip-runtime:active-trip";
export const TRIP_STORAGE_PREFIX = "trip-runtime:trip:";

export function saveCanonicalTrip(trip, storage = globalThis.localStorage) {
  const validated = parseCanonicalTrip(trip);
  storage?.setItem(ACTIVE_TRIP_STORAGE_KEY, JSON.stringify(validated));
  return validated;
}

export function loadCanonicalTrip(storage = globalThis.localStorage) {
  try {
    const serialized = storage?.getItem(ACTIVE_TRIP_STORAGE_KEY);
    return serialized ? parseCanonicalTrip(JSON.parse(serialized)) : null;
  } catch {
    return null;
  }
}

export function exportCanonicalJson(trip, space = 2) {
  return JSON.stringify(createCanonicalExport(trip), null, space);
}

export function importCanonicalJson(serialized, storage = globalThis.localStorage) {
  const candidate = parseCanonicalExport(JSON.parse(serialized));
  const trip = parseCanonicalTrip(candidate.trip);
  saveCanonicalTrip(trip, storage);
  return trip;
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
