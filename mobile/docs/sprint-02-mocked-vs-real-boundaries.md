# Sprint-02 Mocked vs Real Boundaries

## Purpose
Define exactly what is mocked in Sprint-02, what remains real in the client runtime, and what will be replaced in Phase 2.

This document is scoped to Sprint-02 modules: auth, onboarding/profile, account lifecycle/settings, and related routing/state behavior.

## Source Alignment
- `docs/sprints/Sprint-02-PRD.md`
- `docs/architecture/system-architecture.md`
- `docs/architecture/database-schema.md`
- `docs/architecture/api-specification.md`
- `mobile/src/contracts/services.ts`
- `mobile/src/services/ServiceLocatorProvider.tsx`
- `mobile/src/services/mockBackendServiceLocator.ts`
- `mobile/src/config/firebaseRuntimeGuard.ts`

## Boundary Summary

### Mocked in Sprint-02 (Phase 1)
- Service implementation behind `BackendServiceContracts` is mock-only.
- Auth/session lifecycle behavior is simulated (`login`, `refreshSession`, account status transitions).
- Profile CRUD and photo operations are simulated.
- Linked accounts and deletion/recovery lifecycle are simulated.
- Error envelopes/scenarios are simulated via mock response factory.
- Persona fixtures and deterministic clocks drive reproducible behavior.

### Real in Sprint-02
- React Native UI rendering and navigation execution.
- Local state management and route guards.
- Local persistence/hydration via AsyncStorage mock-mode snapshot.
- Input validation and screen-level UX behavior.

### Explicitly NOT real in Sprint-02
- Firebase Authentication provider flows.
- Firestore profile/account persistence.
- Firebase Storage photo upload/moderation pipelines.
- Any backend network I/O for auth/profile/account lifecycle.

## Module Boundary Matrix

| Module Area | Sprint-02 Implementation | Real in Phase 2 | Boundary Contract |
|---|---|---|---|
| Service locator | `ServiceLocatorProvider` throws when mock mode is disabled; returns mock locator only | Runtime provider selects real adapters by environment/flag | `BackendServiceContracts` |
| Auth | `auth.login`, `auth.refreshSession`, `auth.linkProvider` simulated in `mockBackendServiceLocator` | Firebase Auth + backend session semantics | `AuthService` |
| Account status gating | `active/suspended/banned/pending_deletion/deleted` simulated in mock service + state store | Server-authoritative status checks | `AccountLifecycleService` + `AuthState` |
| Onboarding/profile completion | Local state + profile fixture and profile service simulation | Firestore-backed profile + server validation | `ProfileService` + onboarding state selectors |
| Photo management | Mock upload/delete responses and moderation state simulation | Storage upload + moderation integration | `ProfileService.uploadMyPhoto/deleteMyPhoto` |
| Linked providers | Mock linked provider list and link operations | Firebase provider linking APIs | `AuthService.linkProvider` + `AccountLifecycleService.getLinkedProviders` |
| Deletion/recovery timeline | Deterministic timeline simulation and window behavior | Backend policy enforcement and scheduled transitions | `AccountLifecycleService` |
| Error model | Mock envelope and canonical error mapping | Real API envelope and mapped backend errors | `ApiResponse<T>` + canonical error codes |

## Runtime Safety Guards

### Guard 1: runtime mode gate
- `readRuntimeMode()` defaults to `phase1-mock` unless explicitly set to `phase2-real`.

### Guard 2: Firebase key safety
- In `phase1-mock`, configured Firebase keys trigger runtime error.
- In `phase2-real`, missing Firebase keys trigger runtime error.

### Guard 3: service wiring deny-by-default
- `ServiceLocatorProvider` throws if `isMockModeEnabled` is false in current Phase 1 implementation.

Together these prevent accidental real backend usage during Sprint-02.

## Contract Invariants to Preserve During Phase-2 Conversion
1. Keep `BackendServiceContracts` method signatures stable where possible.
2. Keep `ApiResponse` success/failure envelope shape stable.
3. Preserve canonical account status values: `active`, `suspended`, `banned`, `pending_deletion`, `deleted`.
4. Preserve canonical error code behavior (`VALIDATION_ERROR`, `UNAUTHORIZED`, `PERMISSION_DENIED`, `ACCESS_DENIED`, `INTERNAL_ERROR`, etc.).
5. Keep UI/state layers depending on contracts, not concrete adapters.

## Known Sprint-02 Boundary Limitations
- Mock auth persona selection is hint-driven and not a real provider identity flow.
- Photo moderation statuses are simulation-only and not moderation-service outcomes.
- Account deletion lifecycle is clock-driven mock logic, not backend scheduler execution.
- State hydration persistence is local-device simulation and not cross-device/account sync.

## Exit Criteria for This Boundary Document
- Sprint-02 contributors can identify what is safe to change in UI/state without coupling to backend.
- Sprint-03 planning can clearly distinguish carry-over work that requires real adapters.
- QA can validate mock-mode behavior without assuming real backend side effects.
