# Trip Runtime — Canonical Product Context
> Status: Product Source of Truth
> Owns: product thesis, invariants, scope/version boundaries, roadmap, validation questions.
## 1. Product thesis
Trip Runtime is a travel execution layer for people who already have an itinerary.
```text
Existing Itinerary
→ Structured Trip
→ Useful Runtime UI
```
Promise:
> Upload what you already have. Open it when you travel.
It does not require users to change how they plan trips.
## 2. Core problem
Planning artifacts may live in Markdown, Notes, Excel, PDF, Word, Canva, images, mind maps, booking confirmations, or personal shorthand.
Product hypothesis:
> A confirmed mobile runtime view can reduce the need to reopen the original planning artifact during travel.
## 3. Product boundary
### In scope
- import existing itinerary
- preserve source content + structural signals
- interpret semantics conservatively
- normalize without inventing precision
- deterministic validation
- Review / Correction
- user overrides
- later resolve/enrich existing entities when evidence-gated
- render confirmed semantics
- later attach Runtime Data
### Out by default
- AI trip planning
- recommendation / explore nearby
- route optimization / replanning
- automatic booking
- expense / budget / packing
- social / photo journal / gamification
- general travel chatbot
- complex collaboration
Feature test:
> Does it directly improve Existing Itinerary → Structured Trip → Useful Runtime UI?
If not, defer.
## 4. Architecture invariant
```text
Code reads the source.
LLM understands the intent.
Code verifies the result.
User confirms the truth.
Renderer presents it.
```
The LLM is an implementation of `Semantic Interpreter`, not the whole parser.
## 5. Data layers
### Source Data
Original artifacts and source trace.
### Trip Data
`Confirmed CanonicalTrip`.
Product-level Source of Truth.
### Runtime Data
Dynamic execution state:
- current time/location
- weather
- flight status
- transit estimate
- opening status
Runtime Data must not mutate CanonicalTrip.
## 6. Processing model
```text
Source
→ Source Adapter
→ UnifiedSourceDocument
→ Semantic Interpreter
→ SemanticInterpretationResult
→ Required Response / Reviewable Draft Gates
→ ParsedTripDraft
→ Deterministic Draft Validation
→ Evidence-backed Review
→ Authoritative Candidate Validation
→ User Confirmation
→ Confirmed CanonicalTrip
→ Presentation Projection
→ Source-agnostic Result UI
```
Rule:
```text
Source format → extraction strategy
Canonical semantics → presentation treatment
```
Never:
```text
Source format → Result UI family
```
## 7. Product invariants
### Preserve intent, not layout
Examples:
- `about 10:30` remains approximate
- recommendation does not become commitment
- optional does not become incomplete work
- fallback remains relational
### Conservative interpretation
```text
uncertain
→ preserve source
→ lower confidence
→ surface in Review
→ do not invent
```

### Source coverage accounting
Every source block must be accounted for as:
- interpreted Trip Data candidate
- preserved supporting/non-itinerary content
- explicitly unparsed content with source locator + reason

