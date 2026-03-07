# Sprint-08 Todo - Real Authentication, Identity, Session, and Account Lifecycle Conversion

## Frontend Tasks
- [ ] Replace mock auth adapter with real auth adapter wiring.
- [ ] Integrate login screen with real auth state responses.
- [ ] Implement real session recovery and re-auth prompts.
- [ ] Update access denied UX for real account-status outcomes.
- [ ] Wire delete/recovery screens to real service methods.

## Backend Tasks (if applicable)
- [ ] Implement auth/account endpoints or callable functions for login/session/account-status checks.
- [ ] Enforce account-status checks on protected operations.
- [ ] Implement deletion request and recovery handlers with idempotency.
- [ ] Add correlation IDs and structured logs for auth/account flows.

## Firebase Tasks (if applicable)
- [ ] Configure Firebase Auth providers and environment setup.
- [ ] Validate token verification path for protected backend calls.
- [ ] Ensure users collection/status integration is operational.
- [ ] Validate Firestore rules alignment for account status constraints.

## Mock-Data Tasks
- [ ] Keep deterministic mock fallback fixtures for non-converted modules.
- [ ] Build mixed-mode test personas for real auth + mocked downstream data.

## Navigation Tasks
- [ ] Validate startup routing with real auth/session state.
- [ ] Ensure denied statuses route to correct restricted screens.
- [ ] Ensure logout/session-expiry routes are consistent and safe.

## UI Tasks
- [ ] Normalize auth error presentation for real backend errors.
- [ ] Improve loading/retry states for auth and deletion flows.
- [ ] Validate account-status messaging tone and clarity.

## State-Management Tasks
- [ ] Replace mock auth store actions with real async flows.
- [ ] Add resilient session-refresh state transitions.
- [ ] Ensure account status is sourced from server-authoritative state.

## Testing Tasks
- [ ] Add integration tests for active user login/session refresh.
- [ ] Add denial tests for suspended/banned/deleted statuses.
- [ ] Add pending-deletion and recovery-window behavior tests.
- [ ] Add mixed-mode regression tests for non-converted modules.
- [ ] Add failure-path tests for token expiry/network errors.

## Bugfix/Stabilization Tasks
- [ ] Fix session race conditions during app startup.
- [ ] Resolve stale account-status cache inconsistencies.
- [ ] Resolve duplicate deletion-request handling issues.

## Documentation Tasks
- [ ] Document real auth architecture and session model.
- [ ] Document account-status enforcement rules and deny behaviors.
- [ ] Document deletion/recovery lifecycle details.
- [ ] Update conversion tracker with completed module replacement.

## Release/Readiness Tasks (if applicable)
- [ ] Prepare Sprint 08 demo with real auth personas.
- [ ] Publish security and QA validation summary.
- [ ] Confirm Sprint 09 readiness dependencies.

## Sprint Exit Checklist
- [ ] Sprint-08 PRD scope delivered or formally deferred.
- [ ] Sprint-08 TestPlan executed with evidence.
- [ ] No blocker defects in auth/account lifecycle scope.
- [ ] Real auth conversion sign-off completed.
