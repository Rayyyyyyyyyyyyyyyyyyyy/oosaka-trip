# AGENTS.md

## Project purpose

This repository contains the personal live trip viewer for User #0001's real trip to Osaka, Uji, and Nara from 2026-09-10 through 2026-09-15. That viewer is also the Golden Result used to validate the Markdown-to-runtime V0 pipeline.

The user will rely on this site while traveling. Treat correctness and graceful fallback as more important than demo impact. This is not an AI trip planner, a generic SaaS, or a fictional prototype. Pipeline work must preserve the Osaka viewer as a reliable fallback.

The product promise for this repository is:

> Show the traveler what they actually need to know now, without forcing them to reopen the source Markdown.

## Current scope

Build and maintain the personal viewer and the explicitly approved Markdown V0 pipeline:

- Pre-trip overview and countdown
- Today view based on real Japan time
- Daily itinerary timeline
- Flights, hotel, reservations, and tickets
- Interactive pre-trip checklist
- Google Maps and Tabelog links
- Mobile-first travel-day usability
- One Markdown source upload at a time
- Structure-preserving Markdown extraction
- Conservative AI parsing, deterministic validation, and focused review
- Browser-local confirmed trip persistence and canonical JSON portability
- A Home-first setup flow for AI provider/key selection, Markdown upload, canonical JSON import, format guidance, privacy notices, and a reserved optional-form area
- Personal browser-local OpenAI and Gemini API key controls for direct parsing requests

Hosted delivery is planned separately in `openspec/changes/hosted-trip-delivery-lite/` and MUST NOT be implemented until External Markdown Benchmark #001 passes its acceptance gate. V0.2 is limited to a narrow Spreadsheet Travel Table slice; advanced spreadsheets, DOCX, PDF, screenshots, and mind maps remain later evidence-driven work. Do not add accounts, email recovery, cross-device ownership/editing, permanent hosted retention, recommendations, expenses, packing, social features, booking, or automatic replanning unless the user explicitly asks.

## Roadmap and change gates

The decided roadmap is:

```text
V0    Understand + Trust
      Source -> UnifiedSourceDocument -> Semantic Interpreter
      -> ParsedTripDraft -> deterministic validation -> evidence-backed Review
      -> Confirmed CanonicalTrip -> External Markdown Benchmark #001 gate

V0.1  Deliver
      CanonicalTrip -> PublishedTripSnapshot
      -> TripPublication -> read-only unlisted Viewer

V0.2  Spreadsheet Travel Table
      narrow one/few-sheet XLSX extraction
      -> the same Draft / Review / Canonical pipeline

Later Advanced spreadsheets and structured/visual sources

Only with evidence
      Account / cross-device ownership / multi-trip / billing
```

Current research state:

```text
Formal input samples                  25
External Markdown benchmarks           1
Response reference pairs               1
Cross-format semantic saturation       approaching, not declared
Markdown V0 evidence boundary          sufficient to implement
```

## Source-to-UI architecture invariants

Treat the current product architecture as:

```text
Source
→ source-specific extraction / reconstruction
→ UnifiedSourceDocument
→ Semantic Interpreter
→ ParsedTripDraft
→ deterministic validation
→ Review
→ Confirmed CanonicalTrip
→ Presentation Projection
→ source-agnostic Result UI
```

Architecture mantra:

> **Code reads the source. LLM understands the intent. Code verifies the result. User confirms the truth. Renderer presents it.**

`Semantic Interpreter` is the boundary between source-level evidence and `ParsedTripDraft`. It may be implemented with:

```text
Semantic Interpreter
├─ deterministic rules
├─ LLM
└─ hybrid
```

The LLM is one implementation of the Semantic Interpreter, not the whole Parser or pipeline.

Rules:

