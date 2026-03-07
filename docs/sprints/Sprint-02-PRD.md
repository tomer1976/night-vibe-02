# Sprint 02 PRD - Mock Authentication, Onboarding, Profile, and Settings

## Sprint Objective
Deliver complete mocked user identity and profile lifecycle UX for Night Vibe, including first-login onboarding, returning-user session recovery, account-state gating, and profile/settings management flows, without any real backend dependency.

## Business Context
Night Vibe’s user-facing product value depends on trusted onboarding, clear account state handling, and profile completeness before venue and discovery features. Sprint 02 ensures product teams can validate user journeys and edge behaviors early in Phase 1 while preserving architecture readiness for Phase 2 real Firebase conversion.

## User Stories
- As a new user, I can sign in through a mocked flow and complete onboarding steps.
- As a returning user, I can recover session state and continue from my last valid state.
- As a user with restricted account status, I can clearly understand access denial states.
- As a user, I can manage profile details, photos, linked accounts, and account deletion request flow in a realistic mock simulation.
- As a product/QA stakeholder, I can test all state transitions deterministically without backend setup.

## UX Scope
- Auth and account-state screens:
  - Splash Screen
  - Welcome Screen
  - Login Screen
  - Session Recovery Screen
  - Account Access Denied Screen
- Onboarding flow screens:
  - Onboarding Step 1: Name
  - Onboarding Step 2: Date of Birth
  - Onboarding Step 3: Gender
  - Onboarding Step 4: Photo Upload
  - Onboarding Step 5: Bio
  - Onboarding Step 6: Preferences
  - Onboarding Step 7: Terms Acceptance
  - Profile Completion Required Screen
- Profile/settings screens:
  - User Profile Screen
  - Edit Profile Screen
  - Profile Photos Management Screen
  - Account Settings Screen
  - Linked Accounts Screen
  - Delete Account Screen
  - Account Deletion Recovery Screen
  - Error and Retry Screen
  - Empty State Screen (where applicable)

## Functional Requirements
1. Implement mocked authentication journey:
   - Sign in success path
   - Session refresh/recovery simulation
   - Explicit account status responses (`active`, `suspended`, `banned`, `pending_deletion`, `deleted`)
2. Implement onboarding state machine:
   - Step progression and back navigation
   - Validation at each step
   - Persist mock onboarding draft state locally
   - Completion gate controlling access to post-onboarding areas
3. Implement mocked profile CRUD behavior:
   - View/edit profile data
   - Preferences update
   - Profile completion toggling logic
4. Implement mocked photo management:
   - Upload simulation and local preview
   - Moderation statuses simulation (`pending`, `approved`, `rejected`)
   - Guard rails for minimum required photo count
5. Implement linked account simulation:
   - Provider list and linking/unlinking mock outcomes
6. Implement account deletion and recovery simulation:
   - Deletion request state transition to `pending_deletion`
   - Recovery-window simulation path
7. Implement centralized mock error and retry UX for auth/profile flows.

## Non-Functional Requirements
- Deterministic mock scenarios reproducible across app restarts in dev mode.
- Type-safe domain models for auth/profile/account lifecycle.
- Input validation and form responsiveness suitable for production UX quality.
- No real network/Firebase calls permitted in this sprint.
- Accessibility baseline for form controls and error feedback.

## Edge Cases
- User exits onboarding mid-flow and resumes later.
- Date of birth below minimum age threshold.
- Invalid preference combinations (min/max boundaries).
- Photo upload failure simulation and retry.
- Account state changes while user is in-app (mock event-driven state switch).
- Deletion requested but user cancels within recovery window.

## Mocked vs Real Behavior Expectations
- Mocked in Sprint 02:
  - Auth providers, token generation, token refresh.
  - Account status checks and transitions.
  - Profile persistence and media operations.
  - Linked account behavior and deletion lifecycle.
- Real in later Phase 2 conversion:
  - Firebase Authentication identity and provider linking.
  - Firestore-backed user/profile/account records.
  - Storage-backed photo handling and moderation integration.
- Architectural constraint:
  - UI and state layers must depend on interfaces only, enabling adapter replacement with minimal refactor.

## API/Data Contract Expectations (if relevant)
- Mock contracts should mirror expected API conventions:
  - Success envelope with explicit status.
  - Error envelope with `code`, `message`, `details`.
- Simulate error codes relevant to this sprint:
  - `UNAUTHORIZED`
  - `ACCESS_DENIED`
  - `VALIDATION_ERROR`
  - `PERMISSION_DENIED`
  - `INTERNAL_ERROR`
- Model account status enum compatibility with canonical schema values.

## Screen-Level Behavior
- Auth entry should route based on mock identity and account status.
- New users route through onboarding until profile completion.
- Returning active users route to post-auth shell entry.
- Suspended/banned/deleted users route to denied guidance states.
- Profile/settings screens should show realistic editable and read-only states.
- Delete account and recovery flows should show clear irreversible/recoverable messaging.

## Role/Permission Impact
- Primary role in this sprint: `RegularUser`.
- Mock role context may still be switchable for shell testing, but privileged feature access is out-of-scope for implementation depth in this sprint.
- Account status gating must override role context in UI behavior.

## Analytics/Events to Track (if relevant)
- `auth_login_attempt_mock`
- `auth_login_success_mock`
- `auth_login_denied_mock`
- `onboarding_step_completed`
- `onboarding_completed`
- `profile_updated_mock`
- `photo_upload_attempt_mock`
- `account_deletion_requested_mock`
- `account_recovery_initiated_mock`

## QA Acceptance Criteria
- All onboarding steps are navigable with validation and error states.
- Profile completion gate blocks access until onboarding is complete.
- Account-state simulation correctly routes for all statuses.
- Mock auth and profile operations produce deterministic results for test personas.
- Profile/settings/edit/photo flows handle happy, edge, and failure paths without crashes.

## Dependencies
- Sprint 01 foundation (navigation, design system, state containers, mock infrastructure).
- Product and architecture constraints on account statuses and profile gating.
- UI screen inventory and UX implementation guide.

## Exclusions
- Real auth provider SDK integration.
- Real Firebase reads/writes.
- Real moderation backend.
- Venue, discovery, matching, chat functional implementations.

## Definition of Done
- End-to-end mocked auth/onboarding/profile/settings flows implemented and demoable.
- Deterministic persona pack supports account status and onboarding variations.
- QA checks for happy/edge/negative auth-profile paths executed and documented.
- No backend dependency introduced into Sprint 02 scope.
