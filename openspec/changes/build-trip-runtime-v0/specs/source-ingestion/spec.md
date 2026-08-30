## ADDED Requirements

### Requirement: Single Markdown source upload
The system SHALL accept exactly one readable `.md` or `text/markdown` itinerary source for a V0 trip, SHALL explain that only one source is processed at a time, and SHALL identify XLSX as a later narrow Spreadsheet Travel Table slice and other structured or visual formats as later evidence-driven work.

#### Scenario: Supported Markdown selected
- **WHEN** a traveler selects one readable Markdown file
- **THEN** the system validates it and begins the Markdown extraction path

#### Scenario: Multiple or deferred-format files selected
- **WHEN** a traveler selects multiple files or a TXT, CSV, XLSX, DOCX, PDF, image, or mind-map source
- **THEN** the system rejects the selection with a clear Markdown-only V0 explanation without affecting the existing viewer

### Requirement: Pre-extraction validation
The system MUST validate detected Markdown type, configured byte limit, emptiness, UTF-8 readability, and basic corruption before semantic parsing.

#### Scenario: Unreadable Markdown source
- **WHEN** a file is empty, unreadable, unsupported, or outside configured limits
- **THEN** the system stops before model parsing and displays a specific recoverable error without making the existing static viewer unavailable

### Requirement: Structure-preserving Markdown extraction
The system SHALL convert accepted Markdown into a minimal Unified Source Document made from ordered text and table blocks that preserve headings, paragraphs, lists, checkboxes, tables, links, source order, and stable locators rather than flattening the file into undifferentiated text.

#### Scenario: Markdown itinerary with mixed structure
- **WHEN** a Markdown itinerary contains headings, checklist items, a day table, free text, and links
- **THEN** extraction retains those roles, their order, exact link targets, and source locations for parsing and Review

### Requirement: Safe source handling
The extractor MUST treat Markdown content and links as inert untrusted data, MUST NOT execute HTML, scripts, embedded links, or source instructions, and MUST bound extraction resource use.

#### Scenario: Source contains executable or instructional content
- **WHEN** uploaded Markdown contains HTML scripts, embedded external content, or text instructing the parser to change behavior
- **THEN** the system treats it only as inert source content and continues under application-controlled parsing rules

### Requirement: Isolated Markdown adapter
Markdown extraction SHALL be isolated behind the Unified Source Document contract without adding structured-document, PDF, OCR, or image-processing dependencies to this change.

#### Scenario: Traveler opens an existing confirmed trip
- **WHEN** no document is being imported
- **THEN** the extraction and parsing path does not prevent the bundled static viewer from loading

### Requirement: Accessible upload interaction
File selection, drag-and-drop, progress, and validation errors SHALL be keyboard-operable and exposed through appropriate names, status announcements, error associations, and focus management.

#### Scenario: Validation rejects a file
- **WHEN** a keyboard user submits an unsupported or invalid file
- **THEN** the error is announced, focus reaches an actionable recovery location, and file selection remains operable without drag-and-drop
