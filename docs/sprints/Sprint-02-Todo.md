# Sprint-02 Todo - Mock Authentication, Onboarding, Profile, and Settings

## Frontend Tasks
- [x] Implement auth flow screens (Splash, Welcome, Login, Session Recovery, Access Denied).
- [x] Implement complete onboarding screen set with stepper/navigation controls.
- [x] Build profile screens (view/edit/photos) using shared Sprint 01 design components.
- [x] Build account/settings screens (Account Settings, Linked Accounts, Delete/Recovery flows).
- [x] Add reusable form validation and inline error messaging components.

## Backend Tasks (if applicable)
- [x] Define auth/profile/account-lifecycle service interfaces for future Phase 2 real implementation.
- [x] Define mock error mapping for expected API error codes.

## Firebase Tasks (if applicable)
- [x] Confirm Firebase adapters remain disabled/guarded in Phase 1 mode.
- [x] Add placeholder configuration points for future auth/profile adapters.

## Mock-Data Tasks
- [x] Create persona fixtures for:
  - new user
  - active returning user
  - suspended user
  - banned user
  - pending deletion user
- [x] Add profile fixtures with complete and incomplete onboarding states.
- [x] Add photo fixtures across moderation states (`pending`, `approved`, `rejected`).
- [x] Implement deterministic token/session simulation and expiry scenarios.
- [x] Implement deletion/recovery timeline simulation.

## Navigation Tasks
- [x] Wire entry routing based on mock auth/account status.
- [x] Implement onboarding gating route guard to block post-onboarding routes.
- [x] Ensure deep-link fallback behavior routes to safe screens in mock mode.

## UI Tasks
- [x] Implement onboarding input components with UX-consistent spacing/typography.
- [x] Build account-state banners/cards for denied/recovery contexts.
- [x] Add loading, error, and empty-state handling across auth/profile flows.
- [x] Validate visual consistency with Night Vibe UI-UX guide.

## State-Management Tasks
- [x] Implement auth state store with status enum support.
- [x] Implement onboarding progress store and completion gate selector.
- [x] Implement profile draft/edit store with save/cancel semantics.
- [ ] Implement account lifecycle state store for deletion/recovery simulation.

## Testing Tasks
- [ ] Add auth routing tests per account status.
- [ ] Add onboarding step validation tests.
- [ ] Add profile completion gate tests.
- [ ] Add photo workflow tests for upload/retry/remove constraints.
- [ ] Add delete/recovery flow tests.
- [ ] Add regression tests for login -> onboarding -> profile -> settings path.

## Bugfix/Stabilization Tasks
- [ ] Fix navigation loops or stale route-state issues.
- [ ] Resolve form input edge-case crashes and validation race conditions.
- [ ] Resolve photo state synchronization bugs.
- [ ] Ensure consistent behavior after app relaunch in mock mode.

## Documentation Tasks
- [ ] Document auth/onboarding state machine transitions.
- [ ] Document persona fixture catalog and usage instructions.
- [ ] Document mocked-vs-real boundaries for Sprint 02 modules.
- [ ] Update sprint execution notes with unresolved risks for Sprint 03.

## Release/Readiness Tasks (if applicable)
- [ ] Prepare sprint demo script for all account status personas.
- [ ] Publish QA execution summary and defect list.
- [ ] Capture carry-over items with owner and target sprint.

## Sprint Exit Checklist
- [ ] Sprint-02 PRD functional and UX scope completed or formally deferred.
- [ ] Sprint-02 TestPlan executed with pass/fail status.
- [ ] No unresolved blocker defects in auth/onboarding/profile/settings paths.
- [ ] Sprint review approval obtained from PM, Engineering, and QA.
