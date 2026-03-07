# Sprint-02 Test Plan - Mock Authentication, Onboarding, Profile, and Settings

## Scope Under Test
- Mock authentication and account-state routing.
- Onboarding flow progression, validation, and completion gating.
- Profile edit and settings management flows.
- Linked account simulation behavior.
- Account deletion and recovery simulation.
- Shared error/retry behavior in auth/profile modules.

## Happy Paths
1. New user logs in, completes onboarding, and reaches post-onboarding shell.
2. Returning active user logs in and reaches profile/home entry without onboarding detour.
3. User edits profile and saves successfully.
4. User adds photo in mock flow and sees updated gallery state.
5. User opens settings, linked accounts, and exits back without state corruption.

## Edge Cases
- User closes app during onboarding and resumes correctly.
- User navigates backward across onboarding steps with retained data.
- DOB set below minimum legal age threshold and corrected.
- Preference age range min/max boundary handling.
- Photo moderation state changes between screen visits.
- Deletion request followed by immediate recovery action.

## Negative Cases
- Invalid login payload and simulated auth failure.
- `suspended` user login attempt routes to denied state.
- `banned` user login attempt routes to denied state.
- `deleted` user attempts session recovery.
- Profile save returns simulated `VALIDATION_ERROR` and displays actionable error UI.
- Mock service returns `INTERNAL_ERROR` and retry path works.

## Role-Based Cases
- `RegularUser` primary flow behaves as expected.
- Non-regular role contexts in shell do not bypass account status restrictions.
- Account status gating supersedes role context in routing decisions.

## Device/Platform Cases
- Android emulator: auth forms, onboarding keyboard handling, profile edit interactions.
- iOS simulator: safe-area and scroll behavior on onboarding/profile screens.
- Portrait layout checks across all Sprint 02 screens.

## Mock-Mode Cases
- Deterministic persona fixtures produce repeatable behavior.
- Mock token/session expiry scenario triggers session recovery screen.
- Mock deletion state persists and routes user to recovery/denied flow as designed.
- No external API/Firebase request is made during execution.

## Regression Checklist
- [ ] Sprint 01 shell navigation remains stable.
- [ ] Shared components still render correctly in new auth/profile screens.
- [ ] Theme tokens and spacing remain consistent.
- [ ] Route guards do not break non-auth route groups.
- [ ] Error state templates still function globally.

## Acceptance Checklist
- [ ] All in-scope Sprint 02 screens are implemented and reachable.
- [ ] Onboarding gate blocks incomplete users from post-onboarding routes.
- [ ] Account-state routing works for all required statuses.
- [ ] Lint/typecheck/tests pass for changed modules.
- [ ] No Severity-1/Severity-2 defects remain in Sprint 02 scope.
- [ ] Demo scenarios pass for new, active, suspended, banned, and pending-deletion personas.

## Test Data and Environment Notes
- Environment: local dev mode, mock adapters forced.
- Data setup: deterministic persona and profile fixture packs.
- Network policy: offline-safe; no backend dependency.

## Exit Reporting
- Provide pass/fail matrix by feature area:
  - auth routing
  - onboarding
  - profile/settings
  - deletion/recovery
- Log open defects with severity, owner, target fix sprint.
- Submit go/no-go recommendation for Sprint 03 kickoff.
