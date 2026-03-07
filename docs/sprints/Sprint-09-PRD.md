# Sprint 09 PRD - Real Profile, Photos, Roles, and Permission Conversion

## Sprint Objective
Convert mocked profile, photo, and role-permission modules to real Firebase-backed implementations with server-authoritative validation, role assignment/revocation, and role-context enforcement.

## Business Context
After real auth/account conversion in Sprint 08, profile and RBAC become the next control layer required for trusted user identity completeness and privileged operation safety. Sprint 09 enables real user data persistence and role governance needed before venue and moderation domain conversion.

## User Stories
- As a user, I can load and update my profile with real persisted data.
- As a user, I can manage profile photos with real upload and moderation-state visibility.
- As an admin, I can assign/revoke roles in a real authoritative flow.
- As a multi-role user, I can switch active role context only to assigned roles.
- As QA/security stakeholders, we can verify permission checks and deny-by-default behavior.

## UX Scope
- User Profile Screen (real data)
- Edit Profile Screen (real validation and save)
- Profile Photos Management Screen (real upload/remove/state)
- Profile Completion Required Screen (real gate)
- Role Context Selector Screen (real assigned-role constraints)
- Admin Role Assignment Screen (real role changes)
- Admin User Management Screen (real role/status visibility baseline)
- Error/Retry/Access Denied states for profile and role operations

## Functional Requirements
1. Replace mock profile repository with real persistence:
   - Get profile
   - Upsert profile
   - Enforce profile completion gate
2. Implement profile field validation aligned to canonical rules:
   - Age minimum constraints
   - Preference range constraints
   - Bio/field limits
3. Convert photo flow to real-backed behavior:
   - Upload photo
   - Persist metadata and moderation status (`pending`, `approved`, `rejected`)
   - Enforce minimum photo constraints where required
4. Convert role-permission flows:
   - Real role assignment/revocation (admin-authorized)
   - Real active role context switching
   - Immediate effect on subsequent privileged requests
5. Enforce permission checks server-side with deny-by-default.
6. Add audit/event hooks for privileged changes.

## Non-Functional Requirements
- Validation and permission checks must be server-authoritative.
- No regressions in existing auth/account behavior from Sprint 08.
- Profile CRUD and role operations must be observable with structured logs.
- Mixed-mode compatibility maintained for yet-to-convert modules.
- Data integrity maintained against canonical schema and enum values.

## Edge Cases
- Profile completion toggles false due to photo moderation rejection.
- Role revoked while currently active role context in app.
- Admin attempts to remove last remaining administrator.
- Concurrent profile updates from multiple sessions.
- Upload succeeds but metadata write fails.
- Permission drift between client cache and server response.

## Mocked vs Real Behavior Expectations
- Real in Sprint 09:
  - Profile persistence and validation.
  - Photo upload metadata lifecycle and moderation status source.
  - Role assignment/revocation/context switch enforcement.
- Still mocked in Sprint 09:
  - Venue/presence/discovery/match/chat and broader moderation queue workflows.
- Conversion principle:
  - Existing UI remains stable; adapter implementations swap underneath interfaces.

## API/Data Contract Expectations (if relevant)
- Enforce canonical error model usage:
  - `VALIDATION_ERROR`
  - `PERMISSION_DENIED`
  - `ACCESS_DENIED`
  - `NOT_FOUND`
  - `CONFLICT`
  - `INTERNAL_ERROR`
- Use canonical role/account enums and profile schema expectations.
- Ensure role operations and profile updates include audit metadata where applicable.

## Screen-Level Behavior
- Profile screens load real persisted values and validation errors.
- Profile completion gate responds to real `profile_completed` state.
- Photo management reflects real moderation status transitions.
- Role selector only displays assigned role contexts.
- Admin role actions show real success/error outcomes.

## Role/Permission Impact
- Real RBAC begins in this sprint for role assignment/context operations.
- Admin-only endpoints enforce server-side authorization.
- Account status from Sprint 08 continues to override permissions when restricted.

## Analytics/Events to Track (if relevant)
- `profile_view_loaded`
- `profile_updated`
- `profile_validation_failed`
- `photo_upload_started`
- `photo_upload_completed`
- `photo_moderation_status_changed`
- `role_assignment_requested`
- `role_assignment_completed`
- `role_revocation_completed`
- `role_context_switched`
- `permission_denied_event`

## QA Acceptance Criteria
- Profile and photo operations execute against real data stores.
- Validation rules enforced consistently across API and UI.
- Role assignment/revocation/context-switch flows are real and permission-safe.
- Unauthorized role operations are denied with correct errors.
- Mixed-mode operation remains stable for non-converted modules.

## Dependencies
- Sprint 07 conversion foundation.
- Sprint 08 real auth/account status enforcement.
- Firebase Storage/Firestore readiness and security alignment.

## Exclusions
- Venue/owner/moderation queue full real conversion.
- Presence/discovery/match/chat real conversion.
- Notification and analytics real conversion.

## Definition of Done
- Mock profile and role modules replaced by real implementations.
- Profile/photo validation and RBAC checks are server-authoritative.
- Admin role flows and user role-context behavior verified end-to-end.
- Sprint-09 TestPlan executed with no blocker defects.
