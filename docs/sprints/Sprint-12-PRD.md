# Sprint 12 PRD - Real Chat, Safety Enforcement, and Notifications Conversion

## Sprint Objective
Convert mocked chat, safety, moderation-enforcement, and notifications modules into real implementations with server-authoritative eligibility checks, cross-system enforcement propagation, and production-grade event handling.

## Business Context
With real presence/discovery/matching in place from Sprint 11, user communication and safety controls must now become authoritative. Sprint 12 is the final core social-conversion wave that secures user interaction integrity and trust before hardening/release sprints.

## User Stories
- As a matched user, I can send messages only when both users remain eligible to chat.
- As a user, I can block or report another user and see immediate safety impact.
- As a moderator, enforcement actions propagate across chat/discovery/interaction surfaces.
- As a user, I receive in-app and push-backed notifications according to preferences.
- As QA/security stakeholders, we can verify safety denials and abuse controls end-to-end.

## UX Scope
- Matches List Screen (real chat readiness states)
- Chat Threads Screen (real source)
- Chat Conversation Screen (real send/read/typing/eligibility)
- Report User Screen (real submission)
- Block User Confirmation Screen (real block action)
- Blocked Users Screen (real block list)
- Safety Center Screen (real safety status surfaces)
- Notification Center Screen (real notifications)
- Notification Preferences Screen (real preference updates)
- Error/Retry/Denied states for converted flows

## Functional Requirements
1. Convert chat session and messaging flows:
   - One chat per match.
   - Real send, delivery, read, and typing-state lifecycle.
2. Enforce real chat eligibility:
   - Require active match + same-venue active sessions.
   - Disable/deny sends when eligibility invalidates.
3. Convert blocking/reporting flows:
   - Persist directed block relationships.
   - Persist user reports with moderation queue linkage.
4. Convert cross-system safety enforcement:
   - Block/report/moderation outcomes immediately affect chat and discovery eligibility.
   - Banned/suspended status propagation enforced across converted modules.
5. Convert notifications system:
   - Real in-app notification storage and retrieval.
   - Push fallback integration boundary via FCM.
   - Preference filtering, deduplication, and rate-limiting behavior.
6. Implement audit and event trail for safety and privileged moderation actions.

## Non-Functional Requirements
- Safety and chat authorization must be server-authoritative.
- Message eligibility checks must be deterministic and low-latency.
- Notification processing must support dedup/rate-limit protections.
- Cross-module consistency guaranteed for enforcement outcomes.
- Observability required for chat delivery and safety actions.

## Edge Cases
- Match expires while message send is in-flight.
- Block action occurs during active conversation.
- Report submitted multiple times from retries.
- Notification burst exceeds rate policy.
- Typing indicators linger due to missed expiry updates.
- Moderator ban applied while user is actively chatting.

## Mocked vs Real Behavior Expectations
- Real in Sprint 12:
  - Chat message persistence and eligibility validation.
  - Block/report persistence and enforcement effects.
  - Notification storage/preferences/dedup/rate-limit core behavior.
- May remain partially controlled/stubbed in Sprint 12:
  - Some push transport edge paths if rollout staged (FCM fallback integration boundary can be phased).
- Conversion principle:
  - No mock bypasses on safety or chat eligibility decisions.

## API/Data Contract Expectations (if relevant)
- Apply canonical error model and contracts for converted endpoints.
- Relevant codes include:
  - `CHAT_EXPIRED`
  - `ACCESS_DENIED`
  - `PERMISSION_DENIED`
  - `RATE_LIMIT_EXCEEDED`
  - `VALIDATION_ERROR`
  - `NOT_FOUND`
  - `INTERNAL_ERROR`
- Maintain delivery status enums and chat/match status compatibility.
- Ensure report/moderation payload contracts are auditable and policy-compliant.

## Screen-Level Behavior
- Conversation composer enables/disables based on real eligibility checks.
- Block/report actions update visible state immediately.
- Threads and conversation reflect real delivery/read/typing updates.
- Notifications list reflects real read/unread and preference-filtered items.

## Role/Permission Impact
- Regular users: real block/report/chat operations within policy limits.
- Moderators/admins: enforcement outcomes now propagate to user interaction layers.
- Account status restrictions remain authoritative and superseding.

## Analytics/Events to Track (if relevant)
- `message_sent`
- `message_delivery_state_updated`
- `chat_send_denied_eligibility`
- `block_created`
- `report_submitted`
- `moderation_action_applied`
- `cross_system_enforcement_applied`
- `notification_created`
- `notification_deduplicated`
- `notification_rate_limited`
- `notification_marked_read`

## QA Acceptance Criteria
- Real chat send/read/typing flows pass with eligibility enforcement.
- Block/report actions enforce immediate downstream restrictions.
- Moderation outcomes propagate correctly across converted modules.
- Notification preferences, dedup, and rate limiting operate as expected.
- Mixed-mode compatibility remains stable for analytics/hardening items not yet converted.

## Dependencies
- Sprint 07 conversion foundation.
- Sprint 08 auth/account-status enforcement.
- Sprint 09 profile/RBAC conversion.
- Sprint 10 venue/governance conversion.
- Sprint 11 presence/discovery/matching conversion.

## Exclusions
- Full platform analytics optimization/hardening scope (Sprint 13).
- Final production release packaging and store readiness (Sprint 14).

## Definition of Done
- Chat, safety, and notifications are real-backed and policy-authoritative.
- Cross-system enforcement works across chat/discovery/interaction surfaces.
- Notification preference/dedup/rate-limit behavior is validated.
- Sprint-12 TestPlan executed with no blocker defects.
