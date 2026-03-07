# Block Enforcement in Chat

## Feature Name
Block Enforcement in Chat

## Status
Draft

## Description
Implements the 'Block Enforcement in Chat' capability according to Section 11 – Real-Time Chat System for Matched Users, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Block Enforcement in Chat'.
- Out of scope: unrelated domain workflows outside Section 11 – Real-Time Chat System for Matched Users.

## Functional Requirements
- Create directed block relations and apply immediate interaction restrictions.
- Store reports with pending status and moderator action workflow.
- Enforce moderation outcomes (`warning|suspension|ban|no_action`) across system surfaces.


## Non-Functional Requirements
- Performance target: Message delivery latency < 200 ms.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- Block/report payloads, actor/target IDs, moderator decision payload.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- Block/report records, enforcement status changes, audit/telemetry events.


## Acceptance Criteria
- Blocked users are removed from discovery and cannot chat.
- Reports appear in moderation queue and resolve with auditable action.
- Banned users are denied all interactive platform operations.


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
- FR references: FR-12.3
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
