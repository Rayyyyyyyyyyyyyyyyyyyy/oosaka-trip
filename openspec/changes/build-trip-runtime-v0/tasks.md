## 1. Lock V0 Decisions and the Test Foundation

- [x] 1.1 Capture automated and browser baselines for the current Osaka Overview, Today, Day, Reservations, Date Rail, checklist persistence, mobile viewport, desktop viewport, production build, initial bundle, and console state.
- [x] 1.2 Revise the completed single-OpenAI decision for the now-approved OpenAI and Gemini browser-BYOK boundary: update proposal, design, and affected specs; select one reproducible structured-output model per provider; define provider-specific endpoints/authentication, encrypted storage, disclosure, clear behavior, and the rule that no shared credential is shipped.
- [x] 1.3 Set V0 Markdown file-size, extraction-time, request-time, and retry limits; record XLSX as a post-Hosted narrow Spreadsheet Travel Table slice and all advanced structured/visual formats as later evidence-driven research inputs.
- [x] 1.4 Decide whether an interrupted ReviewSession is discarded on close or retained locally for a bounded period, and document the privacy disclosure and cleanup behavior.
- [x] 1.5 Select the smallest JavaScript runtime-schema and test stack needed for schemas, reducers, adapters, selectors, storage, components, and critical flows; add the test scripts without migrating the application to TypeScript.

## 2. Vertical Slice 1 — Osaka CanonicalTrip to Existing Viewer

- [x] 2.1 Create versioned JavaScript runtime schemas and JSDoc types for CanonicalTrip, timing precision, entities, links, reservations/resources, transit relations, user overrides, and findings.
- [x] 2.2 Explicitly reject presentation-only canonical fields including `n`, `dow`, `period`, formatted date labels, day count, `runtime: now`, `runtime: next`, `special`, and component styling state.
- [x] 2.3 Extract only the demonstrated ownership boundaries into `src/domain/trip/` and `src/features/trip-viewer/`; compose existing MUI/Tailwind components before creating shared abstractions.
- [x] 2.4 Implement selectors for header, Date Rail, overview sections, day timeline, reservations, checklist links, display labels, optional/all-day layout choices, and runtime candidates.
- [x] 2.5 Convert the Osaka source data into the first CanonicalTrip fixture while preserving exact URLs, statuses, notes, transit connections, and optional/flexible semantics.
- [x] 2.6 Generalize trip-timezone phase, Today date selection, minute refresh, countdown, completed state, and honest NOW/NEXT/leave-by derivation from canonical facts.
- [x] 2.7 Generalize checklist/reservation linkage around stable `todoId` values and migrate `osaka-trip-todos` without losing checked state.
- [x] 2.8 Verify that the canonical Osaka slice matches the visual and interaction baseline at mobile and desktop widths, survives reload, builds successfully, and has no console or accessibility regression.

## 3. Vertical Slice 2 — Canonical JSON to Persistence to Viewer

- [x] 3.1 Implement one concrete `src/storage/tripStorage.js` module for versioned save/load/clear and migration; do not add a repository interface until a second storage implementation exists.
- [x] 3.2 Define CanonicalExport as an explicit allowlist projection that excludes ReviewSession data, source excerpts, source binaries, model/provider data, workflow state, and browser-only metadata.
- [x] 3.3 Implement canonical JSON export and runtime-validated import so invalid or unsupported data cannot replace a valid local trip.
- [ ] 3.4 Distinguish a persisted confirmed active trip from the bundled Osaka fallback: restore a valid active trip after reload, bypass Home only for that trip, expose Osaka through an explicit fallback/sample action, and make confirmed clearing of repository-owned trip data return to Home without losing separately managed provider keys unless the traveler explicitly clears them.
- [x] 3.5 Add the import workflow shell with a local reducer for `idle` and `viewing` plus scoped recoverable errors, keeping viewer and checklist state at their closest shared owner.
- [x] 3.6 Test schema boundaries, allowlist filtering, import failure preservation, storage migrations, reload, clear, and JSON-import-to-viewer at mobile and desktop widths.

