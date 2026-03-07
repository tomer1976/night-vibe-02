# User Discovery Feed Generation

## Feature Name
User Discovery Feed Generation

## Status
Draft

## Description
Implements the 'User Discovery Feed Generation' capability according to Section 9 – User Discovery and Potential Match Generation, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'User Discovery Feed Generation'.
- Out of scope: unrelated domain workflows outside Section 9 – User Discovery and Potential Match Generation.

## Functional Requirements
- Require active venue session to generate discovery feed.
- Apply same-venue, preference, mutual visibility, and block/skip filters.
- Return deterministic ordered, paginated results with preview-safe fields.


## Non-Functional Requirements
- Performance target: Discovery generation latency < 500 ms.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- Viewer session, preferences, cursor/page_size, block/skip history.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- `candidates[]` previews and `next_cursor`.


## Acceptance Criteria
- Discovery without active session returns `NOT_CHECKED_IN`.
- Blocked/skipped users do not appear in the current session feed.
- Pagination cursors return consistent continuation results.


## Edge Cases
- Network retries and duplicate requests.
- Concurrent updates to the same user/venue/session state.
- Mid-operation state changes (checkout, suspension, ban, or role change).

## Telemetry
- Required metrics/logs include: discovery_requests, candidate_pool_size, preference_filter_rejections.

## Dependencies
- Modules: discovery_engine, candidate_filtering, preference_matching, pagination.
- Data/services: active venue sessions, profile preferences, block/skip filters.

## Open Decisions
- Final thresholds and defaults follow unresolved DEC items in the master specification.
- Any domain-specific trade-offs must be captured in ADRs before production rollout.

## Source Mapping
- Primary source: Section 9 – User Discovery and Potential Match Generation
- FR references: FR-9.1, FR-9.2, FR-9.6
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
