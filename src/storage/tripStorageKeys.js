export const ACTIVE_TRIP_STORAGE_KEY = "trip-runtime:active-trip";
export const TRIP_STORAGE_PREFIX = "trip-runtime:trip:";
export const LEGACY_OSAKA_TODO_KEY = "osaka-trip-todos";

export function todoStorageKey(tripId) {
  return `${TRIP_STORAGE_PREFIX}${tripId}:todos`;
}
