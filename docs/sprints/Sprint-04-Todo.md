# Sprint-04 Todo - Mock Discovery, Interactions, and Match Lifecycle

## Frontend Tasks
- [x] Implement User Discovery Feed UI with deterministic candidate progression.
- [x] Implement Discovery Profile Preview with conditional action controls (`like|unlike` for potential, `unmatch` for match).
- [x] Implement Match Confirmation screen/overlay behavior.
- [x] Implement empty and error discovery states with retry handling.
- [x] Add interaction feedback states (loading/success/duplicate/failure).

## Backend Tasks (if applicable)
- [x] Define `DiscoveryService`, `InteractionService`, and `MatchService` interfaces for Phase 2 parity.
- [x] Define idempotency and duplicate-detection behavior contract for interactions.

## Firebase Tasks (if applicable)
- [x] Keep Firebase adapters disabled in Phase 1 mode.
- [x] Add placeholder client contract mappers for future `/api/v1` discovery/interaction endpoints.

## Mock-Data Tasks
- [x] Create candidate fixture datasets partitioned by venue/session context.
- [x] Create preference compatibility fixture matrix.
- [x] Create block/skip fixture states to validate filtering behavior.
- [x] Create reciprocal-like scenario fixture packs.
- [x] Create match lifecycle fixture states (`matched`, `expired`, `blocked`).
- [x] Implement deterministic pagination cursor fixture generation.

## Navigation Tasks
- [x] Wire route flow: Discovery Feed -> Profile Preview -> Match Confirmation -> Feed return.
- [x] Add guard for users without active venue session.
- [x] Add fallback route for exhausted feed and ineligible discovery states.

## UI Tasks
- [x] Build candidate card components and action affordances.
- [x] Implement clear eligibility and state labels in preview UI.
- [x] Add visual treatment for match-created and match-expired states.
- [x] Ensure dark-theme token consistency and accessibility baseline.

## State-Management Tasks
- [x] Implement discovery feed store with pagination and filter state.
- [x] Implement interaction queue state with duplicate protection.
- [x] Implement match store for lifecycle transitions and event replay.
- [x] Add selectors for same-venue eligibility and candidate visibility reasons.

## Testing Tasks
- [x] Add happy-path tests: feed load -> like -> reciprocal match.
- [ ] Add tests for no-active-session discovery denial.
- [ ] Add duplicate-interaction prevention tests.
- [ ] Add preference/block/skip filter correctness tests.
- [ ] Add pagination tests for end-of-feed and cursor progression.
- [ ] Add match-expiration transition tests.

## Bugfix/Stabilization Tasks
- [ ] Resolve rapid-tap interaction race conditions.
- [ ] Fix stale candidate rendering after block/skip updates.
- [ ] Fix incorrect match confirmation triggers from non-reciprocal scenarios.

## Documentation Tasks
- [ ] Document mock discovery pipeline and filtering order.
- [ ] Document interaction idempotency behavior for Phase 2 conversion.
- [ ] Document match lifecycle state machine and transition triggers.
- [ ] Capture known limitations and carry-over risks for Sprint 05.

## Release/Readiness Tasks (if applicable)
- [ ] Prepare demo script covering key scenario matrix.
- [ ] Publish QA test execution report and open issue summary.
- [ ] Confirm readiness gates for Sprint 05 handoff.

## Sprint Exit Checklist
- [ ] Sprint-04 PRD scope delivered or formally deferred.
- [ ] Sprint-04 TestPlan executed with evidence.
- [ ] No blocker defects in discovery/interaction/match flows.
- [ ] Sprint review approval completed.
