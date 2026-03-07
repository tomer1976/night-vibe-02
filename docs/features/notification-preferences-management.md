# Notification Preferences Management

## Feature Name
Notification Preferences Management

## Status
Draft

## Description
Implements the 'Notification Preferences Management' capability according to Section 13 – Notifications and Real-Time Event Delivery, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Notification Preferences Management'.
- Out of scope: unrelated domain workflows outside Section 13 – Notifications and Real-Time Event Delivery.

## Functional Requirements
- Map domain events to supported notification types.
- Deliver real-time notifications to active clients and push via FCM when offline/background.
- Persist notification history and enforce user preference filters.
- Apply rate limits and deduplication keys to suppress duplicates/spam.


## Non-Functional Requirements
- Performance target: Notification generation < 100 ms; push dispatch < 500 ms.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- Event payload, recipient IDs, preference settings, device push tokens.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- Notification records, real-time dispatch events, push delivery attempts.


## Acceptance Criteria
- Enabled notification types are delivered/stored; disabled types are suppressed.
- Duplicate events in dedup window produce one notification.
- Rate-limited sends return suppression status without hard failure.


## Edge Cases
- Network retries and duplicate requests.
- Concurrent updates to the same user/venue/session state.
- Mid-operation state changes (checkout, suspension, ban, or role change).

## Telemetry
- Required metrics/logs include: notifications_generated, push_notifications_sent, duplicate_notifications_blocked.

## Dependencies
- Modules: notification_service, event_dispatch, push_delivery, preferences.
- Data/services: notifications, notification_preferences, FCM, event producers.

## Open Decisions
- Final thresholds and defaults follow unresolved DEC items in the master specification.
- Any domain-specific trade-offs must be captured in ADRs before production rollout.

## Source Mapping
- Primary source: Section 13 – Notifications and Real-Time Event Delivery
- FR references: FR-13.5
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
