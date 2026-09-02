# Upload / Paste Intake Schema Decision

> Status: Candidate contract
> Updated: 2026-09-02
> Scope: Source intake only. This document does not define CanonicalTrip or interpretation output.

## 1. Product decision

The intake surface accepts:

```text
Upload: one .md, .pdf, or .xlsx file
Paste: any non-empty text
```

`Excel` currently means modern `.xlsx` only. Legacy `.xls`, CSV, images, HTML, folders, and ZIP bundles are not accepted.

Paste does not require Markdown syntax. Markdown-like structure, when present, remains useful extraction evidence, but plain prose and shorthand are valid intake candidates.

## 2. Two different validation questions

The system must not confuse "accepted as input" with "sufficient to build a trip draft."

```text
Gate A — Intake validity
→ Is the envelope valid, supported, readable, non-empty, and within configured limits?

Gate B — Reviewable trip minimum
→ Did extraction and interpretation produce enough supported trip structure for Review?
```

Any non-empty pasted text can pass Gate A. It passes Gate B only when interpretation produces:

- at least one supported trip/day structure;
- at least one itinerary entity linked to that structure;
- required identity, semantic type, source reference, and explicit time precision for every entity;
- complete source-block accounting as interpreted, supporting, or explicitly unparsed.

If Gate A passes and Gate B fails, return an explicit insufficient result with missing requirements and unparsed items. Do not invent dates, day order, places, or events to cross the gate.

## 3. Contract layering

Do not force binary PDF/XLSX bytes into `TextSourceInput` or encode them as base64 in the intake JSON.

```text
Browser input
→ SourceIntakeInput
→ source-format dispatcher
   ├─ markdown upload → decode → TextSourceInput v2 → Markdown Adapter
   ├─ pasted text ─────────────→ TextSourceInput v2 → Text Adapter
   ├─ PDF session blob ─────────────────────────────→ PDF Adapter
   └─ XLSX session blob ────────────────────────────→ Spreadsheet Adapter
→ Unified source representation
→ interpretation
→ Reviewable-trip minimum gate
```

Machine-readable contracts:

- [`source-intake-input.v1.schema.json`](./source-intake-input.v1.schema.json)
- [`text-source-input.v2.schema.json`](./text-source-input.v2.schema.json)
- [`text-source-input.v1.schema.json`](./text-source-input.v1.schema.json) is the earlier Markdown-only candidate and is superseded for new paste behavior.

## 4. `SourceIntakeInput v1`

All variants contain:

```json
{
  "schema_version": "source-intake-input.v1",
  "source_id": "...",
  "input_mode": "...",
  "source_format": "...",
  "media_type": "...",
  "display_name": "...",
  "payload": {}
}
```

Accepted variants:

