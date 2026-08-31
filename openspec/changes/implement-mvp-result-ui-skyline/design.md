## Context

The active V0 work already provides a source-independent Viewer, canonical selectors, separate Overview and Day surfaces, a Date Rail, semantic event presentation, exact-link behavior, and shared styling ownership. `temp/06_RESULT_UI_SPEC.md` now records MVP UI Skyline #001 after two design iterations: an austere editorial document was rejected because it lacked the feeling of going on a trip, while the accepted direction adds departure energy through purposeful route, place, color, and journal cues without becoming a destination-magazine layout.

This change is a presentation-layer refinement. It must consume existing canonical facts and presentation selectors, preserve every runtime and semantic integrity rule, and avoid adding UI-shaped fields to CanonicalTrip. The primary traveler context remains a 390px-class mobile viewport used one-handed during travel; desktop is the same travel document at a wider measure, not a different dashboard architecture.

## Goals / Non-Goals

**Goals:**

- Make Overview and Day immediately feel like an active or upcoming trip while keeping critical facts scannable within seconds.
- Implement the accepted hierarchy, rhythm, semantic weight, restrained travel color roles, and light/dark behavior using existing component and token ownership.
- Keep fixed anchors, flexible space, optional content, transit, readiness, unresolved values, and supporting notes visually distinct without overstating source precision.
- Produce browser-verified Golden Screens for the Osaka Overview and Uji Day and validate the grammar against representative semantic stress cases.
- Preserve keyboard access, touch targets, readable multilingual text, safe links, and static fallback behavior.

**Non-Goals:**

- Redesign Home, Upload, Review, Today, Reservations, Map, or hosted publication.
- Add NOW/NEXT, leave-by, transit calculation, weather, flight status, recommendations, or place enrichment.
- Change CanonicalTrip, parsing, validation, persistence, provider, or checklist domain behavior.
- Freeze exact component APIs, every design token, the future Today composition, or the final desktop information architecture.
- Add photography, a new icon pack, animation framework, design-system dependency, or parallel handcrafted component library.

## Decisions

### 1. Keep Skyline logic in presentation projection and existing viewer boundaries

Overview, Day, Date Rail, and event templates will consume existing canonical selectors or focused presentation helpers. Ordered geography labels, readiness attention, fixed-anchor selection, time labels, and semantic modifiers are derived at render time and are never persisted into CanonicalTrip.

**Why:** This preserves the source-to-UI architecture and lets Markdown, canonical JSON, and future adapters use the same visual language.

**Alternative considered:** Add fields such as `heroMood`, `routeColor`, `dayIllustration`, or `featuredCard` to CanonicalTrip. Rejected because those fields describe rendering rather than trip truth.

### 2. Treat travel atmosphere as purposeful presentation, not decorative content

Overview may render a schematic journey line from canonical day/geography labels. It must be clearly schematic rather than a geographic map. A Day may use a restrained place/mood motif only when supported by canonical place or event semantics; otherwise it uses neutral travel chrome and does not infer a river, landmark, weather, or activity.

**Why:** The accepted design needs departure energy, but the UI cannot invent destination facts or become dependent on external enrichment.

**Alternative considered:** Use large destination photography or per-city bespoke artwork. Rejected because it competes with utility, adds asset and attribution complexity, and fails for unfamiliar trips.

### 3. Use role-based color, not event-type color coding

The shared tokens will expose a warm reading surface, a dark travel surface, sky/movement accent, sun/warmth accent, coral attention/fixed-anchor accent, moss readiness/flexible accent, neutral text, and hairline structure. Light and dark appearances preserve these roles with accessible contrast. Event type remains identifiable through label, icon, structure, and hierarchy rather than a unique hue.

**Why:** This creates travel energy without a rainbow itinerary or SaaS gradient system.

**Alternative considered:** Assign blue to flights, orange to restaurants, purple to hotels, and green to activities. Rejected because color becomes noisy and carries category meaning inconsistently.

