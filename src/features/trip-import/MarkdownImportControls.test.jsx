import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { initialImportState } from "./importReducer";
import { MarkdownImportControls } from "./MarkdownImportControls";

describe("MarkdownImportControls", () => {
  it("supports keyboard file selection and dispatches the extraction sequence", async () => {
    const user = userEvent.setup();
    const dispatch = vi.fn();
    render(<MarkdownImportControls state={initialImportState} dispatch={dispatch} />);

    await user.upload(
      screen.getByLabelText("選擇 Markdown 檔案"),
      new File(["# Kyoto"], "trip.md", { type: "text/markdown" }),
    );

    await waitFor(() => expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "EXTRACTED" })));
    expect(dispatch.mock.calls.map(([action]) => action.type)).toEqual(["SELECT_FILE", "VALIDATED", "EXTRACTED"]);
  });

  it("accepts a dropped Markdown file", async () => {
    const dispatch = vi.fn();
    render(<MarkdownImportControls state={initialImportState} dispatch={dispatch} />);
    const dropZone = screen.getByText(/拖放一個 Markdown/).closest("div");

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [new File(["# Nara"], "trip.md", { type: "text/markdown" })] },
    });

    await waitFor(() => expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "EXTRACTED" })));
  });

  it("moves focus to an announced error", () => {
    render(<MarkdownImportControls state={{ ...initialImportState, error: "檔案無法讀取" }} dispatch={vi.fn()} />);
    expect(document.activeElement).toBe(screen.getByRole("alert"));
  });
});
