# Sprint-04 Demo Script - Mock Discovery, Interactions, and Match Lifecycle

## Purpose
Provide a deterministic stakeholder walkthrough of Sprint-04 discovery, interaction, and match lifecycle behavior.

## References
- `docs/sprints/Sprint-04-PRD.md`
- `docs/sprints/Sprint-04-TestPlan.md`
- `docs/sprints/Sprint-04-Todo.md`
- `docs/sprints/Sprint-04-Carry-Over.md`
- `docs/product/Night Vibe - Phases and Sprints Delivery Plan.md`
- `mobile/docs/sprint-04-discovery-pipeline-and-filtering-order.md`
- `mobile/docs/sprint-04-interaction-idempotency-phase-2-conversion.md`
- `mobile/docs/sprint-04-match-lifecycle-state-machine-and-triggers.md`

## Demo Preconditions
- Branch: `Sprint-04`
- Runtime mode is Phase 1 mock (`phase1-mock`)
- Mobile dependencies installed in `mobile/` (`npm ci`)
- Validation baseline passed:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test -- --runInBand`
- Active-session fixture is available (Sprint-03 presence simulation baseline)

## Demo Runtime Commands
From `mobile/`:
1. `npm start -- --clear`
2. Open Android emulator or iOS simulator.
3. Log in with an active regular-user persona and navigate to venue/discovery flow.

## Required Outcome Scenarios

### A) Discovery Entry and Same-Venue Gating
- [ ] Open discovery from an active checked-in context.
- [ ] Verify candidates shown are same-venue only and preview-safe fields only.
- [ ] Confirm deterministic candidate ordering and visible pagination controls/state.

### B) Discovery Denial Without Active Session (`NOT_CHECKED_IN`)
- [ ] Use no-active-session scenario.
- [ ] Request discovery.
- [ ] Verify blocked/error state maps to `NOT_CHECKED_IN` and retry path is shown.

### C) Filtering Correctness (Preference + Mutual Visibility + Block/Skip)
- [ ] Run incompatible-preference scenario and verify candidate exclusion.
- [ ] Run block/skip scenario and verify blocked/skipped users do not appear.
- [ ] Verify mutual visibility constraints are reflected in candidate list.

### D) Profile Preview Navigation and Action Matrix
- [ ] Tap a person bar from Potential Matches and open Discovery Profile Preview.
- [ ] Verify potential profile shows `like` (or `unlike` if already liked).
- [ ] Verify match profile shows `unmatch` only.
- [ ] Verify explicit back navigation returns to venue/discovery context.

### E) One-Sided Like (No Match)
- [ ] Submit `like` on one-sided scenario.
- [ ] Verify interaction success state and no match confirmation appears.
- [ ] Re-open profile and verify action state reflects prior interaction.

### F) Duplicate Interaction Prevention (`DUPLICATE_INTERACTION`)
- [ ] Trigger rapid repeat interaction on same actor-target-session scope.
- [ ] Verify duplicate path returns `DUPLICATE_INTERACTION`.
- [ ] Verify UI duplicate feedback state renders without crash/regression.

### G) Reciprocal Like -> Match Creation
- [ ] Run reciprocal-like scenario pack.
- [ ] Verify exactly one match is created.
- [ ] Verify Match Confirmation appears only for valid reciprocal match.

### H) Unmatch Behavior
- [ ] Open a match profile.
- [ ] Trigger `unmatch`.
- [ ] Verify profile returns to Potential Matches in unliked state.

### I) Match Expiration Lifecycle
- [ ] Start from active `matched` state.
- [ ] Trigger co-location/session invalidation scenario.
- [ ] Verify match transitions to `expired` and expiration visual treatment appears.

### J) Empty Feed and End-of-Pagination Behavior
- [ ] Run no-candidates/exhausted-feed scenario.
- [ ] Verify Empty State rendering and deterministic end-of-feed behavior.
- [ ] Verify retry/back behavior remains stable.

### K) Mock Failure and Retry (`INTERNAL_ERROR`, `VALIDATION_ERROR`, `ACCESS_DENIED`)
- [ ] Trigger mock failure scenario.
- [ ] Verify error surface and retry behavior for simulated failure states.
- [ ] Verify account-status denial (`ACCESS_DENIED`) remains enforced when applicable.

## Suggested Demo Narrative
1. Prove same-venue discovery baseline and deterministic ordering.
2. Show no-session denial and filter correctness.
3. Show profile preview and action-availability matrix.
4. Demonstrate one-sided like, duplicate prevention, and reciprocal-like match creation.
5. Demonstrate unmatch and match expiration transitions.
6. Close with empty/error/retry states and carry-over risk notes for Sprint-05.

## Demo Exit Criteria
- All sections A-K above are completed.
- Scenario packs replay deterministic outcomes across reruns.
- Duplicate interaction prevention and reciprocal-like single-match behavior are demonstrated.
- Match expiration and unmatch transitions are shown end-to-end.
- No Severity-1/Severity-2 defect appears in Sprint-04 scope during walkthrough.
- Stakeholder review confirms Sprint-04 demo readiness.
