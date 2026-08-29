## ADDED Requirements

### Requirement: Incomplete-capable parsed draft
The parser SHALL output a schema-validated ParsedTripDraft that can represent missing, ambiguous, unresolved, conflicting, and low-confidence information without satisfying final viewer requirements by invention.

#### Scenario: Source omits exact trip dates
- **WHEN** a source provides weekday labels or day numbers without enough information to determine exact dates
- **THEN** the draft preserves the known labels, leaves exact dates unresolved, and creates a render-blocking review issue

### Requirement: Preserve source intent and precision
The parser MUST preserve exact, range, approximate, part-of-day, all-day, and unspecified timing semantics and SHALL distinguish optional, alternative, conditional, fallback, tentative, flexible, and unresolved intent where present.

#### Scenario: Approximate time
- **WHEN** the source says `約 10:30`
- **THEN** the draft stores 10:30 as an approximate value with the original label and does not mark it exact

#### Scenario: Intentional flexible time
- **WHEN** the source says `睡飽再去` or `下午自由活動`
- **THEN** the draft preserves the flexible wording and does not invent a start time

### Requirement: Distinguish itinerary from supporting content
The parser SHALL classify research, recommendations, references, packing, budget, expense, shopping, opening-hours tables, and candidate-place material without automatically converting each mentioned place into an itinerary event.

#### Scenario: Research-heavy document
- **WHEN** a document contains a daily route plus nearby restaurant research and opening hours
- **THEN** the daily route is parsed as itinerary intent while unsupported research items remain classified reference blocks or review candidates

### Requirement: Source provenance
Every parsed semantic entity and material field SHALL retain one or more source references inside the active ReviewSession, including source identifier, locator, and sufficient source text or visual reference for review. Confirmation SHALL reduce those references to stable provenance identifiers and locators; CanonicalTrip SHALL NOT retain raw excerpts, visual payloads, complete extracted blocks, or transient confidence evidence.

#### Scenario: Reviewer inspects parsed restaurant
- **WHEN** the traveler opens a parsed restaurant in Review
- **THEN** the system can show the source excerpt and page, sheet, cell range, line, or visual block that produced it

#### Scenario: Draft is confirmed
- **WHEN** Review creates CanonicalTrip data from a source-backed draft
- **THEN** source excerpts remain outside CanonicalTrip and are discarded according to the ReviewSession retention policy

### Requirement: Canonical domain excludes presentation state
CanonicalTrip SHALL contain confirmed travel facts and SHALL NOT contain viewer-computed fields such as formatted date labels, day indexes, weekday labels, period labels, NOW/NEXT state, special layout flags, or component styling state.

#### Scenario: Viewer needs a weekday label
- **WHEN** the viewer renders a canonical day date
- **THEN** a selector derives the locale-specific weekday label without persisting it in CanonicalTrip

### Requirement: Deterministic identity and validation
Application code SHALL assign stable Trip, Day, entity, place, reservation, and todo identifiers after parsing and SHALL run schema, date, time, trip-range, ordering, duplicate, and basic conflict validation without silently deleting or rewriting source-derived content.

#### Scenario: Out-of-order events
- **WHEN** a day contains a 19:06 event before a later-listed 18:00 event
- **THEN** deterministic validation emits an ordering finding for Review and retains both source-derived entities

#### Scenario: Declared flight without flight details
- **WHEN** the draft claims a flight exists but lacks the source-supported flight fields required by the flight entity
- **THEN** validation emits a blocking or review finding instead of displaying a completed flight card

### Requirement: No itinerary hallucination
The parser MUST NOT create dates, event times, places, reservations, ticket states, transport details, weather, recommendations, or other itinerary intent absent from the source or explicit traveler corrections.

#### Scenario: Source names a place without directions
- **WHEN** the source contains a place name but no route or travel duration
- **THEN** the draft may retain the unresolved place name but does not generate a route or duration

### Requirement: Structured parse failure behavior
The system SHALL surface malformed output, schema mismatch, timeout, provider failure, and partial parsing as explicit recoverable states.

#### Scenario: Model returns malformed structured output
- **WHEN** the parser response cannot be decoded or validated
- **THEN** the system does not create a canonical trip and offers a safe retry or return-to-upload path
