# Sprint-04 Test Plan - Mock Discovery, Interactions, and Match Lifecycle

## Scope Under Test
- Same-venue discovery feed generation and filtering.
- Profile preview and like/pass action handling.
- Duplicate interaction prevention behavior.
- Reciprocal-like match creation and confirmation.
- Match expiration behavior and downstream state updates.
- Discovery pagination and empty/error scenarios.

## Happy Paths
1. User with active session opens discovery and sees eligible same-venue candidates.
2. User likes a candidate; reciprocal like exists; match confirmation is shown.
3. User passes candidate and next candidate loads correctly.
4. Pagination loads additional candidates until feed end.
5. Match remains active while both users remain co-located in mock session.

## Edge Cases
- Discovery request with no active session returns proper blocked state.
- Candidate set shrinks to zero after applying preference updates.
- Candidate is blocked after already appearing in current page.
- Rapid consecutive like taps on same candidate.
- Candidate leaves venue before reciprocal-like check.
- Pagination cursor invalid or stale.

## Negative Cases
- Simulated `NOT_CHECKED_IN` on discovery request.
- Simulated `DUPLICATE_INTERACTION` on repeated like/pass.
- Simulated `ACCESS_DENIED` for restricted account status.
- Simulated service failure (`INTERNAL_ERROR`) and retry behavior.
- Invalid interaction payload produces `VALIDATION_ERROR` state.

## Role-Based Cases
- `RegularUser` discovery/interaction flow executes fully.
- Suspended/banned users are denied discovery actions.
- Role context does not bypass account-state restrictions.

## Device/Platform Cases
- Android emulator: feed performance and action responsiveness.
- iOS simulator: preview interaction UX and modal/overlay behavior.
- Portrait layout and safe-area checks for all in-scope screens.

## Mock-Mode Cases
- Deterministic scenario packs replay identical outcomes.
- Mock event emission (`match_created`, `match_expired`) fires reliably.
- No external network/Firebase calls occur during test execution.

## Regression Checklist
- [ ] Sprint 01 foundation and route structure remain stable.
- [ ] Sprint 02 auth/profile gate still enforced.
- [ ] Sprint 03 active session logic still gates discovery entry.
- [ ] Global error/empty-state components remain consistent.

## Acceptance Checklist
- [ ] Same-venue gating validated across all discovery tests.
- [ ] Filter correctness verified (preference, block, skip, mutual visibility).
- [ ] Duplicate prevention verified.
- [ ] Match creation occurs exactly once for reciprocal likes.
- [ ] Match expiration updates state as expected.
- [ ] Lint/typecheck/tests pass for Sprint 04 scope.
- [ ] No Severity-1/Severity-2 defects open in Sprint 04 scope.

## Test Data and Environment Notes
- Environment: local mock mode only.
- Data sources: deterministic fixtures for candidates/interactions/matches.
- Preconditions: active session mock fixture present unless explicitly testing not-checked-in behavior.

## Exit Reporting
- Publish pass/fail matrix for discovery, interactions, and match lifecycle.
- Log defects with severity, owner, and target sprint.
- Submit go/no-go recommendation for Sprint 05 kickoff.
