# Mobile Service Contracts and Adapter Pattern (Sprint-01)

## Purpose
This document describes the mobile service contract layer and adapter pattern used in Sprint-01.

The goal is to keep UI/state logic stable while allowing backend adapter replacement from mock mode (Phase 1) to real Firebase-backed services (Phase 2).

## Source Alignment
- Product specification: `docs/product/Night Vibe - Specification.md`
- System architecture: `docs/architecture/system-architecture.md`
- API contract: `docs/architecture/api-specification.md`
- Sprint scope: `docs/sprints/Sprint-01-PRD.md`

## Contract-First Design

### Canonical Service Contracts
All service interfaces are defined in:
- `mobile/src/contracts/services.ts`

The `BackendServiceContracts` aggregate defines mobile-facing domain modules:
- `auth`
- `profile`
- `accountLifecycle`
- `roles`
- `venues` (implemented via `VenueDiscoveryService` contract)
- `presence`
- `discovery`
- `interactions`
- `match`
- `chat`
- `safety`
- `notifications`
- `analytics`

Each operation returns a `Promise<ApiResponse<T>>` where `ApiResponse` is defined in:
- `mobile/src/contracts/api.ts`

### Envelope Shape
All adapters must return the canonical envelope:
- success: `status: "SUCCESS"` + `data` + `request_id`
- failure: `status: "FAIL"` + `error` (`code`, `message`, optional `details`) + `request_id`

This keeps UI error handling deterministic and aligned with the API spec.

## Adapter Pattern in Sprint-01

### Service Locator Provider
Runtime service provisioning is handled by:
- `mobile/src/services/ServiceLocatorProvider.tsx`

`ServiceLocatorProvider` exposes `BackendServiceContracts` through React context and enforces Sprint-01 safety:
- if mock mode is disabled, provider throws (real adapter wiring is intentionally unavailable in Sprint-01)

### Mock Adapter Implementation
The mock adapter lives in:
- `mobile/src/services/mockBackendServiceLocator.ts`

`createMockBackendServiceLocator` returns:
- `services`: concrete implementation of all `BackendServiceContracts`
- `clock`: deterministic timestamp source (`mobile/src/mocks/clock.ts`)
- `responseFactory`: deterministic response envelope factory (`mobile/src/mocks/responseFactory.ts`)

It composes deterministic fixtures from:
- `mobile/src/mocks/fixtures.ts`

Sprint-02 extends contract-first auth/profile readiness with explicit lifecycle-facing methods:
- `auth.login`, `auth.refreshSession`, `auth.linkProvider`
- `profile.upsertMyProfile`, `profile.uploadMyPhoto`, `profile.deleteMyPhoto`
- `accountLifecycle.getAccountStatus`, `accountLifecycle.requestAccountDeletion`, `accountLifecycle.recoverAccount`, `accountLifecycle.getLinkedProviders`

Sprint-03 extends venue/presence readiness with conversion-safe contracts:
- `venues.getNearbyVenues(request?)` where request carries `latitude`, `longitude`, and optional `radiusKm`
- `presence.getMyActiveSession`
- `presence.checkInWithContext` (`venueId`, coordinates, optional idempotency key)
- `presence.checkOutActiveSession`
- `presence.getStateTransitions` for deterministic close/expiry reason timelines
- placeholder callable interfaces for future backend wiring:
	- `PresenceCallableOperations.checkIn`
	- `PresenceCallableOperations.checkOut`

Legacy Sprint-01 method names remain available as compatibility shims (`auth.signInWithProvider`, `profile.updateMyProfile`) to avoid route/screen churn while migration proceeds.

This ensures scenario replayability and test stability.

## Dependency and Usage Flow
1. Screens/components call domain operations via `useServiceLocator()`.
2. `useServiceLocator()` returns contract-typed services from context.
3. Context is provided by `ServiceLocatorProvider`.
4. Provider resolves to mock adapter implementations in Sprint-01.
5. UI branches on `response.status` and renders deterministic success/error states.

This flow keeps screens unaware of concrete adapter implementation details.

## Replacement Strategy for Phase 2
To swap mock adapters with real adapters safely:
1. Keep `contracts` signatures stable.
2. Introduce real adapter implementations that satisfy `BackendServiceContracts`.
3. Extend `ServiceLocatorProvider` to select mock vs real adapters by environment/feature flag.
4. Preserve `ApiResponse` envelope contract to avoid screen-level rewrites.

## Naming and File Conventions
- Contract types/interfaces: `mobile/src/contracts/*`.
- Adapter factories/providers: `mobile/src/services/*`.
- Deterministic mocks and scenario utilities: `mobile/src/mocks/*`.
- Keep domain boundaries explicit in service keys and method names.

## Sprint-01 Scope Notes
- No real Firebase transport is wired yet.
- Provider is deny-by-default for non-mock mode in Sprint-01.
- Adapter behavior is deterministic to support repeatable tests and low-risk future conversion.
