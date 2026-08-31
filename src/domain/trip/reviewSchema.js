import { z } from "zod";
import { findingSchema, safeExternalUrlSchema } from "./schema";

const nullableText = z.string().nullable();
const sourceLinkSchema = z.object({ text: z.string(), url: safeExternalUrlSchema }).strict();
const locatorSchema = z.object({
  startLine: z.number().int().positive(),
  endLine: z.number().int().positive(),
}).strict();

export const REFERENCE_BLOCK_CLASSIFICATIONS = Object.freeze([
  "research",
  "recommendation",
  "reference",
  "background",
  "runtime_instruction",
  "operational_procedure",
  "runtime_deferred_decision",
  "reference_freshness",
  "explicit_intra_source_reference",
  "packing",
  "budget",
  "expense",
  "shopping",
  "opening_hours",
  "candidate_place",
  "other",
]);

export const referenceBlockClassificationSchema = z.enum(REFERENCE_BLOCK_CLASSIFICATIONS);

const listMetadataBase = {
  marker: z.string().min(1),
  indent: z.number().int().nonnegative(),
};

const sourceListMetadataSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("ordered"),
    ...listMetadataBase,
    ordinal: z.number().int().positive(),
  }).strict(),
  z.object({
    kind: z.literal("unordered"),
    ...listMetadataBase,
  }).strict(),
]);

const textBlockSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("text"),
  role: z.enum(["heading", "paragraph", "list_item", "checkbox"]),
  text: z.string(),
  level: z.number().int().min(1).max(6).optional(),
  checked: z.boolean().optional(),
  list: sourceListMetadataSchema.optional(),
  links: z.array(sourceLinkSchema),
  locator: locatorSchema,
}).strict();

const tableBlockSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("table"),
  rows: z.array(z.array(z.string())),
  links: z.array(sourceLinkSchema),
  locator: locatorSchema,
}).strict();

export const unifiedSourceDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  source: z.object({
    id: z.string().min(1),
    filename: z.string().min(1),
    mimeType: z.literal("text/markdown"),
    size: z.number().int().nonnegative(),
  }).strict(),
  blocks: z.array(z.union([textBlockSchema, tableBlockSchema])),
}).strict();

export const draftEvidenceSchema = z.object({
  blockId: z.string().min(1),
  excerpt: z.string().max(500),
}).strict();

const draftTimingSchema = z.object({
  kind: z.enum(["exact", "range", "open_ended", "approximate", "part_of_day", "all_day", "unspecified"]),
  start: nullableText,
  end: nullableText,
  value: nullableText,
  label: z.string().min(1),
  crossesMidnight: z.boolean().optional(),
}).strict();

const draftRelationSchema = z.object({
  kind: z.enum(["alternative", "conditional", "fallback"]),
  groupId: nullableText,
  condition: nullableText,
}).strict();

const draftLinkSchema = z.object({
  id: nullableText,
  type: z.enum(["maps", "restaurant", "website"]),
  url: safeExternalUrlSchema,
  sourceProvided: z.literal(true),
  evidence: z.array(draftEvidenceSchema).min(1),
}).strict();

const draftFlightSchema = z.object({
  code: nullableText,
  origin: nullableText,
  destination: nullableText,
  departure: nullableText,
  arrival: nullableText,
  originTerminal: nullableText,
  destinationTerminal: nullableText,
}).strict();

export const draftItemSchema = z.object({
  id: nullableText,
  kind: z.enum(["event", "transit"]),
  type: z.enum(["flight", "hotel", "work", "activity", "restaurant", "free_time", "transport"]).nullable(),
  title: nullableText,
  place: nullableText,
  from: nullableText.optional(),
  to: nullableText.optional(),
  timing: draftTimingSchema.nullable(),
  details: nullableText,
  note: nullableText,
  status: nullableText,
  flexible: z.boolean(),
  optional: z.boolean(),
  tentative: z.boolean(),
  relation: draftRelationSchema.nullable().optional(),
  links: z.array(draftLinkSchema),
  flight: draftFlightSchema.nullable(),
  evidence: z.array(draftEvidenceSchema),
}).strict();

export const draftDaySchema = z.object({
  id: nullableText,
  date: nullableText,
  sourceLabel: nullableText,
  title: nullableText,
  subtitle: nullableText,
  theme: nullableText,
  items: z.array(draftItemSchema),
  evidence: z.array(draftEvidenceSchema).min(1),
}).strict();

const draftReservationSchema = z.object({
  id: nullableText,
  title: nullableText,
  dateLabel: nullableText,
  type: z.enum(["flight", "hotel", "work", "activity", "restaurant", "free_time", "transport"]).nullable(),
  todoLabel: nullableText,
  completeStatus: nullableText,
  pendingStatus: nullableText,
  evidence: z.array(draftEvidenceSchema).min(1),
}).strict();

const parserNoteSchema = z.object({
  kind: z.enum(["ambiguity", "conflict", "non_itinerary", "low_confidence"]),
  message: z.string().min(1),
  blockIds: z.array(z.string().min(1)),
}).strict();

export const parsedTripDraftSchema = z.object({
  schemaVersion: z.literal(1),
  trip: z.object({
    id: nullableText,
    title: nullableText,
    destination: nullableText,
    countryCode: nullableText,
    timezone: nullableText,
    startDate: nullableText,
    endDate: nullableText,
  }).strict(),
  days: z.array(draftDaySchema),
  reservations: z.array(draftReservationSchema),
  referenceBlocks: z.array(z.object({
    blockId: z.string().min(1),
    classification: referenceBlockClassificationSchema,
    reason: z.string().min(1),
  }).strict()),
  parserNotes: z.array(parserNoteSchema),
}).strict();

export const reviewSessionSchema = z.object({
  id: z.string().min(1),
  sourceDocument: unifiedSourceDocumentSchema,
  draft: parsedTripDraftSchema,
  findings: z.array(findingSchema),
  overrides: z.array(z.object({
    id: z.string().min(1),
    entityId: z.string().min(1),
    field: z.string().min(1),
    value: z.unknown(),
    changedAt: z.string().datetime(),
  }).strict()),
  createdAt: z.string().datetime(),
}).strict();

/** @typedef {z.infer<typeof unifiedSourceDocumentSchema>} UnifiedSourceDocument */
/** @typedef {z.infer<typeof parsedTripDraftSchema>} ParsedTripDraft */
/** @typedef {z.infer<typeof reviewSessionSchema>} ReviewSession */
/** @typedef {z.infer<typeof referenceBlockClassificationSchema>} ReferenceBlockClassification */
