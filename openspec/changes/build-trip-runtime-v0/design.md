## Context

The repository is a React 19/Vite 7 JavaScript application whose Osaka-specific `tripData.js` drives a proven mobile-first result viewer. The V0 gap is the trustworthy conversion of a second traveler's existing Markdown itinerary into data that can drive that same viewer. The 22-sample research corpus informs a conservative Markdown V0 model; sample count is not participant count, and the corresponding source files live under `temp/Odata/`. After gated Hosted Delivery, V0.2 is limited to narrow Spreadsheet Travel Table ingestion; advanced spreadsheet, structured/visual extraction, and still-evolving cross-format canonical relationships remain later evidence-driven concerns.

The current implementation is concentrated in `src/main.jsx`, and `src/tripData.js` mixes trip facts with Osaka-specific presentation fields. V0 therefore needs an incremental boundary extraction, not a second UI, a framework rewrite, or a speculative generic platform. This personal deployment follows the local AI Travel reference: each traveler supplies their own OpenAI API key, the static app encrypts it for that browser, stores the ciphertext in `localStorage` and a non-extractable wrapping key in IndexedDB, and the browser calls OpenAI directly. No shared project credential or parser backend is deployed.

## Goals / Non-Goals

**Goals:**

- Support one Markdown source per trip.
- Convert Markdown into a small, traceable source representation before semantic parsing.
- Preserve uncertainty, flexibility, alternatives, exact source links, and non-itinerary content without inventing precision.
- Separate transient review evidence, incomplete parser output, confirmed trip facts, and presentation-only state.
- Reuse and generalize the existing Osaka viewer without a parallel component system.
- Keep original bytes, extracted blocks, and review excerpts out of durable backend and confirmed-trip storage.
- Keep confirmed trip facts, traveler overrides, and checklist state usable after reload in the same browser.
- Deliver in vertical slices so every milestone produces a runnable end-to-end result.

**Non-Goals:**

- Multiple source files, account sync, hosted trip URLs, collaboration, or cross-device access.
- AI planning, recommendations, optimization, automatic replanning, booking, expenses, packing, or social features.
- Live weather, flight, transit, location, or opening-status APIs.
- Guaranteed understanding of every scan, mind map, encrypted file, macro workbook, or visually complex document.
- TXT, CSV, XLSX, DOCX, PDF, screenshot, image, and mind-map extraction.
- A TypeScript migration, global state library, workflow framework, provider registry, repository layer, or universal document AST.

## Decisions

### 1. Extract feature ownership incrementally

The existing app SHALL be separated only where the V0 workflow creates a real responsibility boundary:

```text
src/domain/trip/                  schemas, validators, selectors, runtime derivation
src/features/trip-viewer/        existing Overview, Today, Day, Reservations UI
src/features/trip-import/        upload UI, import reducer, format adapters
src/features/trip-review/        evidence-backed corrections and review reducer
src/services/parseTrip.js        browser-facing parse service
src/storage/tripStorage.js       versioned local persistence and migration
```

The exact filenames may evolve, but ownership SHALL follow these boundaries. Reusable MUI-based components are composed before new abstractions are introduced. No `shared/` dumping ground, repository interface, factory, manager, provider registry, or global store is added until a second concrete use case justifies it.

Alternative considered: redesign the application around a comprehensive platform architecture first. Rejected because it delays the second-user path and creates abstractions without evidence.

### 2. Use a minimal Markdown-backed UnifiedSourceDocument

The Markdown adapter SHALL return a provider-neutral `UnifiedSourceDocument` made from a small discriminated set of ordered `text` and `table` blocks. A block carries its content or structured cells, a stable locator, source links, and only the structural hints demonstrated necessary by Markdown fixtures.

V0 does not add DOCX, XLSX, PDF, OCR, or image-processing dependencies. The contract may expand in later input changes from corpus evidence, beginning with a narrow Spreadsheet Travel Table slice; this change does not pre-model every possible document structure.

Samples #19 and #20 add evidence for formulas versus calculated values, counterfactual comparisons, multi-day resource economics, region/city phases, phase-scoped participants, source-day versus calendar-date grouping, `24:00` source notation, meal-block candidate layers, weak emoji markup, and event-level costs. Samples #21 and #22 add contextual operational instructions, digital workflows, explicit intra-workbook references, option-specific downstream actions, runtime-deferred decisions, reference freshness, and time-sensitive supporting knowledge.

The research `Core / Preserve / Defer` layer is a cross-format product-modeling decision aid. It does not automatically enlarge this Markdown-only implementation whenever an XLSX workbook reveals a new semantic. V0 classifies supporting content, preserves its source trace during Review, and avoids turning it into itinerary events. It does not add a generic knowledge-base UI, procedure state machine, or freshness verifier; standalone runtime-instruction persistence remains a later evidence-driven design decision unless a Markdown acceptance fixture proves it is necessary for the stranger gate. The V0 runtime schema is therefore not a frozen cross-format canonical model.

