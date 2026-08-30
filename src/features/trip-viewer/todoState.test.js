import { beforeEach, describe, expect, it } from "vitest";
import {
  LEGACY_OSAKA_TODO_KEY,
  loadTripTodos,
  saveTripTodos,
  todoStorageKey,
} from "./todoState";

const defaults = [
  { id: "hotel", label: "Hotel", done: true },
  { id: "usj-ticket", label: "USJ", done: false },
];

describe("trip checklist storage", () => {
  beforeEach(() => localStorage.clear());

  it("migrates the legacy Osaka key without losing checked state", () => {
    localStorage.setItem(
      LEGACY_OSAKA_TODO_KEY,
      JSON.stringify([{ id: "usj-ticket", label: "Old", done: true }]),
    );
    const loaded = loadTripTodos("osaka-uji-nara-2026", defaults);
    expect(loaded.find((todo) => todo.id === "usj-ticket").done).toBe(true);
    expect(localStorage.getItem(todoStorageKey("osaka-uji-nara-2026"))).toBeTruthy();
  });

  it("stores each trip under its own stable key", () => {
    saveTripTodos("another-trip", defaults);
    expect(localStorage.getItem(todoStorageKey("another-trip"))).toContain("usj-ticket");
  });

  it("keeps the Osaka legacy key synchronized during migration", () => {
    saveTripTodos("osaka-uji-nara-2026", defaults);
    expect(localStorage.getItem(LEGACY_OSAKA_TODO_KEY)).toContain("usj-ticket");
  });
});
