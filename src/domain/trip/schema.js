import { z } from "zod";

export const CANONICAL_TRIP_SCHEMA_VERSION = 1;

const idSchema = z.string().min(1).regex(/^[a-z0-9][a-z0-9-]*$/);
const isoDateSchema = z.string().date();
const localTimeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export function isUsableIanaTimezone(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function isSafeExternalUrl(value) {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export const ianaTimezoneSchema = z.string().min(1).refine(
  isUsableIanaTimezone,
  "Timezone must be a usable IANA timezone.",
);

export const safeExternalUrlSchema = z.string().url().refine(
  isSafeExternalUrl,
  "External links must use the supported https protocol.",
);

export const timingSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("exact"), start: localTimeSchema, end: localTimeSchema.optional(), label: z.string().optional(), crossesMidnight: z.boolean().optional() }).strict(),
  z.object({ kind: z.literal("range"), start: localTimeSchema, end: localTimeSchema, label: z.string().min(1), crossesMidnight: z.boolean().optional() }).strict(),
  z.object({ kind: z.literal("open_ended"), start: localTimeSchema, label: z.string().min(1) }).strict(),
  z.object({ kind: z.literal("approximate"), value: localTimeSchema, label: z.string().min(1) }).strict(),
  z.object({ kind: z.literal("part_of_day"), value: z.enum(["morning", "afternoon", "evening"]), label: z.string().min(1) }).strict(),
  z.object({ kind: z.literal("all_day"), label: z.string().min(1).default("ALL DAY") }).strict(),
  z.object({ kind: z.literal("unspecified"), label: z.string().min(1) }).strict(),
]);

export const eventRelationSchema = z.object({
  kind: z.enum(["alternative", "conditional", "fallback"]),
  groupId: idSchema,
  condition: z.string().min(1).optional(),
}).strict();

export const linkSchema = z.object({
  id: idSchema,
  type: z.enum(["maps", "restaurant", "website"]),
  url: safeExternalUrlSchema,
  sourceProvided: z.boolean(),
}).strict();

export const eventSchema = z.object({
  id: idSchema,
  kind: z.literal("event"),
  type: z.enum(["flight", "hotel", "work", "activity", "restaurant", "free_time", "transport"]),
  title: z.string().min(1),
  place: z.string().min(1).optional(),
  placeId: idSchema.optional(),
  timing: timingSchema,
  details: z.string().optional(),
  note: z.string().optional(),
  status: z.string().optional(),
  flexible: z.boolean().optional(),
  optional: z.boolean().optional(),
  tentative: z.boolean().optional(),
  relation: eventRelationSchema.optional(),
  links: z.array(linkSchema).default([]),
  flight: z.object({
    code: z.string().min(1).optional(),
    origin: z.string().min(1).optional(),
    destination: z.string().min(1).optional(),
    departure: localTimeSchema.optional(),
    arrival: localTimeSchema.optional(),
    originTerminal: z.string().optional(),
    destinationTerminal: z.string().optional(),
  }).strict().refine((flight) => Object.values(flight).some(Boolean), "Flight must contain at least one supported fact.").optional(),
}).strict();

export const transitSchema = z.object({
  id: idSchema,
  kind: z.literal("transit"),
  label: z.string().min(1),
  tip: z.string().optional(),
  from: z.string().min(1).optional(),
  to: z.string().min(1).optional(),
}).strict();

export const daySchema = z.object({
  id: idSchema,
  date: isoDateSchema,
  title: z.string().min(1),
  subtitle: z.string().optional(),
  theme: z.string().optional(),
  suggestedDeparture: z.object({
    start: localTimeSchema,
    end: localTimeSchema,
    label: z.string().min(1),
  }).strict().optional(),
  items: z.array(z.union([eventSchema, transitSchema])),
}).strict();

export const reservationSchema = z.object({
  id: idSchema,
  dateLabel: z.string().min(1),
  type: eventSchema.shape.type,
  title: z.string().min(1),
  todoId: idSchema,
  completeStatus: z.string().min(1),
  pendingStatus: z.string().optional(),
}).strict();

export const todoSchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  defaultDone: z.boolean(),
}).strict();

export const provenanceSchema = z.object({
  sourceId: idSchema,
  locator: z.string().min(1),
}).strict();

export const userOverrideSchema = z.object({
  id: idSchema,
  entityId: idSchema,
  field: z.string().min(1),
  value: z.unknown(),
  changedAt: z.string().datetime(),
}).strict();

