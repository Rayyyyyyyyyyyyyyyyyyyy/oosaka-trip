import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { osakaTrip } from "./fixtures/osakaTrip";
import { TripRuntimeApp } from "./App";

describe("TripRuntimeApp entry flow", () => {
  it("opens Home when no confirmed trip is persisted and shows Osaka only on request", async () => {
    render(<TripRuntimeApp initialTrip={null} sampleTrip={osakaTrip} />);
    expect(screen.getByRole("heading", { name: "把你的行程帶進來" })).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "查看大阪內建範例" }));
    expect((await screen.findAllByText("大阪・宇治・奈良")).length).toBeGreaterThan(0);
  });

  it("bypasses Home for a confirmed trip", () => {
    render(<TripRuntimeApp initialTrip={osakaTrip} />);
    expect(screen.queryByRole("heading", { name: "把你的行程帶進來" })).toBeNull();
    expect(screen.getAllByText("大阪・宇治・奈良").length).toBeGreaterThan(0);
  });

  it("renders a generic all-day trip without Osaka-specific content", async () => {
    const candidate = structuredClone(osakaTrip);
    candidate.id = "custom-trip";
    candidate.title = "北國一日旅程";
    candidate.destination = "北國";
    candidate.startDate = "2026-10-03";
    candidate.endDate = "2026-10-03";
    candidate.days = [{
      id: "day-custom",
      date: "2026-10-03",
      title: "湖畔日",
      items: [{ id: "event-custom", kind: "event", type: "activity", title: "湖畔散步", timing: { kind: "all_day", label: "全天彈性" }, details: "依體力自由安排", links: [] }],
    }];
    candidate.reservations = [];
    candidate.todos = [];

    render(<TripRuntimeApp initialTrip={candidate} />);
    await userEvent.click(screen.getByRole("tab", { name: /3 SAT/ }));

    expect(screen.getByRole("heading", { name: "湖畔散步" })).toBeTruthy();
    expect(screen.queryByText("UNIVERSAL STUDIOS", { exact: false })).toBeNull();
    expect(screen.queryByText("JX822", { exact: false })).toBeNull();
  });
});
