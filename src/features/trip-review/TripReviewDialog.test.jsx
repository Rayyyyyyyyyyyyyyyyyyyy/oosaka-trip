import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { createReviewSession } from "../../domain/trip/review";
import { kyotoSourceDocument, parsedKyotoDraft } from "../../fixtures/parsedKyotoDraft";
import { TripReviewDialog } from "./TripReviewDialog";

describe("TripReviewDialog", () => {
  it("shows evidence and confirms a renderable draft by keyboard", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const session = createReviewSession(kyotoSourceDocument, parsedKyotoDraft);
    render(<TripReviewDialog initialSession={session} onCancel={vi.fn()} onConfirm={onConfirm} />);
    expect(screen.getByRole("status").textContent).toContain("可產生旅程");
    await user.click(screen.getAllByText("查看來源證據")[0]);
    expect(screen.getByText(/京都 2026\/10\/03/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "確認並開啟旅程" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("associates blockers with fields and revalidates corrections", async () => {
    const user = userEvent.setup();
    const draft = structuredClone(parsedKyotoDraft);
    draft.trip.timezone = null;
    const session = createReviewSession(kyotoSourceDocument, draft);
    render(<TripReviewDialog initialSession={session} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    const timezone = screen.getByLabelText("IANA 時區");
    expect(timezone.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("button", { name: "確認並開啟旅程" }).disabled).toBe(true);
    await user.type(timezone, "Asia/Tokyo");
    expect(timezone.getAttribute("aria-invalid")).toBe("false");
    expect(screen.getByRole("button", { name: "確認並開啟旅程" }).disabled).toBe(false);
  });

  it("supports adding a missed item and removing a false item", async () => {
    const user = userEvent.setup();
    render(<TripReviewDialog initialSession={createReviewSession(kyotoSourceDocument, parsedKyotoDraft)} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "補上漏掉的行程" }));
    expect(screen.getByDisplayValue("新增行程")).toBeTruthy();
    await user.click(screen.getAllByRole("button", { name: "移除誤判" })[1]);
    expect(screen.queryByDisplayValue("新增行程")).toBeNull();
  });

  it("describes all reference blocks as supporting information", () => {
    const draft = structuredClone(parsedKyotoDraft);
    draft.referenceBlocks = [{ blockId: "block-2", classification: "runtime_instruction", reason: "Use this at the station." }];
    render(<TripReviewDialog initialSession={createReviewSession(kyotoSourceDocument, draft)} onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByText(/參考、背景、操作指引或其他支援資訊/)).toBeTruthy();
  });
});
