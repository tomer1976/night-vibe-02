# Sprint-07 Test Plan - Phase 2 Conversion Foundation and Environment Hardening

## Scope Under Test
- Environment configuration loading and validation.
- Adapter switching framework and module fallback behavior.
- API envelope handling and error normalization.
- CI/CD baseline checks and build variant stability.
- Regression stability of existing Phase 1 functionality under default mock mode.

## Happy Paths
1. App starts successfully in `dev` mock-default mode.
2. Adapter mode switches at module level and routes to intended adapter.
3. API client maps successful responses to domain state consistently.
4. CI pipeline passes lint/typecheck/tests/build for baseline branch.
5. Mixed adapter configuration (subset real-ready, subset mock) runs without crash.

## Edge Cases
- Missing required env variable at startup.
- Invalid adapter key assigned to module.
- Partial API response missing expected contract fields.
- Runtime adapter mode change during active screen session.
- Build executed with incorrect environment target declaration.

## Negative Cases
- Invalid config should fail fast with actionable diagnostics.
- Malformed response envelope should trigger normalized error state.
- Unknown error code should map to safe generic fallback.
- Adapter unavailable should fallback to configured safe mode (or block with clear error).

## Role-Based Cases
- Existing role-context behavior remains unchanged in mock mode.
- No privileged path unexpectedly exposed due to adapter/config changes.

## Device/Platform Cases
- Android emulator startup with each environment profile.
- iOS simulator startup with each environment profile.
- Basic navigation smoke validation in both platforms after adapter changes.

## Mock-Mode / Real-Mode Cases
- Mock-only mode remains fully functional.
- Mixed mode (selected module toggled) works with no app-wide regression.
- Real-mode placeholder path errors gracefully where endpoint not yet implemented.
- No accidental production endpoint usage from local builds.

## Regression Checklist
- [ ] Sprint 01-06 core flows still launch and navigate in mock mode.
- [ ] Account status gating still behaves consistently.
- [ ] Venue/discovery/chat/safety mocked flows still deterministic.
- [ ] Design-system and global error states remain consistent.

## Acceptance Checklist
- [ ] Environment loader and validator tests pass.
- [ ] Adapter registry and mode-switch tests pass.
- [ ] Contract validation/error mapping tests pass.
- [ ] CI checks configured and passing.
- [ ] No Severity-1/Severity-2 defects in sprint scope.
- [ ] Sprint 08 conversion kickoff readiness confirmed.

## Test Data and Environment Notes
- Environment: local + CI using dev/staging simulation profiles.
- Data source: existing mock fixtures with optional mixed-mode adapter stubs.
- Backend dependency: none mandatory for full pass in Sprint 07.

## Exit Reporting
- Publish pass/fail matrix for config, adapter, contract, and regression areas.
- Track defects by severity, owner, and resolution target.
- Provide go/no-go recommendation for Sprint 08 (real auth conversion).
