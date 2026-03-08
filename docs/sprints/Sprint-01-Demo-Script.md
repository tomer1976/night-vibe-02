# Sprint-01 Demo Script - Mobile Foundation and Design System

## Purpose
Provide a deterministic walkthrough of Sprint-01 outputs for stakeholder review.

## References
- `docs/sprints/Sprint-01-PRD.md`
- `docs/sprints/Sprint-01-TestPlan.md`
- `docs/sprints/Sprint-01-Todo.md`
- `docs/product/UI-Screens.md`

## Demo Preconditions
- Branch: `Sprint-01`
- Mock mode remains enabled (no real Firebase wiring)
- Mobile dependencies installed: `npm ci` in `mobile/`
- Validation baseline passed:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test -- --ci --runInBand`

## Demo Runtime Commands
From `mobile/`:
1. `npm start`
2. Open Android emulator or iOS simulator.
3. Verify app launches to shell flow without runtime crash.

## Route Walkthrough Checklist

### Launch and Global Shell
- [ ] Splash/app entry renders successfully.
- [ ] Global top bar and bottom shell navigation render with theme tokens.
- [ ] Empty/loading/error templates render without runtime crash.

### Role Route Groups
- [ ] Auth route group entry renders.
- [ ] User route group entry renders.
- [ ] Venue Owner route group entry renders.
- [ ] Moderator route group entry renders.
- [ ] Administrator route group entry renders.

### Routing Safety and Fallback
- [ ] Invalid role context is blocked and routed to safe fallback.
- [ ] Unknown route attempt lands on fallback route.
- [ ] Route ownership boundaries stay consistent with role simulation.

### Mock and Contract Behavior
- [ ] Mock provider success scenario returns deterministic `SUCCESS` envelope.
- [ ] Mock provider error scenario returns deterministic `FAIL` envelope with canonical error code.
- [ ] No external Firebase/network dependency is required for demo flow.

### Design-System Baseline
- [ ] Button/Input/Card/Badge/ListItem/StateView render correctly.
- [ ] Typography and spacing scale align with Sprint-01 visual baseline.
- [ ] Dark-theme contrast remains readable for shell screens.

## Demo Narrative (Suggested)
1. Launch app and confirm shell stability.
2. Switch across role-context route entries to validate information architecture.
3. Trigger fallback behavior (invalid role/unknown route).
4. Show deterministic success/error UI states using mock provider toggles.
5. Close with architecture note: interfaces remain adapter-swappable for Phase 2.

## Demo Exit Criteria
- All checklist items above are marked complete during walkthrough.
- No Severity-1/Severity-2 defect is observed in foundation/navigation/design-system surfaces.
- Sprint-01 stakeholders acknowledge readiness to proceed toward Sprint-02.
