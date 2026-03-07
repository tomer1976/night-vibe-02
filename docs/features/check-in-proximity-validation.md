# Check-In Proximity Validation

## Feature Name
Check-In Proximity Validation

## Status
Draft

## Description
Implements the 'Check-In Proximity Validation' capability according to Section 8 – Venue Check-In System and Presence Validation, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Check-In Proximity Validation'.
- Out of scope: unrelated domain workflows outside Section 8 – Venue Check-In System and Presence Validation.

## Functional Requirements
- Validate active venue and proximity threshold before check-in.
- Enforce one active session per user; auto-close prior session on new check-in.
- Support explicit checkout and automatic timeout expiration.
- Expose presence only for active same-venue sessions.


## Non-Functional Requirements
- Performance target: Check-in processing time < 500 ms.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- `user_id`, `venue_id`, current coordinates, session context.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- Session status transitions and presence visibility updates.


## Acceptance Criteria
- Out-of-range check-in returns `OUT_OF_RANGE`.
- Session replacement is deterministic under concurrent requests.
- Expired/closed sessions are excluded from presence lists.


## Edge Cases
- Network retries and duplicate requests.
- Concurrent updates to the same user/venue/session state.
- Mid-operation state changes (checkout, suspension, ban, or role change).

## Telemetry
- Required metrics/logs include: checkin_requests, checkin_success_rate, sessions_expired, venue_presence_queries.

## Dependencies
- Modules: presence, checkin, checkout, session_management.
- Data/services: venue_sessions, active venues, GPS proximity validation.

## Open Decisions
- Final thresholds and defaults follow unresolved DEC items in the master specification.
- Any domain-specific trade-offs must be captured in ADRs before production rollout.

## Source Mapping
- Primary source: Section 8 – Venue Check-In System and Presence Validation
- FR references: FR-8.2
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
