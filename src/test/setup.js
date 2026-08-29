import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "fake-indexeddb/auto";

afterEach(async () => {
  cleanup();
  localStorage.clear();
  await new Promise((resolve) => {
    const request = indexedDB.deleteDatabase("trip-runtime-secrets");
    request.onsuccess = request.onerror = request.onblocked = () => resolve();
  });
});
