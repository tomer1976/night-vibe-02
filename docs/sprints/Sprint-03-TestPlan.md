# Sprint-03 Test Plan - Mock Venues, Nearby Discovery, Check-In, and Check-Out

## Scope Under Test
- Nearby venue discovery list behavior.
- Venue details and check-in initiation flow.
- Mock proximity validation outcomes.
- Single active venue session enforcement.
- Active session, checkout, and timeout transitions.
- Venue presence visibility from mock active sessions.

## Happy Paths
1. User opens Nearby Venues and sees ordered list.
2. User opens Venue Details and successfully checks in (in-range scenario).
3. Active Session screen displays current venue and session status.
4. User manually checks out and active session is closed.
5. Venue Presence screen reflects active participants while checked in.

## Edge Cases
- User checks into Venue A, then checks into Venue B (auto-replace).
- Session timeout occurs while user remains on Active Session screen.
- No nearby venues available in current simulated location.
- Venue status changes to non-active before check-in confirmation.
- User returns to app with previously active mock session persisted.

## Negative Cases
- Out-of-range check-in returns denial state.
- Location permission denied prevents check-in eligibility.
- Stale/invalid location payload triggers validation error state.
- Repeated rapid check-in requests do not corrupt session state.
- Venue details fetch failure renders retry flow safely.

## Role-Based Cases
- `RegularUser` can browse venues and manage own session.
- Non-regular role contexts do not bypass account status restrictions from Sprint 02.
- Suspended/banned account personas are blocked from venue action routes.

## Device/Platform Cases
- Android emulator validation for list scrolling and check-in confirmation UX.
- iOS simulator validation for safe-area, modal confirmations, and timers.
- Portrait behavior validation on all in-scope screens.

## Mock-Mode Cases
- Deterministic scenario toggles reproduce identical outcomes across runs.
- Mock clock-driven timeout events fire predictably.
- Presence participant list updates follow mock session state transitions.
- No external API/Firebase requests are made.

## Regression Checklist
- [ ] Sprint 01 navigation and design-system components remain stable.
- [ ] Sprint 02 auth/profile gating remains intact for venue routes.
- [ ] Global error/retry components remain consistent.
- [ ] Theme and typography consistency maintained across new screens.

## Acceptance Checklist
- [ ] All Sprint 03 in-scope screens implemented and reachable.
- [ ] Check-in scenarios pass for success and denial paths.
- [ ] One-active-session enforcement validated across replacement cases.
- [ ] Checkout and timeout transitions behave correctly.
- [ ] Lint/typecheck/tests pass for changed modules.
- [ ] No Severity-1/Severity-2 defects in Sprint 03 scope.

## Test Data and Environment Notes
- Environment: local mock mode only.
- Data sources: deterministic venue/session/presence fixture sets.
- Network policy: backend-independent execution.

## Exit Reporting
- Produce pass/fail matrix for:
  - venue discovery
  - check-in eligibility
  - session lifecycle
  - presence visibility
- Record defects with severity, owner, and resolution target.
- Publish go/no-go recommendation for Sprint 04 kickoff.
