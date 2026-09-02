# Trip Runtime — Result UI Contract
> Status: Approved UI Direction Contract — implementation validation pending
> Scope: Confirmed CanonicalTrip → Presentation Projection → Result UI.
## 1. Purpose
Make a confirmed itinerary faster to use during travel than the original planning artifact.
Primary question:
> Can the traveler understand what matters in a few seconds?
## 2. Presentation boundary
```text
Confirmed CanonicalTrip
→ Presentation Projection
→ Semantic UI Templates
→ Result UI
```
CanonicalTrip defines:
what the trip means.
Presentation defines:
how confirmed semantics are emphasized.
Do not write UI-only styling into CanonicalTrip.
## 3. Renderer invariant
Result UI is source-agnostic.
Forbidden:
```text
xlsx → spreadsheet UI
pdf → PDF UI
```
Required:
```text
Canonical semantic + runtime state
→ presentation treatment
```
## 4. Visual thesis
```text
Travel Notebook
×
Departure Energy
×
Runtime Clarity
```
Direction:
- editorial
- Japanese-minimal
- utility-first
- mobile-first
- travel-specific without template cliché
Avoid:
- dashboard density
- card-everything
- teal travel SaaS gradients
- recommendation/social feeds
- excessive destination photography
- gamification
- generic travel copy

The current screen structure, hierarchy, responsive composition, and surface language are the approved V0 design baseline.

Approval of the direction does not by itself validate:
- exact color tokens
- exact type metrics
- sticky/overflow mechanics
- accessibility
- implementation correctness

Those remain subject to the checks in §21.
## 5. View scope
### Generalized V0
- Overview
- Day
### Golden Viewer / later runtime track
- Today
- Reservations
- Map
- NOW/NEXT/leave-by
Current checked-in Osaka viewer behavior remains a real-use reference. No discarded-branch implementation is inherited, and reference capability does not expand generalized V0 acceptance scope.
## 6. Semantic presentation grammar
```text
Flight
Accommodation
Fixed Event
Activity
Restaurant
Free Time
Optional
Alternative Group
Conditional / Fallback
Transit
Reservation / Readiness
Note
Runtime Instruction
Supporting Reference
Internal Timetable
```
Template ≠ Card.
Allowed surfaces:
- plain block
- prominent block
- card
- inline metadata
- badge
- connector
- nested content
- secondary surface
## 7. Semantic modifiers
Preserve:
- exact
- approximate
- daypart
- open-ended
- no-time
- reserved/ready
- action-needed
- optional
- tentative
- unresolved
- conditional/fallback
- all-day
Invariant:
> Visual precision must not exceed source precision.

When provenance is intentionally exposed, `你的校正` is an allowed supporting label for a user override. It identifies authority/provenance and must not become itinerary intent.
## 8. Overview contract
Purpose:
pre-trip orientation and trip compression.
Reading order:
```text
Trip Identity
→ Dates / Geography
→ Journey / destination sequence
→ Readiness attention, if any
→ Critical travel anchors
→ Day Journey Index
```
Rules:
- no KPI dashboard
- no fake route geometry
- journey derived only from supported trip facts
- no readiness issue → omit readiness attention treatment; a collapsed, low-emphasis completion summary may remain
- absent flight/hotel → omit placeholder
- day index supports fast scan + navigation

Approved composition:
- mobile follows the reading order as one continuous travel document
- desktop may place readiness and critical anchors in a secondary column beside trip identity/day index
- desktop width must improve simultaneous orientation, not introduce dashboard modules or KPIs
## 9. Day contract
Purpose:
primary single-day reading surface.
Hierarchy:
```text
Date navigation/orientation
→ Day identity
→ day context
→ nearest fixed anchor, if any
→ semantic timeline
→ optional disclosure
→ supporting/personal context
```
Rules:
- fixed anchors outrank flexible content
- narrow time scan column where applicable
- no fake time for untimed items
- transit = connective tissue
- flexible space stays intentionally open
- optional stays outside main committed hierarchy
- no fixed anchor → omit anchor surface
- long supporting content → secondary/nested treatment

