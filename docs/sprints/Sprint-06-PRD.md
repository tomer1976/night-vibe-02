# Sprint 06 PRD - Mock Role Dashboards, Owner Flows, and Phase 1 Exit

## Sprint Objective
Complete Phase 1 by delivering fully mocked role-based dashboard and governance experiences (Venue Owner, Moderator, Administrator), including venue submission/review lifecycle simulation, role context UX validation, and formal Phase 1 exit readiness.

## Business Context
Night Vibe is a multi-actor platform, not only a regular-user app. Product validation is incomplete without role-based operations for venue management, moderation, and platform governance. Sprint 06 closes this gap and finalizes the mocked app as a complete look-and-feel and behavior simulation before Phase 2 real conversion begins.

## User Stories
- As a venue owner, I can submit a venue, monitor review status, manage venue content, and view mock analytics/plan states.
- As a moderator, I can review user reports and venue submissions and apply mock enforcement actions.
- As an administrator, I can manage users, assign/revoke roles, and view governance controls.
- As a multi-role user, I can switch role context and see the correct dashboard and permissions in mock mode.
- As PM/QA/engineering stakeholders, we can perform Phase 1 UAT and confirm conversion readiness.

## UX Scope
- Role Context Selector Screen
- Venue Submission Screen
- Venue Submission Review Status Screen
- Venue Owner Dashboard Screen
- Venue Owner Venue Management Screen
- Venue Edit Screen
- Venue Analytics Screen
- Venue Plan and Subscription Screen (mock payment states)
- Moderator Dashboard Screen
- Moderator Reports Queue Screen
- Moderator Report Details Screen
- Moderator Action Confirmation Screen
- Moderator Venue Review Queue Screen
- Moderator Venue Review Details Screen
- Admin Dashboard Screen
- Admin User Management Screen
- Admin Role Assignment Screen
- Admin Venue Governance Screen
- Admin Moderation Overrides Screen
- Admin Platform Settings Screen
- Admin Analytics Overview Screen
- Error/Retry/Empty-state patterns for all role surfaces

## Functional Requirements
1. Implement mock role-context switching:
   - Support `RegularUser`, `VenueOwner`, `Moderator`, `Administrator` context simulation.
   - Preserve account-status restrictions and deny states from prior sprints.
2. Implement venue-owner operations in mock mode:
   - Submit venue with status progression (`pending`, `active`, `rejected`, etc.).
   - Manage owned venue details with lifecycle-aware restrictions.
   - Display mock analytics snapshots and plan/subscription states.
3. Implement moderator operations in mock mode:
   - Reports queue and details review UX.
   - Venue review queue and approval/rejection simulation.
   - Enforcement action simulation (`warning`, `suspension`, `ban`, `no_action`).
4. Implement administrator operations in mock mode:
   - User management and role assignment/revocation UI.
   - Governance and moderation override simulations.
   - Platform settings and admin analytics overview placeholders.
5. Implement cross-role policy simulation:
   - Deny-by-default visual policy for unauthorized actions.
   - Role-specific action visibility and disabled states.
6. Implement Phase 1 exit pack:
   - Full scenario matrix coverage (user/owner/moderator/admin).
   - Conversion map specifying which mock modules convert in Phase 2 by sprint.
   - UAT sign-off checklist and known risk register.

## Non-Functional Requirements
- Entire app remains backend-independent in Phase 1.
- Mock role transitions are deterministic and reproducible.
- Role dashboards and list surfaces remain responsive with realistic fixture volume.
- All role modules use typed interfaces and adapter boundaries suitable for Phase 2 replacement.
- Cross-screen consistency with Night Vibe UI-UX guide and design system.

## Edge Cases
- Multi-role user switches context while unsaved dashboard form changes exist.
- Role removed in mock state while currently active in UI context.
- Moderator applies enforcement action to already suspended/banned user.
- Venue submission enters rejected state and owner attempts restricted edits.
- Admin attempts action resulting in invalid role distribution (e.g., no administrators).
- Plan state changes mid-session (active -> expired) affecting owner capabilities.

## Mocked vs Real Behavior Expectations
- Mocked in Sprint 06:
  - Role entitlement and permission decisions.
  - Venue submission/approval persistence.
  - Moderation queue actions and enforcement outcomes.
  - Owner plan/subscription and analytics data.
- Real in Phase 2 conversion:
  - Server-authoritative RBAC and account status enforcement.
  - Real venue lifecycle persistence and moderation actions.
  - Real admin governance/audit pathways.
  - Real owner analytics and monetization workflows.
- Contract requirement:
  - UI depends on role-domain interfaces only (`RoleService`, `OwnerService`, `ModerationService`, `AdminService`).

## API/Data Contract Expectations (if relevant)
- Mock response shape aligns with production envelope conventions.
- Simulate privileged-operation error codes:
  - `PERMISSION_DENIED`
  - `ACCESS_DENIED`
  - `VALIDATION_ERROR`
  - `CONFLICT`
  - `NOT_FOUND`
  - `INTERNAL_ERROR`
- Ensure role and account status enums remain schema-compatible.

## Screen-Level Behavior
- Role selector routes to context-appropriate dashboard.
- Owner dashboard surfaces submission/management/analytics/plan states.
- Moderator dashboards support queue-to-action workflow simulation.
- Admin dashboard supports user-role-governance operations simulation.
- Unauthorized actions show explicit deny state messaging.

## Role/Permission Impact
- This sprint is role-centric and must validate all role contexts:
  - `RegularUser`
  - `VenueOwner`
  - `Moderator`
  - `Administrator`
- Permission simulation is visual/functional in client-only mode.
- Phase 2 conversion must replace all permission checks with server-authoritative logic.

## Analytics/Events to Track (if relevant)
- `role_context_switched_mock`
- `venue_submission_created_mock`
- `venue_submission_status_changed_mock`
- `moderation_action_applied_mock`
- `admin_role_assigned_mock`
- `admin_role_revoked_mock`
- `permission_denied_rendered_mock`
- `owner_plan_state_changed_mock`
- `phase1_uat_scenario_completed`

## QA Acceptance Criteria
- All role dashboard surfaces are navigable and scenario-testable.
- Role context switching updates visible actions and routes correctly.
- Mock permission/deny behavior works consistently across owner/moderator/admin actions.
- Venue submission and moderation status transitions are deterministic.
- Admin role operation scenarios produce expected UI and state outcomes.
- Phase 1 UAT pass criteria and conversion-readiness checklist completed.

## Dependencies
- Sprint 01 foundation and navigation architecture.
- Sprint 02 account states and role context groundwork.
- Sprint 03 venue and presence baseline concepts.
- Sprint 04 discovery/match outputs and safety dependencies.
- Sprint 05 chat/safety/notification behavior hooks.

## Exclusions
- Real Firebase RBAC/authorization.
- Real moderation backend persistence.
- Real payment processor integration.
- Real owner/admin analytics backends.

## Definition of Done
- All role-based Phase 1 dashboard and governance screens implemented and demoable.
- Deterministic scenario packs exist for owner/moderator/admin critical workflows.
- Phase 1 UAT and conversion-readiness artifacts are completed and reviewed.
- Sprint-06 TestPlan executed with no blocker defects.
- Phase 1 exit recommendation documented for transition to Sprint 07 (Phase 2 foundation).
