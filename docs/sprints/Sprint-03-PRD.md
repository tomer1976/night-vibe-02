# Sprint 03 PRD - Mock Venues, Nearby Discovery, Check-In, and Check-Out

## Sprint Objective
Deliver complete mocked venue exploration and presence lifecycle flows, including nearby venue discovery, venue details, check-in eligibility simulation, active session management, and check-out behavior, while enforcing Night Vibe’s one-active-session and venue-gated interaction principles in client-only mode.

## Business Context
Night Vibe’s core product differentiation is venue-based, proximity-gated interaction. Sprint 03 validates whether users can understand and successfully execute venue discovery and presence workflows before discovery/matching/chat features are layered in later sprints.

## User Stories
- As a user, I can view nearby venues in a list sorted by relevant criteria.
- As a user, I can enter venue details only after checking in.
- As a user, I can attempt check-in and receive clear success/failure feedback based on proximity scenarios.
- As a user, I can see my active venue session status and check out.
- As a QA/product stakeholder, I can simulate location and session edge cases deterministically.

## UX Scope
- Nearby Venues Screen
- Venue Details Screen
- Venue Check-In Confirmation Screen
- Active Venue Session Screen
- Venue Checkout Confirmation Screen
- Venue Presence Screen
- Error and Retry Screen for venue/presence failure states
- Empty State Screen for no nearby venues / no active session

## Functional Requirements
1. Implement mocked nearby venue discovery list:
   - List-first UI (no dependency on paid map products)
   - Mock distance display and deterministic sorting
   - Venue status badges and activity snapshot preview
2. Implement venue detail flow:
   - Venue metadata, category, status, and mock activity signals
  - Entry is allowed only for users currently checked into that venue
3. Implement mocked check-in validation scenarios:
   - In-range success
   - Out-of-range denial
   - Location unavailable / permission denied
   - Venue not active / ineligible
4. Enforce single active venue session behavior in mock engine:
   - New check-in auto-closes prior active session
   - Session state transitions with deterministic timestamps
5. Implement active session and checkout UX:
   - Active session card/details
   - Manual checkout flow
   - Session timeout simulation state
6. Implement venue presence display behavior from mock active sessions.
7. Provide scenario toggles in dev mode for deterministic QA/demo runs.

## Non-Functional Requirements
- No external map/place provider integration.
- All proximity and location outcomes simulated locally and deterministically.
- Venue list interactions should feel responsive for mock dataset sizes.
- State transitions should remain deterministic across app restarts in mock mode.
- Architecture should keep check-in and distance logic abstracted for future server-authoritative replacement.

## Edge Cases
- User attempts check-in while already in active session at another venue.
- Check-in succeeds, then immediate retry is triggered.
- Session expires while user is on Active Session screen.
- Venue status switches from active to non-active in simulated data.
- No nearby venues returned.
- Location permission toggled off after user entered venue list.

## Mocked vs Real Behavior Expectations
- Mocked in Sprint 03:
  - Nearby venue data source.
  - Distance calculations and proximity outcomes.
  - Session creation/closure logic.
  - Timeout event generation.
- Real in Phase 2 conversion:
  - Device location validation by backend logic.
  - Haversine distance and range enforcement server-side.
  - Transactional one-active-session enforcement in Firestore.
  - Real presence visibility from active sessions.
- Contract constraint:
  - UI consumes `VenueDiscoveryService` and `PresenceService` interfaces only.

## API/Data Contract Expectations (if relevant)
- Mock responses should mirror expected production contracts for:
  - venue list retrieval
  - check-in request
  - checkout request
  - active session fetch
- Simulate relevant error codes:
  - `OUT_OF_RANGE`
  - `NOT_FOUND`
  - `VALIDATION_ERROR`
  - `RATE_LIMIT_EXCEEDED`
  - `INTERNAL_ERROR`

## Screen-Level Behavior
- Nearby Venues screen displays list with distance and activity snapshot values.
- Nearby venue card tap does not navigate to venue details, except for the currently checked-in venue card which opens venue details.
- Nearby venue `Check-In` button checks user in and then navigates to venue details.
- Nearby venue `Checkout` button checks user out and keeps user on Nearby Venues.
- Venue Details screen is accessible only while user is checked into that venue.
- Venue Details `Checkout` action checks out and navigates back to Nearby Venues.
- Check-In confirmation displays scenario-specific outcome.
- Active Venue Session screen displays venue and session duration/status.
- Checkout confirmation closes active session and returns to non-active state.
- Presence screen reflects currently active same-venue participants from mock data.

## Role/Permission Impact
- Primary execution role: `RegularUser`.
- Venue owner/moderator/admin behaviors are out-of-scope for implementation in this sprint.
- Mock account status restrictions from Sprint 02 still apply.

## Analytics/Events to Track (if relevant)
- `nearby_venues_requested_mock`
- `venue_details_opened_mock`
- `checkin_attempted_mock`
- `checkin_succeeded_mock`
- `checkin_failed_out_of_range_mock`
- `session_replaced_mock`
- `checkout_initiated_mock`
- `checkout_completed_mock`
- `session_timeout_simulated_mock`

## QA Acceptance Criteria
- Nearby venue list renders correctly with deterministic sorting.
- Check-in flow works across all required mock scenarios.
- One active session rule is consistently enforced in simulated behavior.
- Checkout and timeout transitions update all relevant UI states.
- Venue presence screen reflects active session scenarios accurately.
- No real backend/network dependency is introduced.

## Dependencies
- Sprint 01 architecture/design system.
- Sprint 02 auth/profile completion gate and account-state handling.
- Product constraints for venue gating and single active session.

## Exclusions
- Real GPS hardware trust model enforcement.
- Real backend proximity validation.
- Real check-in persistence and server transactions.
- Discovery/matching/chat domain logic (covered in later sprints).

## Definition of Done
- All in-scope venue/presence screens implemented and connected.
- Deterministic check-in/check-out scenario pack available for demos/tests.
- One-active-session behavior validated through test cases.
- Sprint-03 TestPlan executed with documented outcomes and no blocker defects.
