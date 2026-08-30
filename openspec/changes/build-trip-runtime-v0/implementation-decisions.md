# V0 Implementation Decisions

## 1.1 Osaka viewer baseline (2026-08-29)

- Baseline environment: Vite 7.3.6 production build, Chromium through the Codex in-app browser.
- Mobile viewport: 390 x 844. Overview, Today, Day, Reservations, the sticky Date Rail, and bottom navigation rendered through one component tree.
- Desktop viewport: 1440 x 1000. Overview and Date Rail rendered without responsive overflow or missing content.
- Before-trip Today state used Japan date `2026-08-29`, showed `12 days to go` and JX822 as the next confirmed event, and did not show a fake `NOW`.
- Day view preserved the exact/flexible labels, directions, Tabelog link, and transit treatment for 2026-09-10.
- Reservations baseline was 5/6 checked. USJ began pending; checking it immediately changed the linked reservation to `Ticket ready`, survived reload via `osaka-trip-todos`, and was then restored to unchecked for the baseline browser.
- Browser console: no warnings or errors at either viewport.
- Production build: passed. Initial assets were 431.45 kB JS (135.77 kB gzip) and 88.59 kB CSS (14.31 kB gzip).
- `git diff --check`: passed before implementation edits.

## 1.2 Parser models and browser BYOK boundary

- Delivery boundary: static browser application only. No Cloudflare Worker, parser server, shared provider credential, server-side environment variable, or parser deployment unit is used.
- Providers: the user selects one of two concrete adapters, OpenAI or Gemini. A small explicit dispatch boundary is allowed; a generic provider registry, plugin system, factory hierarchy, or provider-specific canonical schema is not.
- Shared contract: both adapters use the same application-controlled conservative parser instruction, structured ParsedTripDraft semantics, Zod validation, deterministic findings, Review, and CanonicalTrip confirmation path. Provider/model/usage metadata remains transient workflow data.
- OpenAI model and transport: pinned `gpt-5.6-sol` with reasoning effort `high` through `https://api.openai.com/v1/responses`; the key is sent in the `Authorization: Bearer` header and every request sets `store: false`.
- Gemini model and transport: pinned `gemini-3.7-flash` through `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent`; the key is sent only in the `x-goog-api-key` header, never as a URL query parameter, and structured JSON output is validated through the shared runtime schema.
- Model-change gate: either pinned model may change only after provider adapter tests, Parser Quality fixtures, and the unfamiliar-Markdown acceptance gate are rerun. V0 does not expose an arbitrary model-name field.
- AI Travel reference: follow its explicit API-key input, missing-key guard, provider selection, browser-local persistence, direct provider request pattern, and Google AI Studio key-creation link; do not copy its query-key transport or stale model identifiers.
- Storage: existing OpenAI AES-GCM ciphertext remains under `trip-runtime-openai-api-key`; Gemini ciphertext uses `trip-runtime-gemini-api-key`; last provider selection uses `trip-runtime-ai-provider`. Each credential has an isolated non-extractable AES wrapping-key record in the `trip-runtime-secrets` IndexedDB database. Values are masked in the UI and removed only through the matching provider clear action or an explicitly broader clear-all-local-data action.
- Key isolation: decrypt only the selected provider's credential for its own request. A missing selected-provider key blocks transmission even when the other provider has a stored key. Never copy or fall back between credentials.
- Data controls: `store: false` does not promise OpenAI Zero Data Retention, and direct Gemini processing likewise remains subject to the traveler's provider account and data controls. Home shows provider-specific disclosure before transmission.
- Risk disclosure: encryption protects against casual/plaintext `localStorage` inspection but not same-origin malicious JavaScript that can invoke the application's decrypt path. The UI warns about scripts, extensions, or an origin compromise and recommends restricted credentials and spend controls where supported.
- Key exclusions: never include either key in CanonicalTrip, CanonicalExport, ReviewSession, logs, analytics, errors, URLs, screenshots, source fixtures, or model responses.
- Cross-computer behavior: Canonical JSON is the V0 trip-portability mechanism. Provider keys remain browser/device-local and must be supplied independently on each computer.

## 1.3 V0 limits and deferred-format boundary

Limits are intentionally conservative for a one-Markdown-file, one-request V0. PDF and raster limits below are retained as later research inputs, not commitments in this change:

| Limit | Value |
| --- | ---: |
| Source file size | 10 MiB |
| PDF pages | 30 |
| Raster width or height | 8,192 px |
| Total raster pixels | 24 megapixels |
| Browser extraction timeout | 20 seconds |
| Browser parse deadline | 55 seconds |
| Provider request timeout | 45 seconds |
| Automatic retries | 1, only for timeout, 429, and 5xx with jitter |
| Structured request payload | 6 MiB after extraction/encoding |

Format expectations:

| Format | V0 level | Notes |
| --- | --- | --- |
| Markdown | Supported | Deterministic local extraction; semantic interpretation still requires Review. |
| XLSX | Deferred to the post-Hosted V0.2 narrow slice | The next source change targets only one/few-sheet travel tables, not universal spreadsheet understanding. |
| TXT, CSV, DOCX, PDF, JPG, JPEG, PNG, mind maps, advanced spreadsheets | Deferred to later evidence-driven changes | Research evidence informs the model, but no extractor ships in this change. |
| Empty, unreadable, corrupt, or over-limit Markdown | Unsupported | Rejected before semantic parsing. |

