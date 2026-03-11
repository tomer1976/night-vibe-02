# Sprint-02 Demo Script - Mock Authentication, Onboarding, Profile, and Settings

## Purpose
Provide a deterministic walkthrough of Sprint-02 auth, onboarding, profile, and settings behavior for stakeholder review.

## References
- `docs/sprints/Sprint-02-PRD.md`
- `docs/sprints/Sprint-02-TestPlan.md`
- `docs/sprints/Sprint-02-Todo.md`
- `docs/product/Night Vibe - Phases and Sprints Delivery Plan.md`
- `mobile/docs/persona-fixture-catalog-and-usage.md`

## Demo Preconditions
- Branch: `Sprint-02`
- Runtime mode is Phase 1 mock (`phase1-mock`)
- Mobile dependencies installed in `mobile/` (`npm ci`)
- Validation baseline passed:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test -- --runInBand`

## Demo Runtime Commands
From `mobile/`:
1. `npm start`
2. Open Android emulator or iOS simulator.
3. Navigate to login flow and execute persona-driven walkthroughs.

## Persona Login Hints
Use `Email or Persona` input values containing these keywords:
- `new` -> new user (`active`, `isNewUser=true`)
- default/fallback (for example `active-user@example.com`) -> active returning user
- `suspended` -> suspended user
- `banned` -> banned user
- `pending` -> pending deletion user
- `deleted` -> deleted user simulation path

## Route Walkthrough Checklist

### A) New User Persona
- [ ] Login using `new-user@example.com`.
- [ ] Verify route goes to onboarding step 1.
- [ ] Complete steps 1-7 and verify validation behavior per step.
- [ ] Verify profile completion gate blocks direct post-onboarding routes until completion action.
- [ ] Verify final transition to user shell/profile area after completion.

### B) Active Returning Persona
- [ ] Login using `active-user@example.com`.
- [ ] Verify immediate routing to post-auth user area (no onboarding detour).
- [ ] Open profile/edit/photos/settings and verify stable navigation/state.

### C) Suspended Persona
- [ ] Login using `suspended-user@example.com`.
- [ ] Verify routing to access denied screen.
- [ ] Verify no bypass to onboarding/profile/settings routes.

### D) Banned Persona
- [ ] Login using `banned-user@example.com`.
- [ ] Verify routing to access denied screen.
- [ ] Verify no bypass to onboarding/profile/settings routes.

### E) Pending Deletion Persona
- [ ] Login using `pending-user@example.com`.
- [ ] Verify routing to session recovery screen.
- [ ] Verify recover action returns to active flow.
- [ ] Verify cancel action routes back to welcome safely.

### F) Deleted Persona Simulation
- [ ] Login using `deleted-user@example.com`.
- [ ] Verify account status is treated as deleted and access denied guidance is shown.

### G) Error/Retry Behavior
- [ ] Trigger a mock failure path and verify `Error and Retry` UX is actionable and non-crashing.
- [ ] Verify retry returns user to a valid auth/profile path.

### H) Determinism and Relaunch
- [ ] Relaunch app in mock mode and verify state hydration behaves deterministically.
- [ ] Verify account status/profile-completion gate remains consistent after relaunch.

## Suggested Demo Narrative
1. Start with `new` persona to prove onboarding + completion gate.
2. Show active returning persona for fast path.
3. Show suspended and banned denied-path handling.
4. Show pending deletion recovery path.
5. Show deleted simulation denial behavior.
6. Close with deterministic mock-mode claim and no-backend dependency note.

## Demo Exit Criteria
- All persona checklist sections above are completed.
- Required account statuses (`active`, `suspended`, `banned`, `pending_deletion`, `deleted`) are demonstrated.
- No Severity-1/Severity-2 defect appears in Sprint-02 scope during walkthrough.
- Stakeholder review confirms Sprint-02 demo readiness.
