## Why

The Osaka Golden Result can already validate travel-day usefulness through GitHub Pages, but a second traveler who confirms their own CanonicalTrip cannot automatically receive a stable mobile URL. After External Markdown Benchmark #001 passes its acceptance gate, Trip Runtime needs a deliberately narrow delivery capability that publishes confirmed facts without pulling accounts, cross-device editing, or permanent retention into the parser change.

## What Changes

- Add an explicit positive-allowlist projection from confirmed CanonicalTrip data into a schema-versioned, immutable `PublishedTripSnapshot`, including the viewer-required Alternative/Conditional/Flexible relationships, exact links, reservation/resource distinctions, and source-derived arrival/leave-by constraints; CanonicalExport portability does not automatically define publishability.
- Add a minimal `TripPublication` lifecycle record that controls only where, whether, and until when a trip is available through a stable unlisted slug and points atomically to the current validated snapshot.
- Add explicit publish and republish behavior: create and validate a new immutable snapshot, atomically switch the publication pointer, then remove the superseded snapshot rather than retaining Lite rollback history.
- Add a read-only hosted route that loads the current snapshot through the same mobile-first viewer components. Anyone with the unlisted link can view it; the link is not authentication and is not represented as private.
- Add a one-time recovery secret for republish, revoke, delete, and bounded expiry extension. Store only a verifier/hash server-side, never place the secret in the viewer URL or published payload, and provide copy/download recovery without email identity.
- Add automatic expiry and cascade deletion for the publication and its snapshots. Lite does not promise permanent URLs.
- Keep readiness semantically separate from event completion. A published snapshot may show allowlisted readiness state captured at publication time, but the unlisted viewer cannot mutate owner state.
- Defer accounts, email recovery, ownership sync, cross-device mutable state, multi-trip dashboards, collaboration, subscriptions, platform AI billing, public discovery, search indexing, permanent retention, and advanced publication history.

## Capabilities

### New Capabilities

- `trip-publication`: Positively project confirmed trips into immutable snapshots and manage stable unlisted publication lifecycle, atomic republish, recovery-secret authorization, expiry, revoke, and deletion.
- `published-trip-viewer`: Resolve a live unlisted publication to its current viewer-safe snapshot and render it read-only through the existing mobile trip viewer with clear privacy and expiry behavior.

### Modified Capabilities

None. This change starts only after `build-trip-runtime-v0` passes External Markdown Benchmark #001 and does not add Hosted tasks to that change.

## Impact

- Adds a small hosted API and durable store for publication records, snapshot payloads, recovery-secret verifiers, expiry, and deletion; the concrete hosting provider is selected in design and is not implied by the current GitHub Pages deployment.
- Adds publish, recovery-key copy/download, republish, revoke, delete, expiry, and hosted read-only route UI around the existing CanonicalTrip and viewer boundaries.
- Introduces `PublishedTripSnapshot` and `TripPublication` runtime schemas and positive projection tests without turning CanonicalExport into a public payload contract.
- Requires privacy, authorization, rate-limit, no-index, atomic-pointer-swap, retention, cascade-delete, mobile/desktop, fallback, and production hosting verification.
- Does not retain original uploads, ReviewSession evidence, parser responses, API keys, source excerpts, or superseded Lite snapshots.
