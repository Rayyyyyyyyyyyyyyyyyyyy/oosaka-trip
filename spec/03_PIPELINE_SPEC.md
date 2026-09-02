# Trip Runtime — Pipeline Contract
> Status: Architecture Contract
> Scope: Source → Confirmed CanonicalTrip → Renderable Trip.
## 1. Pipeline
```text
Source intake
→ Validate
→ Source Adapter
→ UnifiedSourceDocument
→ Semantic Interpreter
→ SemanticInterpretationResult
→ Required Response / Reviewable Draft Gates
→ ParsedTripDraft
→ Normalize
→ Reconcile
→ Deterministic Draft Validation
→ Review / Correct
→ [Later, optional: Resolve / Enrich approved intent]
→ Authoritative Candidate Validation
→ User Confirmation
→ Confirmed CanonicalTrip
→ Presentation Projection
→ Renderer
```
Post-V0:
```text
CanonicalTrip
→ PublishedTripSnapshot
→ TripPublication
→ Hosted Viewer
```
## 2. Core contracts
### Source Adapter
Input:
versioned `TextSourceInput`.

For Generalized V0 this may be:
- one Markdown file
- pasted Markdown text represented as an ephemeral source

Required normalized input fields:
```json
{
  "schema_version": "...",
  "source_id": "...",
  "input_mode": "markdown_file | pasted_markdown",
  "media_type": "text/markdown",
  "content": "...",
  "display_name": "..."
}
```

`content` must be non-empty after source validation. `display_name` may be generated for pasted input but remains required in the normalized envelope. File upload and paste differ only at intake; both continue through the same Source Adapter contract.
Output:
`UnifiedSourceDocument`.
Owns:
- source input reading
- extraction/reconstruction
- source locators
- assets/links/structural hints
Does not own:
- confirmed truth
- validation
- Review
- rendering
### UnifiedSourceDocument
Source-neutral intermediate representation.
Must support:
- ordered blocks
- hierarchy / structural role
- raw text/value
- locator
- links/assets
- source-specific hints
Not CanonicalTrip.
### Semantic Interpreter
Input:
`UnifiedSourceDocument`.
Output:
versioned `SemanticInterpretationResult`, containing either a reviewable `ParsedTripDraft` or an explicit insufficient result.
Implementation:
- deterministic
- LLM
- hybrid
Owns:
- block intent
- semantic classification
- relation interpretation
- uncertainty
Does not own:
- file extraction
- deterministic correctness
- user confirmation
- presentation

### SemanticInterpretationResult
Provider-neutral response envelope. Required minimum shape:
```json
{
  "schema_version": "...",
  "source_id": "...",
  "status": "draft | insufficient",
  "draft": null,
  "findings": [],
  "coverage": {
    "total_blocks": 0,
    "block_dispositions": [],
    "unparsed_items": []
  }
}
```

Required rules:
- `schema_version`, `source_id`, `status`, `draft`, `findings`, and `coverage` are always present
- `source_id` must match the input document
- `draft` is a `ParsedTripDraft` only when `status = draft`; otherwise it is `null`
- every `UnifiedSourceDocument` block has exactly one `block_dispositions` entry: `interpreted`, `supporting`, or `unparsed`
- `coverage.total_blocks` equals the number of unique `block_dispositions` source references
- each unparsed item contains a stable source locator, reason code, severity, and user-readable message
- schema-valid `insufficient` is a supported interpretation outcome, not malformed provider output
- malformed/schema-invalid provider output remains a parse failure and may be retried; it must not advance to Review or confirmation

When `status = draft`, the required `ParsedTripDraft` schema must include:
- trip identity + explicit trip date-range fields
- `days[]` with stable ID, explicit date, and source references
- `entities[]` with stable ID, day reference, semantic type, title/raw label, source references, and explicit time precision
- explicit optional/tentative/flexible/unresolved state fields
- preserved supporting/non-itinerary content references

Required fields must be present even when the supported value is `null`, `none`, `unknown`, or an empty list. Source absence is not automatically a parse defect: for example, an intentionally untimed item uses time precision `none`. Missing required schema members are parser-contract failures; source facts that cannot be interpreted safely become structured findings/unparsed items instead of invented values.

The implementation must encode this contract as a versioned required schema before provider integration. Provider adapters may not weaken or replace it.
### Deterministic Validator
Owns machine-checkable correctness:
- schema
- date/time
- trip range
- rollover
- ID uniqueness
- reference consistency
- obvious conflicts
- duplicate/reconciliation candidates
Reports findings.
Does not silently rewrite source intent.

Also validates the minimum response/draft gates and source coverage accounting described below.
### Review
Owns evidence-backed correction and approval decisions before final confirmation.
May:
- correct
- approve/reject interpreted intent
- add parser-missed content
- delete parser-created mistakes
Only confirmed output becomes active CanonicalTrip.
### Confirmation
Owns the final user action that turns a reviewed, authoritatively validated candidate into Confirmed CanonicalTrip.
Authoritative candidate validation must run after all Review corrections and optional resolution/enrichment changes; the confirmation transaction may rerun the same validation immediately before persistence.
If optional resolution/enrichment is enabled before confirmation, its persisted results must first return through Review visibility.
### Confirmed CanonicalTrip
Product-level trip Source of Truth.
Must not contain:
- raw model response
- provider metadata
- UI-only styling
- live runtime state
### Presentation Projection
Deterministic mapping:
Canonical semantics → presentation semantics.
Examples:
- Transit → connector
- Optional → optional disclosure
- Free Time → flexible-space treatment
- Reservation → readiness metadata
Must not:
- parse source
- invent intent
- mutate CanonicalTrip
- branch by source format
### Renderer
Consumes:
- presentation model
- Runtime Data when available
Must not read:
- raw Markdown
- workbook/PDF objects
- extracted blocks
- UnifiedSourceDocument
## 3. Stage behavior
### Source intake
Production source bytes, pasted source text, and full Review evidence are session-scoped unless explicitly approved otherwise.

