# Sprint-06 Test Plan - Mock Role Dashboards, Owner Flows, and Phase 1 Exit

## Scope Under Test
- Role context switching and role-aware navigation.
- Venue owner submission/management/analytics/plan mock flows.
- Moderator report and venue review queue flows.
- Admin governance and role assignment/revocation flows.
- Permission-denied and account-status gating behavior across privileged routes.
- Phase 1 end-to-end UAT scenario completeness.

## Happy Paths
1. Multi-role user switches context and lands on correct dashboard each time.
2. Venue owner submits venue and sees status progression in submission tracker.
3. Moderator reviews report and applies enforcement action successfully.
4. Moderator reviews venue submission and approves/rejects correctly.
5. Admin assigns and revokes role with immediate UI state update.
6. Owner plan state displays and updates per deterministic scenario.

## Edge Cases
- Active role context becomes invalid after role update.
- Moderator applies duplicate action to already resolved report.
- Admin revokes role resulting in restricted action visibility.
- Venue owner edits disallowed fields after rejection/lock state.
- Queue item disappears or changes status while details screen is open.
- Plan expires while owner is mid-flow in management screen.

## Negative Cases
- Simulated `PERMISSION_DENIED` for unauthorized privileged action.
- Simulated `ACCESS_DENIED` due to account status restrictions.
- Simulated `VALIDATION_ERROR` for invalid role/venue payload.
- Simulated `CONFLICT` for inconsistent state transitions.
- Simulated `INTERNAL_ERROR` with retry and safe fallback.

## Role-Based Cases
- `RegularUser` cannot access owner/moderator/admin privileged surfaces.
- `VenueOwner` can access owner flows only.
- `Moderator` can access moderation flows only.
- `Administrator` can access admin governance flows.
- Multi-role user context switching honors assigned-role boundaries.

## Device/Platform Cases
- Android emulator validation for dashboard list usability and action flows.
- iOS simulator validation for modal confirmations and safe-area behavior.
- Portrait layout checks for all role dashboards and queue/detail screens.

## Mock-Mode Cases
- Deterministic fixtures produce repeatable queue/status outcomes.
- Mock permission policy updates propagate immediately across open screens.
- No real Firebase/backend requests made in role flow execution.

## Regression Checklist
- [ ] Sprint 01 app shell and core components remain stable.
- [ ] Sprint 02 auth/account-status gating remains enforced.
- [ ] Sprint 03 venue and presence base states still function.
- [ ] Sprint 04 discovery/match states not regressed by role modules.
- [ ] Sprint 05 chat/safety/notifications still render and gate correctly.

## Acceptance Checklist
- [ ] All Sprint 06 in-scope screens implemented and reachable.
- [ ] Role switching and permission gating validated for all role types.
- [ ] Owner/moderator/admin critical workflows pass scenario tests.
- [ ] Phase 1 UAT matrix completed with documented outcomes.
- [ ] Lint/typecheck/tests pass for changed modules.
- [ ] No Severity-1/Severity-2 defects open in Sprint 06 scope.
- [ ] Phase 1 exit recommendation and readiness checklist approved.

## Test Data and Environment Notes
- Environment: local mock mode only.
- Data sources: deterministic role, venue, moderation, governance fixture packs.
- Preconditions: account personas and role assignments loaded from fixture scenarios.

## Exit Reporting
- Publish pass/fail matrix for owner, moderator, admin flows and role switching.
- Log defects by severity, owner, and target sprint.
- Publish Phase 1 exit report with go/no-go recommendation for Sprint 07.
