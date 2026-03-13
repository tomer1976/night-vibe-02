# Check-In / Check-Out Mock State Machine (Sprint-03)

## Purpose
This document defines the implemented Sprint-03 mock presence state machine for:
- venue check-in eligibility and creation
- manual check-out behavior
- timeout and auto-replacement session closure
- deterministic transition history used by UI/QA

It is implementation-derived and intended to keep QA/demo runs repeatable in Phase 1 mock mode.

## Source Alignment
- Product specification: `docs/product/Night Vibe - Specification.md`
- Sprint scope: `docs/sprints/Sprint-03-PRD.md`
- Sprint test expectations: `docs/sprints/Sprint-03-TestPlan.md`
- Architecture constraints: `docs/architecture/system-architecture.md`
- Mobile implementation:
  - `mobile/src/services/mockBackendServiceLocator.ts`
  - `mobile/src/state/presenceSessionStore.ts`
  - `mobile/src/screens/CheckInConfirmationScreen.tsx`
  - `mobile/src/screens/CheckoutConfirmationScreen.tsx`
   - `mobile/src/screens/VenueDetailsScreen.tsx`

## Core Invariants Preserved
1. A user has at most one active venue session.
2. Check-in is venue and proximity gated.
3. Session closure reasons are explicit and deterministic.
4. Expired/closed sessions are excluded from active session queries.
5. Mock mode remains backend-independent (no Firebase/network dependency).

## Canonical States
- `active`: user currently checked into one venue.
- `closed`: session ended by manual checkout or auto replacement.
- `expired`: session ended by deterministic timeout window.

## Canonical Close Reasons
- `manual_checkout`
- `auto_replaced`
- `timeout`
- `venue_invalidated` (reserved in contract; not produced by current Sprint-03 mock service)

## Check-In Decision Flow (`presence.checkInWithContext`)
Input: `venueId`, `latitude`, `longitude`, optional `locationCapturedAt`, optional `idempotencyKey`.

Evaluation order:
1. Apply deterministic timeout sweep to existing active sessions.
2. Validate target venue exists and is `active`.
   - Fail: `NOT_FOUND`
3. Validate coordinates are finite.
   - Fail: `PERMISSION_DENIED`
4. If `locationCapturedAt` provided, enforce stale-location threshold.
   - Fail: `VALIDATION_ERROR`
5. Compute mock distance and enforce radius.
   - Fail: `OUT_OF_RANGE`
6. Resolve existing active session for current user:
   - same venue -> return existing session (no replacement)
   - different venue -> close existing session as `closed` + `auto_replaced`
7. Create active session when needed and return success payload:
   - `status: SUCCESS`
   - `sessionId`
   - `checkinTimestamp`
   - `previousVenueCheckout` flag

## Check-Out Flow (`presence.checkOutActiveSession`)
Evaluation order:
1. Apply deterministic timeout sweep.
2. Resolve current active session for user.
   - none -> fail with `NOT_CHECKED_IN`
3. Close active session with:
   - `status: closed`
   - `closeReason: manual_checkout`
   - `checkoutAt` timestamp from deterministic clock
4. Return success payload with `checkoutTime`.

## Timeout Flow
- Timeout window is deterministic (4h in mock service constants).
- Timeout sweep runs before presence operations (`getMyActiveSession`, `checkInWithContext`, `checkOutActiveSession`, `getStateTransitions`, etc.).
- Any active session older than timeout is transitioned to:
  - `status: expired`
  - `closeReason: timeout`
  - `checkoutAt = checkinAt + timeout_window`

## Transition History Model
`presence.getStateTransitions` derives transitions from non-active sessions and returns sorted deterministic history:
- `sessionId`
- `userId`
- `venueId`
- `fromStatus` (`active`)
- `toStatus` (`closed` | `expired`)
- `reason`
- `transitionedAt`

UI consumers rely on this transition list for active-session timeline indicators.

## Client Store Reducer Rules (`presenceSessionStore`)
Main actions:
- `SET_SESSION_SNAPSHOT`
- `APPLY_CHECKIN_RESULT`
- `APPLY_CHECKOUT`
- `APPLY_TIMEOUT`

Deterministic stale-event protection:
- Reducer computes latest known presence event timestamp from active session check-in + transition history.
- Incoming check-in/check-out/timeout updates older than latest known event are ignored.
- This prevents out-of-order rapid interactions from reverting newer presence state.

## Error/Scenario Matrix (Mock)
- Success in range -> check-in succeeds, active session available.
- Out of range -> `OUT_OF_RANGE`.
- Location permission/unavailable -> `PERMISSION_DENIED`.
- Stale location payload -> `VALIDATION_ERROR`.
- Ineligible/non-active venue -> `NOT_FOUND`.
- Checkout without active session -> `NOT_CHECKED_IN`.

## Mocked vs Real Boundary (Sprint-03)
Mocked now:
- Venue existence/eligibility checks against fixture dataset.
- Distance/proximity via deterministic local calculation.
- Session persistence/mutation in local in-memory fixture clone.
- Timeout event generation from deterministic mock clock.

Phase-2 real conversion target:
- Server-authoritative proximity validation.
- Transactional one-active-session enforcement in backend persistence.
- Backend-generated transition events and authoritative timestamps.

## QA Notes
- Validate replacement path: check into Venue A then Venue B -> old session closed with `auto_replaced`.
- Validate timeout path by advancing mock clock and re-querying active session.
- Validate stale-event protection with rapid check-in/check-out response reordering.
- Ensure UI displays active session state and transition history consistently after each transition.
