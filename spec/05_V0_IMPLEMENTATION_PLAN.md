# Trip Runtime — V0 Implementation Plan

> Status: Execution Plan  
> Goal: Validate unfamiliar Markdown through the Understand + Trust pipeline before expanding delivery or source formats.

## 1. V0 objective

```text
Markdown
→ Source Adapter
→ UnifiedSourceDocument
→ Semantic Interpreter
→ SemanticInterpretationResult
→ Required Response / Reviewable Draft Gates
→ ParsedTripDraft
→ Deterministic Draft Validation
→ Review
→ Authoritative Candidate Validation
→ User Confirmation
→ Confirmed CanonicalTrip
→ Local Overview / Day rendering
→ External Markdown Benchmark #001 gate
```

V0 does not include Hosted Delivery implementation.

## 2. Scope distinction

### Golden Viewer
Real Osaka viewer in the current checkout. Treat it as a reference artifact, not as the Generalized V0 implementation baseline.

May contain:
- Overview
- Today
- Day
- reservations
- directions
- checklist
- runtime prototype behavior

### Generalized Product V0
Validation target for unfamiliar Markdown.

Required:
- Home / Upload
- Markdown parsing
- Review
- Canonical persistence
- Overview
- Day
- local result usability

### V0.1
Hosted Delivery Lite after the benchmark gate.

## 3. Current implementation baseline

As of 2026-09-01, this branch is an intentional clean start for Generalized Product V0.

Current baseline:
- the checked-in Osaka/Uji/Nara viewer is reference material and a real-use fallback
- the Generalized V0 source-intake/parser/validator/Review/Canonical pipeline is not yet implemented
- no prior-branch architecture, persistence behavior, test files, or passing-test counts are assumed
- the current UI direction is approved; its clean-start implementation and the Functional Spec remain pending behavioral validation

Do not retrieve or inherit implementation from the discarded branch merely to recreate its previous baseline.

## 4. P0 implementation work

### Data contract
- Canonical schema version
- versioned `TextSourceInput` schema shared by file and pasted input
- versioned provider-neutral `SemanticInterpretationResult` required schema
- interpretation status: draft / insufficient
- complete source-block coverage accounting
- structured unparsed item: locator / reason code / severity / message
- stable entity IDs
- provenance identifiers / locators
- confidence / review state
- unresolved state
- user override identity
- source asset reference support
- exact/approximate/daypart/no-time/open-ended time precision
- cross-midnight relation
- alternative/conditional/fallback relationships
- tentative/flexible state
- reservation/ticket/readiness and source-provided deadline/buffer

### Markdown Source Adapter
- accept one Markdown file or pasted Markdown text through the same adapter contract
- normalize both modes into the same required `TextSourceInput` envelope
- assign stable session source IDs and line/block locators to pasted input
- preserve Markdown structure
- preserve source order and locators
- missing relative assets do not fail the document
- do not treat Markdown AST as semantic truth

### Semantic Interpreter
- provider-neutral interface
- require one versioned response envelope across providers
- emit schema-valid insufficient outcomes without fabricating a draft
- account for every source block as interpreted, preserved supporting/non-itinerary, or explicitly unparsed
- list every unparsed item with stable locator, reason code, severity, and message
- one-shot parse as primary V0 path
- structured output
- mixed time notation
- inline multi-unit sequences
- exact/approximate/daypart/no-time/open-ended and cross-midnight semantics
- free/flexible/optional/tentative semantics
- alternative/conditional/fallback relationships
- reservation/ticket/deadline/buffer semantics
- incomplete entities
- conservative unresolved-place interpretation

### Validation
- schema
- input/response schema version and source-ID match
- source coverage totals/reference consistency
- zero silent source-block omission
- minimum Reviewable Draft gate: supported trip/day structure + linked itinerary entity
- date
- time
- cross-midnight
- trip range
- IDs
- relationship/reference consistency
- duplicate candidates
- logical conflicts
- open-ended time

### Workflow shell
- Home supports separate, operable Markdown file upload and pasted Markdown text input paths
- pasted input includes explicit start, empty-input validation, and clear/replace behavior
- provider/credential, Canonical JSON, privacy, and sample controls remain reachable through explicit secondary-surface controls
- one active confirmed trip remains separate from one candidate import/review state
- successful confirmation derives Home, success, Overview, and Day from the same newly active trip and clears the candidate state
- grouped progress communicates source reading, source-document construction, semantic interpretation, and validation/Review preparation
- uninterpretable day/date structure offers bounded structural recovery without guessing or planning
- schema-valid insufficient results list missing/unparsed items instead of entering normal Review
- schema-invalid parser output fails/retries and never advances
- confirmed success appears only after authoritative validation and successful persistence

