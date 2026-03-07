# Sprint-06 Todo - Mock Role Dashboards, Owner Flows, and Phase 1 Exit

## Frontend Tasks
- [ ] Implement Role Context Selector and role-aware navigation entry.
- [ ] Implement Venue Owner Dashboard and related management screens.
- [ ] Implement Venue Submission and Submission Status screens.
- [ ] Implement Venue Edit and Venue Analytics screens.
- [ ] Implement Venue Plan and Subscription screen with mock plan states.
- [ ] Implement Moderator dashboards and queue/detail/action screens.
- [ ] Implement Admin dashboard and governance/user/role/settings/analytics screens.
- [ ] Implement shared error/empty/loading states for role modules.

## Backend Tasks (if applicable)
- [ ] Define `RoleService`, `OwnerService`, `ModerationService`, and `AdminService` interfaces.
- [ ] Define permission policy contract for deny/allow simulation.
- [ ] Define mock audit-event contract for privileged actions.

## Firebase Tasks (if applicable)
- [ ] Confirm all role operations remain mock-only in Phase 1 mode.
- [ ] Add placeholder contract mappers for future role/admin/moderation APIs.

## Mock-Data Tasks
- [ ] Create fixtures for multi-role users and active role contexts.
- [ ] Create venue submission lifecycle fixtures with approval/rejection paths.
- [ ] Create moderation queue fixtures (reports + venue reviews).
- [ ] Create enforcement outcome fixtures (`warning`, `suspension`, `ban`, `no_action`).
- [ ] Create owner plan/subscription fixtures (trial/active/expired).
- [ ] Create admin governance fixtures for role assignment/revocation scenarios.

## Navigation Tasks
- [ ] Wire role selector -> context dashboard routing.
- [ ] Add permission-aware guards for role-specific routes.
- [ ] Add fallback route for invalid or stale role context.

## UI Tasks
- [ ] Build dashboard cards/panels for owner/moderator/admin modules.
- [ ] Build queue tables/list variants optimized for mobile readability.
- [ ] Build action confirmation and result feedback modals.
- [ ] Ensure visual consistency with dark theme and design tokens.

## State-Management Tasks
- [ ] Implement role context store with persistence and validation.
- [ ] Implement owner flow state for submission/edit/plan lifecycle.
- [ ] Implement moderation queue state and action result handling.
- [ ] Implement admin governance state for role changes and overrides.
- [ ] Implement cross-module permission selector helpers.

## Testing Tasks
- [ ] Add role-context routing tests across all role types.
- [ ] Add owner flow tests for venue submission lifecycle states.
- [ ] Add moderation queue/action tests and enforcement output checks.
- [ ] Add admin role assignment/revocation tests including invalid scenarios.
- [ ] Add permission-denied rendering tests for unauthorized actions.
- [ ] Add regression tests covering Sprint 01-05 integration points.

## Bugfix/Stabilization Tasks
- [ ] Fix stale role-context rendering issues.
- [ ] Resolve inconsistent permission states across dashboards.
- [ ] Resolve lifecycle state-sync issues between owner and moderator views.

## Documentation Tasks
- [ ] Document role policy simulation and deny-by-default rules.
- [ ] Document owner/moderator/admin mock workflow state machines.
- [ ] Document Phase 1 -> Phase 2 conversion map by module.
- [ ] Document known risk register and unresolved assumptions.
- [ ] Prepare Phase 1 UAT checklist and sign-off template.

## Release/Readiness Tasks (if applicable)
- [ ] Execute full Phase 1 UAT scenario matrix (user + owner + moderator + admin).
- [ ] Publish Phase 1 completion report and conversion readiness memo.
- [ ] Confirm Sprint 07 scope lock and dependency readiness.

## Sprint Exit Checklist
- [ ] Sprint-06 PRD scope delivered or formally deferred.
- [ ] Sprint-06 TestPlan executed and evidenced.
- [ ] No blocker defects in role dashboard/governance modules.
- [ ] Phase 1 exit recommendation approved by PM + Eng + QA.
