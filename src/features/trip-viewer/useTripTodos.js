import { useState } from "react";
import { loadTripTodos, saveTripTodos } from "./todoState";

export function useTripTodos(tripId, initialTodos) {
  const [todos, setTodos] = useState(() => loadTripTodos(tripId, initialTodos));
  const toggleTodo = (id) =>
    setTodos((current) => {
      const next = current.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      );
      saveTripTodos(tripId, next);
      return next;
    });
  return [todos, toggleTodo];
}