Silent omission is forbidden. An explicitly unparsed item is incomplete interpretation, not permission to invent a replacement.
### User override precedence
```text
User Override
> Verified External Data
> Parser Result
> Raw Source Inference
```
### Enrichment ≠ recommendation
Verified metadata may enrich an existing itinerary entity.
It may not create new itinerary intent.
### Review = trust boundary
`ParsedTripDraft` is provisional.
Only confirmed, validated `CanonicalTrip` is product truth.
### Runtime degradation
If runtime data fails:
- static itinerary remains usable
- unsupported runtime labels are omitted
- no guessing
## 8. Core semantic preservation
Preserve when present:
- exact / approximate / daypart / no-time / open-ended time
- cross-midnight relation
- free time
- optional
- alternative
- conditional / fallback
- tentative
- unresolved
- reservation/ticket state
- source-provided deadline/buffer
- personal note
- basic participant subgroup
- source trace
- explicit unparsed-source findings during Draft/Review
Supporting data may be classified/preserved without full V0 productization.
## 9. Scope/version boundaries
### Golden Viewer
Real Osaka/Uji/Nara viewer used as Golden Result #001.
May contain:
- Overview / Today / Day
- NOW/NEXT prototypes
- source-derived leave-by
- reservations / directions
- checklist behavior
Golden Viewer capability does not automatically define Generalized Product V0.
### Generalized Product V0 — Understand + Trust
Goal:
> Reliably convert unfamiliar Markdown into confirmed, renderable CanonicalTrip.
```text
Markdown
→ UnifiedSourceDocument
→ ParsedTripDraft
→ Validation
→ Review
→ Confirmed CanonicalTrip
→ Local Overview / Day
```
V0 ends at locally confirmed + renderable trip.
### V0.1 — Hosted Delivery Lite
Only after V0 benchmark gate:
```text
CanonicalTrip
→ PublishedTripSnapshot
→ TripPublication
→ Read-only unlisted Viewer
```
### V0.2 — Narrow Spreadsheet Travel Table
Constrained XLSX Source Adapter using the same Draft/Review/Canonical pipeline.
### Later
Evidence-driven:
- advanced spreadsheets
- PDF/visual/mind map
- place resolution
- richer runtime
- account / multi-trip / billing / cross-device ownership
## 10. UI direction
Current MVP Result UI thesis:
```text
Travel Notebook
×
Departure Energy
×
Runtime Clarity
```
Current UI design scope:
- Overview
- Day
- semantic hierarchy
- flexible/optional/transit treatments

The current skyline's screen structure, hierarchy, responsive composition, and surface language are the approved V0 product direction.

Implementation acceptance still requires clean-start validation of:
- mobile/desktop behavior
- accessibility and control sizing
- overflow and keyboard navigation
- contrast and semantic stress states
- exact visual tokens where they are to be frozen

Today runtime composition is a separate runtime UI track.
## 11. Evidence state
```text
Formal input samples: 25
External Markdown benchmark fixtures collected: 1
External Markdown benchmark gates passed: 0
Response reference pairs: 1
Cross-format semantic saturation: approaching, not declared
Markdown V0 evidence: sufficient to implement
```
Acceptance fixture:
Sample #23, Korea/Seoul Markdown.
## 12. Status classification
### Confirmed
- product thesis/boundary
- three-layer data model
- pipeline ownership
- user override precedence
- source-agnostic Renderer
- Review trust layer
- Markdown V0 evidence boundary
- Overview/Day surface scope and semantic direction
### Available reference implementation
- current Osaka/Uji/Nara viewer
- runtime-oriented prototype behavior
### Current clean-start implementation state
- Generalized Product V0 pipeline is not yet implemented on this branch
- prior-branch architecture hardening, persistence, and test counts are not a current baseline
- current UI direction is approved; its clean-start implementation and the Functional Spec remain pending behavioral validation
### Unvalidated
- generic parser quality
- Review burden
- unfamiliar Markdown E2E acceptance
- current clean-start Overview/Day implementation and usability
- travel-time replacement of source docs
- willingness to pay
- business model
- product-vs-feature risk
## 13. Product hypotheses
### Runtime value
Will users stop reopening the source itinerary?
### Review tolerance
Is correction burden low enough?
### WTP
Is itinerary-to-runtime conversion worth paying for?
### Product vs feature
Can general AI tools absorb the value?
### Frequency
Is consumer trip frequency too low?
### B2B
Would travel operators gain more from white-label runtime itineraries?
## 14. Kill questions
1. Feature or product?
2. Why not ChatGPT / Claude / Notion?
3. Is the source actually painful during travel?
4. Does Review friction erase value?
5. Are parser/layout/resolution costs too high?
6. Is B2C frequency too low?
7. Is WTP real?
8. Is B2B stronger?
9. Is Golden Viewer only useful to its creator?
10. What result should make us stop?
## 15. Highest-level acceptance
> During travel, users should no longer need to reopen the original itinerary document.
