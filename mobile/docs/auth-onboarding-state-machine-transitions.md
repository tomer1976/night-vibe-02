# Auth and Onboarding State Machine Transitions (Sprint-02)

## Purpose
This document describes the implemented Sprint-02 state-machine behavior for:
- authentication lifecycle and account-status routing
- onboarding progress and profile-completion gating

It is implementation-derived from current mobile code and serves as QA/dev reference for deterministic mock-mode behavior.

## Source Alignment
- Product specification: `docs/product/Night Vibe - Specification.md`
- Sprint scope: `docs/sprints/Sprint-02-PRD.md`
- Sprint test expectations: `docs/sprints/Sprint-02-TestPlan.md`
- Mobile implementation:
  - `mobile/src/state/authStateStore.ts`
  - `mobile/src/state/onboardingProgressStore.ts`
  - `mobile/src/navigation/authEntryRouting.ts`
  - `mobile/src/state/routeSelectors.ts`
  - `mobile/src/screens/LoginScreen.tsx`
  - `mobile/src/screens/SplashScreen.tsx`
  - `mobile/src/screens/OnboardingTermsScreen.tsx`
  - `mobile/src/screens/ProfileCompletionRequiredScreen.tsx`
  - `mobile/src/screens/SessionRecoveryScreen.tsx`

## Auth Lifecycle State Machine

### States
- `signed_out`
- `authenticating`
- `authenticated`
- `session_recovery`
- `access_denied`

### Canonical Inputs
- `isAuthenticated: boolean`
- `accountStatus: active | suspended | banned | pending_deletion | deleted`

### Transition Rules
- `BEGIN_AUTHENTICATION` -> sets lifecycle to `authenticating` and `isAuthenticated=false`.
- `COMPLETE_AUTHENTICATION(status, isAuthenticated?)` -> lifecycle is derived from `status` and authenticated flag.
- `SET_ACCOUNT_STATUS(status)` -> lifecycle recomputed from status + current `isAuthenticated`.
- `SET_AUTHENTICATED(value)` -> lifecycle recomputed from current status + new auth flag.
- `ENTER_SESSION_RECOVERY` -> forces `accountStatus=pending_deletion`, `isAuthenticated=true`, lifecycle `session_recovery`.
- `RESOLVE_SESSION_RECOVERY` -> forces `accountStatus=active`, `isAuthenticated=true`, lifecycle `authenticated`.
- `DENY_ACCESS(status)` -> forces lifecycle `access_denied` with `status in {suspended,banned,deleted}`.
- `RESET_AUTH_STATE(status?, isAuthenticated?)` -> resets to provided/default values, lifecycle recomputed.
- `HYDRATE_STATE(state)` -> restores persisted auth snapshot in mock mode.

### Lifecycle Derivation Function
`lifecycleFromStatus(status, isAuthenticated)`:
1. if `isAuthenticated=false` => `signed_out`
2. else if `status=pending_deletion` => `session_recovery`
3. else if `status in {suspended,banned,deleted}` => `access_denied`
4. else => `authenticated`

## Auth Entry Routing State Machine

### Route Resolver (`resolveAuthEntryRoute`)
- Not authenticated -> `Welcome`
- Authenticated + `pending_deletion` -> `SessionRecovery`
- Authenticated + `suspended|banned|deleted` -> `AccessDenied`
- Authenticated + `isNewUser=true` -> `OnboardingName`
- Authenticated + active -> `UserGroup`

### Splash Bootstrap Behavior
- `SplashScreen` waits for state hydration in runtime (`isStateHydrated=true`) before route transition.
- After hydration, it resolves auth entry route and then applies onboarding gate for `UserGroup` via `useRouteAccessSelectors().resolve(...)`.
- Transition dispatch uses stack `replace` after 450ms timer for deterministic initial navigation.

## Onboarding Progress State Machine

### State Shape
- `currentStep: number` (clamped to `1..7`)
- `completedSteps: number[]` (deduplicated, sorted, each clamped to `1..7`)

### Actions
- `SET_CURRENT_STEP(step)` -> sets clamped step.
- `MARK_STEP_COMPLETED(step)` -> adds clamped step if not already present.
- `GO_TO_NEXT_STEP` -> increments within bounds.
- `GO_TO_PREVIOUS_STEP` -> decrements within bounds.
- `HYDRATE_STATE(state)` -> restores clamped/deduplicated persisted onboarding state.
- `RESET_PROGRESS` -> resets to step 1 with no completed steps.

## Profile Completion Gate State Machine

### Gate Signal
- `profileCompleted: boolean` from onboarding state context.

### Route Guard (`useRouteAccessSelectors`)
If route is post-onboarding (`UserGroup`, `UserProfile`, `EditProfile`, `ProfilePhotosManagement`, `AccountSettings`, `LinkedAccounts`, `DeleteAccount`, `AccountDeletionRecovery`) and `profileCompleted=false`, resolved route becomes `ProfileCompletionRequired`.

### Step-7 and Completion Transitions
- `OnboardingTermsScreen.finishOnboarding`:
  - requires `acceptedTerms=true`
  - marks step 7 completed
  - sets `profileCompleted=false`
  - routes to `ProfileCompletionRequired`
- `ProfileCompletionRequiredScreen.continueToUserShell`:
  - sets `profileCompleted=true`
  - resets onboarding progress
  - routes to `UserGroup`

## Session Recovery Transition Path
- `SessionRecoveryScreen.recoverSession`:
  - dispatches `resolveSessionRecovery()`
  - routes to `UserGroup`
- `SessionRecoveryScreen.cancelRecovery`:
  - dispatches `resetAuthState('pending_deletion', false)`
  - routes to `Welcome`

## Login Flow to State Transitions
- `LoginScreen.handleLogin` sequence:
  1. validate identity input
  2. dispatch `beginAuthentication()`
  3. call `auth.login(...)`
  4. on auth failure: `resetAuthState('active', false)` and `setProfileCompleted(false)`
  5. on success: resolve account status from `accountLifecycle.getAccountStatus()`
  6. resolve profile completion from `profile.getMyProfile()`
  7. dispatch `completeAuthentication(resolvedStatus, true)`
  8. dispatch `setProfileCompleted(isProfileCompleted)`
  9. route via `resolveAuthEntryRoute(...)`

## Persistence and Relaunch Determinism (Mock Mode)
- Persisted state key: `night-vibe:phase1-mock-app-state:v1`
- Restored slices:
  - auth state
  - role simulation state
  - onboarding progress
  - `profileCompleted`
  - profile draft
  - account lifecycle draft
- Persistence is no-op safe when storage is unavailable (e.g., test/native module gaps).

## QA Notes
- Account status must always supersede role/access routing at auth entry.
- `pending_deletion` must resolve to session recovery until explicit recovery/cancel action.
- Post-onboarding routes must remain blocked while `profileCompleted=false`.
- Relaunch in mock mode must restore the persisted state machine snapshot before splash routing finalizes.