## 1.4 Interrupted ReviewSession and privacy

- Policy: privacy-first, memory-only ReviewSession. An interrupted ReviewSession is discarded on reload, navigation away, or tab close and requires re-upload.
- No source bytes, UnifiedSourceDocument, excerpts, visual payloads, model responses, or confidence evidence are written to `localStorage`, IndexedDB, analytics, endpoint logs, or application backend storage.
- Confirmation projects an allowlisted CanonicalTrip, persists only confirmed facts/overrides/checklist state, and releases the ReviewSession references.
- Cancellation clears active references and aborts in-flight extraction/parse work where possible. A stale response is ignored by request identity.
- Pre-transmission disclosure identifies the selected OpenAI or Gemini provider: “Your file is sent directly from this browser to [provider] using your personal API key. Trip Runtime does not retain the file or model response. This unfinished review is kept only in this tab and is discarded if you reload or close it.”
- The trip-data clear action removes canonical trip, override, checklist, trip-migration, and any future review-remnant records and returns to Home without silently removing provider keys. Provider-key and clear-all actions state their separate scopes before confirmation.

## 1.5 JavaScript schema and test foundation

- Runtime schemas: Zod, kept at external, parsing, persistence, and import/export boundaries.
- Unit/integration runner: Vitest in jsdom.
- Component and interaction tests: Testing Library React plus user-event.
- Browser acceptance: the in-app Chromium browser at 390 x 844 and 1440 x 1000, including console inspection.
- Scripts: `npm test` for deterministic CI runs and `npm run test:watch` for local iteration.
- The application remains JavaScript with JSDoc types; no TypeScript migration, global state library, or workflow framework is introduced.

## Sources for the model/host decision

- OpenAI model comparison: https://developers.openai.com/api/docs/models/compare
- OpenAI Responses API: https://developers.openai.com/api/reference/cli/resources/responses/methods/create
- OpenAI API authentication: https://developers.openai.com/api/reference/overview
- Gemini models: https://ai.google.dev/gemini-api/docs/models
- Gemini Structured Outputs: https://ai.google.dev/gemini-api/docs/structured-output?lang=rest
- Gemini GenerateContent API: https://ai.google.dev/api/generate-content

## 2.8 Canonical Osaka viewer verification (2026-08-30)

- The Osaka source now passes the versioned CanonicalTrip runtime schema and is projected into the existing viewer through selectors.
- Mobile 390 x 844 and desktop 1440 x 1000 retained Overview, Date Rail, day content, exact source links, optional sections, and responsive navigation with no browser-console errors.
- Checklist state migrated from `osaka-trip-todos` to the trip-scoped key while keeping the legacy key synchronized; the linked USJ reservation survived reload.
- Automated suite: 22 tests passed. Production build passed.
- Initial production JavaScript is 520.27 kB (160.95 kB gzip), up from 431.45 kB (135.77 kB gzip) because Zod is now on the canonical validation path. The dedicated bundle-hardening task will assess whether schema loading should be split without weakening boundary validation.

## 2.9 Roadmap and stranger-acceptance gate (2026-08-30)

- V0 is the Understand + Trust layer: Source -> UnifiedSourceDocument -> ParsedTripDraft -> evidence-backed Review -> Confirmed CanonicalTrip.
- The actual unfamiliar Markdown is a hard acceptance gate, not a later roadmap item. Before Hosted implementation, the pre-Review draft has zero missing or invented critical events, zero unsupported exact critical facts, and surfaces every fixture-annotated ambiguity.
- Sanitized fixtures retain draft, findings, corrections, and confirmed output so Parser Quality is distinguishable from Review Recovery Quality. Production ReviewSession evidence remains memory-only and is never retained for benchmarking.
- Hosted Delivery is the next independent change, `hosted-trip-delivery-lite`; this change adds no hosted URL, publication, recovery, expiry, account, or server task.
- After Hosted Delivery, the first structured-format slice is a narrow Spreadsheet Travel Table change. Calendar grids, formula-heavy models, cross-sheet reconciliation, and operational workbooks remain later evidence-driven work.

## 3.7 Home/Viewer entry and replacement behavior (2026-08-30)

- No persisted confirmed CanonicalTrip: show Home with OpenAI/Gemini selection, selected-provider key controls, Markdown upload, canonical JSON import, format/privacy guidance, and a reserved optional-form area with no invented required fields.
- Persisted confirmed CanonicalTrip: open the existing Viewer directly. Reading a confirmed trip never depends on provider selection or key availability.
- Bundled Osaka fixture: retain it as an explicit sample/fallback action, not an implicit active trip that bypasses Home.
- Replacement: opening Home/import from Viewer leaves the current trip active in storage. Validation, extraction, provider failure, cancellation, stale response, or abandoned Review cannot overwrite it.
- Confirmation: save a renderable reviewed candidate atomically, then switch Viewer to the new active trip.
- Clearing: trip-data clear returns to Home and leaves provider credentials alone; provider-specific clear removes only that credential; clear-all may remove both trips and credentials after explicit scope disclosure.
