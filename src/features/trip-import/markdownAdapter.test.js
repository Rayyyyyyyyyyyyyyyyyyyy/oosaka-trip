import { afterEach, describe, expect, it, vi } from "vitest";
import { unifiedSourceDocumentSchema } from "../../domain/trip/reviewSchema";
import { extractMarkdown, extractMarkdownFile } from "./markdownAdapter";

describe("Markdown adapter", () => {
  afterEach(() => vi.useRealTimers());
  it("preserves headings, checkboxes, tables, links, order, and locators", () => {
    const document = extractMarkdown("# Trip\n- [x] Hotel\n| Date | Plan |\n|---|---|\n| 9/10 | [Map](https://example.com) |", { id: "source-1", filename: "trip.md", mimeType: "text/markdown", size: 80 });
    expect(document.blocks.map((block) => block.kind)).toEqual(["text", "text", "table"]);
    expect(document.blocks[1]).toMatchObject({ role: "checkbox", checked: true, list: { kind: "unordered", marker: "-", indent: 0 }, locator: { startLine: 2 } });
    expect(document.blocks[2].links[0].url).toBe("https://example.com");
  });

  it("preserves ordered procedure steps, ordinals, markers, indentation, and source order", () => {
    const document = extractMarkdown("Procedure\n3. Open the ticket app\n4) Tap the QR code\n  - Keep the paper fallback\n5. [ ] Confirm the pass", { id: "source-steps", filename: "steps.md", mimeType: "text/markdown", size: 108 });

    expect(document.blocks.map((block) => block.text)).toEqual([
      "Procedure",
      "Open the ticket app",
      "Tap the QR code",
      "Keep the paper fallback",
      "Confirm the pass",
    ]);
    expect(document.blocks[1]).toMatchObject({ role: "list_item", list: { kind: "ordered", marker: "3.", indent: 0, ordinal: 3 }, locator: { startLine: 2, endLine: 2 } });
    expect(document.blocks[2]).toMatchObject({ role: "list_item", list: { kind: "ordered", marker: "4)", indent: 0, ordinal: 4 }, locator: { startLine: 3, endLine: 3 } });
    expect(document.blocks[3]).toMatchObject({ role: "list_item", list: { kind: "unordered", marker: "-", indent: 2 }, locator: { startLine: 4, endLine: 4 } });
    expect(document.blocks[4]).toMatchObject({ role: "checkbox", checked: false, list: { kind: "ordered", marker: "5.", ordinal: 5 }, locator: { startLine: 5, endLine: 5 } });
  });

  it("requires an ordinal only for ordered-list metadata", () => {
    const ordered = extractMarkdown("1. First", { id: "source-schema", filename: "schema.md", mimeType: "text/markdown", size: 8 });
    const missingOrdinal = structuredClone(ordered);
    delete missingOrdinal.blocks[0].list.ordinal;
    expect(() => unifiedSourceDocumentSchema.parse(missingOrdinal)).toThrow();

    const unorderedWithOrdinal = extractMarkdown("- First", { id: "source-schema", filename: "schema.md", mimeType: "text/markdown", size: 7 });
    unorderedWithOrdinal.blocks[0].list.ordinal = 1;
    expect(() => unifiedSourceDocumentSchema.parse(unorderedWithOrdinal)).toThrow();
  });

  it("rejects deferred formats before extraction", async () => {
    await expect(extractMarkdownFile(new File(["data"], "trip.pdf", { type: "application/pdf" }))).rejects.toThrow("只支援");
  });

  it("assigns the same source ID to the same unchanged file", async () => {
    const first = await extractMarkdownFile(new File(["# Same"], "trip.md", { type: "text/markdown" }));
    const second = await extractMarkdownFile(new File(["# Same"], "trip.md", { type: "text/markdown" }));
    expect(first.source.id).toBe(second.source.id);
  });

  it("bounds browser extraction at 20 seconds", async () => {
    vi.useFakeTimers();
    const pendingFile = { name: "trip.md", type: "text/markdown", size: 10, text: () => new Promise(() => {}) };
    const extraction = extractMarkdownFile(pendingFile);
    const rejection = expect(extraction).rejects.toThrow("20 秒");
    await vi.advanceTimersByTimeAsync(20_000);
    await rejection;
  });
});
