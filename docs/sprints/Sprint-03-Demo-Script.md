# Sprint-03 Demo Script - Mock Venues, Nearby Discovery, Check-In, and Check-Out

## Purpose
Provide a deterministic walkthrough of Sprint-03 venue discovery and presence lifecycle behavior for stakeholder review.

## References
- `docs/sprints/Sprint-03-PRD.md`
- `docs/sprints/Sprint-03-TestPlan.md`
- `docs/sprints/Sprint-03-Todo.md`
- `docs/product/Night Vibe - Phases and Sprints Delivery Plan.md`
- `mobile/docs/checkin-checkout-mock-state-machine.md`
- `mobile/docs/sprint-03-proximity-location-scenario-matrix.md`
- `mobile/docs/sprint-03-mocked-vs-real-boundaries.md`

## Demo Preconditions
- Branch: `Sprint-03`
- Runtime mode is Phase 1 mock (`phase1-mock`)
- Mobile dependencies installed in `mobile/` (`npm ci`)
- Validation baseline passed:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test -- --runInBand`

## Demo Runtime Commands
From `mobile/`:
1. `npm start -- --clear`
2. Open Android emulator or iOS simulator.
3. Log in with active persona and navigate to Nearby Venues.

## Required Outcome Scenarios

### A) Nearby Venues Discovery Baseline
- [ ] Open Nearby Venues screen.
- [ ] Verify deterministic ordering and that venue card metadata is visible (distance/category/activity/status).
- [ ] Open a venue details screen and verify check-in entry action is present when venue is eligible.

### B) Check-In Success (`in_range_success`)
- [ ] From Venue Details, continue to Check-In Confirmation.
- [ ] Trigger success scenario and confirm success result state.
- [ ] Open Active Venue Session and verify active venue/session state is visible.

### C) Out-of-Range Denial (`out_of_range`)
- [ ] Trigger out-of-range scenario from Check-In Confirmation.
- [ ] Verify denied state maps to `OUT_OF_RANGE` with clear user-facing guidance.

### D) Location Permission Denied (`location_permission_denied`)
- [ ] Trigger location permission denied scenario.
- [ ] Verify denied state maps to `PERMISSION_DENIED` and location guidance is shown.

### E) Stale Location (`stale_location`)
- [ ] Trigger stale location scenario.
- [ ] Verify denied state maps to `VALIDATION_ERROR` with refresh/retry guidance.

### F) Ineligible Venue (`venue_ineligible`)
- [ ] Trigger ineligible venue scenario.
- [ ] Verify denied state maps to `NOT_FOUND` with ineligible/not available guidance.

### G) Single Active Session Replacement
- [ ] Check in to Venue A successfully.
- [ ] Check in to Venue B successfully.
- [ ] Verify old session is closed with replacement behavior and active session now points to Venue B.

### H) Manual Checkout
- [ ] From Active Venue Session, enter Checkout Confirmation.
- [ ] Confirm checkout.
- [ ] Verify active session is closed and flow returns to non-active state.

### I) Session Timeout Simulation
- [ ] Start from active session state.
- [ ] Advance deterministic clock using mock scenario controls.
- [ ] Verify timeout transition is reflected in session UI and the session is no longer active.

### J) Venue Presence Visibility
- [ ] Open Venue Presence screen while in active session.
- [ ] Verify mock participant summaries render.
- [ ] Verify closed/expired session context is excluded from active presence display.

## Suggested Demo Narrative
1. Show Nearby Venues list and venue details.
2. Demonstrate successful check-in and active session.
3. Run all four denial scenarios (`OUT_OF_RANGE`, `PERMISSION_DENIED`, `VALIDATION_ERROR`, `NOT_FOUND`).
4. Demonstrate one-active-session replacement (Venue A -> Venue B).
5. Demonstrate manual checkout and timeout simulation.
6. Close on presence visibility and mock-vs-real boundary.

## Demo Exit Criteria
- All sections A-J above are completed.
- Required scenario outcomes are demonstrated deterministically.
- One-active-session replacement and timeout behavior are shown.
- No Severity-1/Severity-2 defect appears in Sprint-03 scope during walkthrough.
- Stakeholder review confirms Sprint-03 demo readiness.