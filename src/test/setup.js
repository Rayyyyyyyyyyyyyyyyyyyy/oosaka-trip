import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "fake-indexeddb/auto";

globalThis.matchMedia ??= (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() { return false; },
});

afterEach(async () => {
  cleanup();
  localStorage.clear();
  await new Promise((resolve) => {
    const request = indexedDB.deleteDatabase("trip-runtime-secrets");
    request.onsuccess = request.onerror = request.onblocked = () => resolve();
  });
});