## 4. Vertical Slice 3 — Markdown to Review to Viewer

- [x] 4.1 Define JSDoc and runtime schemas for a transient ReviewSession, incomplete-capable ParsedTripDraft, validation findings, and a minimal Markdown-backed UnifiedSourceDocument with ordered `text` and `table` blocks, stable locators, links, and fixture-driven hints.
- [ ] 4.2 Move the accessible single-file upload/drag-and-drop entry to a mobile-first Home page that also contains provider/key setup, Canonical JSON import, upload-format guidance, privacy/provider disclosures, and a reserved optional-form area without inventing required traveler fields; retain keyboard selection, named controls, announced progress/errors, and focus recovery.
- [x] 4.3 Validate detected type, configured size limits, emptiness, readability, and basic corruption before semantic parsing; treat all source content and links as inert untrusted data.
- [x] 4.4 Implement a lightweight Markdown adapter that preserves source order, headings, paragraphs, lists, checkboxes, tables, links, and stable source locations.
- [x] 4.5 Expand the local reducer to `idle -> validating -> extracting -> parsing -> reviewing -> confirming -> viewing`, with scoped retry/return states, request identity, cancellation, and stale-response rejection.
- [ ] 4.6 Implement the provider-neutral browser `parseTrip(request)` service with two concrete adapters and a small explicit OpenAI/Gemini dispatch boundary; load only the selected provider's personal key, apply bounded requests, timeouts, sanitized errors, runtime validation, and no request/source/model-response persistence or logging; use OpenAI `store: false` and send Gemini authentication in the `x-goog-api-key` header rather than a URL query parameter.
- [ ] 4.7 Centralize the parser instruction and structured-output schema with conservative parsing, untrusted-source boundaries, source evidence, no-hallucination rules, and distinct classification of research, recommendation, reference, background, runtime instruction, operational procedure, runtime-deferred decision, reference freshness, and explicit intra-source reference without eventizing them.
- [ ] 4.8 Implement deterministic stable-ID assignment and normalization/validation for dates, timing precision, trip range, ordering, duplicates, conflicts, flights, accommodation, reservations, and renderability without rewriting source meaning.
- [ ] 4.9 Build the responsive Review summary and evidence-backed correction controls for dates/timezone, daily skeleton, flights, accommodation, reservations, entity type, place, notes, and optional/flexible/tentative semantics.
- [ ] 4.10 Implement add-missed/remove-false actions, user-override precedence, revalidation, blocker/warning announcements, associated field errors, predictable focus, and the renderability gate.
- [ ] 4.11 Confirm a reviewed draft into CanonicalTrip, discard source bytes, extracted blocks, excerpts, visual payloads, model responses, and transient confidence evidence, then open and persist the same generalized viewer.
- [ ] 4.12 Exercise representative Markdown fixtures through Home, upload, extraction, a real request through each OpenAI and Gemini adapter, Review, correction, confirmation, viewer, reload, export, and clear without source or API-key leakage.
- [ ] 4.13 Implement Home/Viewer routing from persisted domain state: no confirmed trip opens Home; a confirmed trip opens the existing itinerary; “create/replace trip” reopens Home while preserving the current trip; cancellation or failure returns to that trip; only successful confirmation atomically replaces it.
- [ ] 4.14 Generalize the OpenAI-only key UI and storage into provider-scoped controls for OpenAI and Gemini, preserving any existing encrypted OpenAI key, keeping provider keys isolated, persisting the last selected provider separately from trip data, linking to each provider's official key setup, and supporting masked status plus per-provider clear actions.
- [ ] 4.15 Keep provider transport outside the canonical domain: share one conservative parser instruction and ParsedTripDraft contract, translate provider-specific request/response shapes only in their adapters, normalize provider failures/usage metadata for transient UI use, and exclude provider/model selection from CanonicalTrip and CanonicalExport.

