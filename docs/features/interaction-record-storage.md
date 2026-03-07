# Interaction Record Storage

## Feature Name
Interaction Record Storage

## Status
Draft

## Description
Implements the 'Interaction Record Storage' capability according to Section 10 – Like / Pass Actions and Match Creation, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Interaction Record Storage'.
- Out of scope: unrelated domain workflows outside Section 10 – Like / Pass Actions and Match Creation.

## Functional Requirements
- Persist like/pass interactions with idempotency guarantees.
- Prevent duplicate interaction per actor-target-session scope.
- Create match on reciprocal likes only when co-located.
- Expire match when co-location/session validity ends and emit lifecycle events.


## Non-Functional Requirements
- Performance target: Like latency < 200 ms; match detection < 100 ms.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- Actor/target IDs, venue/session context, interaction action.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- Interaction record, match record transitions, emitted match events.


## Acceptance Criteria
- Duplicate interactions return `DUPLICATE_INTERACTION`.
- Match is created exactly once per unordered user pair.
- Match expiration disables downstream chat eligibility.


## Edge Cases
- Network retries and duplicate requests.
- Concurrent updates to the same user/venue/session state.
- Mid-operation state changes (checkout, suspension, ban, or role change).

## Telemetry
- Required metrics/logs include: like_actions, pass_actions, matches_created, duplicate_interaction_attempts.

## Dependencies
- Modules: interactions, match_engine, match_storage, match_events.
- Data/services: interactions collection, matches collection, active co-location checks.

## Open Decisions
- Final thresholds and defaults follow unresolved DEC items in the master specification.
- Any domain-specific trade-offs must be captured in ADRs before production rollout.

## Source Mapping
- Primary source: Section 10 – Like / Pass Actions and Match Creation
- FR references: FR-10.3
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
