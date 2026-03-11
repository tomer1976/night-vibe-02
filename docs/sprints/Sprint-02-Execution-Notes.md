# Sprint-02 Execution Notes

## Date
- 2026-03-11

## Scope of This Note
- Record unresolved risks identified at Sprint-02 close that may impact Sprint-03 delivery.
- Align risk statements with Sprint-03 PRD, TestPlan, and product delivery-plan dependencies.

## Inputs Reviewed
- `docs/sprints/Sprint-02-PRD.md`
- `docs/sprints/Sprint-02-Todo.md`
- `docs/sprints/Sprint-02-TestPlan.md`
- `docs/sprints/Sprint-03-PRD.md`
- `docs/sprints/Sprint-03-TestPlan.md`
- `docs/product/Night Vibe - Phases and Sprints Delivery Plan.md`

## Unresolved Risks for Sprint-03

| Risk ID | Risk | Why It Matters for Sprint-03 | Current Evidence | Proposed Mitigation | Owner |
|---|---|---|---|---|---|
| S2-RISK-03-01 | Session replacement and timeout behavior may diverge across screens/state transitions | Sprint-03 depends on deterministic one-active-session + timeout handling for check-in/check-out and presence flows | Delivery plan flags this as Sprint-03 risk; Sprint-03 PRD/TestPlan include replacement/timeout edge cases | Implement a single mock presence state machine and centralize timeout/session-close reason codes before feature UI wiring | Engineering |
| S2-RISK-03-02 | Profile-completion and account-status route guards may be bypassed on new venue routes | Sprint-03 venue routes must continue Sprint-02 auth/profile gating invariants | Sprint-03 dependencies explicitly require Sprint-02 gate behavior; Sprint-03 TestPlan includes regression checks | Add route-guard integration tests for venue routes at initial Sprint-03 navigation wiring | Engineering + QA |
| S2-RISK-03-03 | Proximity outcome simulations may be inconsistent across list/detail/check-in confirmation screens | Sprint-03 requires scenario-consistent outcomes (`in-range`, `out-of-range`, `permission denied`, `stale location`) | Sprint-03 PRD requires deterministic toggles and local simulation contract | Define one scenario source-of-truth and consume it in all venue/presence screens and services | Engineering |
| S2-RISK-03-04 | Mock fixture and scenario setup may be insufficient for repeatable QA/demo runs | Sprint-03 demo and test exit criteria require stable scenario reproduction | Sprint-03 PRD/TestPlan call for deterministic toggles, mock clock, and repeatability across restarts | Publish a Sprint-03 scenario matrix and seed-reset instructions before mid-sprint QA execution | QA + Engineering |
| S2-RISK-03-05 | Contract drift risk between mock presence/discovery APIs and planned real Phase-2 APIs | Drift increases Phase-2 replacement cost and regression risk | Architecture/service-contract docs require interface-first adapter swap model | Define `VenueDiscoveryService` + `PresenceService` contracts first, then implement mocks against those contracts only | Engineering |

## Assumptions
- Sprint-03 remains Phase-1 mock mode with no real Firebase or external map/place provider usage.
- Sprint-02 auth/profile/account-state gating behavior remains authoritative for venue-route access.

## Suggested Sprint-03 Entry Checks
1. Confirm venue routes are covered by existing account-status/profile-completion guards.
2. Confirm one-active-session replacement and timeout reason codes are represented in service contracts.
3. Confirm deterministic scenario toggles exist for each required check-in outcome.
4. Confirm regression test cases include Sprint-02 gate compatibility.

## Status
- Open risks documented; mitigation ownership assigned for Sprint-03 planning and execution.
