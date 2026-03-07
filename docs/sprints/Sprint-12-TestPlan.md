# Sprint-12 Test Plan - Real Chat, Safety Enforcement, and Notifications Conversion

## Scope Under Test
- Real chat threads/conversation send/read/typing behavior.
- Real chat eligibility enforcement based on match + co-location validity.
- Real block/report actions and enforcement propagation.
- Real notifications list/read/preferences/dedup/rate-limit behavior.
- Cross-system consistency after moderation and account-status changes.

## Happy Paths
1. Eligible matched/co-located users exchange messages successfully.
2. Delivery state transitions progress from sent to delivered to read.
3. Typing indicator appears and expires as expected.
4. User blocks another user and chat/discovery access updates immediately.
5. User reports another user and report status is tracked.
6. Notification preferences update and notification center reflects expected items.

## Edge Cases
- Match/session invalidates during active conversation.
- Block action occurs while message send request is in-flight.
- Duplicate report submission due to retry behavior.
- Notification burst events trigger dedup/rate-limit logic.
- Moderator action updates account status during active thread.

## Negative Cases
- Ineligible send returns `CHAT_EXPIRED` or denied status.
- Unauthorized access to chat resource returns `ACCESS_DENIED`.
- Privileged moderation action by non-authorized role returns `PERMISSION_DENIED`.
- Invalid payloads return `VALIDATION_ERROR`.
- Internal backend errors map to safe `INTERNAL_ERROR` UI behavior.

## Role-Based Cases
- `RegularUser` can chat/report/block within allowed rules.
- `Moderator` actions propagate correctly to user-level interaction restrictions.
- `Administrator` override paths remain policy-aligned.
- Restricted account statuses are denied interactive operations.

## Device/Platform Cases
- Android emulator end-to-end chat and safety flows.
- iOS simulator end-to-end chat and safety flows.
- Notification list and settings usability checks on both platforms.

## Mock-Mode / Real-Mode Cases
- Converted chat/safety/notification modules operate real-backed.
- Remaining non-converted hardening/analytics modules coexist in mixed mode.
- No fallback to mock for converted enforcement-critical decisions.

## Regression Checklist
- [ ] Sprint 08 auth/account restrictions remain enforced.
- [ ] Sprint 09 profile/RBAC remains stable.
- [ ] Sprint 10 venue lifecycle and permissions remain stable.
- [ ] Sprint 11 presence/discovery/matching remains stable.
- [ ] Global loading/error/empty-state behavior remains consistent.

## Acceptance Checklist
- [ ] Chat eligibility and delivery lifecycle validated.
- [ ] Block/report and cross-system enforcement validated.
- [ ] Notification preference/dedup/rate-limit validated.
- [ ] Lint/typecheck/tests pass for sprint scope.
- [ ] No Severity-1/Severity-2 defects in Sprint 12 scope.

## Test Data and Environment Notes
- Environments: staging preferred with converted modules enabled.
- Data setup: active test users with matches, sessions, and varied safety statuses.
- Preconditions: converted dependencies from Sprints 08-11 available.

## Exit Reporting
- Publish pass/fail matrix for chat, safety, and notifications tracks.
- Log defects by severity, owner, and target sprint.
- Provide go/no-go recommendation for Sprint 13 kickoff.
