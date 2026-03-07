# Real-Time Messaging

## Feature Name
Real-Time Messaging

## Status
Draft

## Description
Implements the 'Real-Time Messaging' capability according to Section 1–14 (Cross-Cutting), preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Real-Time Messaging'.
- Out of scope: unrelated domain workflows outside Section 1–14 (Cross-Cutting).

## Functional Requirements
- Create one chat per match and enforce participant-only access.
- Validate send eligibility using active match + same-venue active sessions.
- Persist messages and transition delivery statuses (`sent->delivered->read`).
- Expire/disable chat when eligibility ends.


## Non-Functional Requirements
- Performance target: As defined by owning domain.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- `chat_id`, sender/recipient context, `message_text`, presence state.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- Message records, delivery state updates, chat status transitions.


## Acceptance Criteria
- Ineligible send attempts are rejected (`CHAT_EXPIRED`/match invalid).
- Message ordering remains deterministic by timestamp with tie-breakers.
- Typing indicators auto-expire and read receipts update correctly.


## Edge Cases
- Network retries and duplicate requests.
- Concurrent updates to the same user/venue/session state.
- Mid-operation state changes (checkout, suspension, ban, or role change).

## Telemetry
- Required metrics/logs include: domain-specific metrics.

## Dependencies
- Modules: platform.
- Data/services: cross-domain services.

## Open Decisions
- Final thresholds and defaults follow unresolved DEC items in the master specification.
- Any domain-specific trade-offs must be captured in ADRs before production rollout.

## Source Mapping
- Primary source: Section 1–14 (Cross-Cutting)
- FR references: FR-11.3, FR-11.4
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
