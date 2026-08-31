## ADDED Requirements

### Requirement: Source-independent MVP presentation
The MVP Result UI SHALL render Overview and Day from validated CanonicalTrip data and deterministic presentation selectors, and MUST NOT read source files, parser evidence, or source-format-specific layout in those surfaces. Presentation-only hierarchy, atmosphere, route motifs, and visual roles MUST NOT be persisted into CanonicalTrip.

#### Scenario: Equivalent trips come from different inputs
- **WHEN** two confirmed trips have equivalent canonical semantics but originate from different supported input paths
- **THEN** Overview and Day use the same presentation grammar without source-format-specific UI branches

#### Scenario: Presentation atmosphere is unavailable
- **WHEN** canonical data does not support a place-specific or day-specific visual motif
- **THEN** the UI uses neutral travel presentation and does not invent a destination, landmark, weather condition, or activity

### Requirement: Overview communicates trip identity and journey structure
Overview SHALL present trip identity, date range, concise trip character, supported journey/place atmosphere, current readiness attention, critical travel anchors, and a scannable day index in that priority order. It SHALL omit unsupported anchor or readiness sections rather than render empty or invented content.

#### Scenario: Osaka Golden Result opens before travel
- **WHEN** the confirmed Osaka trip opens on Overview before departure
- **THEN** the first reading sequence communicates the September 10–15 trip identity and journey before presenting one actionable USJ ticket state, flight/hotel anchors, and the six-day index

#### Scenario: Trip has no flight or accommodation data
- **WHEN** a confirmed trip contains days and events but no supported flight or accommodation entities
- **THEN** Overview remains coherent and omits the missing anchor rows without placeholder cards

### Requirement: Travel atmosphere remains purposeful and honest
The MVP Result UI SHALL express departure energy through restrained journey, place, color, and travel-journal cues that support orientation. A schematic journey treatment MUST NOT imply geographic scale, calculated routing, live location, weather, or external enrichment.

#### Scenario: Overview shows ordered destinations
- **WHEN** canonical day or trip geography provides an ordered set of destination labels
- **THEN** Overview may present those labels as a clearly schematic journey motif without map controls, distance claims, or inferred coordinates

#### Scenario: Day motif is not supported by canonical semantics
- **WHEN** a day has no supported place or activity semantics for a specific motif
- **THEN** Day uses neutral travel atmosphere instead of selecting a bespoke landmark or environmental illustration

### Requirement: Day prioritizes orientation and the nearest fixed anchor
Day SHALL present compact day orientation, a clear date and day character, any supported day atmosphere, the nearest relevant fixed anchor, and then the detailed semantic itinerary. The anchor summary MUST identify its source event and MUST NOT create a duplicate reservation or event identity.

#### Scenario: Flexible day ends with a fixed reservation
- **WHEN** a day contains untimed or flexible activity followed by a fixed 19:30 reservation
- **THEN** the fixed reservation is visible before the detailed timeline while the flexible activity retains lower-pressure presentation

#### Scenario: Day has no fixed event
- **WHEN** a day contains only flexible, untimed, or optional content
- **THEN** Day omits the fixed-anchor summary and does not invent a next deadline

### Requirement: Semantic event weight remains distinct
The Day presentation SHALL visually distinguish fixed, exact, approximate, untimed, flexible, optional, conditional, alternative, transit, readiness, and unresolved semantics without implying precision or commitment beyond CanonicalTrip. General itinerary content MUST NOT be rendered as a uniform stack of equal-weight cards.

#### Scenario: Flexible Uji time
- **WHEN** the Uji day contains river and café time without an exact departure time
- **THEN** that content receives spacious flexible treatment and does not appear as an overdue task or exact appointment

#### Scenario: Transit connects two events
- **WHEN** canonical data represents transit between itinerary events
- **THEN** Day renders it as connective tissue unless the transport is itself a critical booked entity

#### Scenario: Approximate time is rendered
- **WHEN** an event time is approximate or open-ended
- **THEN** its label and visual treatment remain distinguishable from an exact fixed time

### Requirement: Optional content stays outside the committed timeline
Optional places and activities SHALL appear in a lower-priority `IF YOU STILL HAVE ENERGY` area outside the committed timeline. Optional presentation MUST NOT resemble disabled content, an incomplete checklist, or a required next event.

#### Scenario: Traveler expands optional Uji places
- **WHEN** the traveler expands the optional area on the Uji Day
- **THEN** the supported optional places become available without changing the fixed or flexible itinerary sequence

### Requirement: Visual roles remain restrained and theme-aware
The UI SHALL use role-based colors for reading surfaces, travel movement, warmth, attention/fixed anchors, readiness/flexible space, and neutral structure. Meaning MUST also be conveyed by text, label, icon, or layout, and MUST NOT depend on color alone or assign an arbitrary unique color to every event type.

#### Scenario: Appearance changes between light and dark
- **WHEN** the host appearance changes between supported light and dark modes
- **THEN** the same semantic roles remain distinguishable with readable text and visible controls without collapsing into a monochrome dashboard

### Requirement: Mobile-first responsive and accessible operation
Overview and Day SHALL remain readable and operable at a 390 × 844 mobile viewport and a normal desktop viewport without horizontal page overflow, clipped essential text, or dashboard-only desktop restructuring. Interactive controls SHALL support keyboard operation, visible focus, accessible names, and effective touch targets appropriate for one-handed use.

#### Scenario: Traveler scans on mobile
- **WHEN** Overview and Day are displayed at 390 × 844
- **THEN** trip identity, date, readiness or fixed-anchor state, itinerary content, and primary actions fit the reading flow without horizontal scrolling

#### Scenario: Traveler opens the same trip on desktop
- **WHEN** the same confirmed trip is displayed at a normal desktop viewport
- **THEN** the interface remains a wider travel document and does not become a KPI dashboard or hide content available on mobile

#### Scenario: Keyboard user operates Day controls
- **WHEN** a keyboard user moves through day navigation, optional disclosure, directions, and reservation actions
- **THEN** every control is reachable, clearly labeled, visibly focused, and operable without pointer input

### Requirement: Existing viewer integrity is preserved
The MVP visual change MUST preserve exact safe source links, checklist/reservation synchronization, canonical entity identity, static itinerary fallback, and graceful omission of unsupported sections. It MUST NOT add Today, NOW/NEXT, Map, Reservations hub, hosted publication, or new runtime intelligence to the MVP Skyline scope.

#### Scenario: Exact map link exists
- **WHEN** an event action has an exact safe source-provided Google Maps URL
- **THEN** the redesigned Directions control opens that unchanged URL with safe new-tab relationship attributes

#### Scenario: Runtime helper is unavailable
- **WHEN** optional runtime derivation fails
- **THEN** Overview and every Day remain readable through the redesigned static presentation