### 4. Compose Overview as an editorial journey index

Overview will follow this order: compact product/trip header; large date and one-line trip character; purposeful journey atmosphere; at most one current readiness attention item; critical flight/hotel anchors; day journey index. Unsupported sections are omitted rather than leaving empty shells.

**Why:** This lets the first viewport communicate trip identity and anticipation, then moves directly into information needed before departure.

**Alternative considered:** A grid of flight, hotel, reservation, weather, and day cards. Rejected because it produces dashboard density and gives every fact equal weight.

### 5. Compose Day around the nearest fixed anchor and a semantic timeline

Day will use compact day orientation, a large date/day character, optional supported atmosphere, the nearest fixed anchor, then a narrow-time-column timeline. Transit remains a connector; flexible space receives air and softer treatment; optional content remains outside the committed timeline under `IF YOU STILL HAVE ENERGY`; reservation actions stay attached to the relevant event.

**Why:** The user can understand the day's emotional shape without losing the next thing that cannot be missed.

**Alternative considered:** Equal-height event cards in chronological order. Rejected because it collapses fixed, flexible, optional, and connective semantics into a task list.

### 6. Reuse existing interaction primitives and styling ownership

Material UI remains responsible for accessible interactive behavior. Tailwind and the shared token layer remain responsible for layout, rhythm, responsive rules, and visual roles. Existing component boundaries may be refined, but this change will not introduce another button, card, icon, or token system.

**Why:** The visual change should deepen the current system rather than create a parallel implementation that is difficult to maintain.

### 7. Verify with Golden Screens and semantic stress fixtures

Browser verification will cover at least 390 × 844 and a normal desktop viewport, light/dark behavior where supported, keyboard operation, external-link safety, console errors, and no horizontal overflow. Golden Screens use the Osaka Overview and Uji Day. Fixture-driven checks cover optional-heavy, reservation-heavy, all-day, approximate/untimed, alternative/conditional, and missing-section states.

**Why:** The accepted direction must generalize beyond the exact visual composition of Golden Input #001.

## Risks / Trade-offs

- **[Travel atmosphere becomes decorative noise]** → Limit motifs to the hero/day identity surfaces, require a semantic purpose, and keep itinerary text visually dominant.
- **[A schematic route is mistaken for geographic accuracy]** → Avoid map geometry, distance claims, and map controls; present ordered labels as a journey motif only.
- **[Dark appearance loses the feeling of travel]** → Preserve sky, sun, coral, and moss roles in dark tokens rather than reducing the interface to monochrome navy.
- **[Fixed-anchor elevation duplicates the same event]** → Treat the header anchor as a concise pointer and keep one detailed canonical event in the timeline; ensure accessible labels do not imply two separate reservations.
- **[Visual hierarchy accidentally hides unsupported or unresolved information]** → Keep unresolved/approximate labels explicit and include semantic regression fixtures before visual sign-off.
- **[Existing dirty work overlaps viewer files]** → Apply tasks incrementally, inspect the current working tree before edits, and preserve unrelated user-authored changes.

## Migration Plan

1. Capture current Overview and Day screenshots and focused behavioral tests as a rollback baseline.
2. Introduce or refine shared semantic visual-role tokens without changing domain data.
3. Update Overview hierarchy, then Day/Date Rail/event grammar in small independently testable steps.
4. Add semantic fixtures and responsive/accessibility assertions before visual browser sign-off.
5. Run the production build, test suite, `git diff --check`, and strict OpenSpec validation.
6. Roll back presentation commits or individual component changes if semantic regression appears; no data migration is required.

## Open Questions

- The exact production navigation treatment represented by the Skyline review switch remains open; implementation must preserve the current valid navigation flow unless separately approved.
- Exact font family, scale, line height, radii, and final token values remain implementation-prototype decisions within the recorded roles.
- The future Today visual hierarchy remains a separate Runtime Skyline decision.
