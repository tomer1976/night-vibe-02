# Chat Session Creation

## Feature Name
Chat Session Creation

## Status
Draft

## Description
Implements the 'Chat Session Creation' capability according to Section 11 – Real-Time Chat System for Matched Users, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Chat Session Creation'.
- Out of scope: unrelated domain workflows outside Section 11 – Real-Time Chat System for Matched Users.

## Functional Requirements
- Create one chat per match and enforce participant-only access.
- Validate send eligibility using active match + same-venue active sessions.
- Persist messages and transition delivery statuses (`sent->delivered->read`).
- Expire/disable chat when eligibility ends.


## Non-Functional Requirements
- Performance target: Message delivery latency < 200 ms.
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
- Required metrics/logs include: messages_sent, message_delivery_latency, chats_expired, typing_events.

## Dependencies
- Modules: chat_service, message_storage, delivery_engine, typing_indicator, read_receipts.
- Data/services: matches, chats, messages, active co-location validation.

## Open Decisions
- Final thresholds and defaults follow unresolved DEC items in the master specification.
- Any domain-specific trade-offs must be captured in ADRs before production rollout.

## Source Mapping
- Primary source: Section 11 – Real-Time Chat System for Matched Users
- FR references: FR-11.2
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