Alternative considered: convert Markdown to plain text. Rejected because it loses headings, tables, checkboxes, links, and source order that provide useful parsing evidence.

### 3. Keep ReviewSession, CanonicalTrip, and CanonicalExport distinct

The data lifecycle has three explicit privacy and responsibility boundaries:

```text
source bytes -> ReviewSession -> CanonicalTrip -> CanonicalExport
                  transient        durable local     portable filtered
```

- `ReviewSession` owns source metadata, `UnifiedSourceDocument`, optional visual payload references, `ParsedTripDraft`, validation findings, and human-readable source evidence. It is ephemeral unless the task-1 retention decision explicitly allows short-lived local recovery.
- `CanonicalTrip` owns only confirmed travel facts, traveler overrides, stable entity IDs, and stable provenance identifiers/locators. It MUST NOT contain source bytes, full extracted blocks, raw excerpts, model responses, or transient confidence/evidence objects.
- `CanonicalExport` is created by an explicit allowlist projection from `CanonicalTrip`. It excludes source evidence, provider details, transient review state, and browser-only metadata.

Non-itinerary research, recommendation, background, runtime-instruction, operational-procedure, reference-freshness, and other supporting blocks remain in `ReviewSession` or draft classification. They retain source trace and MUST be surfaced rather than silently converted into events, but they do not enlarge `CanonicalTrip` merely because the parser saw them. If a Markdown acceptance fixture shows that dropping a supporting block would omit critical travel intent, the change must resolve that gap explicitly before passing the stranger gate rather than silently treating the block as non-critical.

### 4. Separate canonical facts from presentation derivation

Canonical data SHALL represent domain facts such as exact or imprecise timing, date, source wording, optionality, links, reservations, and transit relationships. Viewer-specific fields are derived through selectors.

`CanonicalTrip` MUST NOT store Osaka-era presentation fields such as `n`, `dow`, `period`, formatted month/day labels, day counts, `runtime: now`, `runtime: next`, `special`, or MUI/Tailwind state. `all_day` remains a valid domain timing kind; an all-day visual treatment is derived. Runtime phase, Today selection, NOW/NEXT, display labels, grouped sections, and empty-state choices are recomputed from canonical facts and the confirmed trip timezone.

### 5. Own the import workflow with a local reducer

The import feature SHALL own one explicit reducer-driven state machine:

```text
idle -> validating -> extracting -> parsing -> reviewing -> confirming -> viewing
```

Recoverable error states retain a safe return or retry path. The reducer also handles cancellation and ignores stale async results by request/session identity. Review form state stays in the review feature, and viewer/checklist state stays at the closest shared owner. Derived data is computed rather than synchronized into duplicate state.

Alternative considered: introduce XState or a global state store. Rejected because one local reducer and feature context cover the V0 workflow with less coupling.

### 6. Use one browser parse service and personal BYOK

The browser calls `parseTrip(request)` through `src/services/parseTrip.js`. The traveler supplies a personal OpenAI API key through an explicit settings input. AES-GCM ciphertext is stored under one repository-owned `localStorage` key and its non-extractable wrapping key is stored in IndexedDB. The value is decrypted only at request time, sent only as bearer authentication to `https://api.openai.com/v1/responses`, and excluded from exports, application logs, analytics, error messages, and trip domain state.

The first implementation uses `gpt-5.6-sol` with reasoning effort `high` and one OpenAI adapter. No factory, registry, or plugin system is introduced until another provider is actually implemented. The UI states that browser storage is not a secure secret vault, links to key creation, recommends a restricted project key with a spend limit, and provides a dedicated clear-key action.

Uploaded content is always untrusted data, never parser instructions. Request bodies, source bytes, prompts containing itinerary content, and model responses are not written to application storage, analytics, or logs. `store: false` is sent on every Responses request.

### 7. Stay in JavaScript with runtime schemas and JSDoc

The app remains JavaScript. Versioned runtime schemas validate `UnifiedSourceDocument`, `ParsedTripDraft`, findings, overrides, `CanonicalTrip`, and `CanonicalExport` at every external or persistence boundary. JSDoc types provide editor assistance and document discriminated unions. A TypeScript migration is outside V0.

Stable IDs are assigned by deterministic application code after parsing; model-provided IDs are not trusted.

### 8. Gate confirmation through focused review

Review shows trip dates/timezone, daily skeleton, flights, accommodation, reservations, optional/flexible semantics, conflicts, and low-confidence fields with evidence from `ReviewSession`. The traveler can correct supported fields, add missed entities, remove false entities, and confirm interpretations. Every correction is a user override and wins over later parsing.

Only render-blocking gaps prevent confirmation, such as unresolved trip dates, timezone, or invalid day structure. Warnings and intentionally flexible times do not. Accessibility is part of the flow: keyboard-operable file selection/drop zone, announced progress and errors, focus movement after state changes, associated field errors, and one responsive component tree using MUI behavior.

### 9. Generalize the current viewer through selectors

