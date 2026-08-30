## Why

The existing Osaka viewer proves that structured trip data can produce a useful mobile travel-day experience, but the repository still relies on one manually authored `tripData.js`. V0 must prove the missing product pipeline: a traveler can upload the itinerary file they already use, correct only uncertain or incorrect interpretations, and receive the same trusted viewer experience without Trip Runtime retaining the original file on its backend.

## What Changes

- Add a single-file Markdown upload flow. Structured and visual formats remain evidence for the canonical model but are outside this change; post-Hosted V0.2 begins only with a narrow Spreadsheet Travel Table slice.
- Add Markdown-aware validation and extraction that preserves headings, lists, tables, checkboxes, links, source order, and stable locators instead of flattening input to plain text.
- Add conservative semantic parsing into an incomplete-capable parsed draft with source provenance, confidence, unresolved states, and deterministic validation findings.
- Add a focused review and correction flow that separates parse acceptance from the renderability gate and never requires the parser to invent missing dates, times, places, or reservation state.
- Add a personal bring-your-own-key setting, stored only in the current browser, so the static app can call OpenAI directly without a shared Trip Runtime credential or hosted parser.
- Generalize the existing Osaka viewer so confirmed canonical trip data drives the same Overview, Today, Day, Reservations, Date Rail, checklist, optional, flexible, all-day, directions, and before/during/after runtime-phase behavior for another traveler.
- Keep uploaded files, extracted blocks, and review evidence inside a transient ReviewSession; persist only confirmed canonical facts, user overrides, and checklist state in the user's browser.
- Add allowlist-based canonical JSON import/export that cannot carry raw source evidence, plus schema versioning, Markdown fixtures, graceful parser/runtime failure states, and regression acceptance against representative Markdown evidence.
- Defer Hosted Delivery to its gated independent change; defer TXT, CSV, XLSX, DOCX, PDF, image and mind-map extraction; accounts; cross-device ownership/editing; automatic recommendations or replanning; live weather/flight/transit APIs; expenses; packing; and multi-file trip merging from this change.
- Treat the 22-sample corpus as evolving evidence rather than declaring the V0 runtime schema a frozen cross-format canonical model. The research `Core / Preserve / Defer` layer describes cross-format product-modeling priority, not a commitment to implement every workbook-derived semantic in this Markdown-only change. A later V0.2 change is limited to narrow Spreadsheet Travel Table ingestion; formula/derived data, counterfactual options, source-day/cross-midnight relations, region/city phases, phase-scoped participants, resource economics, contextual operational instructions, explicit intra-source references, runtime-deferred decisions, reference freshness, and structured/visual formats beyond that slice remain later evidence-driven work unless a Markdown acceptance fixture demonstrates they are required for trustworthy V0 parsing.
- Make sanitized stranger-Markdown acceptance a hard prerequisite for any Hosted Delivery implementation while keeping `PublishedTripSnapshot`, `TripPublication`, hosted URLs, and hosting tasks outside this change.

## Capabilities

### New Capabilities

- `source-ingestion`: Validate and extract one Markdown itinerary file into a structure-preserving, traceable unified source document with explicit failure behavior.
- `itinerary-parsing`: Produce a conservative parsed trip draft with provenance, confidence, unresolved semantics, stable post-parse identifiers, schema validation, and deterministic validation findings.
- `itinerary-review`: Let the traveler inspect source-backed interpretations, resolve render-blocking gaps, correct or remove parser output, add missed content, and confirm a renderable canonical trip without becoming a general planner.
- `trip-viewer`: Render confirmed canonical trip data through the existing mobile-first Overview, Today, Day, Reservations, Date Rail, checklist, optional, flexible, all-day, and safe runtime-fallback experience.
- `private-trip-persistence`: Enforce ephemeral backend processing, browser-local canonical persistence and clearing, privacy disclosure, and versioned canonical JSON import/export.

### Modified Capabilities

None. No main OpenSpec capabilities exist yet.

## Impact

- Refactors `src/tripData.js` from a hard-coded Osaka-specific module into fixture data conforming to a JavaScript runtime-validated canonical schema.
- Incrementally splits `src/main.jsx` into trip domain, viewer, import, review, parsing-service, and browser-storage ownership while retaining one MUI/Tailwind component system.
- Introduces a lightweight Markdown extraction boundary plus an explicit browser-only BYOK boundary modeled after the local AI Travel reference. Heavy structured and visual extractors are not added in this change.
- Adds browser storage keys and migration behavior for canonical trips, overrides, and checklist state while preserving the existing `osaka-trip-todos` behavior during migration.
- Adds reducer-owned import workflow state and automated Markdown fixtures and acceptance coverage, alongside production build, bundle, diff, accessibility, mobile/desktop browser, persistence, and console verification.
- Produces the validated Confirmed CanonicalTrip prerequisite for the separate `hosted-trip-delivery-lite` change; it does not publish or host user trips.