| User action | `input_mode` | `source_format` | Normalized `media_type` | Payload |
|---|---|---|---|---|
| Upload `.md` | `file_upload` | `markdown` | `text/markdown` | session blob reference |
| Upload `.pdf` | `file_upload` | `pdf` | `application/pdf` | session blob reference |
| Upload `.xlsx` | `file_upload` | `xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | session blob reference |
| Paste any text | `pasted_text` | `text` | `text/plain` | inline text |

File payload:

```json
{
  "kind": "session_blob",
  "blob_id": "blob_session_01",
  "byte_length": 2048
}
```

Paste payload:

```json
{
  "kind": "inline_text",
  "content": "第一天抵達，下午自由活動。"
}
```

`blob_id` is an opaque, session-scoped reference. It is not a filesystem path, public URL, or durable storage identifier.

## 5. `TextSourceInput v2`

Markdown uploads and pasted text both become normalized text after intake, but retain their source authority:

```json
{
  "schema_version": "text-source-input.v2",
  "source_id": "...",
  "input_mode": "markdown_file | pasted_text",
  "media_type": "text/markdown | text/plain",
  "content": "...",
  "display_name": "..."
}
```

Rules:

- `markdown_file` must pair with `text/markdown`.
- `pasted_text` must pair with `text/plain`.
- `content` must contain at least one non-whitespace code point.
- Markdown syntax is optional for `pasted_text`.
- Preserve the full normalized text; do not infer or delete itinerary facts at intake.
- A user-visible paste label may be generated, but never infer it from destinations, dates, or participant names in the content.

## 6. Normalization

### Uploaded Markdown

1. Accept one `.md` file.
2. Verify the normalized media type and file signature/content are consistent enough for the supported policy.
3. Decode as UTF-8; optionally remove a UTF-8 BOM.
4. Normalize `CRLF` and bare `CR` to `LF`.
5. Reject empty/whitespace-only content.
6. Preserve meaningful line whitespace and source order.
7. Emit `TextSourceInput v2` and deterministic one-based line/block locators.

### Pasted text

1. Accept any submitted text syntax.
2. Normalize newlines in the same way as uploaded Markdown.
3. Reject empty/whitespace-only content.
4. Preserve all remaining text and ordering.
5. Emit `TextSourceInput v2` with `pasted_text` and `text/plain`.
6. Let extraction/interpretation decide whether Markdown signals exist and whether the reviewable-trip gate passes.

### PDF

1. Accept one `.pdf` file and normalize to `application/pdf` only after validation.
2. Keep raw bytes session-scoped behind `blob_id`.
3. Reject unreadable, corrupt, unsupported encrypted, or configured-size-violating files explicitly.
4. The PDF Adapter must preserve page identity, text blocks, reading-order evidence, and relevant asset/layout relations.
5. Image-only PDFs require an explicit OCR/reconstruction capability; intake acceptance must not pretend extraction succeeded.

### XLSX

1. Accept one `.xlsx` OOXML workbook and normalize to the official XLSX media type only after validation.
2. Keep raw bytes session-scoped behind `blob_id`.
3. Reject corrupt packages, missing workbook structure, or configured-size-violating files explicitly.
4. The Spreadsheet Adapter must preserve sheet identity, cells, rows/columns, merges, blanks, formulas/results, links, and relevant drawings/assets.
5. Spreadsheet layout is structural evidence, not direct itinerary semantics.

## 7. Validation and failure codes

| Code | Condition |
|---|---|
| `UNSUPPORTED_MEDIA_TYPE` | Upload is not Markdown, PDF, or XLSX. |
| `FILE_EXTENSION_TYPE_MISMATCH` | Filename extension, detected structure, and normalized media type conflict. |
| `MULTIPLE_FILES_NOT_ALLOWED` | More than one file is supplied. |
| `EMPTY_CONTENT` | Markdown or pasted text is empty/whitespace-only. |
| `EMPTY_FILE` | Uploaded binary file has zero bytes. |
| `UNREADABLE_SOURCE` | Browser/session bytes cannot be read. |
| `INVALID_TEXT_ENCODING` | Uploaded Markdown cannot be decoded under the supported UTF-8 policy. |
| `CORRUPT_PDF` | PDF structure cannot be read safely. |
| `UNSUPPORTED_ENCRYPTED_PDF` | PDF requires an unsupported password/decryption flow. |
| `CORRUPT_XLSX` | OOXML package/workbook structure is invalid. |
| `SOURCE_SIZE_LIMIT_EXCEEDED` | Configured file or paste limit is exceeded. |
| `SCHEMA_VERSION_UNSUPPORTED` | Intake envelope version is unknown. |
| `INSUFFICIENT_TRIP_STRUCTURE` | Intake is valid, but interpretation does not satisfy the Reviewable Trip gate. |

An intake or extraction failure must not activate a partial candidate or replace an existing confirmed trip.

## 8. Security, privacy, and provenance

- Raw bytes, pasted text, decoded text, reconstructed blocks, source excerpts, provider responses, and Review evidence are session-scoped by default.
- Never use `display_name` or `blob_id` as a filesystem path.
- Do not log raw content, filenames, source URLs, excerpts, or provider payloads.
- Do not execute PDF actions, spreadsheet macros, formulas, HTML, or JavaScript during intake.
- Do not fetch links or remote assets during source intake.
- Formula text and cached results may be preserved as evidence, but formulas must never execute in the ingestion environment.
- Durable trip output may retain only the minimum stable provenance required for traceability; raw sources and full excerpts remain session evidence.
- If content is sent to an external semantic provider, the UI must disclose that accurately.

## 9. Evidence versus decision

The currently retained Odata evidence includes:

- one structurally rich Markdown itinerary: [`我的最初行程表.md`](<./Odata/00 我/我的最初行程表.md>);
- one generated Busan HTML/JavaScript/assets result bundle, which remains unsupported as input.

The current Odata files directly support loss-minimizing Markdown/text handling and show why HTML bundles require a separate security boundary. They do not currently provide retained PDF/XLSX fixtures.

PDF and XLSX upload support in this document is therefore an explicit product decision made on 2026-09-02, not a conclusion proven by the currently retained Odata corpus. Adapter correctness still requires representative PDF/XLSX fixtures and acceptance tests.

## 10. Decisions still open

1. File and pasted-text byte/code-point limits.
2. Whether password-protected PDFs are always rejected or can enter a local unlock flow.
3. PDF OCR policy and confidence/review treatment.
4. XLSX formula cached-value policy and workbook resource limits.
5. Exact PDF/XLSX benchmark fixtures and pass gates.
6. Deterministic block/locator algorithms per adapter.
7. Session deletion timing and external-provider disclosure copy.
8. Whether `.markdown` joins `.md` later.
9. Whether legacy `.xls` is ever supported; it is excluded from the current contract.
