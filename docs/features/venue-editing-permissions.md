# Venue Editing Permissions

## Feature Name
Venue Editing Permissions

## Status
Draft

## Description
Implements the 'Venue Editing Permissions' capability according to Section 6 – Venue Model, Venue Lifecycle, and Venue Management, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Venue Editing Permissions'.
- Out of scope: unrelated domain workflows outside Section 6 – Venue Model, Venue Lifecycle, and Venue Management.

## Functional Requirements
- Persist venues as first-party records only (no external venue source).
- Enforce venue lifecycle transitions and authorization for moderation/admin actions.
- Detect duplicates using <=50m proximity + normalized name similarity.
- Restrict immutable location fields after creation.


## Non-Functional Requirements
- Performance target: Venue creation API latency < 500 ms.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- Venue payload: name, coordinates, address, category, actor context.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- Venue record updates with status/ownership/moderation decisions.


## Acceptance Criteria
- New venue starts as `pending` and is not discoverable until `active`.
- Invalid state transitions are rejected.
- Unauthorized ownership/edit/moderation actions are denied.


## Edge Cases
- Network retries and duplicate requests.
- Concurrent updates to the same user/venue/session state.
- Mid-operation state changes (checkout, suspension, ban, or role change).

## Telemetry
- Required metrics/logs include: venue_submissions, venues_approved, duplicate_venues_detected, venue_edits.

## Dependencies
- Modules: venues, venue_submission, venue_moderation, venue_ownership.
- Data/services: venues collection, moderator/admin actions, owner authorization.

## Open Decisions
- Final thresholds and defaults follow unresolved DEC items in the master specification.
- Any domain-specific trade-offs must be captured in ADRs before production rollout.

## Source Mapping
- Primary source: Section 6 – Venue Model, Venue Lifecycle, and Venue Management
- FR references: FR-6.6
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
