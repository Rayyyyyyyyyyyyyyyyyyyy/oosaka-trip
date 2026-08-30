## 1. Gate and Hosting Decisions

- [ ] 1.1 Verify and record that `build-trip-runtime-v0` passed the stranger-Markdown gate: zero missing or invented critical events, zero unsupported exact critical facts, every annotated ambiguity surfaced, valid confirmed schema, and renderable output with Parser Quality separated from Review Recovery Quality.
- [ ] 1.2 Select the smallest concrete hosting and datastore combination that supports atomic publication-pointer updates, cascade deletion, bounded expiry cleanup, secret verification, rate limiting, privacy constraints, acceptable cost, and integration with the existing GitHub Pages frontend; record the decision and rollback boundary.
- [ ] 1.3 Set and document the beta's exact minimum post-publish window, post-trip retention window, maximum recovery-authorized extension, cleanup delay, slug entropy, recovery-secret entropy, and rate limits.
- [ ] 1.4 Define the one-time recovery-key text/download format without embedding trip payloads, viewer credentials, or secrets in logs, analytics, URLs, previews, or filenames.

## 2. Publication Domain and Projection

- [ ] 2.1 Add strict versioned runtime schemas and JSDoc types for PublishedTripSnapshot, TripPublication, PublicationCredential, publication status, and published TripReadinessItem; keep lifecycle, content, and credential records separate.
- [ ] 2.2 Implement `createPublishedTripSnapshot` as a positive allowlist projection independent from CanonicalExport, explicitly projecting only viewer-required trip facts, exact safe links, reservations, and readiness captured at publish time.
- [ ] 2.3 Add negative privacy fixtures proving provenance, source locators/excerpts, override history, ReviewSession data, findings, parser/provider data, browser metadata, credentials, private notes, owner metadata, and unknown future CanonicalTrip fields never enter snapshots or responses.
- [ ] 2.4 Test that optional/flexible events never become incomplete readiness work and that published readiness uses only reservation, ticket, document, payment, or other dependency with needed, ready, or unknown state.
- [ ] 2.5 Validate snapshots at creation, persistence, service response, and viewer load boundaries and reject unsupported snapshot versions without falling back to CanonicalTrip serialization.

## 3. Hosted Publication Service

- [ ] 3.1 Create the selected provider's minimal publication, snapshot, and credential storage schema with unique non-enumerable slugs, lifecycle indexes, foreign-key/cascade behavior, and no source or ReviewSession storage.
- [ ] 3.2 Implement initial publish so it validates the snapshot first, creates publication/snapshot/credential consistently, and returns an active unlisted URL plus the recovery secret exactly once only after the page is readable.
- [ ] 3.3 Store only a salted verifier or equivalent one-way recovery representation, use safe comparison, sanitize logs/errors, and add non-enumerating, rate-limited authorization for republish, revoke, delete, extension, and secret rotation.
- [ ] 3.4 Implement republish by creating and validating a candidate snapshot, atomically switching `currentSnapshotId`, deleting the superseded snapshot after success, and cleaning up the candidate after failure while the old page remains live.
- [ ] 3.5 Implement revoke and delete with generic public responses and cascade removal of every related snapshot and credential; verify terminal operations are idempotent.
- [ ] 3.6 Implement bounded expiry extension and scheduled expiry cleanup using the disclosed policy, including retryable cleanup, idempotency, and proof that expired content stops resolving before or while cleanup completes.
- [ ] 3.7 Implement the unlisted read endpoint with no public enumeration/search surface, strict snapshot response projection, safe unavailable/expired behavior, and no management or credential leakage.

## 4. Publish and Hosted Viewer UI

- [ ] 4.1 Add publish confirmation that explains anyone with the link can view the trip, the URL is unlisted rather than private, the exact expiry, read-only readiness, and the recovery-key limitation before transmission.
- [ ] 4.2 Add accessible post-publish controls for copying the stable URL and copying/downloading the one-time recovery key with announced success, predictable focus, and no pointer-only requirement.
- [ ] 4.3 Add recovery-authorized republish, revoke, delete, bounded extension, and optional recovery-secret rotation controls with explicit destructive confirmation and sanitized errors.
- [ ] 4.4 Add the hosted slug route that validates PublishedTripSnapshot and reuses the existing Overview, Today, Day, Reservations, Date Rail, optional/flexible/all-day, exact-link, and honest NOW/NEXT viewer components.
- [ ] 4.5 Make hosted readiness visibly read-only and ensure the unlisted route cannot mutate CanonicalTrip, readiness, reservations, publication metadata, credentials, or any server record.
- [ ] 4.6 Add no-index/no-follow directives, safe external-link attributes, generic missing/revoked/deleted/expired/invalid states, and scoped transient-service failure behavior without exposing trip content or management hints.

## 5. Security, Lifecycle, and Regression Verification

- [ ] 5.1 Test high-entropy slug generation, collision handling, lack of enumeration, recovery-secret one-time display, verifier-only storage, rate limiting, safe comparison, credential rotation, and generic authorization errors.
- [ ] 5.2 Test initial-publish rollback, concurrent republish, atomic pointer switching, candidate cleanup, superseded-snapshot deletion, idempotent revoke/delete/expiry, and cascade deletion under injected storage and network failures.
- [ ] 5.3 Verify no original file, UnifiedSourceDocument, source excerpt/locator, ReviewSession, parser response, OpenAI key, production benchmark artifact, private canonical field, management secret, or superseded snapshot survives in hosted storage, responses, logs, analytics, URLs, or static assets.
- [ ] 5.4 Verify active, republished, revoked, deleted, expired, malformed, unsupported-version, and service-unavailable routes through automated integration tests and real hosted API checks.
- [ ] 5.5 Verify publish, recovery download, management controls, and the hosted viewer at mobile and desktop widths for keyboard operation, announcements, focus, touch targets, exact links, runtime timezone behavior, minute refresh, and no browser-console errors.

## 6. Deployment and Bounded Beta Handoff

- [ ] 6.1 Deploy the hosted service and frontend route with environment-specific secrets, least-privilege access, cleanup scheduling, disabled public enumeration, no-index behavior, health checks, and rollback controls while leaving browser-local CanonicalTrip and the Osaka static fallback usable.
- [ ] 6.2 Run the complete automated suite, production builds, hosted smoke tests, dependency/security checks, and `git diff --check`; inspect production bundles and service logs for unintended trip or credential data.
- [ ] 6.3 Publish and republish representative sanitized CanonicalTrips end to end, confirm stable URL behavior and superseded-snapshot deletion, then delete/expire them and verify every hosted record is removed.
- [ ] 6.4 Document unlisted-link privacy, read-only semantics, recovery-key loss, expiry/extension/deletion policy, no permanent retention, provider/service boundary, incident/rollback procedure, and the explicit deferral of accounts, email recovery, cross-device state, history, billing, and subscriptions.
