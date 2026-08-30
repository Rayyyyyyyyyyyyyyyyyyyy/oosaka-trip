import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { osakaTrip } from "../../fixtures/osakaTrip";
import { CanonicalTripControls } from "./CanonicalTripControls";

describe("CanonicalTripControls", () => {
  it("keeps the current trip when an invalid JSON file is selected", async () => {
    const user = userEvent.setup();
    render(<CanonicalTripControls trip={osakaTrip} />);
    const input = screen.getByLabelText("匯入 Trip JSON");
    await user.upload(input, new File(["not json"], "invalid.json", { type: "application/json" }));
    expect(await screen.findByText(/原本旅程未被取代/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "匯出 Trip JSON" })).toBeTruthy();
  });
});
