# Sprint 05 PRD - Mock Chat, Safety, and Notifications

## Sprint Objective
Deliver a complete mocked communication and trust-and-safety experience, including matches list, chat threads/conversation, chat eligibility gating, blocking/reporting flows, and notification center/preferences behavior.

## Business Context
Night Vibe requires venue-gated chat and cross-system safety enforcement to preserve user trust and product integrity. Sprint 05 validates these interaction-critical flows in a deterministic mock environment before any backend conversion.

## User Stories
- As a matched user, I can open chat and exchange messages while eligibility conditions are met.
- As a user, I can see when chat is disabled due to leaving venue, match expiry, or safety action.
- As a user, I can block or report another user and understand the immediate impact.
- As a user, I can review notifications and adjust notification preferences.
- As a QA/product reviewer, I can replay safety and chat edge cases predictably.

## UX Scope
- Matches List Screen
- Chat Threads Screen
- Chat Conversation Screen
- Report User Screen
- Block User Confirmation Screen
- Blocked Users Screen
- Safety Center Screen
- Notification Center Screen
- Notification Preferences Screen
- Error and Retry Screen / Empty State Screen as needed

## Functional Requirements
1. Implement mocked matches and chat thread surfaces:
   - List active and expired match states.
   - Render thread summaries with last message state.
2. Implement mocked conversation behavior:
   - Send/receive simulation.
   - Delivery state transitions (`sent -> delivered -> read`).
   - Typing indicator simulation with expiry.
   - Read receipt UI states.
3. Enforce chat eligibility simulation:
   - Chat enabled only for valid match + same venue active sessions.
   - Disable send action when eligibility fails (`left_venue`, `match_expired`, `blocked`, `moderation_action`).
4. Implement user safety actions:
   - Block flow and blocked users management (mock persistence).
   - Report flow and mock moderation queue status visibility.
   - Immediate cross-surface enforcement in mock mode (discovery/chat visibility impact).
5. Implement notifications module behavior:
   - In-app notification list and read-state transitions.
   - Preferences management.
   - Dedup and rate-limited event simulation.
6. Provide deterministic safety and chat scenario packs for QA/demo use.

## Non-Functional Requirements
- Deterministic message and safety outcomes for repeated scenario runs.
- No external network/Firebase dependencies.
- Chat UI remains responsive under realistic mock thread sizes.
- Event ordering remains stable for message and notification timelines.
- Strongly typed chat/safety/notification contracts for Phase 2 adapter replacement.

## Edge Cases
- Match expires while conversation is open.
- User blocked mid-conversation.
- Duplicate report submissions for same user/session.
- Typing indicator stuck due to missed timeout event.
- Message send retried rapidly during eligibility transitions.
- Notification flood scenario requiring dedup/rate-limit simulation.

## Mocked vs Real Behavior Expectations
- Mocked in Sprint 05:
  - Chat thread/message storage.
  - Delivery/read/typing events.
  - Block/report persistence and moderation status.
  - Notification delivery, dedup, and preference filtering.
- Real in Phase 2 conversion:
  - Server-authoritative chat send validation against match + co-location.
  - Firestore-backed messages and delivery states.
  - Real safety enforcement and moderation workflows.
  - FCM-backed push fallback with storage-backed notifications.
- Contract requirement:
  - UI/state depends only on `ChatService`, `SafetyService`, and `NotificationService` interfaces.

## API/Data Contract Expectations (if relevant)
- Mock envelopes should align to production response/error shape.
- Simulate relevant error codes:
  - `CHAT_EXPIRED`
  - `ACCESS_DENIED`
  - `PERMISSION_DENIED`
  - `RATE_LIMIT_EXCEEDED`
  - `VALIDATION_ERROR`
  - `INTERNAL_ERROR`

## Screen-Level Behavior
- Matches list distinguishes active vs expired states.
- Conversation screen enables/disables composer based on eligibility.
- Block/report actions show confirmations and immediate state impact messaging.
- Safety center provides consolidated access to block/report-related states.
- Notification center supports read/unread and preference-respecting display.

## Role/Permission Impact
- Primary role: `RegularUser`.
- Safety actions available to regular users for self-protection flows.
- Moderator/admin decisioning UI remains out-of-scope for this sprint (detailed in Sprint 06 dashboards).
- Account-status restrictions from Sprint 02 remain effective.

## Analytics/Events to Track (if relevant)
- `chat_thread_opened_mock`
- `message_sent_mock`
- `message_delivery_state_changed_mock`
- `typing_indicator_started_mock`
- `typing_indicator_expired_mock`
- `user_blocked_mock`
- `user_report_submitted_mock`
- `chat_disabled_due_to_eligibility_mock`
- `notification_received_mock`
- `notification_marked_read_mock`
- `notification_preference_changed_mock`

## QA Acceptance Criteria
- Chat eligibility gating is correctly enforced across all defined scenarios.
- Blocking actions immediately impact chat/discovery visibility behavior in mock mode.
- Reporting flow captures required metadata and status transitions.
- Notification list and preferences work with dedup/rate-limit simulations.
- Delivery/read/typing states transition correctly and recover from edge scenarios.
- No backend dependency introduced.

## Dependencies
- Sprint 01 architecture and shared UI components.
- Sprint 02 account/profile/status gating.
- Sprint 03 session and presence simulation.
- Sprint 04 match lifecycle and interaction outputs.

## Exclusions
- Real-time backend listeners and production message transport.
- Real moderation queue operations by moderators.
- Real push provider integration.
- Real audit logging backend persistence.

## Definition of Done
- All in-scope chat/safety/notification screens and flows implemented and demoable.
- Deterministic scenario suite covers happy, edge, and negative paths.
- Cross-surface safety enforcement behavior validated in tests.
- Sprint-05 TestPlan executed with no blocker defects in sprint scope.