- A new input format should normally add or extend a Source Adapter, not create a new Renderer path.
- Do not flatten every source to plain text before interpretation. Preserve structural signals that carry intent, such as spreadsheet row/column/merge relationships, PDF/visual grouping, Markdown structure, and mind-map hierarchy.
- Source Adapters read and reconstruct source evidence into `UnifiedSourceDocument`; they do not decide confirmed trip truth.
- Semantic Interpreter implementations consume `UnifiedSourceDocument` and produce `ParsedTripDraft`; an LLM implementation must not bypass this boundary by becoming a file reader, validator, reviewer, or Renderer.
- Deterministic validation owns schema, date, time, rollover, trip-range, duplicate, impossible-sequence, and logical-conflict checks. Review and confirmation own the user's final truth.
- Source-specific logic belongs in extraction / reconstruction. Do not leak source-type branching through CanonicalTrip into Result components.
- Renderer and Presentation Projection MUST NOT read raw Markdown, workbook objects, PDF page objects, extracted blocks, or UnifiedSourceDocument.
- Result UI templates are selected by travel semantics and runtime state, not by file format.
- CanonicalTrip describes what the trip means. Presentation Projection describes how confirmed semantics are presented. UI-only fields MUST NOT be written back into CanonicalTrip.

Sample #23 is `External Markdown Benchmark #001` and is the current Markdown acceptance fixture.

Sample #24 is `Busan.xlsx`. It is also paired with an independently created mobile Web result:

```text
Busan.xlsx
→ https://bbmddt.github.io/busan-travel/
```

That pair is tracked separately as `Response Reference Pair #001`. Input semantics belong in Input Research; source-to-result rendering evidence belongs in Response Page Research. Do not count the Result Web as another input sample.

`build-trip-runtime-v0` MUST end at a locally confirmed and renderable CanonicalTrip. Do not add `PublishedTripSnapshot`, `TripPublication`, hosted URL, recovery, expiry, account, or server implementation tasks to that change.

Before any Hosted Delivery implementation begins, External Markdown Benchmark #001 (Sample #23, the first unfamiliar user-authored Markdown fixture) MUST demonstrate:

- Zero missing critical events in the original pre-Review draft.
- Zero invented critical events in the original pre-Review draft.
- Zero unsupported exact critical dates, times, or places.
- Every fixture-annotated ambiguity is surfaced for Review.
- The corrected CanonicalTrip passes runtime validation and renders through the existing viewer.

Sanitized benchmark fixtures may retain separate ParsedTripDraft, findings, corrections, and Confirmed CanonicalTrip artifacts so Parser Quality can be distinguished from Review Recovery Quality. Real production ReviewSession data remains memory-only and MUST NOT be retained as benchmark material.

## Hosted Delivery invariants

For `hosted-trip-delivery-lite`:

- `CanonicalTrip` is the confirmed editable truth in the owner's browser.
- `PublishedTripSnapshot` is an immutable, schema-versioned, viewer-safe payload.
- `TripPublication` controls only where, whether, and until when a trip is published. It MUST NOT contain title, dates, places, events, reservations, readiness, or viewer settings.
- Recovery verification belongs in a separate security record and only a one-way verifier is stored server-side.
- Publish projection MUST be a positive allowlist. Never serialize CanonicalTrip and remove private fields with a blacklist, and never assume CanonicalExport is safe to publish.
- Republish creates and validates a new snapshot, atomically swaps `currentSnapshotId`, and only then deletes the superseded snapshot. Lite retains no rollback history.
- The URL is unlisted, not authenticated or private. Anyone with the link can read it; there is no public listing or indexing.
- The hosted viewer is read-only. Published readiness is snapshot state for reservation, ticket, document, payment, or another trip dependency; it is not event completion and cannot be mutated through the viewer URL.
- Management uses a one-time copy/download recovery secret for republish, revoke, delete, and bounded expiry extension. Lite has no email recovery.
- Every publication has bounded expiry. Delete, revoke cleanup, or expiry cascades to its snapshot and credential data; Lite does not promise permanent retention.
- Hosted storage MUST NOT receive raw uploads, UnifiedSourceDocument blocks, source excerpts, ReviewSession evidence, parser responses, OpenAI or Gemini keys, or production parser benchmark artifacts.