## 5. Reliability, Privacy, Accessibility, and Measured Hardening

- [ ] 5.1 Add regression cases for empty declared flights, generated-weather exclusion, 19:06/18:00 ordering conflict, generic/specific meal duplication, guessed locations, midnight rollover, and conflicting overview/detail facts.
- [ ] 5.2 Test timeout, malformed structured output, provider-specific response mismatch, OpenAI and Gemini failure, retry, cancellation, stale response, interrupted ReviewSession, storage quota/migration failure, preserved-current-trip behavior, and explicit Osaka fallback.
- [ ] 5.3 Verify upload, Review, confirmation, validation errors, navigation, checklist, and clear are keyboard-operable with announced states, associated errors, predictable focus, sufficient touch targets, and one responsive component tree.
- [ ] 5.4 Inspect production chunks to confirm the existing viewer baseline has not absorbed unnecessary parser code.
- [ ] 5.5 Add semantic chunking and merge/reconciliation only if measured Markdown fixtures exceed the one-request limits; otherwise retain the simpler single-request path.
- [ ] 5.6 Verify the static bundle contains no shared provider secret; verify each personal key exists only under its provider-scoped encrypted browser record, never crosses providers, never appears in a URL, and is absent from CanonicalTrip, CanonicalExport, analytics, logs, errors, source excerpts, extracted blocks, and model responses.

## 6. Markdown and Second-User Acceptance

- [ ] 6.1 Create sanitized annotated semantic fixtures for the Golden Markdown and at least one unfamiliar Markdown itinerary without manually normalizing their structure; annotate both critical itinerary events and any travel-critical supporting content, and preserve separate benchmark artifacts for the original ParsedTripDraft, findings, user corrections, and Confirmed CanonicalTrip without retaining any production ReviewSession.
- [ ] 6.2 Measure Parser Quality and Review Recovery Quality separately; require zero missing critical events, zero invented critical events, zero unsupported exact critical dates/times/places, no fixture-annotated travel-critical supporting content silently ignored, all fixture-annotated ambiguity surfaced for Review, schema-valid confirmed output, and renderability, while recording non-critical correction count, review time, token cost, and time-to-viewer as baselines rather than arbitrary pass thresholds.
- [ ] 6.3 Run the actual second-user Markdown through upload, parse, Review, confirmation, reload, JSON export/import, checklist/reservation interaction, and clear without manually pre-cleaning the source.
- [ ] 6.4 Verify the second-user result uses the same Overview, Today, Day, Reservations, Date Rail, trip menu, and mobile interaction model as the Osaka Golden Result, with graceful omission of unsupported sections.

## 7. Production Verification and Handoff

- [ ] 7.1 Run the complete automated test suite, `npm run build`, and `git diff --check`, fixing all failures.
- [ ] 7.2 Verify Home-first empty state, confirmed-trip Viewer bypass, create/replace preservation, upload, Review, confirmation, reload, import/export, clear, invalid-file, both provider failures, cancellation, stale response, and explicit static-fallback flows in the browser at mobile and desktop widths with no console errors.
- [ ] 7.3 Verify the production static app's direct OpenAI and Gemini request paths, provider selection, provider-scoped BYOK save/clear behavior, per-provider no-key guard, pinned model/limits, OpenAI `store: false`, Gemini header authentication with no key in the URL, error sanitization, provider/risk disclosure, and documented local-key/source non-retention behavior before enabling production transmission.
- [ ] 7.4 Update repository documentation with Markdown-only support, the gated Hosted Delivery prerequisite, the post-Hosted narrow Spreadsheet Travel Table slice, later advanced formats, accessibility behavior, ReviewSession retention, local-only persistence, CanonicalExport privacy, BYOK setup/security trade-offs, and known V0 constraints.
