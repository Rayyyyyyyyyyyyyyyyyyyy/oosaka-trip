## Context

The current React/Vite application already separates trip domain code, feature UI, browser storage, and provider-facing parsing. It also has a local import reducer, runtime schemas, lazy-loaded parser/review code, and 90 passing tests. The remaining risks are cross-cutting: CanonicalTrip validation does not yet enforce every runtime invariant, Review counts some warnings without showing them, selectors discard stable identities, active-trip changes rely on page reloads, and the request controller is owned by a temporary Drawer child rather than the stable workflow owner.

This change hardens those seams on the active `build-trip-runtime-v0` branch. It must preserve the Osaka Golden Result, Home-first behavior, transient ReviewSession privacy, exact safe source links, trip-scoped checklist migration, and the hard External Markdown Benchmark #001 gate. Correctness and recoverability while traveling take precedence over reducing file size or introducing a more general framework.

## Goals / Non-Goals

**Goals:**

- Make one semantic CanonicalTrip validator authoritative for Review confirmation, save, load, canonical JSON import, and Viewer entry.
- Reject unsafe or runtime-breaking data before it replaces a valid confirmed trip.
- Make every parser warning, preserved reference block, and evidence problem visible and locatable in Review.
- Keep active-trip state and import request lifecycle under stable owners with deterministic cancellation and stale-result behavior.
- Preserve stable domain identity through selectors and React rendering.
- Extract only cohesive Viewer and workflow responsibilities that need independent testing or lifecycle ownership.
- Keep styling tokens and responsive behavior consistent across MUI and Tailwind.

**Non-Goals:**

- Completing the Gemini adapter, expanding Markdown interpretation, or running External Markdown Benchmark #001; those remain in `build-trip-runtime-v0`.
- Hosted publication, accounts, recovery, cross-device state, spreadsheets, recommendations, expenses, packing, booking, or automatic replanning.
- TypeScript migration, router adoption, global state library, repository interface, provider plugin registry, generic form framework, or a second design system.
- A visual redesign of the Osaka viewer or speculative component extraction based only on line count.

## Decisions

### 1. Enforce semantic invariants at the CanonicalTrip boundary

`parseCanonicalTrip` remains the public boundary, but its schema/refinements will validate both shape and runtime semantics: a usable IANA timezone, allowed external-link protocols, trip/day date relationships, unique stable IDs in each identity namespace, valid reservation-to-todo references, and relation consistency. Review-specific incomplete data remains in ParsedTripDraft and does not weaken CanonicalTrip.

All persistence paths call this boundary before mutation. `importCanonicalJson` parses the envelope and candidate completely before calling `setItem`; a failed candidate leaves the existing value untouched. `loadCanonicalTrip` treats invalid persisted data as unavailable and allows Home/recovery controls to render instead of passing invalid state to Viewer runtime helpers.

Safe source-provided URLs are preserved byte-for-byte. Validation rejects an unsupported protocol rather than reconstructing, normalizing, or silently dropping the exact URL.

Alternative considered: validate only in Review. Rejected because canonical JSON import and stored-data migration bypass Review and therefore require the same protection.

### 2. Keep runtime derivation fallible without hiding static itinerary data

Valid canonical data should make runtime failures rare, but timezone formatting and future optional runtime services are still external-system boundaries. Runtime derivation will return a scoped unavailable result or be isolated by the Viewer so Overview and Day content remain renderable when current-time derivation fails. It will not fabricate NOW, NEXT, countdown, or leave-by state.

Alternative considered: rely exclusively on an application-wide error boundary. Rejected because a global fallback would hide the static itinerary the traveler still needs.

### 3. Make Review findings a first-class review model

Review validation remains a domain function. A focused selector will group findings by severity, entity, and source/evidence status for presentation. The Review UI will render every parser ambiguity, conflict, low-confidence note, invalid or missing evidence warning, and preserved reference block with classification, reason, and source location/content when available.

Warnings remain non-blocking unless an existing deterministic rule makes them blocking, but they cannot be represented only by an aggregate count. Traveler-added items without source evidence remain allowed and are visibly distinguished from provider output with broken evidence.

Alternative considered: expose raw provider response metadata in Review. Rejected because provider transport and response shapes must remain outside the review and canonical domains.

### 4. Make App the active-trip owner and storage a persistence boundary

`TripRuntimeApp` will lazily load the active trip and own the in-memory `activeTrip` value. Home, canonical import, Review confirmation, sample mode, and clear actions communicate through explicit callbacks. Mutations follow a storage-first sequence:

```text
validate candidate -> persist candidate -> update activeTrip -> render Viewer
```

If validation or persistence fails, `activeTrip` is unchanged. Clearing removes only the documented trip scope and then updates App state to Home. The bundled Osaka sample remains in memory-only sample mode. Page reload is no longer the synchronization mechanism.

Alternative considered: introduce Context or a global store. Rejected because the state has one natural root owner and normal props/callbacks are sufficient.

### 5. Own asynchronous import lifecycle outside temporary presentation children

