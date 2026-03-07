# Sprint-11 Test Plan - Real Presence, Nearby Discovery, Interactions, and Matching Conversion

## Scope Under Test
- Real check-in/check-out/session lifecycle.
- Single active session enforcement under concurrency.
- Real discovery candidate generation and filtering.
- Real interaction persistence and duplicate prevention.
- Real match creation and expiration behavior.
- Mixed-mode stability with non-converted modules.

## Happy Paths
1. User checks into active venue within range successfully.
2. Existing active session is auto-closed when checking into another venue.
3. Checked-in user receives same-venue discovery feed.
4. User likes candidate and reciprocal like creates match.
5. Match remains active while co-location remains valid.

## Edge Cases
- Concurrent check-in requests from multiple devices for same user.
- Session timeout occurs near manual checkout action.
- Candidate leaves venue between feed fetch and interaction.
- Preference/filter changes collapse feed mid-pagination.
- Match creation collides with session expiration.

## Negative Cases
- Out-of-range check-in returns `OUT_OF_RANGE`.
- Discovery request without active session returns `NOT_CHECKED_IN`.
- Duplicate interaction returns `DUPLICATE_INTERACTION`.
- Restricted account status returns `ACCESS_DENIED`.
- Invalid payload returns `VALIDATION_ERROR`.
- Internal backend failure maps to resilient `INTERNAL_ERROR` UX handling.

## Role-Based Cases
- `RegularUser` can perform in-scope presence/discovery/interactions actions.
- Unauthorized role contexts cannot bypass account/status restrictions.
- Admin/moderator privileges do not affect regular social gating rules.

## Device/Platform Cases
- Android emulator end-to-end check-in -> discovery -> match flow.
- iOS simulator end-to-end check-in -> discovery -> match flow.
- Session transition UI behavior consistency across both platforms.

## Mock-Mode / Real-Mode Cases
- Converted modules run in real mode while chat/safety remain mixed-mode compatible.
- Adapter boundary stability validated across converted/non-converted modules.
- No fallback to mock for converted critical invariants.

## Regression Checklist
- [ ] Sprint 08 auth/account status behavior remains stable.
- [ ] Sprint 09 profile/RBAC behavior remains stable.
- [ ] Sprint 10 venue lifecycle/eligibility behavior remains stable.
- [ ] Existing UI state patterns (loading/error/empty) remain consistent.

## Acceptance Checklist
- [ ] Check-in/check-out/session paths pass integration tests.
- [ ] One-active-session invariant validated under concurrency.
- [ ] Same-venue discovery gating validated.
- [ ] Duplicate interaction prevention validated.
- [ ] Reciprocal match creation and expiration validated.
- [ ] Lint/typecheck/tests pass for sprint scope.
- [ ] No Severity-1/Severity-2 defects in Sprint 11 scope.

## Test Data and Environment Notes
- Environments: staging preferred for concurrency and integration validation.
- Data setup: multiple active test users across venues and preference matrices.
- Preconditions: active venues and role/account states configured from previous converted modules.

## Exit Reporting
- Publish pass/fail matrix for presence, discovery, interactions, and matching tracks.
- Log defects with severity, owner, and target sprint.
- Provide go/no-go recommendation for Sprint 12 kickoff.
