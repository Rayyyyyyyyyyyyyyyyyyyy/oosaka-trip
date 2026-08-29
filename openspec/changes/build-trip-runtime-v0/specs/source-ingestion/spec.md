## ADDED Requirements

### Requirement: Single common-format source upload
The system SHALL accept exactly one TXT, Markdown, CSV, DOCX, XLSX, PDF, JPG, JPEG, or PNG itinerary source for a V0 trip and SHALL explain that only one source is processed at a time.

#### Scenario: Supported file selected
- **WHEN** a traveler selects one readable file with a supported type
- **THEN** the system validates it and begins the matching extraction path

#### Scenario: Multiple files selected
- **WHEN** a traveler attempts to provide more than one source for a trip
- **THEN** the system rejects the selection with a clear single-file V0 explanation

### Requirement: Pre-extraction validation
The system MUST validate detected type, configured size and page limits, emptiness, readability, encryption, and basic corruption before semantic parsing.

#### Scenario: Unreadable or encrypted source
- **WHEN** a file is corrupt, empty, encrypted, unsupported, or outside configured limits
- **THEN** the system stops before model parsing and displays a specific recoverable error without making the existing static viewer unavailable

### Requirement: Structure-preserving extraction
The system SHALL convert accepted input into a minimal Unified Source Document made from discriminated text, table, or visual blocks that preserve source order, stable locators, source links, and only the structural signals required by supported fixtures rather than flattening every format into undifferentiated text.

#### Scenario: Spreadsheet row timeline
- **WHEN** an XLSX contains sheets, rows, columns, merged cells, formatting hints, or hyperlinks
- **THEN** the extracted document retains those signals and source locations for later structural classification

#### Scenario: Visual itinerary
- **WHEN** a PDF or image contains positioned text, tables, branches, or visual groups
- **THEN** the extracted document retains page or image coordinates and grouping evidence for semantic parsing and review

### Requirement: Extraction quality and failure state
The system SHALL report extraction quality and SHALL NOT silently treat low-quality OCR or failed structural reconstruction as reliable source text.

#### Scenario: Low-confidence scan
- **WHEN** OCR or visual reconstruction cannot reliably distinguish dates, times, or groups
- **THEN** the system marks affected blocks for review or stops with a quality warning instead of inventing canonical values

### Requirement: Safe source handling
The extractor MUST treat file content as untrusted data, MUST NOT execute workbook macros, formulas, scripts, embedded links, or document instructions, and MUST bound extraction resource use.

#### Scenario: Source contains executable or instructional content
- **WHEN** an uploaded source contains macros, external formulas, scripts, or text instructing the parser to change behavior
- **THEN** the system treats it only as inert source content and continues under application-controlled parsing rules

### Requirement: Isolated and lazy format adapters
Each format extractor SHALL be isolated behind the Unified Source Document contract, and heavy DOCX, XLSX, PDF, OCR, or image dependencies SHALL load only when the selected source requires them.

#### Scenario: Traveler opens an existing confirmed trip
- **WHEN** no document is being imported
- **THEN** heavy format extraction code is not required in the initial viewer bundle

### Requirement: Accessible upload interaction
File selection, drag-and-drop, progress, and validation errors SHALL be keyboard-operable and exposed through appropriate names, status announcements, error associations, and focus management.

#### Scenario: Validation rejects a file
- **WHEN** a keyboard user submits an unsupported or invalid file
- **THEN** the error is announced, focus reaches an actionable recovery location, and file selection remains operable without drag-and-drop
