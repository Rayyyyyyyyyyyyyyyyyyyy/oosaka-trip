## 1. Lock Hardening Decisions and Regression Baselines

- [x] 1.1 Resolve and document the accepted external-link protocol allowlist from demonstrated fixtures and the minimum user-visible recovery state for invalid persisted canonical data; do not normalize accepted exact source URLs.
- [x] 1.2 Add failing schema and storage regression tests for invalid IANA timezone, unsupported URL protocols, duplicate canonical IDs, invalid trip/day relationships, broken reservation `todoId` references, invalid stored data, and atomic preservation after validation, serialization, quota, or storage failure.
- [x] 1.3 Add failing selector/component regressions for same-title reservations, partial flights without codes, timeline reordering, and duplicate-label optional places so every rendered collection proves stable canonical identity.
- [x] 1.4 Add failing Review regressions proving parser ambiguity/conflict/low-confidence notes, broken evidence references, and every preserved reference-block classification are individually inspectable rather than count-only.
- [x] 1.5 Add failing workflow regressions for reload-free confirm/import/clear, Drawer close/reopen during parsing, explicit cancellation after reopen, stable-owner unmount cleanup, stale response rejection, and preservation of the previous confirmed trip.

## 2. Harden Canonical and Runtime Boundaries

- [x] 2.1 Extend the canonical runtime schema with shared IANA-timezone and safe-link validators and apply the same link policy to provider/draft boundaries without weakening incomplete ParsedTripDraft semantics.
- [x] 2.2 Add deterministic semantic validation for unique entity identities, trip/day date relationships, reservation-to-todo references, and relation consistency with actionable validation paths.
- [x] 2.3 Make save, load, Review confirmation, and canonical JSON import call the authoritative semantic boundary before mutation; preserve the existing stored trip for every rejected or failed replacement.
- [x] 2.4 Route invalid persisted canonical data to a usable Home or scoped recovery state and ensure malformed persisted values never reach Viewer runtime helpers.
- [x] 2.5 Isolate current-time derivation failure so Overview and every static Day remain usable while NOW, NEXT, countdown, and leave-by are omitted with an honest scoped unavailable state.

## 3. Make Review Evidence and Findings Transparent

- [x] 3.1 Add a focused Review findings selector that groups every blocker and warning by severity, entity, parser-note kind, and evidence validity without exposing provider transport types.
- [x] 3.2 Validate evidence block references against the active UnifiedSourceDocument and distinguish valid source evidence, broken provider evidence, and explicit traveler-added overrides without fabricating excerpts.
- [x] 3.3 Implement a responsive `ReviewFindingsSummary` that renders every finding message, identifies the affected entity or field, announces revalidation changes, and keeps warnings non-blocking when specified.
- [x] 3.4 Implement inspectable preserved-reference sections showing classification, reason, locator, and available inert source content without promoting supporting material into committed events.
- [x] 3.5 Verify confirmation still excludes source excerpts, full extracted blocks, reference classifications, provider metadata, and other transient ReviewSession content from CanonicalTrip and CanonicalExport.

## 4. Stabilize Active Trip and Import Workflow Ownership

- [x] 4.1 Make `TripRuntimeApp` lazily load and exclusively own in-memory active-trip and sample-mode state, with explicit callbacks for confirmed replacement, canonical import, sample entry/exit, and scoped clear.
- [x] 4.2 Convert Review confirmation and canonical JSON import to the storage-first `validate -> persist -> update activeTrip` sequence and remove their `window.location.reload()` synchronization.
- [x] 4.3 Convert confirmed-trip clearing to remove only trip-scoped data, update root state, preserve provider credentials, and return to Home without reloading.
- [x] 4.4 Extract a focused import workflow hook that owns reducer state, request identity, AbortController, retry, confirmation, and unmount cleanup while retaining the existing reducer vocabulary.
- [x] 4.5 Keep the Viewer workflow hook mounted outside temporary Drawer content so close/reopen preserves progress and explicit cancellation always aborts the active request.
- [x] 4.6 Tighten reducer transitions so validation, extraction, parse, confirm, retry, cancel, and failure results advance state only for the matching request and expected current status, while replacement failures retain the prior trip identity.

## 5. Preserve Identity and Clarify UI Boundaries

- [x] 5.1 Preserve canonical IDs in flight, reservation, timeline, transit, and optional-place view models and replace display-string or array-index React keys with those IDs.
- [x] 5.2 Extract only cohesive `TripMenu`, `ReservationsView`, `TodayView`, `DayView`, `DateRail`, and runtime-navigation responsibilities whose lifecycle or tests justify a boundary; keep domain rules in `src/domain/trip` and persistence in `src/storage`.
- [x] 5.3 Move the legacy Osaka checklist storage key out of the trip-viewer feature dependency so storage does not import feature-owned persistence knowledge, while preserving migration and synchronization behavior.
- [x] 5.4 Establish one shared CSS-variable token source consumed by the MUI theme and Tailwind, then remove duplicated same-property `className`/`sx` declarations from touched components without redesigning the Viewer.
- [x] 5.5 Keep existing loading, empty, error, responsive, keyboard, focus, touch-target, exact-link, optional/flexible, transit, checklist, and reservation behavior intact through the extracted component boundaries.

## 6. Verification and Documentation

- [x] 6.1 Run the complete automated test suite and confirm the new domain, storage, Review, workflow, selector, and component regressions pass without weakening existing assertions.
- [x] 6.2 Run `npm run build`, inspect production chunks to preserve parser/Review lazy boundaries, and optimize chunking only if measured output regresses materially.
- [x] 6.3 Verify Home, confirmed Viewer, sample mode, invalid canonical import, replacement failure, Review findings/reference inspection, close/reopen/cancel, confirmation, reload, and scoped clear in a browser at mobile and desktop viewports with no console or accessibility errors.
  - Verified the directly accessible Home, sample/Viewer, navigation, reservations/checklist synchronization, reload persistence, sample exit, and menu flows at 390x844 and 1280x900 with no console warnings or errors. The in-app browser denied file-upload permission, so upload-dependent invalid-import and Review lifecycle paths were verified through their focused component/integration tests instead of bypassing that permission boundary.
- [x] 6.4 Update the fixed current documentation files in place with the hardened canonical invariants, Review visibility behavior, active-trip ownership, cancellation semantics, and any measured bundle or known limitation changes.
- [x] 6.5 Run `git diff --check` and `openspec validate harden-trip-runtime-architecture --strict`; confirm this change does not claim External Markdown Benchmark #001 completion or authorize Hosted Delivery implementation.
