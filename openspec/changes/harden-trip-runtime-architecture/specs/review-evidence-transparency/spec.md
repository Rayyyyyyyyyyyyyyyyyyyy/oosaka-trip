## ADDED Requirements

### Requirement: Complete Review finding visibility
Review SHALL present every blocking finding and warning with its severity and message. Parser ambiguity, conflict, low-confidence, non-itinerary, and evidence findings MUST NOT be represented only by aggregate counts.

#### Scenario: Parser reports an ambiguity
- **WHEN** a ParsedTripDraft includes a parser ambiguity note
- **THEN** Review displays the ambiguity message and its available source references before the traveler can confirm the trip

#### Scenario: Review contains warnings but no blockers
- **WHEN** deterministic validation produces non-blocking warnings only
- **THEN** confirmation remains available and every warning remains individually inspectable

### Requirement: Findings identify affected content
Review SHALL group or link findings to the affected trip, day, event, reservation, or evidence entry so the traveler can identify what must be inspected or corrected without searching the entire form.

#### Scenario: Event time is invalid
- **WHEN** validation creates a finding for one event's timing field
- **THEN** Review identifies the affected event, associates the error with its timing control, and exposes the corresponding source evidence when available

### Requirement: Preserved reference blocks are inspectable
Every preserved reference block SHALL expose its classification, reason, source locator, and available source content in Review. Travel-critical supporting content MUST NOT be hidden behind a count-only summary or promoted to a committed event merely to make it visible.

#### Scenario: Source contains an operational procedure
- **WHEN** the parser preserves ticket-machine instructions as an operational-procedure reference block
- **THEN** Review lets the traveler inspect that classification, reason, and source content without adding the procedure steps to the day timeline

### Requirement: Evidence validity is explicit
Review validation SHALL distinguish valid source evidence, missing or unknown provider evidence, and traveler-added content without source evidence. Provider-derived critical facts with invalid evidence SHALL be surfaced according to their validation severity, while explicit traveler additions remain identifiable as overrides.

#### Scenario: Provider cites an unknown source block
- **WHEN** a parsed entity cites a block identifier absent from the active UnifiedSourceDocument
- **THEN** Review reports the broken evidence reference and does not present it as verified source support

#### Scenario: Traveler adds a missing event
- **WHEN** the traveler explicitly adds an event during Review
- **THEN** the event is marked as a traveler override and is not assigned fabricated source evidence

### Requirement: Review remains transient and provider-neutral
Finding presentation SHALL consume the provider-neutral ReviewSession model and MUST NOT persist raw source excerpts, provider response shapes, or provider metadata into CanonicalTrip or CanonicalExport.

#### Scenario: Reviewed trip is confirmed
- **WHEN** visible findings have been reviewed and all blockers are resolved
- **THEN** confirmation produces CanonicalTrip through the existing allowlisted boundary and discards transient Review evidence according to the V0 retention policy
