import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { osakaTrip } from "../../fixtures/osakaTrip";
import { TripViewer } from "./TripViewer";

describe("TripViewer identity and scoped clearing", () => {
  it("renders same-title reservations independently without duplicate-key warnings", async () => {
    const candidate = structuredClone(osakaTrip);
    candidate.reservations[1].title = candidate.reservations[0].title;
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<TripViewer canonicalTrip={candidate} />);

    await userEvent.click(screen.getByLabelText("開啟選單"));
    await userEvent.click(screen.getByText("Reservations"));
    expect(screen.getAllByText("Museum of Spatial Art", { selector: "h3" })).toHaveLength(2);
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain("same key");
    consoleError.mockRestore();
  });

  it("clears through the root callback without reloading", async () => {
    const onTripCleared = vi.fn();
    render(<TripViewer canonicalTrip={osakaTrip} onTripCleared={onTripCleared} />);
    await userEvent.click(screen.getByLabelText("開啟選單"));
    await userEvent.click(screen.getByRole("button", { name: "清除這趟本機旅程" }));
    await userEvent.click(screen.getByRole("button", { name: "確認清除" }));
    expect(onTripCleared).toHaveBeenCalledOnce();
  });

  it("keeps static Overview and Day usable when runtime derivation is unavailable", async () => {
    const candidate = { ...osakaTrip, timezone: "not/a-timezone" };
    render(<TripViewer canonicalTrip={candidate} />);
    expect(screen.getAllByText("大阪・宇治・奈良").length).toBeGreaterThan(0);

    await userEvent.click(screen.getByLabelText("開啟選單"));
    await userEvent.click(screen.getByText("Today / Now"));
    expect(screen.getByText(/不顯示 NOW、NEXT、倒數或建議離開時間/)).toBeTruthy();
    await userEvent.click(screen.getAllByRole("tab", { hidden: true })[0]);
    expect(screen.getByText("JX822 桃園起飛", { selector: "h3" })).toBeTruthy();
  });
});
