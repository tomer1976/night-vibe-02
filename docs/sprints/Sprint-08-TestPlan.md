# Sprint-08 Test Plan - Real Authentication, Identity, Session, and Account Lifecycle Conversion

## Scope Under Test
- Real login and identity resolution.
- Session refresh and expiry handling.
- Account status enforcement on protected flows.
- Account deletion request and recovery lifecycle.
- Mixed-mode stability with non-converted modules.

## Happy Paths
1. Active user logs in successfully and reaches app shell.
2. Session refresh occurs successfully without forced logout.
3. User requests account deletion and receives pending-deletion state.
4. User performs valid recovery action within allowed window.

## Edge Cases
- Session expires during active app usage.
- Account status changes to suspended while app is open.
- Network outage during login/refresh/deletion request.
- App restart with stale local auth cache.
- Duplicate deletion requests.

## Negative Cases
- Invalid/expired token should return `UNAUTHORIZED` and trigger safe logout flow.
- Suspended/banned/deleted statuses should return denial behavior.
- Invalid deletion payload should return `VALIDATION_ERROR`.
- Backend failures should map to resilient retry/error states.

## Role-Based Cases
- Account status denial supersedes any client role context.
- Active users continue into role-context shell without unauthorized escalation.

## Device/Platform Cases
- Android emulator login/session/recovery behavior.
- iOS simulator login/session/recovery behavior.
- App relaunch behavior consistency on both platforms.

## Mock-Mode / Real-Mode Cases
- Real auth + mocked downstream modules operate correctly.
- Adapter fallback works when non-converted modules remain mock-only.
- No unintended production endpoint access from non-production builds.

## Regression Checklist
- [ ] Phase 1 screens still render correctly under mixed-mode adapters.
- [ ] Existing navigation and theme consistency unchanged.
- [ ] Core mocked modules (venues/discovery/chat) still function for demo flows.

## Acceptance Checklist
- [ ] Real login/session flows pass for active users.
- [ ] All denied account statuses are enforced consistently.
- [ ] Deletion and recovery lifecycle paths pass.
- [ ] Error handling and retries are user-safe and stable.
- [ ] Lint/typecheck/tests pass for sprint scope.
- [ ] No Severity-1/Severity-2 defects open in Sprint 08 scope.

## Test Data and Environment Notes
- Environments: dev and staging with real auth enabled.
- Data setup: test users covering all account statuses.
- Mixed-mode: downstream modules remain mock unless explicitly converted.

## Exit Reporting
- Publish pass/fail matrix for auth/session/status/deletion flows.
- Log defects with severity, owner, and target sprint.
- Provide go/no-go recommendation for Sprint 09 kickoff.
