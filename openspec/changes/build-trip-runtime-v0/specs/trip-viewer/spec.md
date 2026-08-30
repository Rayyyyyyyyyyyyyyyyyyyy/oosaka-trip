## ADDED Requirements

### Requirement: Canonical-data-only renderer
The result viewer SHALL consume only validated CanonicalTrip data and runtime selectors and SHALL NOT parse source files, extracted blocks, or raw model responses inside UI components.

#### Scenario: Different supported inputs produce equivalent trips
- **WHEN** a Markdown-derived and canonical-JSON-imported trip contain equivalent trip semantics
- **THEN** the viewer renders them through the same components and interaction model

### Requirement: Derived presentation model
Locale labels, day numbering, grouping, phase, Today selection, NOW/NEXT, leave-by state, special layouts, and component styling SHALL be derived from canonical facts by selectors or runtime helpers and SHALL NOT be persisted as CanonicalTrip fields.

#### Scenario: Current time crosses a trip-day boundary
- **WHEN** the open page refreshes its time-derived state after the trip timezone date changes
- **THEN** Today and runtime labels are recomputed from canonical dates without mutating the stored trip

### Requirement: Existing core viewer experience
The generalized viewer SHALL provide Overview, Today, Day, Reservations, sticky Date Rail, trip menu, mobile-first layout, and before/during/after runtime-phase behavior consistent with the Osaka Golden Result through the existing MUI interaction primitives and Tailwind layout/token system rather than a parallel component system.

#### Scenario: Traveler opens trip during its date range
- **WHEN** the current time in the trip timezone falls on a trip date
- **THEN** the viewer selects Today and the actual local trip date automatically

#### Scenario: Traveler opens trip before or after travel
- **WHEN** the current time is before or after the trip range
- **THEN** the viewer shows the appropriate countdown/up-next or completed state while keeping every day accessible

### Requirement: Honest runtime state
The viewer SHALL show NOW, NEXT, and leave-by only when canonical timing and relation data support the conclusion and SHALL refresh time-derived state at least once per minute.

#### Scenario: Timing is insufficient
- **WHEN** the selected day contains only flexible or imprecise event times
- **THEN** the Today view explains that precise NOW cannot be determined and does not fabricate one

### Requirement: Semantic day rendering
The viewer SHALL preserve event types, flexible/free-time treatment, optional content outside the main timeline, transit as connective tissue, notes, and density-aware all-day layouts.

#### Scenario: Optional place
- **WHEN** an entity is explicitly optional
- **THEN** it appears under `IF YOU STILL HAVE ENERGY` and is not presented as an incomplete checklist task

#### Scenario: Single all-day activity
- **WHEN** a day contains one primary all-day activity
- **THEN** the viewer uses the all-day presentation instead of forcing a detailed timeline

### Requirement: Conditional overview sections
The viewer SHALL omit flights, accommodation, reservations, links, and other sections that have no supported canonical data and SHALL not display empty or invented cards.

#### Scenario: Trip has no flight
- **WHEN** the canonical trip contains no valid flight entity
- **THEN** the Overview omits the Flights section while remaining usable

### Requirement: Exact source links and safe external navigation
The viewer MUST use an exact source-provided map or restaurant URL when available, SHALL fall back to a clearly unresolved Google Maps search only when no exact link exists, and SHALL open external links in a new tab with safe relationship attributes.

#### Scenario: Source contains an exact Google Maps URL
- **WHEN** an entity has an exact source-provided Maps URL
- **THEN** Directions opens that unchanged URL rather than reconstructing or normalizing a different query

### Requirement: Checklist and reservation consistency
Checklist state SHALL persist locally under stable todo identifiers and SHALL immediately update linked reservation status, with unchecked tickets remaining action-needed unless an explicit source status says otherwise.

#### Scenario: Traveler confirms a pending ticket
- **WHEN** the traveler checks a todo linked to a pending reservation or ticket
- **THEN** the linked reservation immediately displays its configured confirmed or ready status and retains it after reload

### Requirement: Static itinerary fallback
Runtime or optional external-service failure MUST NOT make confirmed static itinerary content unavailable.

#### Scenario: Runtime helper fails
- **WHEN** a runtime selector or optional remote enrichment is unavailable
- **THEN** the viewer displays a scoped unavailable state and continues rendering all canonical trip days and events
