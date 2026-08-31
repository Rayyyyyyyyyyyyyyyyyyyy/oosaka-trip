## Context

`build-trip-runtime-v0` produces a confirmed, browser-local CanonicalTrip after extraction, parsing, deterministic validation, evidence-backed Review, and the External Markdown Benchmark #001 acceptance gate. The Osaka Golden Result already proves that the viewer can be hosted through GitHub Pages, but the generic pipeline has no safe, automatic way to turn another traveler's confirmed trip into a stable mobile endpoint.

Hosted Delivery Lite is the delivery layer, not the persistence/account layer. It introduces a minimal hosted API and durable publication store while retaining the existing viewer, keeping original sources and ReviewSession data out of hosting, and avoiding identity, email, permanent storage, and cross-device editing. Implementation MUST NOT begin until the active Markdown change passes its gate: valid/renderable canonical output, zero missing or invented critical events before Review, zero unsupported exact critical facts, and every fixture-annotated ambiguity surfaced for Review.

## Goals / Non-Goals

**Goals:**

- Positively project a confirmed CanonicalTrip into an immutable, viewer-safe, schema-versioned snapshot.
- Give one publication a stable unlisted slug while explicit republish atomically changes its current snapshot.
- Keep publication lifecycle metadata separate from published trip content.
- Provide read-only mobile delivery through the same viewer components.
- Let a holder of a one-time recovery secret republish, revoke, delete, or extend expiry within configured bounds.
- Expire and delete hosted travel data by default, including every related record.
- Keep published readiness distinct from event completion and immutable until explicit republish.

**Non-Goals:**

- Accounts, email identity or recovery, cross-device ownership, multi-trip dashboards, collaboration, roles, or authenticated viewer access.
- Permanent URLs, public discovery, search indexing, social sharing features, or publication analytics.
- Server-side parsing, source upload retention, ReviewSession retention, parser benchmarking, or platform OpenAI credentials.
- Mutable checklist/readiness state through the unlisted viewer.
- Publication history, rollback, or retention of superseded Lite snapshots.
- Spreadsheet, PDF, image, or other new source ingestion.

## Decisions

### 1. Keep the current Markdown change as a hard prerequisite

Hosted Delivery is designed now but implemented only after `build-trip-runtime-v0` passes External Markdown Benchmark #001. The parser benchmark keeps sanitized, annotated test artifacts for the original ParsedTripDraft, findings, user corrections, and confirmed CanonicalTrip so parser quality can be measured separately from Review recovery quality. Production ReviewSession data remains memory-only and is never retained for benchmarking.

Alternative considered: add Hosted tasks to the active Markdown change. Rejected because it would allow delivery work to leave parsing or trust incomplete and would blur two independently testable capabilities.

### 2. Separate truth, payload, and lifecycle

The hosted model has three responsibilities:

```text
CanonicalTrip
= confirmed editable truth in the owner browser

PublishedTripSnapshot
= immutable allowlisted viewer payload

TripPublication
= where / whether / until when the snapshot is available
```

`TripPublication` contains only `id`, `slug`, `currentSnapshotId`, `status`, `publishedAt`, and `expiresAt`. It MUST NOT duplicate trip title, dates, places, readiness, or viewer settings. Recovery verification data belongs to a separate `PublicationCredential` security record rather than turning the publication into a content or identity container.

Alternative considered: store the viewer payload directly on the publication. Rejected because republish would create two mutable truths and make atomic replacement, privacy review, and lifecycle behavior harder to reason about.

### 3. Use a dedicated positive publish projection

`createPublishedTripSnapshot(canonicalTrip, readinessState)` constructs every allowed field explicitly. It may reuse small projection helpers with CanonicalExport, but it has a separate schema and contract. The snapshot includes only the viewer-required trip header, dates/timezone, days, viewer-safe events and transit, Alternative/Conditional/Flexible relationships, exact allowlisted directions and restaurant links, reservation/resource distinctions, source-derived arrival/leave-by constraints, and an allowlisted `TripReadinessItem` projection captured at publish time.

The projection excludes provenance, source locators or excerpts, user override history, parser/provider data, findings, ReviewSession data, browser keys, management credentials, private notes, internal owner metadata, and fields unknown to the snapshot schema. Future CanonicalTrip fields remain private until explicitly added to the positive projection and reviewed.

Alternative considered: serialize CanonicalTrip and remove private fields with a blacklist. Rejected because new canonical fields could leak automatically when an exclusion is missed.

### 4. Make publish and republish atomic

Initial publish creates and validates a snapshot, creates the publication and credential records, and returns the unlisted viewer URL plus a one-time recovery secret. Republish creates and validates a new immutable snapshot before atomically changing `currentSnapshotId`. After the pointer switch succeeds, the superseded Lite snapshot is deleted. If validation or pointer replacement fails, the existing publication continues serving the old snapshot and the failed candidate is cleaned up.

