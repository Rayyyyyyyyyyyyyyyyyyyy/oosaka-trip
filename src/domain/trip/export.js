import { z } from "zod";
import { parseCanonicalTrip } from "./schema";

export const CANONICAL_EXPORT_VERSION = 1;

export const canonicalExportSchema = z.object({
  exportVersion: z.literal(CANONICAL_EXPORT_VERSION),
  exportedAt: z.string().datetime(),
  trip: z.unknown(),
}).strict();

function projectTiming(timing) {
  return { ...timing };
}

function projectLink(link) {
  return {
    id: link.id,
    type: link.type,
    url: link.url,
    sourceProvided: link.sourceProvided,
  };
}

function projectItem(item) {
  if (item.kind === "transit") {
    return { id: item.id, kind: item.kind, label: item.label, ...(item.tip ? { tip: item.tip } : {}) };
  }
  return {
    id: item.id,
    kind: item.kind,
    type: item.type,
    title: item.title,
    ...(item.place ? { place: item.place } : {}),
    ...(item.placeId ? { placeId: item.placeId } : {}),
    timing: projectTiming(item.timing),
    ...(item.details ? { details: item.details } : {}),
    ...(item.note ? { note: item.note } : {}),
    ...(item.status ? { status: item.status } : {}),
    ...(item.flexible !== undefined ? { flexible: item.flexible } : {}),
    ...(item.optional !== undefined ? { optional: item.optional } : {}),
    ...(item.tentative !== undefined ? { tentative: item.tentative } : {}),
    links: item.links.map(projectLink),
    ...(item.flight ? { flight: { ...item.flight } } : {}),
  };
}

export function createCanonicalExport(value, now = new Date()) {
  const trip = parseCanonicalTrip(value);
  return canonicalExportSchema.parse({
    exportVersion: CANONICAL_EXPORT_VERSION,
    exportedAt: now.toISOString(),
    trip: {
      schemaVersion: trip.schemaVersion,
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      countryCode: trip.countryCode,
      timezone: trip.timezone,
      startDate: trip.startDate,
      endDate: trip.endDate,
      days: trip.days.map((day) => ({
        id: day.id,
        date: day.date,
        title: day.title,
        ...(day.subtitle ? { subtitle: day.subtitle } : {}),
        ...(day.theme ? { theme: day.theme } : {}),
        ...(day.suggestedDeparture ? { suggestedDeparture: { ...day.suggestedDeparture } } : {}),
        items: day.items.map(projectItem),
      })),
      reservations: trip.reservations.map((reservation) => ({ ...reservation })),
      todos: trip.todos.map((todo) => ({ ...todo })),
      overrides: trip.overrides.map((override) => ({ ...override })),
    },
  });
}

export function parseCanonicalExport(value) {
  const envelope = canonicalExportSchema.parse(value);
  return { ...envelope, trip: parseCanonicalTrip(envelope.trip) };
}
