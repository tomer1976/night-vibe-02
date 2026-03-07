# Sprint-09 Test Plan - Real Profile, Photos, Roles, and Permission Conversion

## Scope Under Test
- Real profile read/update behavior.
- Real photo upload metadata and moderation status handling.
- Real role assignment/revocation and role-context switching.
- Permission-denied behavior for unauthorized role actions.
- Mixed-mode stability for non-converted modules.

## Happy Paths
1. User loads profile and updates valid fields successfully.
2. User uploads photo and sees persisted metadata/moderation status.
3. Admin assigns role to target user successfully.
4. Admin revokes role and target user role context updates accordingly.
5. Multi-role user switches to an assigned role context successfully.

## Edge Cases
- User profile becomes incomplete due to moderation/status changes.
- Admin attempts to revoke final administrator role.
- Role revoked while target user is in active role context.
- Simultaneous profile edits from two sessions.
- Photo upload succeeds but metadata write partially fails.

## Negative Cases
- Invalid profile payload returns `VALIDATION_ERROR`.
- Unauthorized role change attempt returns `PERMISSION_DENIED`.
- Restricted account status returns `ACCESS_DENIED` for protected actions.
- Nonexistent target user/role returns `NOT_FOUND`/`CONFLICT` as applicable.
- Backend failure returns normalized `INTERNAL_ERROR` handling.

## Role-Based Cases
- `RegularUser` can edit only own profile, cannot assign roles.
- `VenueOwner`/`Moderator` cannot perform admin-only role operations.
- `Administrator` can assign/revoke roles within policy constraints.
- Active role context can only be set to currently assigned roles.

## Device/Platform Cases
- Android emulator profile/photo/role flow validation.
- iOS simulator profile/photo/role flow validation.
- Safe-area and keyboard/form behavior checks on profile screens.

## Mock-Mode / Real-Mode Cases
- Real profile/RBAC modules operate with mock venue/discovery/chat modules.
- Adapter boundaries hold without runtime coupling errors.
- No unintended fallback to mock for converted profile/RBAC operations.

## Regression Checklist
- [ ] Sprint 08 auth/session/account status behavior remains stable.
- [ ] Existing phase-1 screens remain navigable.
- [ ] Error handling consistency maintained across converted and mocked modules.

## Acceptance Checklist
- [ ] Profile and photo flows pass integration checks with real persistence.
- [ ] Role assignment/revocation/context-switch pass authorization checks.
- [ ] Permission and status denials map to correct UX states.
- [ ] Lint/typecheck/tests pass for sprint scope.
- [ ] No Severity-1/Severity-2 defects open in Sprint 09 scope.

## Test Data and Environment Notes
- Environments: dev/staging with real auth/profile/RBAC modules.
- Data setup: users across role permutations and account statuses.
- Mixed-mode: venue/presence/discovery/chat remain mock as needed.

## Exit Reporting
- Publish pass/fail matrix for profile, photo, and RBAC tracks.
- Log defects with severity, owner, and target sprint.
- Provide go/no-go recommendation for Sprint 10 kickoff.
