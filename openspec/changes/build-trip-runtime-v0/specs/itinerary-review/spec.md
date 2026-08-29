## ADDED Requirements

### Requirement: Focused source-backed review
The system SHALL present a review of trip dates, timezone, daily skeleton, flights, accommodation, reservations, optional/flexible semantics, conflicts, and low-confidence fields with access to source evidence owned by the active ReviewSession rather than CanonicalTrip.

#### Scenario: Draft is ready for review
- **WHEN** extraction and parsing produce a valid draft
- **THEN** the traveler sees a concise trip summary plus prioritized blocking issues and warnings instead of a full planner interface

### Requirement: Supported corrections
The traveler SHALL be able to correct names, dates, timing semantics, entity type, reservation/ticket state, optional/flexible/tentative state, notes, and place text; add parser-missed entities; and remove false entities.

#### Scenario: Parser missed an event
- **WHEN** the traveler adds a missing source event during Review
- **THEN** the draft records the new entity as a user correction with stable identity and source/override metadata

### Requirement: User override precedence
Every traveler correction SHALL be marked as a user override and MUST take precedence over parser inference and later enrichment.

#### Scenario: Revalidation after correction
- **WHEN** a traveler corrects an event time and the draft is validated again
- **THEN** validation uses the corrected time and no parse or enrichment step overwrites it

### Requirement: Renderability gate
The system SHALL distinguish blocking issues from warnings and SHALL create CanonicalTrip data only when required trip dates, timezone, dated days, and minimum entity structure are valid.

#### Scenario: Exact trip dates are missing
- **WHEN** a traveler attempts to confirm a draft whose days cannot be mapped to exact dates
- **THEN** confirmation is blocked and Review asks for the missing date information

#### Scenario: Event lacks exact time by design
- **WHEN** a valid event is flexible, all-day, part-of-day, or intentionally unspecified
- **THEN** the absence of an exact time does not by itself block confirmation

### Requirement: Review remains correction-focused
The Review interface MUST NOT offer AI optimization, regeneration, nearby recommendations, automatic replanning, or route optimization.

#### Scenario: Traveler reviews an incomplete day
- **WHEN** a day contains only a low-detail theme or flexible activity
- **THEN** the system preserves that low-detail plan and does not prompt the traveler to fill the day with recommendations

### Requirement: Explicit import workflow ownership
The import flow SHALL use one locally owned reducer to represent idle, validating, extracting, parsing, reviewing, confirming, viewing, and recoverable-error states and SHALL ignore cancelled or stale asynchronous results.

#### Scenario: An earlier parse finishes late
- **WHEN** the traveler starts a new import before a previous asynchronous request returns
- **THEN** the earlier response cannot replace or mutate the active ReviewSession

### Requirement: Accessible and responsive review
Review SHALL use the same responsive component tree at mobile and desktop widths and SHALL provide announced state changes, focus management, programmatically associated field errors, and keyboard-operable correction and confirmation controls.

#### Scenario: Correction removes a blocker
- **WHEN** a traveler fixes the active blocking field
- **THEN** revalidation feedback is announced and focus remains in a predictable review location