Lite intentionally has no snapshot history or rollback. Deleting, revoking, or expiring a publication cascades to every snapshot and credential belonging to it.

### 5. Treat the URL as unlisted capability access, not privacy authentication

Slugs use cryptographically random, non-sequential identifiers with at least 128 bits of entropy and cannot be enumerated through a public API. Anyone holding the URL can read the current snapshot. Publish UI states this before link creation and copy. Hosted pages emit no-index directives and do not expose management operations or credentials.

Alternative considered: label the URL private. Rejected because possession of an unlisted URL is not user authentication and travel data may contain sensitive dates, lodging, flights, and reservations.

### 6. Use one-time recovery secrets without email identity

Publish returns a high-entropy management secret once and offers copy and download. The secret is never placed in the viewer URL, snapshot, logs, analytics, or CanonicalTrip. The server stores only a salted verifier or equivalent one-way representation in `PublicationCredential`, compares it safely, rate-limits management attempts, and rotates it when explicitly requested.

Losing the recovery secret means management cannot be recovered in Lite; automatic expiry remains the deletion backstop. Email magic links are deferred because they introduce identity, delivery, PII, and account-recovery semantics.

### 7. Default to bounded retention and read-only readiness

The initial expiry is computed from disclosed server policy so the link lasts through the trip and a short post-trip window, with a minimum window after publication. Recovery-authorized extensions remain bounded by the same configured maximum; Lite never offers `expiresAt = null`.

Published readiness means whether a reservation, ticket, document, payment, or other trip dependency was `needed`, `ready`, or `unknown` when the snapshot was produced. It is not event completion. The hosted viewer is read-only, so local readiness changes require explicit republish and cannot be written by anyone possessing the viewer URL.

### 8. Keep the service boundary small and provider selection explicit

The implementation needs only publication management endpoints, unlisted snapshot resolution, a transactional/atomic pointer update, expiry cleanup, and cascade deletion. The concrete host and datastore MUST be selected in the first implementation task by verifying atomic update, TTL/cleanup, secret storage, deployment, cost, regional/privacy, and GitHub Pages integration constraints. No generic repository framework or multi-provider abstraction is introduced before a second provider exists.

## Risks / Trade-offs

- **[Unlisted links are forwarded or leaked]** → State the access model clearly, use high-entropy slugs, disable indexing/enumeration, provide revoke/delete, and expire by default.
- **[Recovery secret is lost]** → Offer one-time copy/download and rely on bounded automatic expiry; do not silently add email identity.
- **[Canonical fields leak through publishing]** → Use a strict positive projection and snapshot schema with negative privacy fixtures.
- **[Republish leaves a broken or half-written page]** → Validate the new snapshot first and atomically swap the publication pointer; retain the old snapshot until the swap succeeds.
- **[Deleted facts survive in old versions]** → Delete the superseded snapshot after a successful swap and cascade every publication deletion/expiry.
- **[Readiness becomes a public todo system]** → Publish only readiness semantics, never event completion, and keep the unlisted viewer read-only.
- **[Hosting work expands into SaaS]** → Exclude accounts, email, permanent storage, dashboards, mutable sync, billing, and analytics from Lite.
- **[Provider limitations weaken lifecycle guarantees]** → Resolve the provider against atomicity, cleanup, secret, privacy, and deployment criteria before implementation.

## Migration Plan

1. Do not enable implementation until External Markdown Benchmark #001 passes and its benchmark evidence is recorded.
2. Select the smallest host/datastore that meets atomic pointer, expiry cleanup, cascade delete, recovery verifier, cost, and privacy requirements.
3. Add versioned snapshot, publication, credential, and API contracts plus positive/negative projection fixtures.
4. Deploy management and read endpoints behind a disabled publish UI; verify atomic replacement, cleanup, expiry, rate limits, and safe failures.
5. Add read-only hosted routing through the existing viewer and verify mobile/desktop behavior, exact links, no-index behavior, and no mutation.
6. Enable publish for a bounded beta, document unlisted access and recovery limitations, and monitor only operational metrics that do not contain trip content.

Rollback disables new publish/management UI and hosted routing, revokes or expires beta publications according to the disclosed policy, and leaves the browser-local CanonicalTrip and Osaka static viewer usable.

## Open Questions

- Which concrete hosting and datastore combination best satisfies atomic pointer updates, bounded retention cleanup, secret verification, privacy, cost, and the existing GitHub Pages frontend deployment?
- What exact minimum post-publish window, post-trip window, and maximum extension bound should the beta disclose?
- What recovery-key file format gives enough context for the owner without embedding the viewer payload or secret in logs and previews?