Pasted Markdown must receive:
- a stable session `source_id`
- deterministic line/block locators
- the same UnifiedSourceDocument and Review path as a Markdown file

Pasting text is an intake mode, not a separate source format or Result UI family.
### Source validation
Reject early:
- unsupported type
- empty/unreadable
- corruption
- configured size violation

Equivalent source validation applies to pasted text, including empty input and configured size limits.

After normalization, file upload and pasted input must satisfy the same `TextSourceInput` schema before extraction.
### Extraction/reconstruction
Preserve enough content + structure to interpret intent correctly.
### Classification/interpretation
Classify blocks such as:
- itinerary
- transport
- accommodation
- reservation
- reference
- research
- runtime instruction
- procedure
- preparation
- personal note
- unknown
Non-itinerary ≠ discard.

Every block must receive an explicit coverage disposition. Content the interpreter cannot safely classify or attach must enter `coverage.unparsed_items`; it must never disappear from the response.
### Normalization
Normalize representation, not intent.
Allowed:
```text
2026/9/12 → 2026-09-12
```
Forbidden:
```text
about 10:30 → exact 10:30
```
Cross-midnight:
preserve raw representation and source-day grouping.
Open-ended:
```text
18:30~ → start=18:30, end=null
```
### Reconciliation
Merge conceptual duplicates conservatively.
Never dedupe solely by naive title/place equality.
### Validation
Emit structured findings:
```json
{
  "severity": "warning",
  "code": "LOCATION_CONFLICT",
  "entity_refs": ["..."],
  "source_refs": ["..."]
}
```

### Minimum output gates
The pipeline distinguishes three gates:

#### A. Valid interpretation response
Required before the system can present any parse outcome:
- `SemanticInterpretationResult` conforms to the versioned required schema
- `source_id` matches
- coverage counts and references are internally consistent
- every source block is accounted for
- every unparsed item has locator + reason + severity + message

Failure at Gate A is a parse/schema failure, not a partial draft.

#### B. Reviewable draft
Required before normal Review/confirmation:
- `status = draft`
- at least one supported trip/day structure exists
- at least one itinerary entity is linked to that structure
- every entity has required identity, semantic type, source reference, and explicit time precision including `none` when untimed
- all blocking missing structure is resolved

If Gate A passes but Gate B fails, return `status = insufficient`, list all known unparsed/missing requirements, and offer only bounded structural recovery or source replacement. Do not fabricate a draft.

#### C. Renderable confirmed result
Required before Overview/Day:
- Review corrections complete
- authoritative candidate validation passes
- user confirms
- persistence succeeds

No percentage confidence threshold substitutes for these structural gates.
### Review
Material findings must be individually visible:
- blocking errors
- warnings
- ambiguity
- low confidence
- broken evidence
- preserved reference blocks
- unparsed source items with locator + reason
- user overrides
### Place resolution
Not required for Generalized Product V0.
When enabled, resolve only place intent explicitly approved in Review.
If ambiguous:
return to Review and ask the user.
Never silently select the most popular candidate.
### Enrichment
May add verified metadata to an existing entity.
May not add itinerary intent.
Anything persisted into CanonicalTrip must be visible before final confirmation and pass authoritative validation.
### Render
```text
CanonicalTrip + Runtime Data
→ Presentation Projection
→ Result UI
```
Static Trip Data must survive Runtime Data failure.
## 4. Provenance
Canonical entities retain stable provenance identifier + locator.
Full excerpts remain Review evidence, not durable trip truth.
Minimum:
```json
{
  "source": {
    "source_id": "...",
    "locator": "..."
  }
}
```
## 5. Override contract
```text
User Override
> Verified External Data
> Parser Result
> Raw Source Inference
```
Reparse/resolution/enrichment must not overwrite user overrides.
## 6. Runtime separation
CanonicalTrip:
stable trip semantics.
Runtime Data:
dynamic execution state.
On runtime failure:
- preserve static itinerary
- omit unsupported NOW/NEXT/leave-by
- never synthesize precision
## 7. Replacement import transaction
When an active trip exists:
```text
candidate source intake
→ parse
→ validate draft
→ review
→ validate candidate
→ confirm
→ persist
→ atomically replace active trip
```
Before confirmation:
- active trip remains readable
- failure/cancel preserves it
- stale responses cannot replace state
## 8. Hosted Delivery boundary
`build-trip-runtime-v0` ends at local confirmed/renderable CanonicalTrip.
Hosted Delivery starts only after External Markdown Benchmark #001 passes.
Hosted storage must not receive:
- raw source files or pasted source text
- UnifiedSourceDocument
- source excerpts
- Review evidence
- parser responses
- personal AI keys
## 9. Failure contract
Each boundary fails explicitly.
Examples:
- extraction failure: cannot read file
- schema-invalid interpretation response: reject/retry without advancing
- structurally insufficient interpretation: list missing/unparsed content and offer bounded recovery
- parse uncertainty: surface ambiguity
- place ambiguity: request choice
- runtime failure: live value unavailable
Never collapse failures into an opaque generic "AI failed" state.
## 10. Invariant summary
```text
Source-specific extraction
≠ source-specific Result UI
ParsedTripDraft
≠ product truth
Validation
≠ silent correction
Review
= trust boundary
CanonicalTrip
= confirmed trip truth
Presentation Projection
≠ second trip truth
```
