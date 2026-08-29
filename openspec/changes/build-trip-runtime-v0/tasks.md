## 1. Lock V0 Decisions and the Test Foundation

- [x] 1.1 Capture automated and browser baselines for the current Osaka Overview, Today, Day, Reservations, Date Rail, checklist persistence, mobile viewport, desktop viewport, production build, initial bundle, and console state.
- [x] 1.2 Select the initial structured-output multimodal model and delivery boundary; define encrypted browser BYOK storage, the direct provider endpoint, model/reasoning settings, risk disclosure, clear behavior, and the rule that no shared credential is shipped.
- [x] 1.3 Set V0 file-size, PDF-page, image-dimension, extraction-time, request-time, and retry limits plus a supported-versus-best-effort format matrix.
- [x] 1.4 Decide whether an interrupted ReviewSession is discarded on close or retained locally for a bounded period, and document the privacy disclosure and cleanup behavior.
- [x] 1.5 Select the smallest JavaScript runtime-schema and test stack needed for schemas, reducers, adapters, selectors, storage, components, and critical flows; add the test scripts without migrating the application to TypeScript.

## 2. Vertical Slice 1 — Osaka CanonicalTrip to Existing Viewer

- [ ] 2.1 Create versioned JavaScript runtime schemas and JSDoc types for CanonicalTrip, timing precision, entities, links, reservations/resources, transit relations, user overrides, and findings.
- [ ] 2.2 Explicitly reject presentation-only canonical fields including `n`, `dow`, `period`, formatted date labels, day count, `runtime: now`, `runtime: next`, `special`, and component styling state.
- [ ] 2.3 Extract only the demonstrated ownership boundaries into `src/domain/trip/` and `src/features/trip-viewer/`; compose existing MUI/Tailwind components before creating shared abstractions.
- [ ] 2.4 Implement selectors for header, Date Rail, overview sections, day timeline, reservations, checklist links, display labels, optional/all-day layout choices, and runtime candidates.
- [ ] 2.5 Convert the Osaka source data into the first CanonicalTrip fixture while preserving exact URLs, statuses, notes, transit connections, and optional/flexible semantics.
- [ ] 2.6 Generalize trip-timezone phase, Today date selection, minute refresh, countdown, completed state, and honest NOW/NEXT/leave-by derivation from canonical facts.
- [ ] 2.7 Generalize checklist/reservation linkage around stable `todoId` values and migrate `osaka-trip-todos` without losing checked state.
- [ ] 2.8 Verify that the canonical Osaka slice matches the visual and interaction baseline at mobile and desktop widths, survives reload, builds successfully, and has no console or accessibility regression.

## 3. Vertical Slice 2 — Canonical JSON to Persistence to Viewer

- [ ] 3.1 Implement one concrete `src/storage/tripStorage.js` module for versioned save/load/clear and migration; do not add a repository interface until a second storage implementation exists.
- [ ] 3.2 Define CanonicalExport as an explicit allowlist projection that excludes ReviewSession data, source excerpts, source binaries, model/provider data, workflow state, and browser-only metadata.
- [ ] 3.3 Implement canonical JSON export and runtime-validated import so invalid or unsupported data cannot replace a valid local trip.
- [ ] 3.4 Restore a valid active trip after reload, retain the bundled Osaka fixture as a safe fallback, and implement confirmed clearing of all repository-owned browser keys.
- [ ] 3.5 Add the import workflow shell with a local reducer for `idle` and `viewing` plus scoped recoverable errors, keeping viewer and checklist state at their closest shared owner.
- [ ] 3.6 Test schema boundaries, allowlist filtering, import failure preservation, storage migrations, reload, clear, and JSON-import-to-viewer at mobile and desktop widths.

## 4. Vertical Slice 3 — TXT/Markdown/CSV to Review to Viewer

- [ ] 4.1 Define JSDoc and runtime schemas for a transient ReviewSession, incomplete-capable ParsedTripDraft, validation findings, and a minimal UnifiedSourceDocument with discriminated `text`, `table`, and `visual` blocks, stable locators, links, and fixture-driven hints.
- [ ] 4.2 Build one accessible single-file upload/drag-and-drop UI using MUI behavior with keyboard selection, named controls, announced progress/errors, focus recovery, privacy summary, and an unchanged path to the existing viewer.
- [ ] 4.3 Validate detected type, configured size limits, emptiness, readability, and basic corruption before semantic parsing; treat all source content and links as inert untrusted data.
- [ ] 4.4 Implement lightweight TXT, Markdown, and CSV adapters that preserve source order, headings/lists where available, tables, links, and stable source locations.
- [ ] 4.5 Expand the local reducer to `idle -> validating -> extracting -> parsing -> reviewing -> confirming -> viewing`, with scoped retry/return states, request identity, cancellation, and stale-response rejection.
- [ ] 4.6 Implement the browser `parseTrip(request)` service with one direct OpenAI adapter, personal-key loading, bounded requests, timeouts, sanitized errors, `store: false`, runtime validation, and no request/source/model-response persistence or logging.
- [ ] 4.7 Centralize the parser instruction and structured-output schema with conservative parsing, untrusted-source boundaries, source evidence, non-itinerary classification, and no-hallucination rules.
- [ ] 4.8 Implement deterministic stable-ID assignment and normalization/validation for dates, timing precision, trip range, ordering, duplicates, conflicts, flights, accommodation, reservations, and renderability without rewriting source meaning.
- [ ] 4.9 Build the responsive Review summary and evidence-backed correction controls for dates/timezone, daily skeleton, flights, accommodation, reservations, entity type, place, notes, and optional/flexible/tentative semantics.
- [ ] 4.10 Implement add-missed/remove-false actions, user-override precedence, revalidation, blocker/warning announcements, associated field errors, predictable focus, and the renderability gate.
- [ ] 4.11 Confirm a reviewed draft into CanonicalTrip, discard source bytes, extracted blocks, excerpts, visual payloads, model responses, and transient confidence evidence, then open and persist the same generalized viewer.
- [ ] 4.12 Exercise TXT, Markdown, and CSV fixtures through upload, extraction, real OpenAI request, Review, correction, confirmation, viewer, reload, export, and clear without source or API-key leakage.

