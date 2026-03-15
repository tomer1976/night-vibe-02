# Sprint-05 Test Plan - Mock Chat, Safety, and Notifications

## Scope Under Test
- Matches and chat thread rendering.
- Conversation send/delivery/read/typing behavior.
- Chat eligibility enforcement for same-venue active match.
- Block/report flows and cross-surface safety enforcement.
- Notification list, read state, preferences, dedup/rate limiting.

## Sprint Kickoff Preconditions
- Sprint-04 completion artifacts reviewed:
	- `docs/sprints/Sprint-04-Completion-Summary.md`
	- `docs/sprints/Sprint-04-TestReport.md`
	- `docs/sprints/Sprint-04-Carry-Over.md`
- Carry-over risk controls are explicitly tracked in Sprint-05 execution:
	- `S4-CO-001`
	- `S4-CO-002`
	- `S4-CO-003`
- Sprint-04 manual platform checks (`MANUAL-04-AND-01`, `MANUAL-04-IOS-01`, `MANUAL-04-LAYOUT-01`) remain risk controls for Sprint-05 signoff.

## Happy Paths
1. User opens active match conversation and sends message successfully.
2. Message transitions from `sent` to `delivered` to `read` in order.
3. User sees typing indicator that appears/disappears correctly.
4. User reports another user and receives submission confirmation.
5. User updates notification preferences and list respects settings.

## Edge Cases
- Match expires during open conversation.
- User leaves venue and chat composer disables in-session.
- Block action taken after recent message exchange.
- Repeated report submission attempts for same target.
- Notification burst triggers dedup/rate-limit handling.
- Typing indicator timeout events delayed/out-of-order.

## Negative Cases
- Simulated `CHAT_EXPIRED` on send attempt.
- Simulated `ACCESS_DENIED` for blocked or restricted interactions.
- Simulated `RATE_LIMIT_EXCEEDED` for message/report/notification actions.
- Simulated `VALIDATION_ERROR` for invalid message payload.
- Simulated `INTERNAL_ERROR` with retry pathway validation.

## Role-Based Cases
- `RegularUser` can access own chat/safety flows.
- Restricted account statuses (suspended/banned) are denied interactive actions.
- Role context does not bypass account/safety restrictions.

## Device/Platform Cases
- Android emulator validation for chat typing and scrolling behavior.
- iOS simulator validation for keyboard, composer, and safe-area interactions.
- Portrait consistency checks across all in-scope screens.

## Mock-Mode Cases
- Deterministic scenario packs replay identical chat/safety outcomes.
- Mock event propagation updates dependent screens immediately.
- No real backend/Firebase requests during execution.

## Regression Checklist
- [ ] Sprint 01 shell and global component stability maintained.
- [ ] Sprint 02 account-state gating still enforced.
- [ ] Sprint 03 presence/session state still drives eligibility conditions.
- [ ] Sprint 04 match lifecycle integration remains intact.
- [ ] Sprint-04 carry-over risks (`S4-CO-001..003`) remain controlled in chat/safety/notification flows.
- [ ] Global error/empty-state behavior unchanged and consistent.

## Acceptance Checklist
- [ ] All Sprint 05 in-scope screens implemented and reachable.
- [ ] Chat eligibility gating validated across required scenarios.
- [ ] Blocking/reporting enforcement validated end-to-end in mock mode.
- [ ] Notification behavior validated for read, preference, dedup, and rate-limit cases.
- [ ] Lint/typecheck/tests pass for sprint changes.
- [ ] No Severity-1/Severity-2 open defects in sprint scope.

## Test Data and Environment Notes
- Environment: local mock mode only.
- Data sources: deterministic fixtures for matches/chats/safety/notifications.
- Preconditions: active session + active match fixture required for happy-path chat tests.

## Exit Reporting
- Publish pass/fail matrix for chat, safety, and notifications.
- Track defects by severity, owner, and fix target sprint.
- Provide go/no-go recommendation for Sprint 06 kickoff.
