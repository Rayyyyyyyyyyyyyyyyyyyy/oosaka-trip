import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { osakaTrip } from "../../fixtures/osakaTrip";
import { viewerSemanticTrips } from "../../fixtures/viewerSemanticTrips";
import { TripViewer } from "./TripViewer";

async function openDay(trip, name) {
  const user = userEvent.setup();
  render(<TripViewer canonicalTrip={trip} />);
  await user.click(screen.getByRole("button", { name }));
  return user;
}

describe("MVP Result UI Skyline", () => {
  it("gives Tailwind ownership of the responsive folio shell", () => {
    render(<TripViewer canonicalTrip={osakaTrip} />);
    const main = document.querySelector("main");

    expect([...main.classList]).toEqual(
      expect.arrayContaining([
        "mx-auto",
        "w-full",
        "max-w-[var(--trip-folio-measure)]",
        "px-5",
        "sm:px-8",
        "md:px-10",
      ]),
    );
    expect(main?.getAttribute("style")).toBeNull();
  });

  it("keeps the Overview reading order and shows exactly one readiness attention item", () => {
    render(<TripViewer canonicalTrip={osakaTrip} />);
    const overview = screen.getByTestId("overview-reading-order");
    const content = overview.textContent;

    expect(content.indexOf("SEP 10 — SEP 15")).toBeLessThan(
      content.indexOf("SCHEMATIC JOURNEY"),
    );
    expect(content.indexOf("SCHEMATIC JOURNEY")).toBeLessThan(
      content.indexOf("ONE THING BEFORE YOU GO"),
    );
    expect(content.indexOf("ONE THING BEFORE YOU GO")).toBeLessThan(
      content.indexOf("TRAVEL ANCHORS"),
    );
    expect(content.indexOf("TRAVEL ANCHORS")).toBeLessThan(
      content.indexOf("DAY JOURNEY INDEX"),
    );
    expect(screen.getAllByText("ONE THING BEFORE YOU GO")).toHaveLength(1);
    expect(screen.getByText("尚未確認門票")).toBeTruthy();
    expect(
      screen.getByLabelText("Schematic journey: 大阪 to 宇治 to 奈良 to USJ"),
    ).toBeTruthy();
    expect(content).not.toMatch(/Markdown|XLSX|source format/i);
  });

  it("omits unsupported Overview anchor and readiness sections", () => {
    const candidate = structuredClone(viewerSemanticTrips.missingAnchors);
    candidate.todos = candidate.todos.map((todo) => ({
      ...todo,
      defaultDone: true,
    }));
    render(<TripViewer canonicalTrip={candidate} />);

    expect(screen.queryByText("ONE THING BEFORE YOU GO")).toBeNull();
    expect(screen.queryByText("TRAVEL ANCHORS")).toBeNull();
    expect(screen.getByText("DAY JOURNEY INDEX")).toBeTruthy();
  });

  it("links the fixed-anchor pointer to exactly one canonical event article", async () => {
    await openDay(osakaTrip, "SEP 12, 宇治");
    const pointer = screen.getByRole("link", {
      name: "Jump to 19:30 清次郎 北新地店 in the timeline",
    });

    expect(pointer.getAttribute("href")).toBe("#event-event-seijiro");
    expect(document.querySelectorAll("#event-event-seijiro")).toHaveLength(1);
    expect(
      document
        .querySelector("#event-event-seijiro")
        ?.getAttribute("data-event-id"),
    ).toBe("event-seijiro");
  });

  it("omits the fixed-anchor summary when a day has no supported fixed event", async () => {
    await openDay(viewerSemanticTrips.noFixedAnchor, "SEP 12, 宇治");
    expect(screen.queryByText("NEAREST FIXED ANCHOR")).toBeNull();
    expect(screen.getByText(/FLEXIBLE PACE/)).toBeTruthy();
  });

  it("keeps all-day, approximate, open-ended, unresolved, and relation labels distinct", async () => {
    const user = await openDay(
      viewerSemanticTrips.approximateOpenEnded,
      "SEP 15, 回家",
    );
    expect(screen.getByText("OPEN ENDED")).toBeTruthy();
    expect(screen.getByText("APPROXIMATE")).toBeTruthy();
    expect(
      document.querySelector('[data-timing-kind="open_ended"]'),
    ).toBeTruthy();
    expect(
      document.querySelector('[data-timing-kind="approximate"]'),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Overview" }));
    await user.click(
      screen.getByRole("button", { name: "SEP 14, Universal Studios Japan" }),
    );
    expect(document.querySelector('[data-timing-kind="all_day"]')).toBeTruthy();
    expect(screen.getAllByText("ALL DAY").length).toBeGreaterThan(0);
  });

  it("keeps optional places collapsed, keyboard-operable, and outside the timeline", async () => {
    const user = await openDay(osakaTrip, "SEP 12, 宇治");
    const disclosure = screen.getByRole("button", {
      name: /IF YOU STILL HAVE ENERGY/,
    });
    expect(disclosure.getAttribute("aria-expanded")).toBe("false");
    expect(
      within(
        screen.getByRole("region", { name: "SEMANTIC TIMELINE" }),
      ).queryByText("宇治川"),
    ).toBeNull();

    disclosure.focus();
    await user.keyboard("{Enter}");
    expect(disclosure.getAttribute("aria-expanded")).toBe("true");
    const optionalLink = screen.getByRole("link", { name: "宇治川" });
    expect(optionalLink.getAttribute("href")).toBe(
      "https://www.google.com/maps/search/?api=1&query=%E5%AE%87%E6%B2%BB%E5%B7%9D%20%E4%BA%AC%E9%83%BD",
    );
    expect(optionalLink.getAttribute("target")).toBe("_blank");
    expect(optionalLink.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("supports keyboard day navigation and preserves exact event links", async () => {
    const user = await openDay(osakaTrip, "SEP 12, 宇治");
    const nextDay = screen.getByRole("tab", { name: /13 SUN 奈良/ });
    nextDay.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: "生駒・奈良" })).toBeTruthy();

    const directions = screen.getAllByRole("link", { name: "Directions" })[0];
    expect(directions.getAttribute("href")).toContain(
      "%E7%94%9F%E9%A7%92%E5%B1%B1%E4%B8%8A%E9%81%8A%E6%A8%82%E5%9C%92",
    );
    expect(directions.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("keeps transit connective and alternative or conditional meaning explicit", async () => {
    await openDay(viewerSemanticTrips.alternativeConditional, "SEP 11, 森之宮");
    expect(screen.getByText("CONDITIONAL")).toBeTruthy();
    expect(screen.getByText("ALTERNATIVE")).toBeTruthy();
    expect(screen.getAllByRole("note", { name: /Transit:/ })).toHaveLength(2);
    expect(
      screen.getByText("Only if the booking time is confirmed"),
    ).toBeTruthy();
  });

  it("keeps checklist and reservation status synchronized from the Overview action", async () => {
    const user = userEvent.setup();
    render(<TripViewer canonicalTrip={osakaTrip} />);
    await user.click(screen.getByRole("button", { name: "Check bookings" }));
    expect(screen.getByText("尚未確認門票")).toBeTruthy();

    await user.click(
      screen.getByRole("button", { name: /USJ 門票／事前票券/ }),
    );
    expect(screen.getByText("Ticket ready")).toBeTruthy();
  });
});
