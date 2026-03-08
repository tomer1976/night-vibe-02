# Mock Scenario Toggles and Fixture Update Process (Sprint-01)

## Purpose
This document defines how to use and maintain Sprint-01 mock data behavior:
- scenario toggles for success/failure API envelopes
- deterministic fixture data updates
- deterministic time control for reproducible tests

## Source Alignment
- Sprint scope: `docs/sprints/Sprint-01-PRD.md`
- API contract: `docs/architecture/api-specification.md`
- Mobile mocks:
  - `mobile/src/mocks/responseFactory.ts`
  - `mobile/src/mocks/fixtures.ts`
  - `mobile/src/mocks/clock.ts`
  - `mobile/src/services/mockBackendServiceLocator.ts`

## Mock Scenario Toggles

### Response Factory
`createMockResponseFactory` produces canonical `ApiResponse<T>` envelopes and supports deterministic request IDs.

Key options:
- `seed` (default `req-mock`) controls request ID prefix
- `defaultScenario` (default `success`) controls baseline behavior
- `scenarios` provides per-operation scenario presets

### Supported Scenario Values
- `success`
- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `PERMISSION_DENIED`
- `ACCESS_DENIED`
- `INTERNAL_ERROR`

### Toggle APIs
- `setScenario(key, scenario)` for one operation
- `setScenarios({ ... })` for batch updates
- `clearScenario(key)` to remove one override
- `resetScenarios()` to restore default behavior

### Operation Key Convention
Operation keys follow `<domain>.<operation>` from service modules, for example:
- `auth.getSession`
- `discovery.getCandidates`
- `chat.sendMessage`

Keep keys aligned with implementations in `mobile/src/services/mockBackendServiceLocator.ts`.

## Fixture Update Process

### Fixture Data Location
Deterministic baseline fixtures are defined in `mobile/src/mocks/fixtures.ts`:
- `users`
- `roleContexts`
- `venues`
- `sessions`
- `interactions`

All fixtures are frozen (`Object.freeze`) to prevent mutation during runtime/tests.

### Update Rules
1. Preserve product invariants from specification:
   - discovery remains venue-restricted
   - matching requires co-location
   - one active venue session per user
2. Keep IDs stable and explicit (`u-*`, `v-*`, `s-*`, `i-*`) unless migration is intentional.
3. Use ISO UTC timestamps for session/interaction fields.
4. Ensure cross-references remain valid (user/session/venue IDs must resolve).
5. Keep deterministic relationships for reciprocal-like and match generation paths.

### Recommended Fixture Change Workflow
1. Edit fixture records in `mobile/src/mocks/fixtures.ts`.
2. Verify mock service behavior impacted by fixtures in `mobile/src/services/mockBackendServiceLocator.ts`.
3. Update/add tests that validate changed behavior:
   - `mobile/__tests__/fixtures.test.ts`
   - `mobile/__tests__/serviceLocatorProvider.test.tsx`
   - domain-specific tests as needed
4. Run full validation (`test`, `lint`, `typecheck`) before merge.

## Deterministic Clock Process
`createMockClock` in `mobile/src/mocks/clock.ts` provides deterministic time progression:
- `now()` returns current ISO time and advances by `stepMs`
- `peek()` returns current ISO time without advancing
- `advanceBy(ms)` moves forward by explicit milliseconds
- `set(instant)` sets the clock to a specific time
- `reset()` returns to initial start time

Use fixed `startAt` values in tests to avoid flaky assertions.

## Test Coverage References
Current tests validating this process:
- `mobile/__tests__/mockResponseFactory.test.ts`
- `mobile/__tests__/fixtures.test.ts`
- `mobile/__tests__/mockClock.test.ts`
- `mobile/__tests__/serviceLocatorProvider.test.tsx`

## Sprint-01 Scope Notes
- This process applies to mock mode only.
- No real backend transport or persistence is introduced.
- Determinism is mandatory to keep sprint demos and regression tests reproducible.
