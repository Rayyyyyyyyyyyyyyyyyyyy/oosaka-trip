## ADDED Requirements

### Requirement: Confirmed-trip publication prerequisite
The system SHALL publish only a runtime-validated confirmed CanonicalTrip after `build-trip-runtime-v0` has passed its stranger-Markdown acceptance gate and SHALL NOT accept a ParsedTripDraft, ReviewSession, raw source, or parser response as publishable input.

#### Scenario: Unconfirmed draft is submitted
- **WHEN** publication receives a draft, source document, or CanonicalTrip that fails runtime validation
- **THEN** it rejects the request without creating a snapshot, publication, or credential record

### Requirement: Positive viewer-safe projection
The system MUST construct PublishedTripSnapshot through an explicit positive allowlist into a strict versioned schema and MUST NOT derive it by serializing CanonicalTrip and blacklisting fields. The projection SHALL exclude provenance, source evidence and locators, user override history, parser/provider data, findings, ReviewSession data, browser metadata, credentials, private notes, owner metadata, and all unknown fields.

#### Scenario: CanonicalTrip gains a new private field
- **WHEN** a valid CanonicalTrip contains a field that is not explicitly defined by the publish projection
- **THEN** the field is absent from the snapshot and publication response

#### Scenario: Viewer-required facts are projected
- **WHEN** a valid confirmed trip is published
- **THEN** the snapshot contains only allowlisted trip header, dates/timezone, days, viewer-safe events and transit, exact allowlisted links, reservations, and published readiness needed by the read-only viewer

### Requirement: Publication lifecycle separation
TripPublication SHALL contain only its identifier, unlisted slug, current snapshot identifier, lifecycle status, publication time, and expiry time. Published trip content SHALL exist only in PublishedTripSnapshot, and recovery verification data SHALL exist only in a separate PublicationCredential security record.

#### Scenario: Publication record is inspected
- **WHEN** a TripPublication record is read by lifecycle code
- **THEN** it contains no trip title, date, place, event, reservation, readiness, viewer-setting, source, or owner-content fields

### Requirement: Immutable initial publish
Initial publish SHALL create and validate an immutable PublishedTripSnapshot before creating an active TripPublication pointing to it, SHALL generate a cryptographically random non-sequential slug with at least 128 bits of entropy, and SHALL return the unlisted URL only after the publication is readable.

#### Scenario: Snapshot validation fails
- **WHEN** the positive projection does not satisfy the PublishedTripSnapshot schema
- **THEN** publication fails without exposing a URL or retaining a publication, snapshot, or credential

### Requirement: Atomic republish without Lite history
Republish SHALL create and validate a new immutable snapshot, atomically change `TripPublication.currentSnapshotId`, and delete the superseded snapshot only after the pointer switch succeeds. A failed candidate SHALL NOT replace or interrupt the current published page.

#### Scenario: Republish succeeds
- **WHEN** an authorized owner republishes a newer confirmed CanonicalTrip
- **THEN** the stable slug resolves completely to the new snapshot and the superseded snapshot is deleted

#### Scenario: Republish pointer swap fails
- **WHEN** the candidate snapshot is valid but the atomic publication update fails
- **THEN** the stable slug continues resolving to the prior snapshot and the unused candidate is cleaned up

### Requirement: One-time recovery authorization
Initial publish SHALL return a high-entropy recovery secret exactly once with copy and download affordances. The secret MUST NOT appear in the viewer URL, snapshot, CanonicalTrip, logs, analytics, or later read responses; the service SHALL store only a salted verifier or equivalent one-way representation and SHALL rate-limit management attempts.

#### Scenario: Authorized management request
- **WHEN** a valid recovery secret accompanies a republish, revoke, delete, or bounded expiry-extension request
- **THEN** the service performs the requested operation without revealing the stored verifier or secret

#### Scenario: Recovery secret is missing or invalid
- **WHEN** a management request lacks a valid recovery secret
- **THEN** the service rejects it with a non-enumerating error and does not disclose whether other slugs or credentials exist

### Requirement: Bounded expiry and cascade deletion
Every publication SHALL have a non-null expiry computed from a disclosed server policy that lasts through the trip plus a bounded post-trip window and a minimum post-publish window. Authorized extensions MUST remain within configured bounds. Expiry, delete, and terminal cleanup SHALL remove the publication, its credential, and every related snapshot.

#### Scenario: Publication expires
- **WHEN** the publication reaches `expiresAt`
- **THEN** its slug stops resolving and cleanup removes its publication, credential, and snapshots according to the disclosed retention window

#### Scenario: Owner deletes publication
- **WHEN** an authorized owner deletes an active or revoked publication
- **THEN** the publication, credential, and all related snapshots are removed and cannot be recovered through Lite

### Requirement: Readiness is not event completion
The publish projection SHALL represent allowlisted trip readiness only as reservation, ticket, document, payment, or other dependency state with `needed`, `ready`, or `unknown` status and SHALL NOT represent optional activities or visited events as incomplete work.

#### Scenario: Optional place is not visited
- **WHEN** a CanonicalTrip contains an optional place without a readiness dependency
- **THEN** the snapshot does not create an incomplete readiness item for that place

### Requirement: Publication service privacy boundary
The hosted publication service MUST NOT receive or retain original source files, UnifiedSourceDocument blocks, source excerpts, ReviewSession evidence, parser/model responses, OpenAI API keys, or production parser benchmark artifacts.

#### Scenario: Confirmed trip is published
- **WHEN** the browser sends a publish request
- **THEN** the request contains only the versioned positive snapshot projection and management metadata required for publication
