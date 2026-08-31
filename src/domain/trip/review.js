import { parsedTripDraftSchema, reviewSessionSchema } from "./reviewSchema";
import { parseCanonicalTrip } from "./schema";

const EVENT_TYPES = new Set(["flight", "hotel", "work", "activity", "restaurant", "free_time", "transport"]);
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function compact(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function slug(value, fallback = "item") {
  const normalized = String(value ?? "").normalize("NFKD").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 42);
  return normalized || fallback;
}

function hash(value) {
  let result = 2166136261;
  for (const character of String(value)) {
    result ^= character.codePointAt(0);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(36);
}

export function stableId(prefix, ...parts) {
  const seed = parts.join("|");
  return `${prefix}-${slug(parts.find(Boolean), prefix)}-${hash(seed)}`;
}

function normalizeEvidence(evidence, sourceDocument) {
  return evidence.map((entry) => ({
    blockId: entry.blockId,
    excerpt: entry.excerpt.slice(0, 500),
  }));
}

export function normalizeParsedTripDraft(input, sourceDocument) {
  const parsed = parsedTripDraftSchema.parse(input);
  const sourceId = sourceDocument.source.id;
  const tripSeed = [sourceId, parsed.trip.title, parsed.trip.destination, parsed.trip.startDate, parsed.trip.endDate];
  const tripId = stableId("trip", ...tripSeed);
  const days = parsed.days.map((day, dayIndex) => {
    const dayId = stableId("day", tripId, day.date, day.sourceLabel, dayIndex);
    return {
      ...day,
      id: dayId,
      date: compact(day.date),
      sourceLabel: compact(day.sourceLabel),
      title: compact(day.title),
      subtitle: compact(day.subtitle),
      theme: compact(day.theme),
      evidence: normalizeEvidence(day.evidence, sourceDocument),
      items: day.items.map((item, itemIndex) => ({
        ...item,
        id: stableId(item.kind === "transit" ? "transit" : "event", dayId, item.title, item.type, itemIndex),
        title: compact(item.title),
        place: compact(item.place),
        details: compact(item.details),
        note: compact(item.note),
        status: compact(item.status),
        timing: item.timing ? {
          ...item.timing,
          start: compact(item.timing.start),
          end: compact(item.timing.end),
          value: compact(item.timing.value),
          label: item.timing.label.trim(),
        } : null,
        flight: item.flight ? Object.fromEntries(Object.entries(item.flight).map(([key, value]) => [key, compact(value)])) : null,
        evidence: normalizeEvidence(item.evidence, sourceDocument),
        links: item.links.map((link, linkIndex) => ({
          ...link,
          id: stableId("link", dayId, item.title, link.url, linkIndex),
          evidence: normalizeEvidence(link.evidence, sourceDocument),
        })),
      })),
    };
  });
  return {
    ...parsed,
    trip: {
      id: tripId,
      title: compact(parsed.trip.title),
      destination: compact(parsed.trip.destination),
      countryCode: compact(parsed.trip.countryCode)?.toUpperCase() ?? null,
      timezone: compact(parsed.trip.timezone),
      startDate: compact(parsed.trip.startDate),
      endDate: compact(parsed.trip.endDate),
    },
    days,
    reservations: parsed.reservations.map((reservation, index) => ({
      ...reservation,
      id: stableId("reservation", tripId, reservation.title, reservation.dateLabel, index),
      title: compact(reservation.title),
      dateLabel: compact(reservation.dateLabel),
      todoLabel: compact(reservation.todoLabel),
      completeStatus: compact(reservation.completeStatus),
      pendingStatus: compact(reservation.pendingStatus),
      evidence: normalizeEvidence(reservation.evidence, sourceDocument),
    })),
  };
}

function validDate(value) {
  if (!DATE_PATTERN.test(value ?? "")) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function validTimezone(value) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

function finding(code, severity, entityId, message, sequence = 0) {
  return { id: stableId("finding", code, entityId, sequence), code, severity, ...(entityId ? { entityId } : {}), message };
}

function timingStart(item) {
  if (["exact", "range", "open_ended"].includes(item.timing?.kind)) return item.timing.start;
  if (item.timing?.kind === "approximate") return item.timing.value;
  return null;
}

function appendEvidenceFindings(findings, evidence, knownBlocks, entityId, label) {
  evidence.forEach((entry, index) => {
    if (!knownBlocks.has(entry.blockId)) {
      findings.push(finding(
        "broken_evidence_reference",
        "warning",
        entityId,
        `${label} 引用了找不到的來源區塊 ${entry.blockId}；此 provider excerpt 不視為已驗證證據。`,
        index,
      ));
    }
  });
}

export function validateReviewDraft(draft, sourceDocument) {
  const findings = [];
  const trip = draft.trip;
  if (!trip.title) findings.push(finding("missing_trip_title", "blocking", trip.id, "請確認旅程名稱。"));
  if (!trip.destination) findings.push(finding("missing_destination", "blocking", trip.id, "請確認主要目的地。"));
  if (!/^[A-Z]{2}$/.test(trip.countryCode ?? "")) findings.push(finding("invalid_country_code", "blocking", trip.id, "國家代碼必須是兩碼 ISO 代碼，例如 JP。"));
  if (!validTimezone(trip.timezone)) findings.push(finding("invalid_timezone", "blocking", trip.id, "請選擇有效的 IANA 時區，例如 Asia/Tokyo。"));
  if (!validDate(trip.startDate)) findings.push(finding("missing_start_date", "blocking", trip.id, "請確認確切開始日期（YYYY-MM-DD）。"));
  if (!validDate(trip.endDate)) findings.push(finding("missing_end_date", "blocking", trip.id, "請確認確切結束日期（YYYY-MM-DD）。"));
  if (validDate(trip.startDate) && validDate(trip.endDate) && trip.endDate < trip.startDate) {
    findings.push(finding("invalid_trip_range", "blocking", trip.id, "結束日期不可早於開始日期。"));
  }
  if (!draft.days.length) findings.push(finding("missing_days", "blocking", trip.id, "至少需要一個可確認的行程日。"));

  const knownBlocks = new Set(sourceDocument.blocks.map((block) => block.id));
  draft.days.forEach((day, dayIndex) => {
    if (!validDate(day.date)) findings.push(finding("missing_day_date", "blocking", day.id, `第 ${dayIndex + 1} 天缺少確切日期。`));
    else if (validDate(trip.startDate) && validDate(trip.endDate) && (day.date < trip.startDate || day.date > trip.endDate)) {
      findings.push(finding("day_outside_trip", "blocking", day.id, `${day.date} 不在旅程日期範圍內。`));
    }
    if (!day.title) findings.push(finding("missing_day_title", "blocking", day.id, `第 ${dayIndex + 1} 天缺少標題。`));
    if (!day.evidence.some((entry) => knownBlocks.has(entry.blockId))) findings.push(finding("missing_day_evidence", "warning", day.id, "此行程日沒有可用的來源證據；請人工確認。"));
    appendEvidenceFindings(findings, day.evidence, knownBlocks, day.id, "行程日");

    let previousTime = null;
    const times = new Map();
    const names = [];
    day.items.forEach((item, itemIndex) => {
      if (!item.title) findings.push(finding("missing_item_title", "blocking", item.id, "行程項目缺少名稱。", itemIndex));
      if (item.kind === "event" && !EVENT_TYPES.has(item.type)) findings.push(finding("missing_event_type", "blocking", item.id, "請確認行程項目類型。", itemIndex));
      if (!item.timing) findings.push(finding("missing_timing_semantics", "blocking", item.id, "請確認時間是確切、約略、時段、全天或未指定。", itemIndex));
      if (item.timing?.kind === "exact" && !TIME_PATTERN.test(item.timing.start ?? "")) findings.push(finding("missing_exact_time", "blocking", item.id, "確切時間需要有效的 HH:mm 開始時間。", itemIndex));
      if (item.timing?.kind === "range" && (!TIME_PATTERN.test(item.timing.start ?? "") || !TIME_PATTERN.test(item.timing.end ?? ""))) findings.push(finding("invalid_time_range", "blocking", item.id, "時間範圍需要有效的開始與結束時間。", itemIndex));
      if (item.timing?.kind === "range" && TIME_PATTERN.test(item.timing.start ?? "") && TIME_PATTERN.test(item.timing.end ?? "") && item.timing.end < item.timing.start && !item.timing.crossesMidnight) findings.push(finding("unmarked_cross_midnight", "blocking", item.id, "結束時間早於開始時間；若為跨日行程請明確標記。", itemIndex));
      if (item.timing?.kind === "open_ended" && !TIME_PATTERN.test(item.timing.start ?? "")) findings.push(finding("missing_open_ended_start", "blocking", item.id, "開放式時間需要有效的 HH:mm 開始時間，但不應虛構結束時間。", itemIndex));
      if (item.timing?.kind === "approximate" && !TIME_PATTERN.test(item.timing.value ?? "")) findings.push(finding("missing_approximate_time", "blocking", item.id, "約略時間需要有效的 HH:mm 值。", itemIndex));
      if (item.timing?.kind === "part_of_day" && !["morning", "afternoon", "evening"].includes(item.timing.value)) findings.push(finding("invalid_part_of_day", "blocking", item.id, "時段必須是 morning、afternoon 或 evening。", itemIndex));
      const time = timingStart(item);
      if (time && !TIME_PATTERN.test(time)) findings.push(finding("invalid_time", "blocking", item.id, `時間 ${time} 必須是 HH:mm。`, itemIndex));
      if (time && previousTime && time < previousTime) findings.push(finding("source_order_conflict", "warning", item.id, `${time} 排在 ${previousTime} 之後但時間更早；請確認順序。`, itemIndex));
      if (time && times.has(time)) findings.push(finding("time_conflict", "warning", item.id, `${time} 與「${times.get(time)}」同時；請確認是否衝突。`, itemIndex));
      if (time) { previousTime = time; times.set(time, item.title ?? "另一項行程"); }
      const normalizedName = item.title?.toLowerCase().replace(/\s+/g, " ");
      if (normalizedName) {
        const duplicate = names.find((name) => name === normalizedName || (name.length > 1 && normalizedName.length > 1 && (name.includes(normalizedName) || normalizedName.includes(name))));
        if (duplicate) findings.push(finding("possible_duplicate", "warning", item.id, `「${item.title}」可能與同日另一項行程重複。`, itemIndex));
        names.push(normalizedName);
      }
      if (!item.evidence.some((entry) => knownBlocks.has(entry.blockId))) findings.push(finding("missing_item_evidence", "warning", item.id, "此項目沒有可用來源證據；僅在你已人工補上時保留。", itemIndex));
      appendEvidenceFindings(findings, item.evidence, knownBlocks, item.id, "行程項目");
      item.links.forEach((link) => appendEvidenceFindings(findings, link.evidence, knownBlocks, item.id, "外部連結"));
      if (item.type === "flight") {
        const required = ["code", "origin", "destination", "departure", "arrival"];
        if (!item.flight || required.some((field) => !item.flight[field])) findings.push(finding("incomplete_flight", "warning", item.id, "航班資料不完整；保留來源支持的欄位，並在 Review 中確認缺漏。", itemIndex));
        if (item.flight?.departure && !TIME_PATTERN.test(item.flight.departure)) findings.push(finding("invalid_flight_departure", "blocking", item.id, "航班起飛時間格式不正確。", itemIndex));
        if (item.flight?.arrival && !TIME_PATTERN.test(item.flight.arrival)) findings.push(finding("invalid_flight_arrival", "blocking", item.id, "航班抵達時間格式不正確。", itemIndex));
        if (item.flight?.departure && item.flight?.arrival && item.flight.arrival < item.flight.departure) findings.push(finding("possible_midnight_rollover", "warning", item.id, "抵達時間早於起飛時間；請確認是否跨日或跨時區。", itemIndex));
      }
      if (item.type === "hotel" && !item.place && !item.details) findings.push(finding("incomplete_accommodation", "warning", item.id, "住宿只有名稱，尚無來源支持的地址或住宿細節。", itemIndex));
    });
  });

  draft.reservations.forEach((reservation, index) => {
    if (!reservation.title || !reservation.dateLabel || !reservation.type || !reservation.todoLabel || !reservation.completeStatus) {
      findings.push(finding("incomplete_reservation", "blocking", reservation.id, "預約需要名稱、日期標籤、類型、確認項目與完成狀態。", index));
    }
    appendEvidenceFindings(findings, reservation.evidence, knownBlocks, reservation.id, "預約");
  });
  draft.parserNotes.forEach((note, index) => {
    findings.push(finding(`parser_${note.kind}`, "warning", trip.id, note.message, index));
    note.blockIds.forEach((blockId, blockIndex) => {
      if (!knownBlocks.has(blockId)) {
        findings.push(finding(
          "broken_parser_note_evidence",
          "warning",
          trip.id,
          `Parser ${note.kind} 提醒引用了找不到的來源區塊 ${blockId}。`,
          index * 1000 + blockIndex,
        ));
      }
    });
  });
  draft.referenceBlocks.forEach((reference, index) => {
    if (!knownBlocks.has(reference.blockId)) {
      findings.push(finding(
        "broken_reference_block",
        "warning",
        trip.id,
        `保留的 ${reference.classification} 資訊引用了找不到的來源區塊 ${reference.blockId}。`,
        index,
      ));
    }
  });
  return findings;
}

function entityIndex(session) {
  const entries = [[session.draft.trip.id, { label: session.draft.trip.title || "旅程摘要", kind: "trip" }]];
  session.draft.days.forEach((day, dayIndex) => {
    entries.push([day.id, { label: day.title || `第 ${dayIndex + 1} 天`, kind: "day" }]);
    day.items.forEach((item, itemIndex) => entries.push([item.id, {
      label: item.title || `${day.title || `第 ${dayIndex + 1} 天`}的第 ${itemIndex + 1} 個項目`,
      kind: item.kind,
    }]));
  });
  session.draft.reservations.forEach((reservation, index) => entries.push([reservation.id, {
    label: reservation.title || `第 ${index + 1} 筆預約`,
    kind: "reservation",
  }]));
  return new Map(entries);
}

function evidenceForEntity(session, entityId) {
  if (!entityId) return [];
  const day = session.draft.days.find((candidate) => candidate.id === entityId);
  if (day) return day.evidence;
  const item = session.draft.days.flatMap((candidate) => candidate.items).find((candidate) => candidate.id === entityId);
  if (item) return item.evidence;
  const reservation = session.draft.reservations.find((candidate) => candidate.id === entityId);
  return reservation?.evidence ?? [];
}

function groupBy(items, keyOf) {
  return items.reduce((groups, item) => {
    const key = keyOf(item) || "none";
    return { ...groups, [key]: [...(groups[key] ?? []), item] };
  }, {});
}

export function selectReviewFindings(session) {
  const entities = entityIndex(session);
  const knownBlocks = new Map(session.sourceDocument.blocks.map((block) => [block.id, block]));
  const travelerAddedIds = new Set(session.overrides.filter((override) => override.field === "add").map((override) => override.entityId));
  const all = session.findings.map((item) => {
    const parserNote = item.code.startsWith("parser_")
      ? session.draft.parserNotes.find((note) => item.code === `parser_${note.kind}` && item.message === note.message)
      : null;
    const evidence = parserNote
      ? parserNote.blockIds.map((blockId) => knownBlocks.get(blockId)).filter(Boolean)
      : evidenceForEntity(session, item.entityId).map((entry) => knownBlocks.get(entry.blockId)).filter(Boolean);
    const isTravelerOverride = travelerAddedIds.has(item.entityId);
    const evidenceValidity = item.code.startsWith("broken_")
      ? "broken_provider_evidence"
      : isTravelerOverride
        ? "traveler_override"
        : evidence.length
          ? "valid_source_evidence"
          : "not_applicable";
    return {
      ...item,
      entityLabel: entities.get(item.entityId)?.label ?? "旅程 Review",
      entityKind: entities.get(item.entityId)?.kind ?? "review",
      parserNoteKind: parserNote?.kind ?? null,
      evidenceValidity,
      sourceBlocks: evidence,
    };
  });
  return {
    all,
    blockers: all.filter((item) => item.severity === "blocking"),
    warnings: all.filter((item) => item.severity === "warning"),
    byEntity: groupBy(all, (item) => item.entityId),
    byParserNoteKind: groupBy(all.filter((item) => item.parserNoteKind), (item) => item.parserNoteKind),
    byEvidenceValidity: groupBy(all, (item) => item.evidenceValidity),
  };
}

export function createReviewSession(sourceDocument, parsedDraft, now = new Date()) {
  const draft = normalizeParsedTripDraft(parsedDraft, sourceDocument);
  return reviewSessionSchema.parse({
    id: stableId("review", sourceDocument.source.id, now.toISOString()),
    sourceDocument,
    draft,
    findings: validateReviewDraft(draft, sourceDocument),
    overrides: [],
    createdAt: now.toISOString(),
  });
}

function updateEntity(draft, entityId, updater) {
  if (draft.trip.id === entityId) return { ...draft, trip: updater(draft.trip) };
  return {
    ...draft,
    days: draft.days.map((day) => {
      if (day.id === entityId) return updater(day);
      return { ...day, items: day.items.map((item) => item.id === entityId ? updater(item) : item) };
    }),
    reservations: draft.reservations.map((reservation) => reservation.id === entityId ? updater(reservation) : reservation),
  };
}

function setNested(entity, field, value) {
  const [head, tail] = field.split(".");
  if (!tail) return { ...entity, [head]: value };
  return { ...entity, [head]: { ...(entity[head] ?? {}), [tail]: value } };
}

export function applyReviewOverride(session, entityId, field, value, now = new Date()) {
  const draft = updateEntity(session.draft, entityId, (entity) => setNested(entity, field, value));
  const override = { id: stableId("override", session.id, entityId, field, now.toISOString()), entityId, field, value, changedAt: now.toISOString() };
  const priorOverrides = session.overrides.filter((candidate) => candidate.entityId !== entityId || candidate.field !== field);
  return { ...session, draft, overrides: [...priorOverrides, override], findings: validateReviewDraft(draft, session.sourceDocument) };
}

export function addReviewItem(session, dayId, now = new Date()) {
  const day = session.draft.days.find((candidate) => candidate.id === dayId);
  if (!day) return session;
  const evidence = [];
  const id = stableId("event", dayId, "user-added", now.toISOString());
  const item = { id, kind: "event", type: "activity", title: "新增行程", place: null, timing: { kind: "unspecified", start: null, end: null, value: null, label: "時間未指定" }, details: null, note: null, status: null, flexible: false, optional: false, tentative: false, links: [], flight: null, evidence };
  const draft = { ...session.draft, days: session.draft.days.map((candidate) => candidate.id === dayId ? { ...candidate, items: [...candidate.items, item] } : candidate) };
  const override = { id: stableId("override", session.id, id, "add", now.toISOString()), entityId: id, field: "add", value: true, changedAt: now.toISOString() };
  return { ...session, draft, overrides: [...session.overrides, override], findings: validateReviewDraft(draft, session.sourceDocument) };
}

export function removeReviewItem(session, itemId, now = new Date()) {
  const draft = { ...session.draft, days: session.draft.days.map((day) => ({ ...day, items: day.items.filter((item) => item.id !== itemId) })) };
  const override = { id: stableId("override", session.id, itemId, "remove", now.toISOString()), entityId: itemId, field: "remove", value: true, changedAt: now.toISOString() };
  return { ...session, draft, overrides: [...session.overrides, override], findings: validateReviewDraft(draft, session.sourceDocument) };
}

function canonicalTiming(timing) {
  if (timing.kind === "exact") return { kind: "exact", start: timing.start, ...(timing.end ? { end: timing.end } : {}), ...(timing.label ? { label: timing.label } : {}), ...(timing.crossesMidnight ? { crossesMidnight: true } : {}) };
  if (timing.kind === "range") return { kind: "range", start: timing.start, end: timing.end, label: timing.label, ...(timing.crossesMidnight ? { crossesMidnight: true } : {}) };
  if (timing.kind === "open_ended") return { kind: "open_ended", start: timing.start, label: timing.label };
  if (timing.kind === "approximate") return { kind: "approximate", value: timing.value, label: timing.label };
  if (timing.kind === "part_of_day") return { kind: "part_of_day", value: timing.value, label: timing.label };
  return { kind: timing.kind, label: timing.label };
}

function canonicalFlight(flight) {
  if (!flight) return null;
  const supported = Object.fromEntries(Object.entries(flight).filter(([, value]) => value));
  return Object.keys(supported).length ? supported : null;
}

export class ReviewValidationError extends Error {
  constructor(findings) {
    super("Review still contains blocking findings.");
    this.name = "ReviewValidationError";
    this.findings = findings;
  }
}

export function confirmReviewSession(session) {
  const findings = validateReviewDraft(session.draft, session.sourceDocument);
  const blockers = findings.filter((item) => item.severity === "blocking");
  if (blockers.length) throw new ReviewValidationError(blockers);
  const { draft, sourceDocument } = session;
  const todos = draft.reservations.map((reservation) => ({ id: stableId("todo", draft.trip.id, reservation.id), label: reservation.todoLabel, defaultDone: false }));
  const canonical = {
    schemaVersion: 1,
    id: draft.trip.id,
    title: draft.trip.title,
    destination: draft.trip.destination,
    countryCode: draft.trip.countryCode,
    timezone: draft.trip.timezone,
    startDate: draft.trip.startDate,
    endDate: draft.trip.endDate,
    days: draft.days.map((day) => ({
      id: day.id,
      date: day.date,
      title: day.title,
      ...(day.subtitle ? { subtitle: day.subtitle } : {}),
      ...(day.theme ? { theme: day.theme } : {}),
      items: day.items.map((item) => item.kind === "transit" ? { id: item.id, kind: "transit", label: item.title, ...(item.note ? { tip: item.note } : {}), ...(item.from ? { from: item.from } : {}), ...(item.to ? { to: item.to } : {}) } : {
        id: item.id,
        kind: "event",
        type: item.type,
        title: item.title,
        ...(item.place ? { place: item.place } : {}),
        ...(item.place ? { placeId: stableId("place", item.place) } : {}),
        timing: canonicalTiming(item.timing),
        ...(item.details ? { details: item.details } : {}),
        ...(item.note ? { note: item.note } : {}),
        ...(item.status ? { status: item.status } : {}),
        ...(item.flexible ? { flexible: true } : {}),
        ...(item.optional ? { optional: true } : {}),
        ...(item.tentative ? { tentative: true } : {}),
        ...(item.relation ? { relation: { kind: item.relation.kind, groupId: item.relation.groupId || stableId("relation", day.id, item.relation.kind), ...(item.relation.condition ? { condition: item.relation.condition } : {}) } } : {}),
        links: item.links.map((link) => ({ id: link.id, type: link.type, url: link.url, sourceProvided: true })),
        ...(canonicalFlight(item.flight) ? { flight: canonicalFlight(item.flight) } : {}),
      }),
    })),
    reservations: draft.reservations.map((reservation, index) => ({
      id: reservation.id,
      dateLabel: reservation.dateLabel,
      type: reservation.type,
      title: reservation.title,
      todoId: todos[index].id,
      completeStatus: reservation.completeStatus,
      ...(reservation.pendingStatus ? { pendingStatus: reservation.pendingStatus } : {}),
    })),
    todos,
    provenance: draft.days.flatMap((day) => [day, ...day.items]).flatMap((entity) => entity.evidence.map((evidence) => {
      const block = sourceDocument.blocks.find((candidate) => candidate.id === evidence.blockId);
      return { sourceId: sourceDocument.source.id, locator: block ? `lines ${block.locator.startLine}-${block.locator.endLine}` : evidence.blockId };
    })),
    overrides: session.overrides,
  };
  return parseCanonicalTrip(canonical);
}