## 5. Vertical Slice 4 — XLSX to Review to Viewer

- [ ] 5.1 Add the XLSX dependency behind a dynamic format-adapter import so it is absent from the viewer's initial execution path.
- [ ] 5.2 Extract sheet identity, displayed cell values without formula execution, cell/range locators, merged ranges, blank/inherited structure, formatting hints, and hyperlinks required by row-timeline and calendar-grid fixtures.
- [ ] 5.3 Add XLSX validation and safe failure states for encrypted, corrupt, oversized, macro-bearing, or unsupported workbooks.
- [ ] 5.4 Prove row-timeline and calendar-grid XLSX fixtures retain evidence in ReviewSession, produce no source excerpts in CanonicalTrip/export, and complete Review-to-viewer at mobile and desktop widths.

## 6. Vertical Slice 5 — DOCX and PDF to Review to Viewer

- [ ] 6.1 Add DOCX and PDF dependencies behind dynamic format-adapter imports.
- [ ] 6.2 Extract DOCX headings, paragraphs, tables, links, order, and stable review locators without executing embedded content.
- [ ] 6.3 Extract readable PDF pages, positioned text, links, and grouping hints, and route scan/visual-heavy pages to the visual path instead of treating unreliable text as authoritative.
- [ ] 6.4 Prepare bounded visual-PDF payload references and explicit low-quality, encrypted, corrupt, oversized, and unsupported failure states.
- [ ] 6.5 Prove representative DOCX, readable day-plan PDF, visual PDF, and research-heavy PDF fixtures preserve itinerary intent, keep supporting research out of CanonicalTrip, and complete Review-to-viewer.

## 7. Vertical Slice 6 — Images and Visual Documents to Review to Viewer

- [ ] 7.1 Add JPG/JPEG/PNG validation and lazy image/visual-processing preparation with bounded dimensions, payloads, stable visual block locators, and no automatic external-link execution.
- [ ] 7.2 Preserve visual grouping evidence and expose low extraction quality or ambiguous dates/times as review findings rather than guessed canonical values.
- [ ] 7.3 Prove a detailed itinerary image, weekly calendar, and mind-map fixture complete the flow or reach an honest best-effort/failure state without false events.

## 8. Reliability, Privacy, Accessibility, and Measured Hardening

- [ ] 8.1 Add regression cases for empty declared flights, generated-weather exclusion, 19:06/18:00 ordering conflict, generic/specific meal duplication, guessed locations, midnight rollover, and conflicting overview/detail facts.
- [ ] 8.2 Test timeout, malformed structured output, provider failure, retry, cancellation, stale response, interrupted ReviewSession, storage quota/migration failure, and static itinerary fallback.
- [ ] 8.3 Verify upload, Review, confirmation, validation errors, navigation, checklist, and clear are keyboard-operable with announced states, associated errors, predictable focus, sufficient touch targets, and one responsive component tree.
- [ ] 8.4 Inspect production chunks to confirm heavy format adapters are lazy and the existing viewer baseline has not absorbed unnecessary parser/extractor code.
- [ ] 8.5 Add semantic chunking and merge/reconciliation only if measured supported fixtures exceed the one-request limits; otherwise retain the simpler single-request path.
- [ ] 8.6 Verify the static bundle contains no shared provider secret; verify the personal key exists only under its dedicated browser key and is absent from CanonicalTrip, CanonicalExport, analytics, URLs, logs, errors, source excerpts, extracted blocks, and model responses.

## 9. Corpus and Second-User Acceptance

- [ ] 9.1 Create sanitized expected-output fixtures for a row timeline, calendar grid, visual day-plan PDF, research-heavy PDF, detailed itinerary image, weekly calendar, mind map, and ultra-light text source from `temp/Odata/`.
- [ ] 9.2 Record schema validity, critical-field accuracy, semantic preservation, hallucination, false events, missing events, review rate, correction count, renderability, and time-to-viewer separately for each archetype.
- [ ] 9.3 Run the actual second-user source through upload, parse, Review, confirmation, reload, JSON export/import, checklist/reservation interaction, and clear without manually pre-cleaning the source.
- [ ] 9.4 Verify the second-user result uses the same Overview, Today, Day, Reservations, Date Rail, trip menu, and mobile interaction model as the Osaka Golden Result, with graceful omission of unsupported sections.

## 10. Production Verification and Handoff

- [ ] 10.1 Run the complete automated test suite, `npm run build`, and `git diff --check`, fixing all failures.
- [ ] 10.2 Verify upload, Review, Viewer, reload, import/export, clear, invalid-file, provider-failure, cancellation, stale-response, and static-fallback flows in the browser at mobile and desktop widths with no console errors.
- [ ] 10.3 Verify the production static app's direct OpenAI request path, BYOK save/clear behavior, no-key guard, limits, `store: false`, error sanitization, provider/risk disclosure, and documented local-key/source non-retention behavior before enabling production transmission.
- [ ] 10.4 Update repository documentation with supported formats, best-effort limitations, accessibility behavior, ReviewSession retention, local-only persistence, CanonicalExport privacy, BYOK setup/security trade-offs, and known V0 constraints.
