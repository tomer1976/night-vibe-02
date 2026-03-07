# Sprint-10 Test Plan - Real Venues, Owner Submission, Approval, and Ownership Conversion

## Scope Under Test
- Real venue submission and validation.
- Duplicate detection behavior.
- Real moderation review queue and approve/reject actions.
- Ownership authorization and edit permission constraints.
- Venue lifecycle transitions and active-venue eligibility rules.
- Mixed-mode stability with non-converted modules.

## Happy Paths
1. Venue owner submits valid venue and receives `pending` status.
2. Moderator reviews and approves submission; status becomes `active`.
3. Owner edits allowed fields successfully.
4. Admin applies governance transition where permitted.
5. Active venue appears in downstream eligible venue source.

## Edge Cases
- Duplicate venue detected during submission.
- Owner attempts disallowed immutable field update.
- Venue status changes between fetch and submit.
- Moderator and admin actions conflict on same venue state.
- Plan state changes impacting owner management capabilities.

## Negative Cases
- Invalid submission payload returns `VALIDATION_ERROR`.
- Unauthorized review/edit action returns `PERMISSION_DENIED`/`ACCESS_DENIED`.
- Invalid transition returns `CONFLICT`.
- Missing venue target returns `NOT_FOUND`.
- Backend failure returns normalized `INTERNAL_ERROR` and safe UI fallback.

## Role-Based Cases
- `VenueOwner` can submit/edit only owned permitted resources.
- `Moderator` can review submissions but not admin-only governance controls.
- `Administrator` can execute governance overrides per policy.
- `RegularUser` cannot access privileged venue management actions.

## Device/Platform Cases
- Android emulator venue submission/review flow validation.
- iOS simulator owner/moderator/admin venue flow validation.
- Mobile layout and interaction checks for queue/detail/edit screens.

## Mock-Mode / Real-Mode Cases
- Real venue modules work with mock presence/discovery/chat modules.
- Adapter boundaries remain stable under mixed conversion mode.
- No fallback to mock for converted venue lifecycle operations.

## Regression Checklist
- [ ] Sprint 08 auth/account status behavior remains enforced.
- [ ] Sprint 09 profile/RBAC behavior remains stable.
- [ ] Existing phase-1 screens remain accessible and consistent.

## Acceptance Checklist
- [ ] Venue submission/review lifecycle passes end-to-end.
- [ ] Duplicate detection behavior verified.
- [ ] Ownership and immutable-field constraints verified.
- [ ] Active-venue eligibility rule verified.
- [ ] Lint/typecheck/tests pass for sprint scope.
- [ ] No Severity-1/Severity-2 defects in Sprint 10 scope.

## Test Data and Environment Notes
- Environments: dev/staging with real venues modules enabled.
- Data setup: users with owner/moderator/admin roles and varied venue states.
- Mixed-mode: presence/discovery/match/chat still mocked unless explicitly converted.

## Exit Reporting
- Publish pass/fail matrix for submission, moderation, ownership, and lifecycle tracks.
- Log defects with severity, owner, and target sprint.
- Provide go/no-go recommendation for Sprint 11 kickoff.
