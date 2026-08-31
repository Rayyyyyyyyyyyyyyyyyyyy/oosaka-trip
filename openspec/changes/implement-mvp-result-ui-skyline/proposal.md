## Why

The current Viewer has the necessary itinerary semantics, but its visual language has not yet been deliberately shaped into an MVP experience that feels like an upcoming trip while remaining fast to scan on travel days. MVP UI Skyline #001 now provides an accepted direction for Overview and Day, so it should be captured as an implementation-ready contract before visual work continues or expands into later Runtime surfaces.

## What Changes

- Apply the accepted `Travel Notebook × Departure Energy × Runtime Clarity` direction to the existing source-agnostic Result UI.
- Establish an Overview hierarchy of trip identity, dates, purposeful route/place atmosphere, one current readiness item, critical travel anchors, and a scannable day journey index.
- Establish a Day hierarchy of compact day navigation, date and day character, day-specific atmosphere, the nearest fixed anchor, a semantic timeline, optional disclosure, and personal context.
- Give fixed, flexible, optional, transit, readiness, and unresolved information distinct visual weight without turning every item into a card or inventing precision.
- Use a restrained travel palette and editorial/sans typography roles that remain legible in light and dark appearances and across Traditional Chinese, Japanese, and Latin text.
- Validate the Golden Osaka Overview and the flexible-heavy Uji Day at mobile and normal desktop widths, then stress-test the same grammar with canonical semantic variants.
- Keep Today, NOW/NEXT, Map, Reservations, hosted publication, parser behavior, canonical schema, and new runtime intelligence outside this change.

## Capabilities

### New Capabilities

- `mvp-result-ui-skyline`: The source-independent visual hierarchy, semantic presentation grammar, responsive behavior, and accessibility acceptance criteria for the MVP Overview and Day Result UI.

### Modified Capabilities

None. No main OpenSpec capabilities have been archived yet; this visual change consumes the active `build-trip-runtime-v0` trip-viewer contracts without changing their canonical or runtime requirements.

## Impact

- Affects the existing Overview, Day, Date Rail, event-presentation, navigation, theme/token, and viewer styling surfaces plus focused UI tests.
- Uses the current React 19, Material UI, Tailwind CSS 4, and shared project tokens; it does not introduce a parallel component system or new UI dependency.
- Does not modify Source Adapter, Semantic Interpreter, ParsedTripDraft, Review, CanonicalTrip, persistence, provider, or hosted-delivery behavior.
- Must preserve exact source-provided links, checklist/reservation consistency, static itinerary fallback, and all existing semantic distinctions.
