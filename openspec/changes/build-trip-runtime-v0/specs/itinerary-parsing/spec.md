## ADDED Requirements

### Requirement: Incomplete-capable parsed draft
The parser SHALL output a schema-validated ParsedTripDraft that can represent missing, ambiguous, unresolved, conflicting, and low-confidence information without satisfying final viewer requirements by invention.

#### Scenario: Source omits exact trip dates
- **WHEN** a source provides weekday labels or day numbers without enough information to determine exact dates
- **THEN** the draft preserves the known labels, leaves exact dates unresolved, and creates a render-blocking review issue

### Requirement: Preserve source intent and precision
The parser MUST preserve exact, range, approximate, part-of-day, all-day, open-ended, cross-midnight, and unspecified timing semantics and SHALL distinguish optional, alternative, conditional, fallback, tentative, flexible, free-time, and unresolved intent where present. Normalization SHALL retain the raw source notation and MUST NOT invent a missing end time or unsupported precision.

#### Scenario: Approximate time
- **WHEN** the source says `約 10:30`
- **THEN** the draft stores 10:30 as an approximate value with the original label and does not mark it exact

#### Scenario: Intentional flexible time
- **WHEN** the source says `睡飽再去` or `下午自由活動`
- **THEN** the draft preserves the flexible wording and does not invent a start time

#### Scenario: Mixed and open-ended time notation
- **WHEN** one source mixes `11:55`, `5.30`, `12點`, `七點`, and `18:30~`
- **THEN** the parser normalizes each supported start value, retains its raw notation and precision, and represents `18:30~` with a known start and unknown end rather than rejecting or completing the range

### Requirement: Interpret semantic units beyond Markdown block boundaries
The parser SHALL treat Markdown structure as evidence rather than semantic truth and SHALL support multiple ordered semantic units inside one paragraph, list item, or blockquote-shaped route expression without automatically converting every syntax node into one event.

#### Scenario: Inline route sequence contains multiple units
- **WHEN** a paragraph contains `買 T-money > 搭機場地鐵 > 首爾車站 > 轉四號線到明洞`
- **THEN** the parser preserves the ordered route units and their shared source reference instead of treating the paragraph as one opaque event or the separators as quotation semantics

### Requirement: Distinguish itinerary from supporting content
The parser SHALL classify research, recommendations, references, background, runtime instructions, operational procedures, runtime-deferred decisions, reference-freshness statements, explicit intra-source references, packing, budget, expense, shopping, opening-hours tables, and candidate-place material without automatically converting mentioned places or procedural steps into itinerary events.

#### Scenario: Research-heavy document
- **WHEN** a document contains a daily route plus nearby restaurant research and opening hours
- **THEN** the daily route is parsed as itinerary intent while unsupported research items remain classified reference blocks or review candidates

#### Scenario: Contextual instruction or deferred choice
- **WHEN** a document contains ticket-machine steps, an app procedure, an explicit reference to another section, or a choice intentionally deferred until runtime
- **THEN** the parser preserves the block's role, wording, relation, freshness statement when present, and source trace for Review without inventing timeline events, completing the procedure, or resolving the choice

#### Scenario: Supporting content may be travel-critical
- **WHEN** a fixture annotates supporting content as necessary to execute the trip
- **THEN** the parser surfaces it for Review and the acceptance result cannot count it as safely ignored merely because it is not an itinerary event

#### Scenario: Parent activity contains an internal timetable
- **WHEN** a parent activity note lists multiple venue-program times inside the activity window
- **THEN** the parser preserves the internal timetable relation and does not automatically promote every program time into a top-level day event

#### Scenario: Reservation note contains a booking release rule
- **WHEN** a note says tickets become available four weeks before on Tuesday at 06:00
- **THEN** the parser classifies the time as a booking-release rule rather than the event time or an already-confirmed reservation

### Requirement: Preserve incomplete entities and structured dependency metadata
The parser SHALL preserve source-supported partial entities, including flights with missing airline, flight number, airport pair, or row-level date and places identified first by an address. It SHALL keep Pass eligibility, purchase method, discount, ticket state, and reservation state as distinct source-supported metadata rather than collapsing them into one boolean or filling missing identity fields by inference.

#### Scenario: Address-first place has no supported name
- **WHEN** the source provides a street address and building floor without a supported venue name
- **THEN** the draft retains an unresolved address-first place for Review and does not invent a business identity

#### Scenario: Pass and reservation metadata differ
- **WHEN** an event row separately indicates Pass eligibility, official-site purchase, and reservation required
- **THEN** the draft preserves those distinctions and does not replace them with a single reserved or ticketed flag

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

### Requirement: Provider-neutral parse contract
The browser parse service SHALL support two concrete direct-provider adapters, OpenAI and Gemini, behind one explicit provider dispatch boundary. Both adapters MUST apply the same conservative parser semantics, produce the same ParsedTripDraft contract, and pass the same runtime and deterministic validation before Review. Provider-specific request/response shapes, authentication, transient usage metadata, and failure details MUST remain outside CanonicalTrip and CanonicalExport.

#### Scenario: Equivalent provider output
- **WHEN** OpenAI and Gemini return semantically equivalent structured results for the same UnifiedSourceDocument
- **THEN** both results enter the same ParsedTripDraft validation and Review flow without provider-specific trip fields

#### Scenario: Provider returns schema-shaped but unsupported content
- **WHEN** either provider returns JSON that fails the shared ParsedTripDraft runtime schema or deterministic validation
- **THEN** the system rejects it as a recoverable parse failure and does not create or replace a confirmed trip

### Requirement: Pinned acceptance-tested provider models
Each provider adapter SHALL use one explicitly pinned structured-output model, and changing either model SHALL require rerunning provider adapter tests, parser-quality fixtures, and External Markdown Benchmark #001 before production use.

#### Scenario: Provider model changes
- **WHEN** a pinned OpenAI or Gemini model identifier is updated
- **THEN** the new model is not treated as production-ready until the shared fixtures and External Markdown Benchmark #001 acceptance checks pass

### Requirement: Structured parse failure behavior
The system SHALL surface malformed output, schema mismatch, timeout, provider failure, and partial parsing as explicit recoverable states.

#### Scenario: Model returns malformed structured output
- **WHEN** the parser response cannot be decoded or validated
- **THEN** the system does not create or replace a canonical trip and offers a safe retry, return-to-Home, or return-to-current-trip path
