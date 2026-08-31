import { LEGACY_OSAKA_TODO_KEY, todoStorageKey } from "../../storage/tripStorageKeys";

export { LEGACY_OSAKA_TODO_KEY, todoStorageKey } from "../../storage/tripStorageKeys";

export function mergeTodoState(defaultTodos, savedTodos) {
  const savedState = new Map(
    Array.isArray(savedTodos)
      ? savedTodos.map((todo) => [todo.id, Boolean(todo.done)])
      : [],
  );
  return defaultTodos.map((todo) => ({
    ...todo,
    done: savedState.has(todo.id) ? savedState.get(todo.id) : todo.done,
  }));
}

export function loadTripTodos(tripId, defaultTodos, storage = globalThis.localStorage) {
  const key = todoStorageKey(tripId);
  try {
    const current = storage?.getItem(key);
    if (current) return mergeTodoState(defaultTodos, JSON.parse(current));

    if (tripId === "osaka-uji-nara-2026") {
      const legacy = storage?.getItem(LEGACY_OSAKA_TODO_KEY);
      if (legacy) {
        const migrated = mergeTodoState(defaultTodos, JSON.parse(legacy));
        storage.setItem(key, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {
    return defaultTodos;
  }
  return defaultTodos;
}

export function saveTripTodos(tripId, todos, storage = globalThis.localStorage) {
  storage?.setItem(todoStorageKey(tripId), JSON.stringify(todos));
  if (tripId === "osaka-uji-nara-2026") {
    storage?.setItem(LEGACY_OSAKA_TODO_KEY, JSON.stringify(todos));
  }
}
