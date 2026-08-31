import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TripHome } from "./TripHome";

describe("TripHome", () => {
  it("offers import controls and opens Osaka only through an explicit action", async () => {
    const onOpenSample = vi.fn();
    render(<TripHome onOpenSample={onOpenSample} />);

    expect(await screen.findByRole("button", { name: "匯入 Trip JSON" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "匯出 Trip JSON" })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "查看大阪內建範例" }));
    expect(onOpenSample).toHaveBeenCalledOnce();
  });
});
