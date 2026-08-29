## ADDED Requirements

### Requirement: No Trip Runtime backend source storage
Trip Runtime SHALL NOT operate a parsing backend and MUST NOT persist source bytes, extracted source documents, prompts containing itinerary content, model responses, or canonical trips in a database, object store, analytics event, or log.

#### Scenario: Parse request completes or fails
- **WHEN** a source is processed successfully, times out, or fails
- **THEN** the browser releases source and response data after the transient ReviewSession and no Trip Runtime server-side application record exists

### Requirement: Clear privacy disclosure
Before transmission, the application SHALL state that the file is sent directly from the browser to OpenAI for parsing, is not retained by Trip Runtime application storage, and is subject to the user's OpenAI account and data controls.

#### Scenario: Traveler starts real AI parsing
- **WHEN** the traveler is about to transmit an itinerary to OpenAI
- **THEN** the UI shows the applicable processing and retention disclosure before submission

### Requirement: Personal browser-local provider credential
The application SHALL require each traveler to supply their own OpenAI API key, SHALL store only AES-GCM ciphertext under the dedicated `trip-runtime-openai-api-key` browser key with a non-extractable wrapping key in IndexedDB, and MUST NOT ship a shared credential or include the personal key in trip data, exports, logs, analytics, URLs, or error messages.

#### Scenario: Traveler saves a personal key
- **WHEN** a traveler explicitly saves their OpenAI API key
- **THEN** the encrypted value is persisted in the current browser, masked in the UI, decrypted only for direct OpenAI bearer authentication, and both ciphertext and wrapping key can be removed through a dedicated clear action

#### Scenario: No personal key exists
- **WHEN** the traveler attempts AI parsing without a stored key
- **THEN** the application blocks transmission and directs them to enter their own key

### Requirement: Browser-local confirmed trip persistence
The application SHALL persist versioned CanonicalTrip data, user overrides, and checklist state in a repository-owned browser storage namespace so a confirmed trip survives reload on the same browser.

#### Scenario: Confirmed trip reload
- **WHEN** the traveler reloads the page after confirming a trip
- **THEN** the same canonical trip, overrides, and linked checklist state are restored without re-uploading the source

### Requirement: Source retention minimization
Original source files, the complete Unified Source Document, raw source excerpts, visual payloads, model responses, and transient ReviewSession evidence MUST NOT be retained with CanonicalTrip after confirmation. CanonicalTrip MAY retain stable source identifiers and locators that do not reproduce source content.

#### Scenario: Traveler confirms the trip
- **WHEN** CanonicalTrip data is saved locally
- **THEN** original binary content, complete extracted blocks, raw excerpts, visual payloads, and transient review evidence are discarded from application-managed storage

### Requirement: Explicit interrupted-review retention policy
The implementation SHALL define whether an interrupted ReviewSession is discarded on tab close or retained locally for a bounded period, and SHALL disclose that behavior before processing. ReviewSession content MUST NOT be sent to durable application backend storage under either policy.

#### Scenario: Traveler closes an unfinished review
- **WHEN** the traveler leaves before confirming the draft
- **THEN** the session is either discarded or restored only according to the documented local retention policy

### Requirement: Local clear operation
The traveler SHALL be able to remove all locally stored Trip Runtime trips, overrides, review remnants, checklist state, and migration metadata through an explicit clear action.

#### Scenario: Traveler clears local trip data
- **WHEN** the traveler confirms the local clear action
- **THEN** all repository-owned Trip Runtime storage keys and records are removed and the upload/empty state is shown

### Requirement: Versioned canonical JSON portability
The application SHALL create CanonicalExport through an explicit allowlist projection, export and import versioned canonical JSON, validate imported schema and semantics before persistence, and reject unsupported or invalid data without replacing a valid local trip. Export MUST exclude ReviewSession evidence, source excerpts, source binaries, provider details, model responses, and browser-only workflow state.

#### Scenario: Valid canonical JSON imported
- **WHEN** the traveler imports a supported, valid canonical JSON file
- **THEN** the trip is stored locally and rendered without invoking source extraction or semantic parsing

#### Scenario: Invalid canonical JSON imported
- **WHEN** the traveler imports invalid or unsupported-version JSON
- **THEN** the system reports the problem and preserves the existing local trip unchanged

#### Scenario: Canonical trip is exported
- **WHEN** the traveler exports a confirmed trip
- **THEN** the portable JSON contains only allowlisted canonical fields and no transient review or raw source content
