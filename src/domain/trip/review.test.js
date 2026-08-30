import { describe, expect, it } from "vitest";
import { kyotoSourceDocument, parsedKyotoDraft } from "../../fixtures/parsedKyotoDraft";
import { applyReviewOverride, confirmReviewSession, createReviewSession, stableId, validateReviewDraft } from "./review";

describe("review normalization and confirmation", () => {
  it("assigns deterministic application IDs and confirms a renderable canonical trip", () => {
    const first = createReviewSession(kyotoSourceDocument, parsedKyotoDraft, new Date("2026-01-01T00:00:00Z"));
    const second = createReviewSession(kyotoSourceDocument, parsedKyotoDraft, new Date("2026-01-02T00:00:00Z"));
    expect(first.draft.trip.id).toBe(second.draft.trip.id);
    expect(first.draft.days[0].items[0].id).toBe(second.draft.days[0].items[0].id);
    const canonical = confirmReviewSession(first);
    expect(canonical.days[0].items[0]).toMatchObject({ title: "清水寺", flexible: true, place: "清水寺" });
    expect(JSON.stringify(canonical)).not.toContain("excerpt");
    expect(JSON.stringify(canonical)).not.toContain("sourceDocument");
  });

  it("blocks unresolved dates and lets a user override win", () => {
    const unresolved = structuredClone(parsedKyotoDraft);
    unresolved.trip.startDate = null;
    unresolved.days[0].date = null;
    let session = createReviewSession(kyotoSourceDocument, unresolved);
    expect(session.findings.filter((finding) => finding.severity === "blocking").map((finding) => finding.code)).toEqual(expect.arrayContaining(["missing_start_date", "missing_day_date"]));
    session = applyReviewOverride(session, session.draft.trip.id, "startDate", "2026-10-03", new Date("2026-01-01T00:00:00Z"));
    session = applyReviewOverride(session, session.draft.days[0].id, "date", "2026-10-03", new Date("2026-01-01T00:01:00Z"));
    expect(session.overrides).toHaveLength(2);
    expect(() => confirmReviewSession(session)).not.toThrow();
  });

  it("surfaces ordering, duplicates, midnight rollover, and incomplete flights", () => {
    const draft = structuredClone(parsedKyotoDraft);
    const base = draft.days[0].items[0];
    draft.days[0].items = [
      { ...base, title: "晚餐", timing: { ...base.timing, start: "19:06", label: "19:06" } },
      { ...base, title: "晚餐 拉麵", timing: { ...base.timing, start: "18:00", label: "18:00" } },
      { ...base, title: "航班", type: "flight", flight: { code: null, origin: "TPE", destination: "KIX", departure: "23:30", arrival: "01:00", originTerminal: null, destinationTerminal: null } },
    ];
    const session = createReviewSession(kyotoSourceDocument, draft);
    const codes = validateReviewDraft(session.draft, kyotoSourceDocument).map((finding) => finding.code);
    expect(codes).toEqual(expect.arrayContaining(["source_order_conflict", "possible_duplicate", "possible_midnight_rollover", "incomplete_flight"]));
  });

  it("creates only identifier-safe stable IDs", () => {
    expect(stableId("event", "清水寺", "10:00")).toMatch(/^[a-z0-9][a-z0-9-]*$/);
  });

  it("surfaces conflicting overview and detail dates without rewriting either", () => {
    const draft = structuredClone(parsedKyotoDraft);
    draft.trip.endDate = "2026-10-03";
    draft.days[0].date = "2026-10-04";
    const session = createReviewSession(kyotoSourceDocument, draft);
    expect(session.findings.map((finding) => finding.code)).toContain("day_outside_trip");
    expect(session.draft.trip.endDate).toBe("2026-10-03");
    expect(session.draft.days[0].date).toBe("2026-10-04");
  });

  it("keeps production review evidence memory-only and exports no excerpts", () => {
    const draft = structuredClone(parsedKyotoDraft);
    draft.referenceBlocks = [{ blockId: "block-2", classification: "operational_procedure", reason: "Ticket steps remain supporting content." }];
    const session = createReviewSession(kyotoSourceDocument, draft);
    expect(localStorage.length).toBe(0);
    const canonical = confirmReviewSession(session);
    expect(JSON.stringify(canonical)).not.toContain("10:00 清水寺（彈性）");
    expect(JSON.stringify(canonical)).not.toContain("operational_procedure");
    expect(canonical).not.toHaveProperty("referenceBlocks");
    expect(canonical.days[0].items[0].placeId).toMatch(/^place-/);
  });
});
