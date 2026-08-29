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

## 1.2 Parser model and browser BYOK boundary

- Model: `gpt-5.6-sol` through the OpenAI Responses API, with reasoning effort `high`. It supports image input and Structured Outputs and is the user-selected quality-first model for mixed itinerary extraction.
- Delivery boundary: static browser application only. No Cloudflare Worker, parser server, shared provider credential, server-side environment variable, or parser deployment unit is used.
- AI Travel reference: follow its explicit API-key input, missing-key guard, browser-local persistence, and direct provider request pattern; do not copy its provider-specific URL/query-key transport.
- Storage: AES-GCM ciphertext is stored under `trip-runtime-openai-api-key` in `localStorage`; a non-extractable AES wrapping key is stored in the `trip-runtime-secrets` IndexedDB database. The value is masked in the UI and both records are removed through an explicit clear-key or clear-all-local-data action.
- Provider endpoint: `https://api.openai.com/v1/responses`; the key is sent in the `Authorization: Bearer` header and never in a URL.
- Response persistence: every request sets `store: false`. This does not promise OpenAI Zero Data Retention; OpenAI processing remains subject to the traveler's OpenAI project/account data controls.
- Risk disclosure: encryption protects against casual/plaintext `localStorage` inspection but not same-origin malicious JavaScript that can invoke the application's decrypt path. The UI warns about scripts, extensions, or an origin compromise and recommends a restricted project key with spend limits.
- Key exclusions: never include the key in CanonicalTrip, CanonicalExport, ReviewSession, logs, analytics, errors, URLs, screenshots, or source fixtures.

## 1.3 V0 limits and format matrix

Limits are intentionally conservative for a one-file, one-request V0:

| Limit | Value |
| --- | ---: |
| Source file size | 10 MiB |
| PDF pages | 30 |
| Raster width or height | 8,192 px |
| Total raster pixels | 24 megapixels |
| Browser extraction timeout | 20 seconds |
| Browser parse deadline | 55 seconds |
| OpenAI request timeout | 45 seconds |
| Automatic retries | 1, only for timeout, 429, and 5xx with jitter |
| Structured request payload | 6 MiB after extraction/encoding |

Format expectations:

| Format | V0 level | Notes |
| --- | --- | --- |
| TXT, Markdown, CSV | Supported | Deterministic local extraction; semantic interpretation still requires Review. |
| XLSX | Supported for fixtures | Row timelines and calendar grids; formulas/macros are never executed. |
| DOCX | Supported for fixtures | Headings, paragraphs, tables, order, and links. |
| Readable text PDF | Supported for fixtures | Text, position, page, and link evidence. |
| Visual/scan PDF | Best effort | May require visual processing or stop with a quality warning. |
| JPG, JPEG, PNG | Best effort | Detailed itineraries, calendars, and mind maps may require substantial Review. |
| Encrypted, corrupt, macro-bearing, or over-limit input | Unsupported | Rejected before semantic parsing. |

## 1.4 Interrupted ReviewSession and privacy

- Policy: privacy-first, memory-only ReviewSession. An interrupted ReviewSession is discarded on reload, navigation away, or tab close and requires re-upload.
- No source bytes, UnifiedSourceDocument, excerpts, visual payloads, model responses, or confidence evidence are written to `localStorage`, IndexedDB, analytics, endpoint logs, or application backend storage.
- Confirmation projects an allowlisted CanonicalTrip, persists only confirmed facts/overrides/checklist state, and releases the ReviewSession references.
- Cancellation clears active references and aborts in-flight extraction/parse work where possible. A stale response is ignored by request identity.
- Pre-transmission disclosure: “Your file is sent directly from this browser to OpenAI using your personal API key. Trip Runtime does not retain the file or model response. This unfinished review is kept only in this tab and is discarded if you reload or close it.”
- The clear action removes all repository-owned canonical trip, override, checklist, migration, and any future review-remnant keys.

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
