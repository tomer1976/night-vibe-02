# Sprint-03 Todo - Mock Venues, Nearby Discovery, Check-In, and Check-Out

## Frontend Tasks
- [x] Implement Nearby Venues list screen with category/status/activity metadata.
- [x] Implement Venue Details screen and check-in entry action.
- [x] Implement Check-In Confirmation flow with scenario-based outcomes.
- [x] Implement Active Venue Session screen and live session-state indicators.
- [x] Implement Checkout Confirmation flow and post-checkout state handling.
- [x] Implement Venue Presence screen with mock active attendee summaries.

## Backend Tasks (if applicable)
- [x] Define `VenueDiscoveryService` and `PresenceService` contracts for future real conversion.
- [x] Define presence state transition model and reason codes for close/expiry.

## Firebase Tasks (if applicable)
- [x] Ensure Firebase adapters remain disabled in Phase 1 mode.
- [x] Add placeholder interfaces for future check-in/check-out callable operations.

## Mock-Data Tasks
- [x] Create venue fixture catalog (active/pending/rejected/suspended examples).
- [x] Create mock coordinates and deterministic distance outputs.
- [x] Create mock active session fixtures including replaced and expired sessions.
- [x] Add scenario toggles for out-of-range, permission denied, stale location.
- [x] Add mock venue presence participant fixtures.

## Navigation Tasks
- [x] Wire navigation flow: Nearby Venues -> Venue Details -> Check-In Confirmation.
- [x] Wire Active Session -> Checkout Confirmation -> Nearby Venues return path.
- [x] Add guards for profile completion/account status before venue routes.

## UI Tasks
- [x] Build venue list cards with distance, category, and activity indicators.
- [x] Build session status cards and timer/elapsed indicators.
- [x] Add clear messaging states for denied check-in reasons.
- [x] Add empty-state and retry-state components for venue/presence views.

## State-Management Tasks
- [x] Implement venue discovery state store (filters/sort/cached list).
- [x] Implement presence/session store for active session lifecycle.
- [x] Implement deterministic mock clock integration for timeout simulation.
- [x] Implement derived selectors for check-in eligibility display states.

## Testing Tasks
- [x] Add happy-path tests for venue browse -> check-in -> active session -> checkout.
- [x] Add edge tests for out-of-range and permission-denied scenarios.
- [x] Add one-active-session enforcement tests (replacement behavior).
- [x] Add timeout simulation tests and UI transition checks.
- [x] Add regression tests for Sprint 01/02 route guard compatibility.

## Bugfix/Stabilization Tasks
- [x] Fix stale session UI after replacement or timeout events.
- [ ] Resolve race conditions in rapid check-in/check-out mock interactions.
- [ ] Fix cross-screen inconsistency in venue status rendering.

## Documentation Tasks
- [ ] Document check-in/check-out mock state machine.
- [ ] Document scenario matrix for proximity and location outcomes.
- [ ] Document mocked-vs-real boundaries for venue/presence modules.
- [ ] Record conversion notes for Phase 2 real presence implementation.

## Release/Readiness Tasks (if applicable)
- [ ] Prepare Sprint 03 demo script for all check-in outcome scenarios.
- [ ] Publish QA report and open-defect summary.
- [ ] Finalize carry-over list for Sprint 04 dependencies.

## Sprint Exit Checklist
- [ ] Sprint-03 PRD commitments delivered or formally deferred.
- [ ] Sprint-03 TestPlan executed and signed off.
- [ ] No blocker defects in venue discovery and presence lifecycle paths.
- [ ] Stakeholder sprint demo completed successfully.
