# Sprint-05 Todo - Mock Chat, Safety, and Notifications

## Kickoff Alignment Tasks
- [x] Review Sprint-04 carry-over risks (`S4-CO-001`, `S4-CO-002`, `S4-CO-003`) and map explicit mitigation checks into Sprint-05 implementation/testing.
- [x] Confirm Sprint-04 QA evidence baseline is attached (`docs/sprints/Sprint-04-TestReport.md`) and note `S4-CO-004` as resolved.
- [ ] Track Sprint-04 manual platform readiness items (`MANUAL-04-AND-01`, `MANUAL-04-IOS-01`, `MANUAL-04-LAYOUT-01`) as Sprint-05 signoff risk controls.

### Task 1 Mitigation Mapping (`S4-CO-001..003`)
- `S4-CO-001` eligibility drift mitigation checks:
	- Add deterministic eligibility selector tests that recompute composer state from match + active session + block state on each relevant event.
	- Add navigation guard checks so ineligible chat transitions route to disabled/error state without stale composer enablement.
- `S4-CO-002` reciprocal-like timing mitigation checks:
	- Preserve Sprint-04 exactly-once match identity usage (`match_id`) when creating/retrieving mock chat sessions.
	- Add dedup verification in notifications for repeated match/message events within dedup window.
- `S4-CO-003` expiration/block propagation mitigation checks:
	- Add cross-surface propagation tests that block/expire events disable chat and remove discovery visibility in the same scenario tick.
	- Add regression checks for blocked-user consistency across conversation, thread list, and blocked-users screens.

### Task 1 Verification Notes
- Baseline references reviewed:
	- `docs/sprints/Sprint-04-Carry-Over.md`
	- `docs/sprints/Sprint-04-TestReport.md`
	- `mobile/docs/sprint-04-match-lifecycle-state-machine-and-triggers.md`
	- `mobile/docs/sprint-04-interaction-idempotency-phase-2-conversion.md`
- Resolution confirmation:
	- `S4-CO-004` is resolved based on published Sprint-04 QA evidence in `docs/sprints/Sprint-04-TestReport.md` and reflected in Sprint-04 closeout artifacts.

## Frontend Tasks
- [ ] Implement Matches List screen with active/expired match states.
- [ ] Implement Chat Threads list with latest message and status preview.
- [ ] Implement Chat Conversation UI with composer, bubbles, and message states.
- [ ] Implement Report User and Block Confirmation flows.
- [ ] Implement Blocked Users and Safety Center screens.
- [ ] Implement Notification Center and Notification Preferences screens.

## Backend Tasks (if applicable)
- [ ] Define `ChatService` interface including eligibility checks and message lifecycle methods.
- [ ] Define `SafetyService` interface for block/report actions and enforcement callbacks.
- [ ] Define `NotificationService` interface for list/read/preferences/dedup operations.

## Firebase Tasks (if applicable)
- [ ] Keep Firebase adapters disabled in Phase 1 mode.
- [ ] Add placeholder DTO mappings for future chat/safety/notification endpoints.

## Mock-Data Tasks
- [ ] Create mock chat thread/message fixture sets with delivery/read states.
- [ ] Create typing indicator scenario fixtures with timeout behavior.
- [ ] Create block/report fixture states and moderation outcome placeholders.
- [ ] Create notification fixtures for unread/read, dedup, and rate-limit scenarios.
- [ ] Add deterministic scenario packs for chat eligibility transitions.

## Navigation Tasks
- [ ] Wire flow: Matches -> Threads -> Conversation.
- [ ] Wire report/block entry from conversation and profile preview contexts.
- [ ] Wire notification entry points and return paths.
- [ ] Add route guards for ineligible chat sessions.

## UI Tasks
- [ ] Build message composer disabled-state UI with reason labels.
- [ ] Build delivery/read status indicators for message rows.
- [ ] Build safety status banners and confirmation modals.
- [ ] Build notification item variants by type and read status.
- [ ] Ensure dark-theme consistency and accessibility contrast.

## State-Management Tasks
- [ ] Implement chat store for threads, messages, and eligibility state.
- [ ] Implement safety store for block/report and enforcement outcomes.
- [ ] Implement notification store for read state and preference filters.
- [ ] Implement event-bus handling for cross-surface state updates.

## Testing Tasks
- [ ] Add happy-path tests for message send/deliver/read flows.
- [ ] Add eligibility tests for `match_active + same_venue` constraints.
- [ ] Add block/report action tests and immediate enforcement checks.
- [ ] Add typing indicator timeout tests.
- [ ] Add notification dedup/rate-limit and preference tests.
- [ ] Add regression tests for Sprint 03/04 integrations.

## Bugfix/Stabilization Tasks
- [ ] Resolve stale eligibility state in open chat threads.
- [ ] Fix duplicate notification rendering under rapid events.
- [ ] Fix inconsistent blocked-user visibility across screens.

## Documentation Tasks
- [ ] Document mocked chat eligibility policy and transition triggers.
- [ ] Document safety enforcement propagation across chat/discovery surfaces.
- [ ] Document notification event taxonomy and dedup rules.
- [ ] Record Phase 2 conversion notes for real chat/safety/notification modules.

## Release/Readiness Tasks (if applicable)
- [ ] Prepare Sprint 05 demo script with safety and eligibility scenarios.
- [ ] Publish QA report with pass/fail and defect summary.
- [ ] Confirm handoff readiness for Sprint 06 dashboard-focused scope.

## Sprint Exit Checklist
- [ ] Sprint-05 PRD scope delivered or formally deferred.
- [ ] Sprint-05 TestPlan executed with evidence.
- [ ] No blocker defects in chat/safety/notification flows.
- [ ] Sprint review approval completed.
