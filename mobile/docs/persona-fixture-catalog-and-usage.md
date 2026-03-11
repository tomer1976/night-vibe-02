# Sprint-02 Persona Fixture Catalog and Usage Instructions

## Purpose
This document catalogs the Sprint-02 mock personas and explains how to use them in app flows and tests.

It complements:
- `mobile/src/mocks/fixtures.ts`
- `mobile/src/services/mockBackendServiceLocator.ts`
- `mobile/src/screens/LoginScreen.tsx`
- `mobile/__tests__/serviceLocatorProvider.test.tsx`

## Source of Truth

### Persona and profile fixtures
- `sprint02AuthPersonaFixtures` in `mobile/src/mocks/fixtures.ts`
- `sprint02ProfileFixtures` in `mobile/src/mocks/fixtures.ts`
- `sprint02PhotoFixtures` in `mobile/src/mocks/fixtures.ts`

### Persona resolution behavior
- `resolvePersonaFixtureByHint(loginHint)` in `mobile/src/services/mockBackendServiceLocator.ts`

### Login entry UX
- `LoginScreen` in `mobile/src/screens/LoginScreen.tsx`
  - input label: `Email or Persona`
  - helper text: `new`, `suspended`, `banned`, `pending`, `deleted`

## Persona Catalog

| Persona Key | UID | Account Status | isNewUser | profileCompleted | Trigger Hint in Login Input |
|---|---|---|---|---|---|
| `new_user` | `u-persona-new-1` | `active` | `true` | `false` | any value containing `new` |
| `active_returning_user` | `u-persona-active-1` | `active` | `false` | `true` | default fallback when no other keyword matches |
| `suspended_user` | `u-persona-suspended-1` | `suspended` | `false` | `true` | any value containing `suspended` |
| `banned_user` | `u-persona-banned-1` | `banned` | `false` | `true` | any value containing `banned` |
| `pending_deletion_user` | `u-persona-pending-del-1` | `pending_deletion` | `false` | `true` | any value containing `pending` |

## Synthetic Deleted Persona Path

`deleted` is supported as a deterministic login simulation, but it is not a fixed `sprint02AuthPersonaFixtures` row.

If login input contains `deleted`, `auth.login` forces:
- account status = `deleted`
- `isNewUser = false`

This behavior is validated in `mobile/__tests__/serviceLocatorProvider.test.tsx`.

## Usage Instructions

### A) Manual app usage (UI)
1. Navigate to the Login screen.
2. Enter any value in `Email or Persona` containing one keyword:
   - `new`
   - `suspended`
   - `banned`
   - `pending`
   - `deleted`
3. Tap `Sign In`.
4. Verify routing:
   - `new` -> onboarding entry
   - `suspended` / `banned` / `deleted` -> access denied flow
   - `pending` -> session recovery flow
   - fallback -> active returning-user flow

Examples:
- `new-user@example.com`
- `suspended-user@example.com`
- `banned-user@example.com`
- `pending-user@example.com`
- `deleted-user@example.com`
- `active-user@example.com` (falls back to active returning user)

### B) Programmatic usage (tests / harness)
Call:
- `services.auth.login({ provider: 'google', providerToken: '<hint>' })`

Then resolve effective state from:
- `services.accountLifecycle.getAccountStatus()`
- `services.profile.getMyProfile()`

### C) Determinism guarantees
- Fixtures are frozen (`Object.freeze`) to prevent mutation.
- Session/token behavior remains deterministic via mock clock and response factory.
- Persisted app state may override fresh persona selection on relaunch unless snapshot is reset.

## Photo Fixture Coverage

`sprint02PhotoFixtures` currently includes moderation-state examples:
- `approved` for `u-persona-active-1`
- `pending` for `u-persona-new-1`
- `rejected` for `u-persona-banned-1`

These are intended for profile photo UI state validation and moderation badge/status behavior.

## Maintenance Rules
When updating persona fixtures:
1. Keep canonical account statuses aligned with architecture/schema values:
   - `active`, `suspended`, `banned`, `pending_deletion`, `deleted`
2. Keep `isNewUser` + `profileCompleted` combinations intentional for gate testing.
3. Update tests in `mobile/__tests__/serviceLocatorProvider.test.tsx` if persona mapping behavior changes.
4. Preserve deterministic behavior (stable IDs, frozen fixtures, deterministic clock-driven timestamps).
