# Venue Activity Snapshot

## Feature Name
Venue Activity Snapshot

## Status
Draft

## Description
Implements the 'Venue Activity Snapshot' capability according to Section 7 – Venue Discovery and Nearby Venue Retrieval, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Venue Activity Snapshot'.
- Out of scope: unrelated domain workflows outside Section 7 – Venue Discovery and Nearby Venue Retrieval.

## Functional Requirements
- Validate location/radius request and enforce max discovery radius.
- Compute distance using Haversine and include only venues within radius.
- Apply deterministic sort (distance asc, tie-breakers as defined).
- Enforce per-user discovery rate limiting.


## Non-Functional Requirements
- Performance target: Venue discovery latency < 1 s.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- `user_id`, `latitude`, `longitude`, `radius_km`.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- Venue list with `distance_km` and activity snapshot fields.


## Acceptance Criteria
- Only active venues in radius are returned.
- Response ordering is deterministic for identical inputs.
- Rate limit violations return `RATE_LIMIT_EXCEEDED`.


## Edge Cases
- Network retries and duplicate requests.
- Concurrent updates to the same user/venue/session state.
- Mid-operation state changes (checkout, suspension, ban, or role change).

## Telemetry
- Required metrics/logs include: venue_discovery_requests, venue_discovery_failures, venue_sort_operations.

## Dependencies
- Modules: venue_discovery, distance_calculation, venue_filtering, venue_sorting.
- Data/services: active venues, GPS coordinates, internal distance calculations.

## Open Decisions
- Final thresholds and defaults follow unresolved DEC items in the master specification.
- Any domain-specific trade-offs must be captured in ADRs before production rollout.

## Source Mapping
- Primary source: Section 7 – Venue Discovery and Nearby Venue Retrieval
- FR references: FR-7.5
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
