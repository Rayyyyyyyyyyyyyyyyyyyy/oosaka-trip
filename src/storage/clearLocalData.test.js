import { beforeEach, describe, expect, it } from "vitest";
import { saveOpenAIApiKey, loadOpenAIApiKey } from "./apiKeyStorage";
import { clearAllLocalData } from "./clearLocalData";
import { ACTIVE_TRIP_STORAGE_KEY } from "./tripStorage";

describe("clearAllLocalData", () => {
  beforeEach(() => localStorage.clear());

  it("clears trip data and the personal provider credential", async () => {
    localStorage.setItem(ACTIVE_TRIP_STORAGE_KEY, "trip");
    await saveOpenAIApiKey("sk-personal");
    await clearAllLocalData();
    expect(localStorage.getItem(ACTIVE_TRIP_STORAGE_KEY)).toBeNull();
    await expect(loadOpenAIApiKey()).resolves.toBe("");
  });
});
