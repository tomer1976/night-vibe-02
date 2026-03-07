# Sprint-11 Todo - Real Presence, Nearby Discovery, Interactions, and Matching Conversion

## Frontend Tasks
- [ ] Replace mock presence/discovery/match adapters with real implementations.
- [ ] Integrate check-in/check-out UI with real response handling.
- [ ] Integrate discovery feed with real pagination and filter outcomes.
- [ ] Integrate interaction actions (like/pass) with real idempotent requests.
- [ ] Integrate match confirmation and lifecycle state updates.

## Backend Tasks (if applicable)
- [ ] Implement check-in proximity validation endpoint/handler.
- [ ] Implement single-active-session enforcement transaction logic.
- [ ] Implement checkout and timeout closure handlers.
- [ ] Implement real discovery candidate generation pipeline.
- [ ] Implement like/pass persistence with duplicate prevention and idempotency.
- [ ] Implement reciprocal-like match creation and expiration handlers.
- [ ] Emit and log domain events for session and match lifecycle.

## Firebase Tasks (if applicable)
- [ ] Validate Firestore structure and indexes for sessions/interactions/matches/discovery queries.
- [ ] Update Firestore security rules for converted read/write paths.
- [ ] Validate transaction behavior and conflict handling under load tests.

## Mock-Data Tasks
- [ ] Keep mixed-mode fixture support for non-converted chat/safety modules.
- [ ] Create replay fixtures for concurrency and idempotency test scenarios.

## Navigation Tasks
- [ ] Validate route guards for not-checked-in discovery entry.
- [ ] Ensure consistent navigation between venue session and discovery flows.
- [ ] Route expired/ineligible states to correct fallback screens.

## UI Tasks
- [ ] Improve check-in denial messaging (`out_of_range`, eligibility failures).
- [ ] Ensure discovery cards render real preview projection fields only.
- [ ] Ensure empty/error states handle real backend failures cleanly.

## State-Management Tasks
- [ ] Replace session store with real backend-synced state.
- [ ] Implement discovery feed store with real cursor management.
- [ ] Implement interaction state with request dedup handling.
- [ ] Implement match lifecycle updates from real events.

## Testing Tasks
- [ ] Add integration tests for check-in success/failure and replacement behavior.
- [ ] Add concurrency tests for one-active-session invariant.
- [ ] Add discovery eligibility/filter correctness tests.
- [ ] Add duplicate interaction and idempotency tests.
- [ ] Add reciprocal match creation and expiration tests.
- [ ] Add mixed-mode regression tests for unconverted modules.

## Bugfix/Stabilization Tasks
- [ ] Fix session conflict race conditions.
- [ ] Resolve stale discovery results after session transitions.
- [ ] Resolve duplicate match creation edge cases.

## Documentation Tasks
- [ ] Document real presence/check-in architecture and policy thresholds.
- [ ] Document discovery pipeline ordering and filtering logic.
- [ ] Document interaction idempotency strategy and duplicate prevention.
- [ ] Document match lifecycle and event emissions.
- [ ] Update conversion tracker and Sprint 12 prerequisites.

## Release/Readiness Tasks (if applicable)
- [ ] Prepare Sprint 11 demo with two-user real co-location scenarios.
- [ ] Publish QA and performance summary.
- [ ] Confirm Sprint 12 readiness for chat/safety/notification conversion.

## Sprint Exit Checklist
- [ ] Sprint-11 PRD scope delivered or formally deferred.
- [ ] Sprint-11 TestPlan executed with evidence.
- [ ] No blocker defects in presence/discovery/interaction/match scope.
- [ ] Real conversion sign-off for Sprint 11 completed.
