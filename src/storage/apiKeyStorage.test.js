import { describe, expect, it } from "vitest";
import {
  OPENAI_API_KEY_STORAGE_KEY,
  clearOpenAIApiKey,
  loadOpenAIApiKey,
  saveOpenAIApiKey,
} from "./apiKeyStorage";

describe("OpenAI API key storage", () => {
  it("encrypts, saves, and loads the traveler-owned key", async () => {
    await saveOpenAIApiKey("  sk-personal  ");

    const stored = localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY);
    expect(stored).not.toContain("sk-personal");
    expect(JSON.parse(stored)).toMatchObject({
      version: 1,
      algorithm: "AES-GCM",
    });
    await expect(loadOpenAIApiKey()).resolves.toBe("sk-personal");
  });

  it("rejects an empty key without changing storage", async () => {
    await saveOpenAIApiKey("existing");

    await expect(saveOpenAIApiKey("   ")).rejects.toThrow("請輸入");
    await expect(loadOpenAIApiKey()).resolves.toBe("existing");
  });

  it("clears the encrypted value and its wrapping key", async () => {
    await saveOpenAIApiKey("sk-personal");

    await clearOpenAIApiKey();

    await expect(loadOpenAIApiKey()).resolves.toBe("");
  });
});