Approved composition:
- mobile uses a horizontal Date Rail followed by one primary Day reading column
- desktop uses three coordinated regions: Day navigation rail, primary semantic timeline, and secondary supporting context
- fixed-anchor summary belongs before or beside the timeline, never below optional/supporting content
- optional and supporting content may be collapsed/nested on mobile and visible in the secondary desktop region
- when a Day has one dominant fixed anchor, `今天唯一不能動的` is an allowed summary phrase
## 10. Free Time
First-class itinerary content.
Do not:
- checkbox it
- mark incomplete
- invent precise time
- turn it into a rigid task card
Use:
- whitespace
- lower pressure
- flexible hierarchy
## 11. Optional
Allowed product phrase:
`IF YOU STILL HAVE ENERGY` / `還有體力的話`
Rules:
- outside committed hierarchy
- visible but secondary
- never disabled-looking
- never task-like
## 12. Alternative / Conditional
Preserve relationship.
Example:
```text
Dinner
├─ Option A
├─ Option B
└─ Return to hotel
```
Do not flatten structured choice into an ambiguous single title.
## 13. Transit
Default:
```text
Event A
  │
  │ 27 min · JR
  ↓
Event B
```
Promote transport only when transport itself is a critical booked entity.
## 14. Reservation / readiness
Readiness = dependency preparedness, not event completion.
Examples:
- reservation
- ticket
- document
- payment
```text
ready ≠ completed
```
## 15. Supporting reference
Examples:
- timetable
- route diagram
- venue map
- ticket instructions
- booking rule
- reference image
Default:
secondary/nested access, not top-level event promotion.

Source locator/provenance may appear as low-priority supporting context. The Result renderer still consumes only Presentation Projection and never raw source evidence.
## 16. Today runtime boundary
Today is not a smaller Day view.
Real Today priority:
```text
NOW
NEXT
LEAVE BY
```
Render only when supported by confirmed Trip Data + valid Runtime Data.
Otherwise omit.
Do not guess.
Detailed Today composition is a later runtime UI spec.
## 17. Navigation
Approved navigation direction:
- changing Day reorients the reader to that Day's identity/start
- mobile Day uses a horizontally scrollable Date Rail with a clearly selected date
- desktop Day uses a persistent vertical Day rail with date + short day identity
- Overview day rows and either Date Rail open the same source-agnostic Day surface
- overflow navigation remains keyboard-operable and keeps the active date visible

Still implementation-tunable:
- exact sticky offsets/thresholds
- scroll animation
- overflow controls and edge affordances
- whether URL/history updates use routes or local state in the local V0

Prototype screen-switching controls are not the production navigation API.
## 18. Mobile / desktop
Mobile is primary.
Assume:
- one hand
- walking
- platform use
- 3-second glance
Desktop is the same travel document at wider measure, not a dashboard.

Responsive treatment:
- mobile prioritizes one reading task at a time
- desktop may keep supporting/personal context simultaneously visible
- information may move between inline, nested, and secondary regions, but semantic emphasis/order must remain equivalent
- desktop must not create new itinerary facts or a different source-specific UI family
## 19. Visual roles
Role direction:
```text
Warm paper / night blue → reading surface
Sky → movement / transition
Sun → warmth / anticipation
Coral → fixed anchor / attention
Moss → readiness / flexible space
```
Roles are not frozen exact color tokens.
Do not use rainbow event taxonomy.
## 20. Typography roles
- editorial display: date/day/trip identity
- utility sans: time/event/metadata/controls
Exact family/size/line-height remains implementation-tunable unless later frozen.
## 21. Historical Golden Screen evidence and current revalidation
Previous viewer QA covered:
- Overview mobile/desktop
- Uji Day mobile/desktop
- no horizontal overflow
- 44px minimum mobile controls
- no browser console errors
- keyboard-operable primary controls
- dark/light semantic contrast checks
- stress fixtures for optional/reservation/all-day/approximate/open-ended/alternative/missing-anchor cases
Previous design review covered:
- hierarchy
- rhythm
- semantic treatment
- surface language
- navigation behavior
This is historical reference evidence, not validation of the current clean-start implementation or Generalized Product V0.
The current skyline is the approved product direction, but the implementation must re-run the applicable viewport, overflow, console, keyboard, contrast, and semantic stress checks before acceptance.
No visual tokens are frozen unless explicitly revalidated and recorded.
## 22. UI state matrix
| Condition | Required behavior |
|---|---|
| no fixed anchor | omit anchor summary |
| approximate time | visibly non-exact |
| open-ended time | known start, unknown end |
| no-time | no fake timeline position |
| no flight/hotel | omit placeholder |
| all readiness complete | omit attention treatment; may retain a collapsed, low-emphasis completion summary |
| optional-heavy | keep outside committed hierarchy |
| free-time-heavy | preserve spacious treatment |
| transit absent | do not invent |
| broken external link | do not render dead action |
| unresolved place | show unresolved state |
| runtime unavailable | static trip remains usable |
## 23. Iteration test
Before accepting a UI change ask:
1. Does it improve runtime comprehension?
2. Does it preserve Canonical semantics?
3. Does it generalize beyond Golden Input #001?
4. Is it presentation-only, or secretly inventing product data?
If it fails, do not promote it into the UI contract.
