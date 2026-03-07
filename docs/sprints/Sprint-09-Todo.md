# Sprint-09 Todo - Real Profile, Photos, Roles, and Permission Conversion

## Frontend Tasks
- [ ] Replace mock profile adapter usage with real profile adapter.
- [ ] Integrate profile screens with real load/save and validation feedback.
- [ ] Integrate photo management screens with real upload status handling.
- [ ] Update role context selector to show assigned roles from real data.
- [ ] Update admin role assignment screens for real operation results.

## Backend Tasks (if applicable)
- [ ] Implement profile get/upsert handlers with server-side validation.
- [ ] Implement photo metadata lifecycle handlers and moderation-state support.
- [ ] Implement role assignment/revocation/context-switch handlers.
- [ ] Enforce admin authorization and deny-by-default role checks.
- [ ] Add audit logging for privileged role operations.

## Firebase Tasks (if applicable)
- [ ] Configure Firestore collections/doc paths for profile and roles usage.
- [ ] Configure Storage upload paths and metadata linkage.
- [ ] Validate security rules for profile self-write and admin-only role writes.
- [ ] Validate indexes required by admin user/role views.

## Mock-Data Tasks
- [ ] Keep mixed-mode fixtures for non-converted modules.
- [ ] Add fallback fixtures for photo upload failure and moderation delay scenarios.

## Navigation Tasks
- [ ] Validate navigation guards for profile completion and role-based surfaces.
- [ ] Ensure role context switch reroutes to eligible dashboard context only.

## UI Tasks
- [ ] Refine validation error messaging on profile forms.
- [ ] Add moderation-status chips and photo-state hints.
- [ ] Improve admin role-action confirmations and result banners.

## State-Management Tasks
- [ ] Replace profile store mutations with real async actions.
- [ ] Add optimistic/pessimistic strategy for profile updates.
- [ ] Implement role state refresh after assignment/revocation.
- [ ] Ensure stale role-context invalidation handling.

## Testing Tasks
- [ ] Add integration tests for profile load/update success paths.
- [ ] Add validation tests for profile constraints and edge cases.
- [ ] Add photo upload and moderation-status transition tests.
- [ ] Add role assignment/revocation authorization tests.
- [ ] Add tests for preventing invalid role context switching.
- [ ] Add mixed-mode regression tests for unconverted modules.

## Bugfix/Stabilization Tasks
- [ ] Fix profile-save race conditions and stale UI refresh behavior.
- [ ] Resolve upload/metadata consistency issues.
- [ ] Resolve role-state propagation delays in admin and user views.

## Documentation Tasks
- [ ] Document real profile and photo architecture changes.
- [ ] Document RBAC flow and role-context switching behavior.
- [ ] Document security-rule expectations for profile/role operations.
- [ ] Update conversion tracker and Sprint 10 prerequisites.

## Release/Readiness Tasks (if applicable)
- [ ] Prepare Sprint 09 demo with real profile + admin role scenarios.
- [ ] Publish QA/security validation summary.
- [ ] Confirm Sprint 10 readiness dependencies.

## Sprint Exit Checklist
- [ ] Sprint-09 PRD scope delivered or formally deferred.
- [ ] Sprint-09 TestPlan executed with evidence.
- [ ] No blocker defects in profile/photo/RBAC scope.
- [ ] Real conversion sign-off for Sprint 09 completed.
