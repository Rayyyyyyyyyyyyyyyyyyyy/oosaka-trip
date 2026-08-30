import { describe, expect, it } from "vitest";
import {
  parsedTripDraftSchema,
  REFERENCE_BLOCK_CLASSIFICATIONS,
} from "../domain/trip/reviewSchema";
import { parsedKyotoDraft } from "../fixtures/parsedKyotoDraft";
import { PARSED_TRIP_JSON_SCHEMA, PARSER_INSTRUCTION } from "./parserContract";

const NEW_REFERENCE_CLASSIFICATIONS = [
  "reference",
  "background",
  "runtime_instruction",
  "operational_procedure",
  "runtime_deferred_decision",
  "reference_freshness",
  "explicit_intra_source_reference",
];

describe("parser reference-block contract", () => {
  it.each(NEW_REFERENCE_CLASSIFICATIONS)("accepts the %s classification at the runtime boundary", (classification) => {
    const draft = structuredClone(parsedKyotoDraft);
    draft.referenceBlocks = [{ blockId: "block-2", classification, reason: "Preserved for Review without eventizing it." }];
    expect(parsedTripDraftSchema.parse(draft).referenceBlocks[0].classification).toBe(classification);
  });

  it("keeps the strict OpenAI enum aligned with the runtime vocabulary", () => {
    const strictEnum = PARSED_TRIP_JSON_SCHEMA.properties.referenceBlocks.items.properties.classification.enum;
    expect(strictEnum).toBe(REFERENCE_BLOCK_CLASSIFICATIONS);
    expect(strictEnum).toEqual(expect.arrayContaining(NEW_REFERENCE_CLASSIFICATIONS));
    expect(strictEnum).not.toContain("procedure_engine_state");
  });

  it("instructs the parser to preserve each supporting classification without eventizing it", () => {
    for (const classification of NEW_REFERENCE_CLASSIFICATIONS) {
      expect(PARSER_INSTRUCTION).toContain(classification);
    }
    expect(PARSER_INSTRUCTION).toContain("Never turn supporting content");
    expect(PARSER_INSTRUCTION).toContain("Do not execute or complete a procedure");
  });

  it("rejects classifications outside the shared vocabulary", () => {
    const draft = structuredClone(parsedKyotoDraft);
    draft.referenceBlocks = [{ blockId: "block-2", classification: "procedure_engine_state", reason: "Unsupported." }];
    expect(() => parsedTripDraftSchema.parse(draft)).toThrow();
  });
});
