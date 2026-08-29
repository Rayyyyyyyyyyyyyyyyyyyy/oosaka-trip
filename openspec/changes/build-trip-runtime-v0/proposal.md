## Why

The existing Osaka viewer proves that structured trip data can produce a useful mobile travel-day experience, but the repository still relies on one manually authored `tripData.js`. V0 must prove the missing product pipeline: a traveler can upload the itinerary file they already use, correct only uncertain or incorrect interpretations, and receive the same trusted viewer experience without Trip Runtime retaining the original file on its backend.

## What Changes

- Add a single-file upload flow for common itinerary formats: TXT, Markdown, CSV, DOCX, XLSX, readable PDF, JPG, JPEG, and PNG.
- Add format-aware validation and extraction that preserves useful source structure in a unified source document instead of flattening every input to plain text.
- Add conservative semantic parsing into an incomplete-capable parsed draft with source provenance, confidence, unresolved states, and deterministic validation findings.
- Add a focused review and correction flow that separates parse acceptance from the renderability gate and never requires the parser to invent missing dates, times, places, or reservation state.
- Add a personal bring-your-own-key setting, stored only in the current browser, so the static app can call OpenAI directly without a shared Trip Runtime credential or hosted parser.
- Generalize the existing Osaka viewer so confirmed canonical trip data drives the same Overview, Today, Day, Reservations, Date Rail, checklist, optional, flexible, all-day, directions, and trip-phase behavior for another traveler.
- Keep uploaded files, extracted blocks, and review evidence inside a transient ReviewSession; persist only confirmed canonical facts, user overrides, and checklist state in the user's browser.
- Add allowlist-based canonical JSON import/export that cannot carry raw source evidence, plus schema versioning, fixture support, graceful format/parser/runtime failure states, and regression acceptance against the real-world input corpus in `temp/Odata/`.
- Defer accounts, cross-device publishing, automatic recommendations or replanning, live weather/flight/transit APIs, expenses, packing, and multi-file trip merging.

## Capabilities

### New Capabilities

- `source-ingestion`: Validate and extract one common-format itinerary file into a structure-preserving, traceable unified source document with explicit failure behavior.
- `itinerary-parsing`: Produce a conservative parsed trip draft with provenance, confidence, unresolved semantics, stable post-parse identifiers, schema validation, and deterministic validation findings.
- `itinerary-review`: Let the traveler inspect source-backed interpretations, resolve render-blocking gaps, correct or remove parser output, add missed content, and confirm a renderable canonical trip without becoming a general planner.
- `trip-viewer`: Render confirmed canonical trip data through the existing mobile-first Overview, Today, Day, Reservations, Date Rail, checklist, optional, flexible, all-day, and safe runtime-fallback experience.
- `private-trip-persistence`: Enforce ephemeral backend processing, browser-local canonical persistence and clearing, privacy disclosure, and versioned canonical JSON import/export.

### Modified Capabilities

None. No main OpenSpec capabilities exist yet.

## Impact

- Refactors `src/tripData.js` from a hard-coded Osaka-specific module into fixture data conforming to a JavaScript runtime-validated canonical schema.
- Incrementally splits `src/main.jsx` into trip domain, viewer, import, review, parsing-service, and browser-storage ownership while retaining one MUI/Tailwind component system.
- Introduces format extraction and validation dependencies for document, spreadsheet, PDF, and image inputs, plus an explicit browser-only BYOK boundary modeled after the local AI Travel reference.
- Adds browser storage keys and migration behavior for canonical trips, overrides, and checklist state while preserving the existing `osaka-trip-todos` behavior during migration.
- Adds reducer-owned import workflow state, lazy format extractors, and automated fixtures and acceptance coverage derived from `temp/Odata/`, alongside production build, bundle, diff, accessibility, mobile/desktop browser, persistence, and console verification.