A focused import workflow hook will own reducer state, request identity, `AbortController`, retry, confirmation, and unmount cleanup. Home may own one hook instance; Viewer owns another instance outside the temporary Drawer content so closing and reopening the menu does not lose request control.

Closing the Drawer is a presentation action and does not silently change import state. An explicit cancel action aborts the active request and returns to the existing trip or Home as appropriate. A response is accepted only when both its request ID and current workflow state still match. Unmounting the stable workflow owner aborts its request.

Alternative considered: keep the controller in `TripImportWorkflow`. Rejected because MUI temporary Drawer content may unmount independently of the workflow and lose the controller while the request continues.

### 6. Preserve identity through the view-model boundary

Selectors will include canonical IDs for flights, reservations, timeline items, and optional places. React list keys use those IDs, never display labels, flight codes, or array indexes. Duplicate-title reservations and source-supported partial flights therefore remain distinct without relying on presentation text.

Alternative considered: synthesize view-only keys. Rejected because stable canonical identity already exists and is the correct semantic contract.

### 7. Extract cohesive Viewer responsibilities without creating generic layers

The Viewer may extract `TripMenu`, `ReservationsView`, `TodayView`, `DayView`, `DateRail`, and a runtime-navigation hook where each has an independent responsibility or test boundary. Domain rules stay in `src/domain/trip/`; browser persistence stays in `src/storage/`; request orchestration stays in the import feature. No `shared/utils`, manager/factory hierarchy, or parallel handcrafted component library is introduced.

MUI continues to own interactive components, accessibility behavior, and component variants. Tailwind continues to own layout, spacing, and responsive composition. Shared visual tokens will have one CSS-variable source consumed by both layers, and the same property will not be redundantly declared in both `className` and `sx` on one element.

Alternative considered: rewrite the Viewer around a new design system. Rejected because it increases travel-day regression risk without improving the required behavior.

### 8. Verify boundary behavior before bundle optimization

Tests will be added first at domain, persistence, reducer/hook, and component boundaries, followed by mobile/desktop browser flows. Production chunks will be measured after extraction. Manual chunk configuration or another dependency is added only if measurements show a real regression; the existing parser/review lazy boundaries are preserved.

## Risks / Trade-offs

- **[Previously imported JSON becomes invalid]** → Fail before mutation, explain the invalid field, and preserve the current trip; do not silently coerce unsafe values.
- **[Stricter URL validation rejects a real source URL]** → Use an explicit documented protocol allowlist and retain exact accepted URLs unchanged.
- **[Reload-free state reveals synchronization bugs]** → Make App the only active-trip owner, keep persistence storage-first, and cover confirm/import/clear/reload transitions with tests.
- **[Review becomes too dense]** → Prioritize blockers and warnings, group by entity, collapse source details, and retain one responsive component tree.
- **[Drawer close semantics surprise travelers]** → Keep close and cancel visibly distinct; preserve progress on close and make explicit cancel reliably abort.
- **[Component extraction causes visual drift]** → Move existing markup incrementally, retain selectors and MUI/Tailwind primitives, and compare mobile/desktop flows against the Osaka baseline.
- **[Parallel OpenSpec scope overlaps V0]** → Treat `build-trip-runtime-v0` as the provider/parser/benchmark contract and limit this change to closing implementation-boundary gaps.

## Migration Plan

1. Add failing tests for invalid timezone, unsafe URL protocols, duplicate IDs, broken todo references, invalid stored trips, and atomic import preservation.
2. Strengthen CanonicalTrip validation and safe runtime fallback without changing the current Viewer layout.
3. Add Review finding/reference selectors and render all warnings and preserved content with evidence context.
4. Preserve IDs through selectors and replace unstable React keys.
5. Move active-trip state to App callbacks and remove reload-based synchronization one mutation at a time.
6. Move request lifecycle into the stable workflow owner and verify close, cancel, retry, stale response, and unmount behavior.
7. Extract cohesive Viewer/menu components and consolidate duplicated style ownership without visual redesign.
8. Run automated tests, strict OpenSpec validation, production build, diff check, bundle inspection, and mobile/desktop browser verification with no console errors.

Rollback is incremental: each step retains the prior canonical Osaka fixture and storage format. If reload-free transitions regress, the affected callback conversion can be reverted without reverting the strengthened canonical validation or Review visibility work.

## Resolved Implementation Decisions

- **External-link protocol allowlist:** `https:` only. The 24 formal input samples, Golden Input #001, the authoritative Maps fixture, and the bundled canonical fixture demonstrate HTTPS links only. Canonical and ParsedTripDraft boundaries therefore reject `http:`, executable/data protocols, relative URLs, and every other protocol. Accepted source URLs are retained byte-for-byte; validation never reconstructs, upgrades, or otherwise normalizes them.
- **Invalid persisted canonical recovery:** startup treats invalid repository-owned canonical data as unavailable and routes to the existing usable Home surface. Home shows a scoped recovery notice explaining that the saved trip could not be opened and was not passed to the Viewer, while retaining canonical JSON import, Markdown import, provider-key controls, and the explicit Osaka sample path. The invalid value is not silently deleted, and a later valid, successfully persisted import replaces it atomically.