The Osaka itinerary becomes the first canonical fixture. Existing components are moved and adapted incrementally to consume canonical selectors while preserving Overview, Today, Day, Reservations, Date Rail, before/during/after phase, minute refresh, checklist-reservation linkage, exact source links, optional/flexible/all-day layouts, transit connectors, and safe NOW/NEXT behavior.

Sections remain conditional. A trip without flights or accommodation is valid. Runtime or optional-service failure never hides the confirmed static itinerary. MUI remains the interactive/accessibility primitive layer and Tailwind remains the layout/token layer; V0 does not create a competing component system.

### 10. Persist through one concrete storage module

`tripStorage.js` owns the repository's versioned browser keys, migration, save/load/clear, and import/export calls. It is a concrete module, not a repository abstraction. The current `osaka-trip-todos` checklist state is migrated without losing checked items.

Original files and `ReviewSession` evidence are discarded at confirmation according to the resolved interruption policy. Export is always generated through the `CanonicalExport` allowlist, never by serializing in-memory state wholesale.

### 11. Deliver and test by vertical slice

Implementation proceeds in independently runnable slices:

1. Osaka `CanonicalTrip` -> generalized existing viewer.
2. Canonical JSON import/export -> persistence -> same viewer.
3. Markdown -> extraction -> browser OpenAI request -> Review -> same viewer.

Tests are added at stable boundaries: runtime schemas and validators, the Markdown adapter, selectors/runtime derivation, reducer transitions, storage/import-export, and user-critical flows. Markdown fixtures measure critical-field accuracy, false/missing events, hallucination, correction count, renderability, and time to viewer. Chunking or new abstractions are added only after measurements show the simple path is insufficient.

### 12. Gate Hosted Delivery on stranger-Markdown trust

This change ends at a locally confirmed and renderable CanonicalTrip. It MUST NOT add PublishedTripSnapshot, TripPublication, hosted URL, recovery-secret, expiry, account, or hosting implementation. Those belong to the separate `hosted-trip-delivery-lite` change and may be designed or spiked without blocking this change.

Before Hosted Delivery implementation begins, an unfamiliar Markdown itinerary MUST pass an annotated acceptance gate: the original pre-Review draft has zero missing critical events, zero invented critical events, zero unsupported exact critical dates/times/places, every fixture-annotated ambiguity is surfaced for Review, canonical validation passes after correction, and the result renders through the same viewer.

Sanitized benchmark artifacts preserve four distinct layers for evaluation:

```text
ParsedTripDraft
Validation / Review findings
User corrections
Confirmed CanonicalTrip
```

Parser Quality compares the original draft with semantic fixture assertions; Recovery Quality compares the confirmed trip with the same assertions. Production ReviewSession data remains memory-only and is never retained as benchmark material.

## Risks / Trade-offs

- **[The canonical model becomes a copy of the UI or source AST]** -> Enforce schema exclusions and derive presentation through selectors.
- **[Async results overwrite newer work]** -> Use session/request identity, cancellation, and reducer transition tests.
- **[Model output is valid JSON but semantically wrong]** -> Run deterministic validation, require source-backed review, and weight critical-field fixtures.
- **[Private content leaks through persistence or export]** -> Separate ReviewSession from CanonicalTrip and use an allowlisted CanonicalExport projection.
- **[Browser-local API keys can be exposed by XSS, malicious extensions, or a compromised origin]** -> Make BYOK risk explicit, never ship a shared key, keep the app dependency surface small, use a dedicated storage key and clear action, and recommend restricted project keys with spend limits.

## Migration Plan

1. Capture the current Osaka UI/runtime/checklist baseline and add the minimal JavaScript schema/test foundation.
2. Move domain validation, selectors, runtime derivation, and viewer components behind feature boundaries while running the Osaka fixture through `CanonicalTrip`.
3. Add the concrete browser storage module plus filtered canonical JSON import/export.
4. Add the reducer-owned import/review shell and complete the text-format vertical slice.
5. Enable real model transmission only after explicit BYOK disclosure, local-key controls, request limits, `store: false`, error sanitization, and no-log/no-export checks are verified.
6. Run second-user Markdown, accessibility, mobile/desktop, reload/clear, production build, bundle, and console acceptance.

Rollback keeps the canonical Osaka fixture and old checklist key readable. Upload/parse entry points can be disabled without removing the static viewer.

## Resolved Decisions

- The first parser uses `gpt-5.6-sol` with reasoning effort `high` and direct browser BYOK; no parser host is in V0.
- Markdown source, extraction, request, timeout, and retry limits are defined in `implementation-decisions.md`.
- `ReviewSession` is memory-only and is discarded on reload, navigation away, or tab close.
- Stranger-Markdown acceptance is the hard prerequisite for Hosted Delivery; Hosted implementation remains a separate change.
- Parser Quality and Review Recovery Quality are measured separately from sanitized benchmark artifacts, while production review evidence retains the memory-only policy.
