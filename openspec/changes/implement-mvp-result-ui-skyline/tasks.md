## 1. Baseline and Presentation Inputs

- [ ] 1.1 Reconcile the current dirty Viewer worktree, capture mobile and desktop Overview/Day browser baselines, and record the existing focused test and console state without overwriting unrelated changes.
- [ ] 1.2 Add or refine deterministic presentation selectors for ordered geography labels, the single readiness attention item, and the nearest fixed anchor while proving that no presentation-only field enters CanonicalTrip or CanonicalExport.
- [ ] 1.3 Add focused canonical fixtures for the Osaka Overview, flexible-heavy Uji Day, missing flight/accommodation, no-fixed-anchor, optional-heavy, reservation-heavy, all-day, approximate/open-ended, and alternative/conditional states.

## 2. Shared MVP Visual Language

- [ ] 2.1 Define the accepted role-based light/dark tokens for reading surfaces, travel movement, warmth, attention/fixed anchors, readiness/flexible space, text, and hairline structure in the existing shared token ownership.
- [ ] 2.2 Establish editorial date/trip typography and utility event/metadata typography with readable Traditional Chinese, Japanese, and Latin fallbacks using the existing theme and styling system.
- [ ] 2.3 Implement the mobile travel-folio measure, section rhythm, rules, touch sizing, and desktop widening behavior without creating dashboard columns or a parallel component system.

## 3. Overview Golden Screen

- [ ] 3.1 Recompose Overview into compact trip identity, large date and trip character, supported travel atmosphere, one readiness attention item, critical travel anchors, and a scannable day journey index.
- [ ] 3.2 Implement a clearly schematic journey motif from supported ordered geography labels, with an honest neutral fallback and no coordinates, routing, live state, or inferred destination facts.
- [ ] 3.3 Render readiness, flight, accommodation, and day-index content with restrained hierarchy and graceful omission of unsupported sections rather than placeholder or equal-weight cards.
- [ ] 3.4 Add Overview component tests for reading order, single-attention behavior, canonical identity, conditional sections, semantic labels, and absence of source-format branching.

## 4. Day Golden Screen

- [ ] 4.1 Recompose Day with compact orientation, Date Rail, large date/day character, supported day atmosphere, fixed-anchor summary, semantic timeline, optional disclosure, and closing context.
- [ ] 4.2 Link the fixed-anchor summary to its canonical event identity and test that days without a fixed event omit the summary without inventing a deadline or duplicate reservation.
- [ ] 4.3 Refine event presentation so fixed, exact, approximate, untimed, flexible, optional, conditional, alternative, transit, readiness, unresolved, and all-day states retain distinct weight without a uniform card stack.
- [ ] 4.4 Keep transit connective, flexible space low-pressure, optional items under `IF YOU STILL HAVE ENERGY`, and exact source-provided Directions/reservation actions attached to their canonical entities.
- [ ] 4.5 Add Day, Date Rail, and event-presentation tests for keyboard operation, disclosure state, semantic ordering, time precision, safe external links, and checklist/reservation consistency.

## 5. Responsive, Accessibility, and Regression Verification

- [ ] 5.1 Verify the Osaka Overview and Uji Day in a browser at 390 × 844 and a normal desktop viewport with no horizontal overflow, clipped essential text, missing content, or console errors.
- [ ] 5.2 Verify supported light and dark appearances preserve travel color roles, readable contrast, visible focus, named controls, and effective one-handed touch targets without relying on color alone.
- [ ] 5.3 Run semantic stress fixtures for optional-heavy, reservation-heavy, all-day, approximate/open-ended, alternative/conditional, missing-section, and runtime-unavailable states and fix any hierarchy that changes trip meaning.
- [ ] 5.4 Confirm that Home, Upload, Review, Today, Reservations, parsing, persistence, and canonical export behavior remain unchanged by this presentation-only change.
- [ ] 5.5 Run the focused test suite, full test suite, `npm run build`, `git diff --check`, and `openspec validate implement-mvp-result-ui-skyline --strict`, then record Golden Screen evidence and any validated refinements in `temp/06_RESULT_UI_SPEC.md`.
