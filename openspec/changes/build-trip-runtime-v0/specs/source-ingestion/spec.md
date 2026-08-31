## ADDED Requirements

### Requirement: Home-first source entry
When no persisted confirmed CanonicalTrip exists, the system SHALL open a mobile-first Home page that contains OpenAI/Gemini provider and personal-key setup, one Markdown upload target, canonical JSON import, supported-format and privacy guidance, and a reserved optional-form area without requiring unapproved traveler fields. A persisted confirmed trip SHALL bypass Home and open the existing Viewer directly.

#### Scenario: New browser has no confirmed trip
- **WHEN** the application loads without a valid persisted confirmed CanonicalTrip
- **THEN** Home is shown and the bundled Osaka fixture is offered only through an explicit sample/fallback action rather than silently becoming active

#### Scenario: Browser already has a confirmed trip
- **WHEN** the application loads with a valid persisted confirmed CanonicalTrip
- **THEN** the Viewer opens directly without requiring a provider key or re-upload

#### Scenario: Traveler starts replacement import
- **WHEN** a traveler with a confirmed trip explicitly chooses to create or replace a trip
- **THEN** Home/import is shown while the current confirmed trip remains intact until a reviewed replacement is successfully confirmed

### Requirement: Single Markdown source upload
The system SHALL accept exactly one readable `.md` or `text/markdown` itinerary source for a V0 trip, SHALL explain that only one source is processed at a time, and SHALL identify XLSX as a later narrow Spreadsheet Travel Table slice and other structured or visual formats as later evidence-driven work.

#### Scenario: Supported Markdown selected
- **WHEN** a traveler selects one readable Markdown file
- **THEN** the system validates it and begins the Markdown extraction path

#### Scenario: Multiple or deferred-format files selected
- **WHEN** a traveler selects multiple files or a TXT, CSV, XLSX, DOCX, PDF, image, or mind-map source
- **THEN** the system rejects the selection with a clear Markdown-only V0 explanation without affecting the existing confirmed trip or explicit Osaka fallback

### Requirement: Pre-extraction validation
The system MUST validate detected Markdown type, configured byte limit, emptiness, UTF-8 readability, and basic corruption before semantic parsing.

#### Scenario: Unreadable Markdown source
- **WHEN** a file is empty, unreadable, unsupported, or outside configured limits
- **THEN** the system stops before model parsing and displays a specific recoverable error without replacing or making the existing confirmed trip unavailable

### Requirement: Structure-preserving Markdown extraction
The system SHALL convert accepted Markdown into a minimal Unified Source Document made from ordered text and table blocks that preserve headings, paragraphs, lists, checkboxes, tables, links, emphasis hints, relative image/asset references, source order, raw syntax where semantic interpretation may differ from Markdown structure, and stable locators rather than flattening the file into undifferentiated text.

#### Scenario: Markdown itinerary with mixed structure
- **WHEN** a Markdown itinerary contains headings, checklist items, a day table, free text, and links
- **THEN** extraction retains those roles, their order, exact link targets, and source locations for parsing and Review

#### Scenario: Relative image asset is unavailable
- **WHEN** an accepted Markdown file references `image.png` or another relative asset that was not uploaded
- **THEN** extraction preserves the asset path, source locator, and unavailable state and continues extracting the surrounding itinerary

### Requirement: Markdown syntax remains structural evidence
The extractor SHALL preserve enough raw representation and source order for semantic parsing to reinterpret Markdown syntax when the travel meaning differs from the Markdown AST. It MUST NOT irreversibly treat blockquote depth, one paragraph, or one list item as exactly one semantic itinerary unit.

#### Scenario: Route sequence resembles blockquote syntax
- **WHEN** the source contains `A > B > C` or a `>>>` transit instruction
- **THEN** extraction preserves the raw sequence and locator so semantic parsing can interpret route order or contextual instructions rather than assuming blockquote meaning

### Requirement: Safe source handling
The extractor MUST treat Markdown content and links as inert untrusted data, MUST NOT execute HTML, scripts, embedded links, or source instructions, and MUST bound extraction resource use.

#### Scenario: Source contains executable or instructional content
- **WHEN** uploaded Markdown contains HTML scripts, embedded external content, or text instructing the parser to change behavior
- **THEN** the system treats it only as inert source content and continues under application-controlled parsing rules

### Requirement: Isolated Markdown adapter
Markdown extraction SHALL be isolated behind the Unified Source Document contract without adding structured-document, PDF, OCR, or image-processing dependencies to this change.

#### Scenario: Traveler opens an existing confirmed trip
- **WHEN** no document is being imported
- **THEN** the extraction and parsing path does not prevent the persisted confirmed trip or explicit bundled fallback from loading

### Requirement: Accessible upload interaction
File selection, drag-and-drop, progress, and validation errors SHALL be keyboard-operable and exposed through appropriate names, status announcements, error associations, and focus management.

#### Scenario: Validation rejects a file
- **WHEN** a keyboard user submits an unsupported or invalid file
- **THEN** the error is announced, focus reaches an actionable recovery location, and file selection remains operable without drag-and-drop