## Technology

- React 19
- Vite 7
- Material UI for interactive components and accessibility behavior
- Tailwind CSS 4 for layout, spacing, responsive styling, and project design tokens
- Browser `localStorage` for personal checklist persistence
- Browser `localStorage` plus IndexedDB for explicitly approved local trip and personal API-key storage
- GitHub Pages deployment through `.github/workflows/pages.yml`

Prefer library and framework components over hand-built equivalents. Do not reintroduce a parallel handcrafted CSS component system.

## Entry flow and AI provider behavior

- When no persisted confirmed CanonicalTrip exists, the application opens a mobile-first Home page rather than treating the bundled Osaka fixture as the active trip.
- Home contains OpenAI/Gemini provider selection, the selected provider's personal API-key controls, one Markdown upload target, canonical JSON import, upload-format/privacy guidance, and space for future optional form fields. Do not invent required traveler fields before their purpose is approved.
- When a persisted confirmed CanonicalTrip exists, reload opens the existing itinerary Viewer directly. The selected provider and API key are parsing settings, not prerequisites for reading a confirmed trip.
- Starting a replacement import keeps the current confirmed trip intact. Cancellation, validation failure, extraction failure, or provider failure returns to that trip; only successful Review confirmation atomically replaces it.
- The bundled Osaka trip remains an explicit safe sample/fallback path, but its presence MUST NOT cause the application to bypass Home.
- OpenAI and Gemini use two concrete provider adapters behind one provider-neutral `parseTrip(request)` contract and the same ParsedTripDraft schema, deterministic validation, Review, and CanonicalTrip confirmation path. Do not add a plugin system or speculative provider registry.
- Each provider has an isolated encrypted browser-local credential and a provider-specific clear action. Preserve the existing encrypted OpenAI key during migration; never copy, share, or fall back from one provider's key to the other.
- OpenAI requests use bearer authentication and `store: false`. Gemini requests use the `x-goog-api-key` header; API keys MUST NOT appear in URLs. Provider/model selection and provider response metadata MUST NOT enter CanonicalTrip or CanonicalExport.
- Each provider uses one pinned, acceptance-tested structured-output model. Changing a pinned model requires rerunning parser-quality and External Markdown Benchmark #001 acceptance fixtures.
- Canonical JSON is the approved cross-computer portability path in V0. Browser-local API keys do not sync; each browser/device requires its own explicitly supplied key.
- Clearing trip data returns to Home without silently clearing provider keys. Clearing a provider key or all local data requires a separate explicit action whose scope is stated before confirmation.

## Documentation maintenance

The project documentation has been consolidated into fixed current filenames.

Do not create rolling files such as:

```text
02_INPUT_RESEARCH_v0.6.md
02_INPUT_RESEARCH_v0.7.md
```

Update the current document in place and use Git history for version history.

Current documentation roles:

```text
00_README.md                  documentation map / maintenance rules
01_CANONICAL_CONTEXT.md       product-level current truth
02_INPUT_RESEARCH.md          real-world source evidence
03_PIPELINE_SPEC.md           source-to-canonical pipeline
04_RESPONSE_PAGE_RESEARCH.md  source-to-result / Result UI evidence
05_V0_IMPLEMENTATION_PLAN.md  implementation order and acceptance gates
06_RESULT_UI_SPEC.md             Result UI grammar / visual-system working spec
```

Keep Input Research and Response Page Research separate. A source document can be an input sample while its existing rendered Web can form a response-reference pair.

## Source-of-truth files

Use these files as product and itinerary references:

