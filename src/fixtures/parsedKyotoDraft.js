export const kyotoSourceDocument = {
  schemaVersion: 1,
  source: { id: "source-kyoto-fixture", filename: "kyoto.md", mimeType: "text/markdown", size: 180 },
  blocks: [
    { id: "block-1", kind: "text", role: "heading", text: "京都 2026/10/03", level: 1, links: [], locator: { startLine: 1, endLine: 1 } },
    { id: "block-2", kind: "text", role: "list_item", text: "10:00 清水寺（彈性）", links: [], locator: { startLine: 2, endLine: 2 } },
  ],
};

const evidence = (blockId, excerpt) => [{ blockId, excerpt }];

export const parsedKyotoDraft = {
  schemaVersion: 1,
  trip: { id: null, title: "京都一日", destination: "京都", countryCode: "JP", timezone: "Asia/Tokyo", startDate: "2026-10-03", endDate: "2026-10-03" },
  days: [{
    id: null,
    date: "2026-10-03",
    sourceLabel: "2026/10/03",
    title: "京都",
    subtitle: null,
    theme: null,
    evidence: evidence("block-1", "京都 2026/10/03"),
    items: [{
      id: null,
      kind: "event",
      type: "activity",
      title: "清水寺",
      place: "清水寺",
      timing: { kind: "exact", start: "10:00", end: null, value: null, label: "10:00" },
      details: null,
      note: null,
      status: null,
      flexible: true,
      optional: false,
      tentative: false,
      links: [],
      flight: null,
      evidence: evidence("block-2", "10:00 清水寺（彈性）"),
    }],
  }],
  reservations: [],
  referenceBlocks: [],
  parserNotes: [],
};