### Review
- original evidence
- unparsed source items and missing required structure remain explicitly visible
- field correction for date/day, time, title, type, note, time precision, and place text
- optional/tentative/flexible correction
- warning/ambiguity visibility
- add parser-missed event
- delete parser-created mistake
- request final confirmation after authoritative candidate validation
- preserve user override identity
- mobile evidence excerpt/locator before material findings
- desktop linked source/review split view
- shared mobile/desktop correction capability with responsive composition only
- automatically interpreted items remain inspectable/editable

### Persistence / portability
- local active trip persistence
- canonical JSON import/export
- active-trip-associated Canonical JSON export action
- replacement transaction safety, including rollback/preservation on validation or persistence failure
- one consistent active-trip identity across Home, success, Overview, and Day after replacement

### Result rendering
- deterministic Presentation Projection
- source-agnostic templates
- Overview
- Day
- exact/approximate/daypart/no-time/open-ended time presentation
- free time
- optional
- tentative/unresolved states
- alternative/conditional/fallback relationships
- transit connector
- reservation/readiness and source-provided deadline/buffer
- note
- supporting references
- source-provided links/actions
- mobile horizontal Date Rail and single-column Day reading surface
- desktop Overview secondary column and three-region Day composition

### UI verification
- mobile and desktop viewports
- complete Review action parity across mobile and desktop
- operable file and pasted-text intake paths
- reachable provider/settings, credentials, privacy, Canonical JSON, and sample/fallback controls
- existing-active-trip replacement success, failure, cancel, and stale-response paths
- no horizontal overflow
- minimum 44px mobile interaction targets
- keyboard-operable primary controls and Date Rail
- light/dark semantic contrast
- no browser console errors
- semantic stress fixtures for approximate/open-ended/no-time, missing anchor, optional-heavy, free-time-heavy, alternative/conditional, unresolved, and runtime-unavailable states

## 5. P1 after benchmark gate

### Hosted Delivery Lite
- positive allowlist projection
- immutable PublishedTripSnapshot
- TripPublication
- unlisted slug
- bounded expiry
- republish/revoke/delete management

### Later parsing/enrichment
- semantic chunking
- global merge validation
- place resolution
- verified map metadata
- reservations hub
- map view

## 6. Later runtime APIs

Only after travel-time use is validated:
- weather
- flight status
- live transit
- current location
- opening status

Runtime UI primitives must not depend on fake data before then.

## 7. External Markdown Benchmark #001

Fixture:
Sample #23, unfamiliar Korea/Seoul Markdown.

Pre-Review parser gate:

- zero missing critical events
- zero invented critical events
- zero unsupported exact critical dates/times/places
- every annotated ambiguity surfaced for Review
- valid required interpretation-response schema
- 100% source-block accounting
- zero silent omissions
- every unparsed item includes stable locator, reason, severity, and message

Post-Review recovery gate:

- corrected CanonicalTrip passes validation
- renders through the current clean-start Generalized V0 result system
- semantic distinctions survive rendering

## 8. Evaluation metrics

### Parser Quality
- schema validity
- field extraction accuracy
- missing event rate
- false event rate
- unsupported exact fact rate
- ambiguity recall
- semantic preservation

### Review Recovery
- correction count
- correction time
- critical correction rate
- deleted false events
- added missing events
- unresolved ambiguity after confirmation

## 9. Implementation order

```text
1. Canonical schema contract
2. Markdown Source Adapter
3. UnifiedSourceDocument contract
4. Semantic Interpreter contract
5. LLM structured-output implementation
6. Deterministic Validator
7. Review / User Confirmation
8. Canonical persistence/import/export
9. Presentation Projection
10. Overview / Day generalized rendering
11. External Markdown Benchmark #001
```

Only after step 11 passes:

```text
→ V0.1 Hosted Delivery
→ V0.2 Narrow Spreadsheet Table
```

## 10. Explicit non-goals

Do not add to V0:
- AI planner
- recommendations
- auto-replanning
- route optimization
- expense/budget
- packing
- social
- account system
- complex collaboration
- PDF/XLSX general parsing
- fake runtime data

## 11. Definition of done for V0

V0 is complete when:

> An unfamiliar Markdown itinerary can become a validated, reviewable, user-confirmed CanonicalTrip and render as a useful local Overview + Day interface without materially distorting the source intent.
