# Sprint-03 Mocked vs Real Boundaries (Venue and Presence)

## Purpose
Define exactly what is mocked in Sprint-03 for venue discovery and presence lifecycle behavior, what is real in the mobile runtime, and what remains reserved for Phase-2 backend conversion.

## Source Alignment
- `docs/sprints/Sprint-03-PRD.md`
- `docs/sprints/Sprint-03-TestPlan.md`
- `docs/product/Night Vibe - Specification.md` (Section 7 and Section 8)
- `docs/architecture/system-architecture.md`
- `docs/architecture/database-schema.md`
- `docs/architecture/api-specification.md` (Section 10)
- `mobile/src/contracts/services.ts`
- `mobile/src/services/mockBackendServiceLocator.ts`
- `mobile/src/state/presenceSessionStore.ts`
- `mobile/src/screens/NearbyVenuesScreen.tsx`
- `mobile/src/screens/CheckInConfirmationScreen.tsx`
- `mobile/src/screens/ActiveVenueSessionScreen.tsx`
- `mobile/src/screens/CheckoutConfirmationScreen.tsx`
- `mobile/src/screens/VenuePresenceScreen.tsx`

## Boundary Summary

### Mocked in Sprint-03 (Phase 1)
- Venue discovery data source and filtering/sorting execution (`venues.getNearbyVenues`) are mock-backed.
- Distance/proximity validation in check-in flow (`presence.checkInWithContext`) is computed locally and deterministically.
- Single active venue session enforcement, auto-replacement, manual checkout, and timeout transitions are simulated in-memory.
- Presence transition history (`presence.getStateTransitions`) is derived from mock session fixtures/state.
- Error outcomes (`OUT_OF_RANGE`, `PERMISSION_DENIED`, `VALIDATION_ERROR`, `NOT_FOUND`, `NOT_CHECKED_IN`) are returned via canonical mock API envelope.

### Real in Sprint-03
- React Native UI rendering and navigation routes for venue and presence screens.
- Local state orchestration (`presenceSessionStore`) and stale-event protection logic.
- Deterministic mock clock/runtime behavior used by UI and tests.
- Contract-typed service consumption through service locator hooks.

### Explicitly NOT Real in Sprint-03
- Backend-authored proximity validation.
- Firestore transactional single-session enforcement.
- Server-generated authoritative timestamps/events for session transitions.
- Any Firebase network read/write path for venue discovery or presence mutation.

## Module Boundary Matrix

| Module area | Sprint-03 implementation | Real in Phase 2 | Contract boundary |
|---|---|---|---|
| Service wiring | Mock-only `ServiceLocatorProvider` path | Runtime adapter switching to real implementations | `BackendServiceContracts` |
| Venue discovery | In-memory fixtures + deterministic sort and activity snapshot shaping | Backend venue query, status filtering, and distance/rate-limit enforcement | `VenueDiscoveryService.getNearbyVenues` |
| Proximity validation | Local coordinate validation + mock distance/radius check | Server-authoritative distance validation from trusted backend flow | `PresenceService.checkInWithContext` |
| Session lifecycle | Local mutable session set, auto-replace, manual checkout, timeout sweep | Transactional session write/update with one-active-session guarantee | `PresenceService.getMyActiveSession` / `checkInWithContext` / `checkOutActiveSession` |
| Transition model | Derived transitions from local mock sessions | Backend-generated transition stream and authoritative event ordering | `PresenceService.getStateTransitions` |
| API envelope/error model | Mock response factory emits canonical `ApiResponse` with stable error codes | Backend responses mapped to same canonical envelope | `ApiResponse<T>` + `ApiErrorCode` |

## Runtime Safety Guards Preserved
- Mock runtime mode remains default and guarded.
- Service locator remains deny-by-default for non-mock wiring in current Phase-1 implementation.
- Sprint-03 behavior remains backend-independent by design.

## Contract Invariants for Future Adapter Swap
1. Preserve `VenueDiscoveryService` and `PresenceService` method signatures.
2. Preserve canonical envelope shape and error-code semantics for venue/presence operations.
3. Preserve close-reason vocabulary: `manual_checkout`, `auto_replaced`, `timeout`, `venue_invalidated`.
4. Keep UI/state layers dependent on contracts and selectors, not adapter internals.

## Known Sprint-03 Boundary Limitations
- Session persistence is process-local simulation and not cross-device authoritative state.
- Proximity checks rely on mock coordinates and deterministic math paths, not hardened GPS trust models.
- Timeout processing is deterministic clock-driven and executed on operation access rather than backend workers.

## Exit Criteria for This Boundary Document
- Engineers can distinguish mock-owned behavior from Phase-2 conversion-owned behavior for venues/presence.
- QA can validate Sprint-03 outcomes without assuming backend side effects.
- Sprint artifacts have an explicit boundary reference for venue and presence modules.
