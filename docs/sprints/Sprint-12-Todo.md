# Sprint-12 Todo - Real Chat, Safety Enforcement, and Notifications Conversion

## Frontend Tasks
- [ ] Replace mock chat adapter with real chat adapter in threads and conversation screens.
- [ ] Replace mock safety adapter with real block/report flows.
- [ ] Replace mock notification adapter with real notification data and preferences.
- [ ] Update composer behavior for real eligibility-denial reasons.
- [ ] Update UI messaging for real moderation-enforcement outcomes.

## Backend Tasks (if applicable)
- [ ] Implement chat send/read/typing handlers with eligibility checks.
- [ ] Implement chat lifecycle updates on match/session invalidation.
- [ ] Implement block and report handlers with idempotency safety.
- [ ] Implement cross-system enforcement propagation logic.
- [ ] Implement notification create/read/preferences/dedup/rate-limit handlers.
- [ ] Add audit logs for moderation and high-risk safety actions.

## Firebase Tasks (if applicable)
- [ ] Validate Firestore data paths/indexes for chats/messages/blocks/reports/notifications.
- [ ] Update Firestore rules for participant-only chat access and safety boundaries.
- [ ] Configure or validate FCM integration boundary and token handling.
- [ ] Ensure secure writes for server-owned notification and moderation fields.

## Mock-Data Tasks
- [ ] Keep mixed-mode fixtures for analytics and hardening areas not yet converted.
- [ ] Add fallback scenarios for temporary push transport failures.

## Navigation Tasks
- [ ] Validate routes from matches to threads to conversation with real data.
- [ ] Ensure report/block flows return to safe screens consistently.
- [ ] Ensure denied chat states route to clear fallback states.

## UI Tasks
- [ ] Add robust delivery/read/typing status rendering for real timelines.
- [ ] Add safety feedback banners after block/report actions.
- [ ] Improve notification type rendering and read-state interactions.

## State-Management Tasks
- [ ] Replace chat store actions with real async flows.
- [ ] Replace safety store with real block/report outcomes.
- [ ] Replace notification store with real list/read/preference logic.
- [ ] Add event-driven updates for cross-module enforcement propagation.

## Testing Tasks
- [ ] Add integration tests for chat eligibility happy/denied paths.
- [ ] Add tests for delivery/read/typing state transitions.
- [ ] Add block/report and enforcement propagation tests.
- [ ] Add notification dedup/rate-limit/preference tests.
- [ ] Add tests for moderation action impact on active interactions.
- [ ] Add mixed-mode regression tests for remaining non-converted modules.

## Bugfix/Stabilization Tasks
- [ ] Fix stale eligibility state in active conversation.
- [ ] Resolve out-of-order message state updates.
- [ ] Resolve duplicate notification creation under burst events.

## Documentation Tasks
- [ ] Document real chat eligibility enforcement logic and transitions.
- [ ] Document safety enforcement propagation model.
- [ ] Document notification architecture, preference controls, and dedup policy.
- [ ] Update conversion tracker and Sprint 13 prerequisites.

## Release/Readiness Tasks (if applicable)
- [ ] Prepare Sprint 12 demo covering chat + safety + notification real flows.
- [ ] Publish QA/security validation summary.
- [ ] Confirm Sprint 13 hardening readiness.

## Sprint Exit Checklist
- [ ] Sprint-12 PRD scope delivered or formally deferred.
- [ ] Sprint-12 TestPlan executed with evidence.
- [ ] No blocker defects in chat/safety/notification conversion scope.
- [ ] Real conversion sign-off for Sprint 12 completed.
