# Trip Runtime — Functional Product Spec
> Status: Working Product Behavior Contract — approved UI composition, implementation validation pending
> Scope: Observable behavior for Generalized Product V0.
> Visual styling belongs to `06_RESULT_UI_SPEC.md`.
## 1. V0 user flow
```text
Home
→ Provide Markdown
→ Parse
→ Review
→ Confirm
→ Local Overview / Day
```
With an existing confirmed trip:
```text
Existing Trip stays active
→ Candidate Import runs separately
→ Successful confirmation replaces active trip
```
## 2. Workflow states
```text
idle
validating_source
extracting
parsing
validating_draft
review_required
confirming
confirmed
failed
cancelled
```
UI may group internal states visually, but behavior must respect them.
## 3. Home
### Purpose
Entry point for starting/resuming an import and opening the active confirmed trip when one exists.
### Must provide
- Markdown file upload
- pasted Markdown text input
- parser provider/settings
- provider credential controls
- Canonical JSON import
- format/privacy guidance
- explicit sample/fallback path
### Must not
- force traveler profile fields
- require provider key to read confirmed trip
- auto-activate bundled sample

Home may place provider, credential, Canonical JSON, and sample controls in a secondary settings/import surface; they do not all need equal first-viewport emphasis. Every required secondary capability must remain reachable through an explicit visible control rather than explanatory copy alone.

With an active trip, Home may show:
- the single active confirmed trip
- a separate candidate import/review state

It must not imply a persisted multi-trip library in Generalized V0.
## 4. Markdown input
### Action
Either:
- select or drag one Markdown file
- paste Markdown text, treated as an ephemeral Markdown source

Pasted Markdown requires an actual text-input surface with explicit submit/start behavior, empty-input validation, and clear/replace behavior. Mentioning paste support in explanatory copy is not sufficient.

Both modes normalize into the same required `TextSourceInput` schema before extraction. Pasted text does not expand V0 beyond the Markdown Source Adapter. It must receive a session source identifier, required display name, and stable line/block locators for Review evidence.
### System flow
```text
validate source
→ extract
→ UnifiedSourceDocument
→ parse
→ SemanticInterpretationResult
→ required response / Reviewable Draft gates
→ ParsedTripDraft
→ deterministic draft validation
→ Review
```

### Progress presentation
UI may group internal states into these user-facing stages:
```text
Read source
→ Build source document
→ Interpret semantics
→ Validate and prepare Review
```
Progress copy must describe completed/current work without claiming unsupported precision or success before the corresponding stage finishes.

### Privacy copy
Privacy guidance must distinguish:
- local/session handling and durable storage
- content sent to the selected parser provider
- data excluded from CanonicalTrip

The UI must not claim that content never leaves the device when the configured Semantic Interpreter transmits content to an external provider.
### Failure
Examples:
- unsupported type
- unreadable/empty file
- extraction failure
Required:
- clear error
- existing active trip preserved
- retry/replace path

If extraction succeeds but day/date structure cannot be interpreted conservatively, recovery may offer:
- supply the missing trip date/day grouping
- explicitly treat the source as a single-day list
- replace the source

This is structural correction, not itinerary planning. The system must not guess a day order or silently distribute items.

If interpretation is structurally insufficient or some source content cannot be parsed safely, the response must list every known missing requirement and unparsed item with its source locator and reason. The UI must distinguish:
- invalid/schema-malformed parser output → parse failure + retry
- schema-valid but insufficient interpretation → bounded recovery + replace source
- reviewable draft with non-blocking unparsed content → Review with explicit findings

No source block may disappear silently in any case.

An explicit unknown/none value is not itself a missing parse result. For example, a source item with no time remains an untimed item; the system must not report a missing exact time or invent one merely to satisfy the required schema.
## 5. Replacement import
Precondition:
active confirmed trip exists.
Contract:
```text
candidate source validate
→ parse
→ validate draft
→ review
→ validate candidate
→ confirm
→ persist
→ atomically replace active trip
```
Before final confirmation:
- active trip remains readable
- failure preserves it
- cancel preserves it
- surface close ≠ implicit request cancel unless explicitly defined
- stale responses never advance current workflow

After successful persistence and replacement:
- the confirmed candidate is the single active trip
- the candidate import/review state is cleared
- Home and all confirmation-success actions resolve the same new active trip
- the replaced trip must not continue to appear as active
## 6. Parser provider behavior
Providers use separate adapters behind one neutral parse contract.
Provider/model metadata must not enter CanonicalTrip.
Credential rules:
- provider-specific
- explicit clear action
- no cross-provider fallback
- no key in URL
- confirmed trip readable without parser credentials
## 7. Parse result
`ParsedTripDraft` is provisional.
May include:
- interpreted entities
- confidence
- unresolved semantics
- provenance
- validation findings
- preserved references
Must not be treated as confirmed truth.

The provider-neutral `SemanticInterpretationResult` is required for both file and pasted input. It always contains:
- schema version
- matching source ID
- `draft | insufficient` status
- draft or explicit null
- structured findings
- complete source-block coverage accounting
- explicit unparsed-item list, including an empty list when none exist

Minimum gates:
- a schema-valid, coverage-complete response is required before any parse outcome is shown
- at least one supported trip/day structure and one linked itinerary entity are required for normal Review
- authoritative validation, confirmation, and persistence are required for Overview/Day

A numeric confidence percentage alone must not unlock Review, confirmation, or Result UI.
## 8. Review
Purpose:
> "I understood your itinerary this way. Is this correct?"
### Required actions
- edit date/time/title/type/note
- correct time precision where supported
- toggle optional/tentative/flexible
- correct place text
- delete false parser entity
- add missing entity
- confirm
### Required visibility
- source locator/evidence
- warnings
- ambiguity
- low confidence
- conflicts
- broken evidence
- preserved references
- unparsed source items and missing required structure
- user override identity

