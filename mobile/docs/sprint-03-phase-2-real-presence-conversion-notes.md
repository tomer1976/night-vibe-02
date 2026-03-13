# Sprint-03 Phase-2 Real Presence Conversion Notes

## Purpose
Record implementation notes for converting Sprint-03 mock presence behavior to Phase-2 server-authoritative presence logic while preserving UX contracts and product invariants.

## Source Alignment
- `docs/sprints/Sprint-03-PRD.md`
- `docs/sprints/Sprint-03-TestPlan.md`
- `docs/product/Night Vibe - Specification.md` (Section 8)
- `docs/architecture/system-architecture.md`
- `docs/architecture/database-schema.md` (`venue_sessions`)
- `docs/architecture/api-specification.md` (Section 10.2, 10.3, 10.4)
- `mobile/src/contracts/services.ts`
- `mobile/src/services/mockBackendServiceLocator.ts`
- `mobile/src/state/presenceSessionStore.ts`

## Conversion Objective
Replace local in-memory presence simulation with backend-authoritative check-in/check-out/session lifecycle enforcement, without changing screen-level behavior or the canonical mobile response envelope.

## Invariants to Preserve
1. A user can have only one active venue session at any time.
2. Check-in succeeds only for active venues and in-range coordinates.
3. Presence lists include active same-venue sessions only.
4. Session closure reasons remain canonical: `manual_checkout`, `auto_replaced`, `timeout`, `venue_invalidated`.
5. Client-provided location is untrusted; backend validation is authoritative.

## Contract Freeze Requirements (Mobile)
- Keep `PresenceService` method signatures stable:
  - `getMyActiveSession()`
  - `checkInWithContext(request)`
  - `checkOutActiveSession()`
  - `getStateTransitions()`
- Keep response envelope as `ApiResponse<T>` with existing error codes.
- Keep `PresenceCheckInResult` and `PresenceCheckOutResult` payload shapes unchanged.
- Preserve `PresenceCallableOperations` request/response types for adapter wiring.

## Mock-to-Real Mapping

| Current mock behavior | Phase-2 real target |
|---|---|
| In-memory session mutation in `mockBackendServiceLocator` | Transactional writes in backend presence module over `venue_sessions/{session_id}` |
| Local deterministic timeout sweep before reads/writes | Backend timeout enforcement (scheduled job and/or read-time reconciliation) with server timestamps |
| Local distance check with mock coordinates | Backend Haversine check using venue coordinates and trusted request validation pipeline |
| Derived transitions from local session list | Backend transition events or derived transition projection from canonical records |
| UI consumes mock service via service locator | UI consumes real adapter via service locator with unchanged contract surface |

## API and Data Notes
- Real adapter should map to API contracts:
  - `POST /api/v1/presence/checkin`
  - `POST /api/v1/presence/checkout`
  - `GET /api/v1/presence/me/session`
- `venue_sessions` canonical fields required by conversion path:
  - `user_id`, `venue_id`, `checkin_time`, `checkout_time`, `expires_at`, `status`, `closed_reason`, `checkin_distance_meters`
- Check-in distance should be rounded to nearest meter per product/API expectations.

## Recommended Conversion Sequence
1. Implement backend presence endpoints and validation pipeline (auth/status/venue/proximity).
2. Implement transactional one-active-session enforcement with deterministic conflict handling.
3. Implement timeout handling and closure reason propagation.
4. Add mobile real presence adapter implementing `PresenceService` against API endpoints.
5. Enable adapter selection by runtime mode/flag without changing screens.
6. Run mixed-mode regression to confirm Sprint-03 UX parity.

## QA and Regression Focus for Conversion
- Re-run Sprint-03 scenario matrix against real adapter equivalents:
  - in-range success
  - out-of-range denial
  - location invalid/stale payload denial
  - venue ineligible/not-found denial
- Verify replacement behavior (Venue A -> Venue B) remains deterministic.
- Verify timeout and manual checkout transitions are reflected in active session and presence screens.
- Verify route-guard compatibility from Sprint-02 still blocks restricted account states.

## Risks and Mitigations
- Risk: contract drift between mobile and backend responses.
  - Mitigation: contract tests using `ApiResponse` envelope and canonical error code assertions.
- Risk: race conditions on concurrent check-ins.
  - Mitigation: transactional backend enforcement + idempotency keys.
- Risk: UI regressions during adapter swap.
  - Mitigation: preserve method signatures and run existing Sprint-03 test suites unchanged.

## Rollback Consideration
If Phase-2 presence rollout introduces regressions, disable real adapter selection and revert to mock adapter path while preserving collected diagnostics.