export const findingSchema = z.object({
  id: idSchema,
  severity: z.enum(["blocking", "warning"]),
  code: z.string().min(1),
  entityId: idSchema.optional(),
  message: z.string().min(1),
}).strict();

export const canonicalTripSchema = z.object({
  schemaVersion: z.literal(CANONICAL_TRIP_SCHEMA_VERSION),
  id: idSchema,
  title: z.string().min(1),
  destination: z.string().min(1),
  countryCode: z.string().length(2),
  timezone: ianaTimezoneSchema,
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  days: z.array(daySchema).min(1),
  reservations: z.array(reservationSchema).default([]),
  todos: z.array(todoSchema).default([]),
  provenance: z.array(provenanceSchema).default([]),
  overrides: z.array(userOverrideSchema).default([]),
}).strict().superRefine((trip, context) => {
  if (trip.endDate < trip.startDate) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "Trip endDate must not precede startDate." });
  }
  for (const [index, day] of trip.days.entries()) {
    if (day.date < trip.startDate || day.date > trip.endDate) {
      context.addIssue({ code: "custom", path: ["days", index, "date"], message: "Day date must fall within the trip range." });
    }
  }

  const unique = (entries, path, label) => {
    const seen = new Map();
    entries.forEach(({ id, path: entryPath }) => {
      if (seen.has(id)) {
        context.addIssue({
          code: "custom",
          path: entryPath,
          message: `${label} ID '${id}' must be unique in ${path}.`,
        });
      } else {
        seen.set(id, entryPath);
      }
    });
  };

  unique(trip.days.map((day, dayIndex) => ({ id: day.id, path: ["days", dayIndex, "id"] })), "days", "Day");
  unique(trip.days.flatMap((day, dayIndex) => day.items.map((item, itemIndex) => ({ id: item.id, path: ["days", dayIndex, "items", itemIndex, "id"] }))), "day items", "Item");
  unique(trip.days.flatMap((day, dayIndex) => day.items.flatMap((item, itemIndex) => item.kind === "event" ? item.links.map((link, linkIndex) => ({ id: link.id, path: ["days", dayIndex, "items", itemIndex, "links", linkIndex, "id"] })) : [])), "links", "Link");
  unique(trip.reservations.map((reservation, index) => ({ id: reservation.id, path: ["reservations", index, "id"] })), "reservations", "Reservation");
  unique(trip.todos.map((todo, index) => ({ id: todo.id, path: ["todos", index, "id"] })), "todos", "Todo");
  unique(trip.overrides.map((override, index) => ({ id: override.id, path: ["overrides", index, "id"] })), "overrides", "Override");

  const seenDates = new Set();
  let previousDate = null;
  trip.days.forEach((day, index) => {
    if (seenDates.has(day.date)) {
      context.addIssue({ code: "custom", path: ["days", index, "date"], message: `Day date '${day.date}' must be unique.` });
    }
    if (previousDate && day.date < previousDate) {
      context.addIssue({ code: "custom", path: ["days", index, "date"], message: "Days must be in chronological order." });
    }
    seenDates.add(day.date);
    previousDate = day.date;
  });

  const todoIds = new Set(trip.todos.map((todo) => todo.id));
  trip.reservations.forEach((reservation, index) => {
    if (!todoIds.has(reservation.todoId)) {
      context.addIssue({
        code: "custom",
        path: ["reservations", index, "todoId"],
        message: `Reservation todoId '${reservation.todoId}' must reference an existing todo.`,
      });
    }
  });

  const relationKinds = new Map();
  trip.days.forEach((day, dayIndex) => {
    day.items.forEach((item, itemIndex) => {
      if (item.kind !== "event" || !item.relation) return;
      const previousKind = relationKinds.get(item.relation.groupId);
      if (previousKind && previousKind !== item.relation.kind) {
        context.addIssue({
          code: "custom",
          path: ["days", dayIndex, "items", itemIndex, "relation", "groupId"],
          message: `Relation group '${item.relation.groupId}' must use one consistent relation kind.`,
        });
      } else {
        relationKinds.set(item.relation.groupId, item.relation.kind);
      }
    });
  });
});

export function parseCanonicalTrip(value) {
  return canonicalTripSchema.parse(value);
}

/** @typedef {z.infer<typeof canonicalTripSchema>} CanonicalTrip */
/** @typedef {z.infer<typeof eventSchema>} CanonicalEvent */
/** @typedef {z.infer<typeof timingSchema>} CanonicalTiming */
/** @typedef {z.infer<typeof findingSchema>} ValidationFinding */