### Approved Review composition
- mobile shows the relevant source excerpt/locator before each material question or correction surface
- desktop uses a linked source/review split view
- focusing or hovering a Review finding highlights its source locator when the input surface supports it
- the source remains read-only
- automatically interpreted items may be summarized, but remain inspectable and editable before confirmation
- every supported viewport provides the same required correction capabilities; responsive composition may differ, field/action availability may not
- a user correction is visibly identified as user-authored in subsequent Review and Result detail where provenance is shown
### Must not become
- planner
- route optimizer
- recommendation editor
- drag/drop scheduler
- AI replan flow
## 9. User overrides
Any manual correction must remain identifiable as user-authored.
Reparse/resolution/enrichment must not overwrite it.
## 10. Confirmation
Preconditions:
- blocking validation resolved
- candidate CanonicalTrip passes authoritative validation
Transaction:
```text
validate candidate
→ persist candidate
→ update active trip
```
Persistence failure:
- do not replace active trip
- surface error
- retain candidate for safe recovery when possible

### Confirmation success
Only after authoritative validation and successful persistence may UI show a confirmed success state.

The success surface may summarize:
- trip identity
- day/entity count
- user-confirmed correction count

It must provide a direct action to open the confirmed trip and a secondary action back to Home/current trip management.

After a replacement import, both actions must resolve against the newly active trip. Returning Home must not show the confirmed candidate as pending or the replaced trip as active.
## 11. Canonical JSON portability
Purpose:
approved V0 portability path.
Import behavior:
- validate before activation
- invalid import does not replace active trip
- activation only after authoritative validation
Export behavior:
- export is an explicit user action
- export is available only when an active confirmed trip exists
- export is reachable from a visible action associated with the active trip, whether directly or through an explicit secondary menu
- export only the active, valid, confirmed CanonicalTrip
- preserve the Canonical schema version
- serialization failure surfaces an error and does not mutate active trip data
Canonical JSON excludes:
- provider keys and provider/model metadata
- raw source files or pasted source text
- UnifiedSourceDocument
- parser responses
- Review evidence
- live Runtime Data
## 12. Overview
Purpose:
pre-trip compression.
Must expose when available:
- trip identity
- date range
- geography/phases
- day index
- critical anchors
- readiness states
Day selection opens that Day.
Missing flight/hotel/reservation:
omit; do not fake placeholder content.
## 13. Day
Purpose:
primary travel-time reading surface in Generalized V0.
Must preserve:
- day/date identity
- event order
- time precision
- free time
- optional
- alternative/conditional relations when modeled
- source-provided transit
- reservation/readiness
- source links
- notes
- unresolved states
Must not:
- invent transit
- invent resolution
- invent exact time
- convert free time into task completion
## 14. External actions
When CanonicalTrip contains an exact source-provided URL:
- preserve exact URL
- open safely
- use safe rel attributes
If no valid link exists:
do not synthesize one unless an explicit fallback capability is defined.
## 15. Golden Viewer compatibility
Do not regress the current checked-in Osaka viewer where the clean-start branch continues to expose it.
No discarded-branch behavior is an inherited requirement.
Viewer-specific capability may include:
- Today
- checklist
- reservations
- directions
- runtime prototypes
Compatibility ≠ generalized scope.

Generalized V0 production navigation must not expose Today or other runtime-only destinations when those capabilities are unavailable. A design/prototype may display them only when clearly identified as Golden Viewer/later-track material.
## 16. Runtime failure
If runtime-derived data is unavailable:
- Overview remains usable
- Day remains usable
- unsupported NOW/NEXT/leave-by omitted
- no stale/guessed replacement
## 17. Persistence scopes
Clear actions must be explicit:
- trip data
- provider key
- all local data
Rules:
- clearing trip does not silently clear keys
- clearing key does not delete confirmed trip
## 18. Failure matrix
| Failure | Required outcome |
|---|---|
| invalid source input | active trip unchanged |
| extraction failure | error + retry/replace |
| provider failure | active trip unchanged |
| malformed model output | parse failure + retry |
| valid response below Reviewable Draft gate | list missing/unparsed items + bounded recovery |
| reviewable draft with non-blocking unparsed content | explicit Review findings; no silent omission |
| validation error | Review/blocking state |
| confirm validation fail | no activation |
| persistence failure | old trip preserved |
| Canonical JSON export failure | active trip unchanged; error surfaced |
| stale async response | ignored |
| runtime API failure | static trip preserved |
| invalid persisted trip | no Viewer entry; recovery path |
## 19. V0 functional acceptance
V0 is functionally complete when:
- unfamiliar Markdown reaches Review
- Markdown can be provided through either a real file-input path or a real pasted-text input path
- both input modes satisfy one required normalized input schema and one provider-neutral response schema
- every source block is accounted for and every unparsed item is explicitly listed with locator + reason
- structurally insufficient input receives a bounded recovery response instead of an invented draft
- material ambiguity is visible
- parser mistakes can be corrected through the full required action set on mobile and desktop
- confirmation creates valid CanonicalTrip
- confirmed CanonicalTrip can be imported and exported without including excluded data
- required secondary Home capabilities are visibly reachable
- replacement is transactional and successful replacement leaves one consistent active-trip state across Home, success, Overview, and Day
- Overview/Day render from CanonicalTrip only
- source precision/flexible semantics survive
- failure never destroys a previously confirmed trip
