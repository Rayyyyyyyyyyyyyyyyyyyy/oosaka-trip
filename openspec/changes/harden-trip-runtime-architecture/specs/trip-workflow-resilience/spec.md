## ADDED Requirements

### Requirement: Single active-trip owner
The application root SHALL own the in-memory active confirmed trip and derive initial state from validated browser persistence. Home, Viewer, canonical import, Review confirmation, sample mode, and clear actions SHALL update that owner through explicit scoped actions rather than page reloads or duplicated synchronized trip state.

#### Scenario: Reviewed replacement is confirmed
- **WHEN** a reviewed candidate passes canonical validation and is persisted successfully
- **THEN** the application updates the root active trip and opens the new Viewer without reloading the page

#### Scenario: Osaka sample is opened and exited
- **WHEN** the traveler explicitly opens and later exits the bundled Osaka sample
- **THEN** sample mode changes root presentation state without persisting the sample as the active confirmed trip

### Requirement: Existing trip survives candidate failure
Starting a replacement workflow MUST leave the existing confirmed trip unchanged until a new candidate has been validated, confirmed, and persisted. Validation, extraction, parsing, Review, serialization, or storage failure SHALL return a recoverable path to the existing trip.

#### Scenario: Replacement confirmation cannot be persisted
- **WHEN** Review produces a valid candidate but browser persistence fails
- **THEN** the previous active trip remains visible and stored and the candidate is not treated as confirmed

### Requirement: Stable asynchronous request ownership
Import request identity, cancellation, retry, and AbortController ownership SHALL live at a component or hook boundary that remains mounted for the complete workflow rather than inside temporary Drawer content.

#### Scenario: Viewer menu closes during parsing
- **WHEN** the traveler closes the temporary menu while a replacement parse is running
- **THEN** request ownership and current workflow state remain intact and reopening the menu shows the same operation

#### Scenario: Traveler explicitly cancels after reopening the menu
- **WHEN** parsing is still active and the traveler uses the explicit cancel action
- **THEN** the owned request is aborted and a later response cannot reopen Review or replace the current trip

#### Scenario: Workflow owner unmounts
- **WHEN** the stable workflow owner leaves the application tree while a request is active
- **THEN** the request is aborted and no completion dispatch mutates abandoned state

### Requirement: Stale results cannot advance workflow state
An asynchronous validation, extraction, parsing, or confirmation result SHALL advance the import reducer only when its request identity and expected current state match the active workflow.

#### Scenario: Older parse finishes after a new file is selected
- **WHEN** a superseded provider request finishes after the active request has changed
- **THEN** the older result is ignored and cannot replace the active draft, error, or confirmed trip

### Requirement: Scoped clearing without reload
Trip clearing SHALL remove only repository-owned trip, override, checklist, and migration state, preserve separately managed provider credentials, update the root active-trip owner, and return to Home without reloading the page. Wider credential clearing requires the separately labeled action defined by V0.

#### Scenario: Traveler clears the confirmed trip
- **WHEN** the traveler confirms the trip-data clear action
- **THEN** trip-scoped data is removed, provider credentials remain, root active-trip state becomes empty, and Home renders immediately

### Requirement: Cohesive UI ownership
Viewer and workflow extraction SHALL follow existing feature boundaries: domain rules remain in `src/domain/trip`, persistence remains in `src/storage`, import lifecycle remains in the import feature, and MUI/Tailwind remain the only component and layout systems. The change MUST NOT introduce a global state library, generic repository interface, or parallel design system.

#### Scenario: Viewer responsibilities are extracted
- **WHEN** Today, Day, Reservations, menu, or runtime-navigation code moves out of `TripViewer`
- **THEN** each extracted unit has a concrete feature responsibility and continues consuming the existing canonical selectors and MUI/Tailwind primitives