- `temp/00_README.md`: current documentation map and maintenance rules
- `temp/01_CANONICAL_CONTEXT.md`: current product decisions, scope, roadmap, and validated / unvalidated assumptions
- `temp/02_INPUT_RESEARCH.md`: current real-world input evidence from 25 formal samples; the sample number is not a participant count, and the corresponding source files are under `temp/Odata/`
- `temp/03_PIPELINE_SPEC.md`: source-to-canonical pipeline principles
- `temp/04_RESPONSE_PAGE_RESEARCH.md`: current Source → Result / Response Page evidence; currently contains Response Reference Pair #001 (`Busan.xlsx` → Busan mobile Web)
- `temp/05_V0_IMPLEMENTATION_PLAN.md`: current implementation order, parser/review work, and acceptance gates
- `temp/06_RESULT_UI_SPEC.md`: current source-agnostic Result UI grammar and visual-system working draft; visual rules are not frozen until UI Skyline and Golden Screens are completed
- `temp/md-files/osaka_uji_nara_2026-09-10_to_09-15.md`: canonical human-readable itinerary for Golden Input #001
- `temp/md-files/trip_places_google_maps.md`: authoritative Google Maps URLs
- `temp/md-files/trip_runtime_result_ui_spec_v0.1.md`: historical result-view principles; later decisions in `01_CANONICAL_CONTEXT.md`, `04_RESPONSE_PAGE_RESEARCH.md`, and `06_RESULT_UI_SPEC.md` take precedence where they differ
- `temp/md-files/trip_runtime_end_to_end_flow_v0.1.md`: historical broader product context; later decisions in `01_CANONICAL_CONTEXT.md` take precedence
- `src/tripData.js`: structured runtime data consumed by the Osaka viewer
- `openspec/changes/build-trip-runtime-v0/`: active Markdown Understand + Trust implementation and External Markdown Benchmark #001 acceptance gate
- `openspec/changes/hosted-trip-delivery-lite/`: approved next-layer delivery proposal; planning is in scope, implementation is gated by External Markdown Benchmark #001 acceptance

When a map URL exists in `temp/md-files/trip_places_google_maps.md` or the canonical itinerary, store and use that exact URL. Do not reconstruct, normalize, or guess a different query in the UI.

## Current parser evidence

Markdown V0 must account for evidence from Sample #23:

- Markdown AST is structural evidence, not semantic truth.
- `A > B > C` may encode itinerary sequence rather than blockquote semantics.
- One source can mix `11:55`, `5.30`, `12點`, and `七點`.
- A partially structured entity such as a flight may be identifiable even when airline, flight number, airport pair, or row-level date is absent.
- Address-first places are valid unresolved places.
- Missing relative Markdown image assets must not fail the whole parse.
- One paragraph or line may contain multiple semantic units.
- Free Time and intentionally vague meals are first-class itinerary intent, not missing data.

Spreadsheet V0.2 / later evidence from Sample #24 adds:

- Open-ended time such as `18:30~` is valid and must normalize to a known start with unknown end.
- A parent activity can contain an internal timetable; venue programs must not automatically become top-level day events.
- Booking release rules such as “four weeks before, Tuesday 06:00” are not event times.
- Pass / ticket / reservation metadata may be structured alongside an event and must not collapse into one boolean.

Keep these distinctions in parser / validator behavior even if the first implementation stores some of them only as Preserve semantics.

## Runtime integrity

- All live date and time decisions must use `Asia/Tokyo`.
- Before the trip, Today shows countdown and the next confirmed event. It must not display a fake `NOW`.
- During 2026-09-10 through 2026-09-15, Today automatically selects the actual Japan date.
- After the trip, show a completed state while keeping the itinerary accessible.
- Refresh runtime state at least once per minute so an open page can cross time or date boundaries.
- Only label an event `NOW` when the source data supports that conclusion.
- If an event time is missing or described as flexible, say so. Never invent precision.
- Runtime/API failure must not make the static itinerary unusable.

