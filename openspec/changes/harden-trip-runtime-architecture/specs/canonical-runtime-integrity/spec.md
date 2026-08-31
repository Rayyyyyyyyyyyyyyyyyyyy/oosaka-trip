## ADDED Requirements

### Requirement: Semantic canonical validation
Every CanonicalTrip entry boundary SHALL validate runtime semantics in addition to object shape, including a usable IANA timezone, valid trip/day date relationships, unique stable entity identifiers, valid reservation/checklist references, and consistent relation identifiers before the candidate can be persisted or rendered.

#### Scenario: Canonical JSON contains an invalid timezone
- **WHEN** a traveler imports canonical JSON whose timezone cannot be used by the runtime formatter
- **THEN** the import is rejected before storage mutation, the existing confirmed trip remains active, and the error is recoverable through the current import surface

#### Scenario: Reservation references an unknown todo
- **WHEN** a canonical candidate contains a reservation whose `todoId` is not present in the same trip's todo collection
- **THEN** canonical validation rejects the candidate instead of rendering an permanently inconsistent reservation state

#### Scenario: Canonical identities are duplicated
- **WHEN** a canonical candidate repeats a stable identifier in a namespace whose entities must be distinct
- **THEN** canonical validation rejects the candidate and reports the affected collection before it reaches the Viewer

### Requirement: Safe exact external links
Canonical and draft link boundaries SHALL allow only explicitly supported non-executable URL protocols. An accepted source-provided URL MUST be retained and opened unchanged; an unsafe URL MUST be rejected rather than normalized, followed, or rendered as an interactive external link.

#### Scenario: Source provides a safe exact Maps URL
- **WHEN** a canonical event contains an accepted source-provided Maps URL
- **THEN** the Viewer opens that exact URL with safe new-tab relationship attributes

#### Scenario: Imported link uses an executable or data protocol
- **WHEN** canonical JSON or provider output contains a `javascript:`, `data:`, or another unsupported-protocol URL
- **THEN** boundary validation rejects the link before it can become an interactive Viewer control

### Requirement: Atomic canonical persistence
Canonical save and import operations SHALL fully validate and serialize a candidate before replacing the persisted active trip. A validation, serialization, quota, or storage failure MUST leave the previous confirmed trip value unchanged.

#### Scenario: Replacement storage fails
- **WHEN** a valid replacement candidate cannot be written because browser storage fails or exceeds quota
- **THEN** the existing confirmed trip remains both persisted and active and the traveler receives a recoverable error

#### Scenario: Stored canonical data is invalid on load
- **WHEN** repository-owned persisted data fails current canonical validation during application startup
- **THEN** the application does not pass it to Viewer runtime code and presents a usable Home or scoped recovery state

### Requirement: Stable rendered identity
Selectors SHALL preserve canonical IDs for every rendered collection, and React lists SHALL use those IDs rather than display labels, flight codes, or array positions.

#### Scenario: Two reservations have the same title
- **WHEN** a valid trip contains distinct reservations with the same title
- **THEN** both reservations render and update independently without duplicate rendered identity

#### Scenario: Multiple partial flights lack codes
- **WHEN** a valid trip contains distinct source-supported flight entities without flight numbers
- **THEN** the Overview preserves each flight as a distinct rendered item using its canonical identity

### Requirement: Scoped runtime fallback
Failure of current-time or optional runtime derivation MUST NOT hide validated static trip days and events, and the fallback MUST NOT fabricate NOW, NEXT, countdown, or leave-by information.

#### Scenario: Runtime formatting is unavailable
- **WHEN** current-time derivation fails after a valid trip has loaded
- **THEN** the Viewer shows a scoped runtime-unavailable state while Overview and every canonical day remain accessible
