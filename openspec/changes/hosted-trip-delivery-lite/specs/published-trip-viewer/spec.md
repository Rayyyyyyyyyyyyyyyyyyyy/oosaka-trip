## ADDED Requirements

### Requirement: Stable unlisted read route
The system SHALL resolve a cryptographically random, non-enumerable publication slug to the current validated PublishedTripSnapshot and render it through the existing mobile-first trip viewer. The system MUST NOT offer a public listing, search endpoint, sequential identifier, or slug-discovery API.

#### Scenario: Active publication is opened
- **WHEN** a traveler opens the stable URL of an active, unexpired publication
- **THEN** the route loads and validates the current snapshot and renders the corresponding trip

### Requirement: Explicit unlisted-access disclosure
Before creating or copying a publication URL, the UI SHALL explain that anyone with the link can view the trip, that the link is unlisted rather than authenticated or private, and when it expires.

#### Scenario: Traveler prepares to publish
- **WHEN** the traveler reaches the final publish action
- **THEN** the access and expiry disclosure is visible before confirmation and is available again beside link-copy controls

### Requirement: Read-only hosted viewer
The hosted viewer SHALL be read-only and MUST NOT mutate CanonicalTrip, readiness, reservations, publication metadata, or server state from the unlisted read URL. Mutable readiness and cross-device state require a later ownership capability.

#### Scenario: Published readiness is displayed
- **WHEN** a snapshot contains allowlisted readiness captured at publish time
- **THEN** the viewer displays its ready, needed, or unknown state without offering a control that writes changes to the publication

### Requirement: Snapshot-only rendering boundary
The hosted viewer SHALL consume only a runtime-validated PublishedTripSnapshot and runtime selectors. It MUST NOT receive CanonicalTrip override history, source evidence, parser output, management credentials, or publication-internal records.

#### Scenario: Snapshot response is inspected
- **WHEN** the viewer loads a publication
- **THEN** the response includes the viewer-safe snapshot and necessary expiry/status presentation data but excludes management and source material

### Requirement: Existing travel-day behavior
The hosted viewer SHALL reuse the existing Overview, Today, Day, Reservations, Date Rail, optional/flexible/all-day, exact directions-link, and honest NOW/NEXT/arrive-by/source-derived-leave-by behavior, deriving current state from the published trip timezone and refreshing time-derived state at least once per minute. Alternative, Conditional, Flexible, and rest/fallback relationships MUST remain distinct rather than being flattened into a misleading committed sequence.

#### Scenario: Hosted trip is open during travel
- **WHEN** the current time in the published trip timezone falls on a trip day
- **THEN** the same viewer components select Today and derive only source-supported NOW/NEXT/arrive-by/leave-by information

#### Scenario: Published day contains choices and a source deadline
- **WHEN** a snapshot contains alternative dinner options, a rest fallback, and a source-supported arrival deadline for a later reservation
- **THEN** the hosted viewer presents the choices as alternatives and keeps the arrival constraint eligible for Today runtime treatment without inventing travel time or implying that every choice will occur

### Requirement: Safe unavailable and expired states
Revoked, deleted, expired, missing, and invalid publications SHALL stop exposing trip content and SHALL return a generic unavailable or expired experience without revealing whether another slug exists or whether management operations are possible. A transient service failure SHALL not fabricate stale trip facts.

#### Scenario: Expired link is opened
- **WHEN** a traveler opens a slug after its publication expires
- **THEN** the viewer shows a generic expired/unavailable state and no snapshot content

#### Scenario: Snapshot fails runtime validation
- **WHEN** the resolved payload is malformed or unsupported
- **THEN** the viewer refuses to render it and shows a scoped unavailable state without exposing payload internals

### Requirement: No indexing or management leakage
Hosted publication pages SHALL emit appropriate no-index directives, SHALL NOT expose recovery secrets or management endpoints in page markup or viewer responses, and SHALL open exact external trip links with safe relationship attributes.

#### Scenario: Search crawler requests a publication
- **WHEN** an active unlisted publication page is served
- **THEN** the response directs compliant crawlers not to index or follow it and contains no management credential

### Requirement: Accessible responsive delivery
Publish disclosure, link copy, recovery-key copy/download, hosted navigation, unavailable states, and read-only readiness SHALL be keyboard-operable, announced appropriately, and usable through one responsive component tree at mobile and desktop widths.

#### Scenario: Keyboard user publishes a trip
- **WHEN** a keyboard user confirms publishing and receives the URL and recovery key
- **THEN** success is announced, focus moves predictably, and both values can be copied or downloaded without pointer-only interaction
