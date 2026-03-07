# Sprint-01 Test Plan - Mobile Foundation and Design System

## Scope Under Test
- Application boot and shell navigation.
- Shared design system primitives.
- Route architecture across role domains.
- Mock adapter/provider wiring and deterministic response behavior.
- Baseline state management for auth/role/mock flags.

## Happy Paths
1. App launches and renders splash/shell without runtime error.
2. User can navigate to each top-level route group.
3. Shared UI components render with expected theme tokens.
4. Mock provider returns deterministic success payloads.
5. Role context switch (mock) updates route visibility.

## Edge Cases
- Invalid role context selected in dev harness.
- Missing token/property in component props.
- Unknown route navigation attempt.
- Fixture record missing required field.
- App relaunch with retained mock state.

## Negative Cases
- Simulated unauthorized response from mock auth service.
- Simulated permission denied for role-restricted route.
- Simulated internal error envelope rendering in UI state component.
- Forced null/undefined payload handling in domain adapters.

## Role-Based Cases
- `RegularUser` sees only user shell routes.
- `VenueOwner` route group available in role simulation mode.
- `Moderator` route group available in role simulation mode.
- `Administrator` route group available in role simulation mode.
- Invalid role-to-route mapping is blocked and routed to fallback.

## Device/Platform Cases
- Android emulator (latest stable target in project config).
- iOS simulator (latest stable target in project config).
- Portrait layout validation for core shell screens.
- Safe area handling check for top and bottom in both platforms.

## Mock-Mode Cases
- Deterministic success scenario pack loads consistently.
- Deterministic error scenario pack triggers expected UI states.
- Mock clock timestamps remain stable across reruns.
- No accidental external network/Firebase requests are made.

## Regression Checklist
- [ ] App still boots after dependency updates.
- [ ] Route names/paths unchanged or migration documented.
- [ ] Design tokens still applied uniformly in primitives.
- [ ] Provider wiring still resolves interfaces correctly.
- [ ] Error state components still handle envelope shape consistently.

## Acceptance Checklist
- [ ] Build passes on iOS and Android targets.
- [ ] Lint and typecheck pass.
- [ ] Core smoke tests pass.
- [ ] All route groups demonstrated in sprint demo.
- [ ] No Severity-1 or Severity-2 open defects in foundation scope.
- [ ] Sprint 01 DoD confirmed by PM + Engineering + QA.

## Test Data and Environment Notes
- Environment: local development only, mock mode forced on.
- Data source: deterministic fixture files in app repository.
- External dependencies: none required for test execution.

## Exit Reporting
- Record pass/fail per test area.
- Capture known issues with severity and owner.
- Provide go/no-go recommendation for Sprint 02 kickoff.