## Checklist and reservation behavior

- Checklist state persists under the active trip-scoped browser key; the legacy `osaka-trip-todos` key is migrated and kept synchronized so existing Osaka state is not lost.
- Checklist items and reservation rows are linked by stable `todoId` values.
- Changing a checkbox must immediately update the corresponding reservation status.
- A checked item shows its confirmed/reserved/ready status.
- An unchecked item shows `Action needed` or its explicit pending status.
- USJ tickets default to unconfirmed until the user checks them.

## UI principles

- `06_RESULT_UI_SPEC.md` is currently a working draft, not a frozen visual system.
- Major Result UI visual decisions MUST follow: `Response Page Research -> UI Skyline / Visual Direction -> Golden Screens -> 06_RESULT_UI_SPEC refinement / freeze`.
- Do not let an agent invent a final typography, spacing, surface, color, or navigation system before Skyline / Golden Screen evidence exists.
- A source format MUST NOT determine Result UI appearance. Presentation is driven by Canonical semantics and runtime priority.
- Mobile first; assume the user is walking, standing on a train platform, or checking the phone one-handed.
- Prioritize Today, Now, Next, leave-by, directions, and reservations.
- Preserve flexible and optional travel. Do not turn leisure into task completion.
- Optional places belong under `IF YOU STILL HAVE ENERGY`, outside the main timeline.
- Transit is connective tissue between events, not a large event card.
- Use an editorial, Japanese-minimal, utility-focused visual style.
- Avoid dashboard density, travel SaaS gradients, excessive photography, and card-everything layouts.
- External map and restaurant links open in a new tab with safe `rel` attributes.
- Response Reference Pair #001 is an evidence-backed baseline for mobile webification: sticky day navigation, day themes, a narrow time column, secondary notes, reservation / Pass badges, and supporting-image appendices are useful patterns.
- Do not merely reproduce that static baseline. Trip Runtime must preserve Alternative / Conditional / Flexible semantics rather than flattening them into display strings.
- Hard runtime constraints such as “arrive by 16:00 for a 16:30 booking” should be eligible for NEXT / Leave-by treatment instead of remaining buried in notes.
- Supporting images, timetables, venue maps, and instructions may belong on a secondary surface rather than inside every event card.

## Development workflow

Install and run locally:

```sh
npm install
npm run dev
```

Before handing off any code change:

```sh
npm run build
git diff --check
```

Before handing off OpenSpec artifact changes, also run strict validation for every affected change, for example:

```sh
openspec validate build-trip-runtime-v0 --strict
openspec validate hosted-trip-delivery-lite --strict
```

For UI or interaction changes, verify the relevant flow in a browser at both a mobile breakpoint and a normal desktop viewport. Check the browser console for errors.

## Git and repository hygiene

- Do not commit `node_modules/` or `dist/`.
- Preserve user-authored changes and unrelated untracked directories.
- `.claude/`, `.codex/`, and `.idea/` are not part of the Trip Viewer unless the user explicitly places them in scope. `openspec/changes/build-trip-runtime-v0/` is in scope for the approved Markdown pipeline; `openspec/changes/hosted-trip-delivery-lite/` is in scope as a gated planning change.
- Do not commit or push unless the user asks.
- The deployment workflow must build with `npm ci` and `npm run build`, then publish `dist/`.

## Definition of done

A change is complete when:

- It reflects the real itinerary rather than demo assumptions.
- The traveler can understand the key information quickly on mobile.
- Interactive state is consistent across related UI surfaces and survives reload when expected.
- Exact source-provided links and statuses are preserved.
- The production build passes.
- The changed interaction has been verified in the browser.
- Parser changes that can affect Markdown interpretation have been checked against External Markdown Benchmark #001 and its annotated ambiguities.
- Result rendering changes must not regress the semantic distinctions identified in Input Research merely to match a prettier static response-page baseline.
