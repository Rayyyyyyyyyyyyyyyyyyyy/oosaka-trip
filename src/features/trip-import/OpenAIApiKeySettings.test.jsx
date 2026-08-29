import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  OPENAI_API_KEY_STORAGE_KEY,
  saveOpenAIApiKey,
} from "../../storage/apiKeyStorage";
import { OpenAIApiKeySettings } from "./OpenAIApiKeySettings";

describe("OpenAIApiKeySettings", () => {
  it("saves a personal key without rendering its value", async () => {
    const user = userEvent.setup();
    render(<OpenAIApiKeySettings />);

    await user.type(screen.getByLabelText("OpenAI API key"), "sk-personal");
    await user.click(screen.getByRole("button", { name: "儲存 key" }));

    await screen.findByText("已設定個人 API key");
    expect(localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY)).not.toContain(
      "sk-personal",
    );
    expect(screen.queryByDisplayValue("sk-personal")).toBeNull();
  });

  it("clears a stored personal key", async () => {
    const user = userEvent.setup();
    await saveOpenAIApiKey("sk-personal");
    render(<OpenAIApiKeySettings />);

    await user.click(screen.getByRole("button", { name: "清除 key" }));

    await waitFor(() => {
      expect(localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY)).toBeNull();
    });
    expect(await screen.findByText("尚未設定 API key")).toBeTruthy();
  });
});
