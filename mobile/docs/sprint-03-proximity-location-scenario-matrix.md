# Sprint-03 Proximity and Location Scenario Matrix

## Purpose
Define the deterministic scenario matrix for proximity and location outcomes used in Sprint-03 check-in validation flows.

This document provides QA-ready expectations for request payload shape, expected API-envelope outcome, and expected UI messaging behavior.

## Source Alignment
- `docs/sprints/Sprint-03-PRD.md`
- `docs/sprints/Sprint-03-TestPlan.md`
- `docs/product/Night Vibe - Specification.md` (Section 8: FR-8.1, FR-8.2, FR-8.3, FR-8.5, FR-8.6)
- `docs/architecture/api-specification.md` (Section 10.2 / 10.3)
- `mobile/src/screens/CheckInConfirmationScreen.tsx`
- `mobile/src/services/mockBackendServiceLocator.ts`
- `mobile/docs/checkin-checkout-mock-state-machine.md`

## Scope and Constraints
- Phase-1 mock mode only (no Firebase/network dependency).
- One-active-session invariant remains enforced.
- Venue check-in radius is 75m (mock constant aligned to product default).
- Stale location threshold is 5 minutes in the current mock service implementation.
- Timeout window is 4 hours in the current mock service implementation.

## Scenario Matrix

| Scenario key | Trigger in check-in confirmation flow | `presence.checkInWithContext` result | Expected UI outcome | Notes |
|---|---|---|---|---|
| `in_range_success` | Valid active venue ID + finite coordinates near venue | `SUCCESS` payload with `sessionId`, `checkinTimestamp`, `previousVenueCheckout` | Success state, `Result: Success`, CTA to open Active Session | Creates new session or returns existing same-venue active session |
| `out_of_range` | Valid venue ID + finite coordinates outside radius | `FAIL` with `OUT_OF_RANGE` | Denied state with out-of-range messaging and reason code | Error details include rounded `distance_meters` and `max_allowed_meters` |
| `location_permission_denied` | Coordinates passed as non-finite values (`NaN`) | `FAIL` with `PERMISSION_DENIED` | Denied state with location-permission-required messaging | Used to simulate unavailable/denied location signal |
| `stale_location` | Valid coordinates + old `locationCapturedAt` timestamp | `FAIL` with `VALIDATION_ERROR` | Denied state with stale-location refresh messaging | Triggered when `now - locationCapturedAt > 5 minutes` |
| `venue_ineligible` | Mutated/ineligible venue ID (not active or not found) | `FAIL` with `NOT_FOUND` | Denied state with venue-ineligible messaging | Covers inactive or missing venue eligibility path |

## Derived Presence Lifecycle Outcomes

| Lifecycle outcome | Trigger | Expected result | Related code |
|---|---|---|---|
| Session replacement (`auto_replaced`) | User checks in to Venue B while active in Venue A | Prior active session closes, new session opens, `previousVenueCheckout = true` | `mobile/src/services/mockBackendServiceLocator.ts` + `mobile/src/state/presenceSessionStore.ts` |
| Same-venue idempotent check-in | User checks in again to same venue while already active | Existing session is reused, no replacement transition appended | `mobile/src/services/mockBackendServiceLocator.ts` |
| Manual checkout | User invokes checkout while active | `SUCCESS` checkout response, transition reason `manual_checkout` | `mobile/src/services/mockBackendServiceLocator.ts` |
| Checkout without active session | User invokes checkout when no active session exists | `FAIL` with `NOT_CHECKED_IN` | `mobile/src/services/mockBackendServiceLocator.ts` |
| Timeout expiry | Active session exceeds 4h timeout window | Session marked `expired`, transition reason `timeout` | `mobile/src/services/mockBackendServiceLocator.ts` |

## Deterministic QA Execution Notes
1. Start in mock mode (`phase1-mock`) and use `Venue Check-In Confirmation Screen` scenario buttons.
2. Verify result badge, denied-message copy, and reason code are aligned to matrix rows above.
3. Verify active-session/replacement outcomes on `Active Venue Session Screen` and transition history paths.
4. Use deterministic clock progression for timeout validation before re-querying active session.

## Mocked vs Real Reminder
- Mocked in Sprint-03: venue eligibility simulation, proximity computation, session mutation, timeout generation.
- Real in Phase-2: server-authoritative location validation, transactional single-session enforcement, backend-authored timestamps/events.
