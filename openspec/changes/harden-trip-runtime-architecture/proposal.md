## Why

The current V0 implementation has sound feature boundaries and passing tests, but several external-data, Review, identity, and asynchronous-lifecycle gaps can still allow an imported trip to break the Viewer or hide information the traveler must review. These gaps should be closed before External Markdown Benchmark #001 is treated as meaningful and before the architecture expands to a second provider.

## What Changes

- Strengthen the CanonicalTrip boundary so every persistence and import path rejects invalid timezones, unsafe external-link protocols, duplicate identities, invalid trip/day relationships, and broken reservation/checklist references before replacing the active trip.
- Preserve the previous confirmed trip when canonical import, replacement parsing, Review confirmation, or persistence fails, and keep the static itinerary available through scoped runtime fallback behavior.
- Make every parser ambiguity, conflict, low-confidence interpretation, evidence problem, and preserved reference block inspectable in Review instead of displaying only aggregate counts.
- Preserve canonical entity IDs through selectors and use them for rendered list identity, including partial flights, same-title reservations, timeline events, and optional places.
- Move active-trip mutation and import request lifecycle to stable owners so cancellation, drawer unmounting, retries, stale responses, confirmation, and clearing have deterministic behavior without page reloads.
- Split the oversized Viewer only at demonstrated responsibility boundaries and clarify MUI, Tailwind, and shared design-token ownership without adding a new component system or global state library.
- Add focused domain, storage, reducer, component, browser, bundle, and accessibility regression coverage for the hardened boundaries.
- Keep OpenAI/Gemini provider completion, Markdown interpretation coverage, and External Markdown Benchmark #001 inside `build-trip-runtime-v0`; this change consumes those contracts and does not duplicate or weaken their acceptance gate.

## Capabilities

### New Capabilities

- `canonical-runtime-integrity`: Semantic CanonicalTrip validation, safe persistence/import, referential integrity, atomic active-trip replacement, and static-viewer resilience.
- `review-evidence-transparency`: Complete traveler-visible Review findings, reference-block inspection, evidence traceability, and focused navigation to affected entities.
- `trip-workflow-resilience`: Stable ownership of active-trip state and asynchronous import lifecycle, including cancellation, stale-result rejection, reload-free confirmation, and scoped clearing.

### Modified Capabilities

None. No main OpenSpec capabilities have been archived yet; this hardening change remains compatible with the active `build-trip-runtime-v0` capability contracts.

## Impact

- Affects `src/domain/trip/schema.js`, Review validation, selectors/runtime helpers, browser storage, App entry ownership, import workflow state, and the existing Viewer/menu component boundaries.
- Adds no backend, hosted publication, account, cross-device, spreadsheet, recommendation, or replanning behavior.
- Adds no global state library, provider plugin system, repository interface, TypeScript migration, or parallel handcrafted component system.
- May invalidate previously accepted canonical JSON containing unsafe or semantically inconsistent values; invalid imports preserve the current confirmed trip and report a recoverable error.
- Must remain compatible with the bundled Osaka fallback, exact source-provided safe URLs, legacy Osaka checklist migration, and browser-local provider credentials.
