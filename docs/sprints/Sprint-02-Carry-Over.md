# Sprint-02 Carry-Over Items

## Date
- 2026-03-11

## Purpose
Capture Sprint-02 carry-over work with explicit owner and target sprint assignment.

## Inputs
- `docs/sprints/Sprint-02-Todo.md`
- `docs/sprints/Sprint-02-TestReport.md`
- `docs/sprints/Sprint-02-Execution-Notes.md`
- `docs/sprints/Sprint-03-Todo.md`

## Carry-Over Register

| Carry-Over ID | Item | Reason Not Closed in Sprint-02 | Owner | Target Sprint | Tracking Reference |
|---|---|---|---|---|---|
| S2-CO-001 | Android emulator manual UX validation for Sprint-02 auth/onboarding/profile/settings flows | Automated suite passed; manual platform verification still pending | QA | Sprint-02 closeout / Sprint-03 kickoff gate | `MANUAL-02-AND-01` in `Sprint-02-TestReport.md` |
| S2-CO-002 | iOS simulator manual UX validation for Sprint-02 auth/onboarding/profile/settings flows | Automated suite passed; manual platform verification still pending | QA | Sprint-02 closeout / Sprint-03 kickoff gate | `MANUAL-02-IOS-01` in `Sprint-02-TestReport.md` |
| S2-CO-003 | Portrait layout sweep for all Sprint-02 in-scope screens | Device-specific manual check pending | QA | Sprint-02 closeout / Sprint-03 kickoff gate | `MANUAL-02-LAYOUT-01` in `Sprint-02-TestReport.md` |
| S2-CO-004 | Sprint-03 route-guard regression enforcement (profile/account-status gate on venue routes) | Risk identified during Sprint-02 closeout, implemented in next sprint scope | Engineering + QA | Sprint-03 | `S2-RISK-03-02` in `Sprint-02-Execution-Notes.md` |
| S2-CO-005 | Sprint-03 deterministic session replacement and timeout state machine alignment | Cross-screen state divergence risk deferred to Sprint-03 implementation | Engineering | Sprint-03 | `S2-RISK-03-01` in `Sprint-02-Execution-Notes.md` |
| S2-CO-006 | Sprint-03 scenario-source unification for proximity outcomes | Consistency risk across venue list/details/check-in flows deferred to Sprint-03 | Engineering | Sprint-03 | `S2-RISK-03-03` in `Sprint-02-Execution-Notes.md` |
| S2-CO-007 | Sprint-03 scenario matrix + seed-reset instructions for deterministic QA runs | Needed for repeatable Sprint-03 demos/tests | QA + Engineering | Sprint-03 | `S2-RISK-03-04` in `Sprint-02-Execution-Notes.md` |
| S2-CO-008 | Sprint-03 contract-first definitions for `VenueDiscoveryService` and `PresenceService` before feature wiring | Needed to avoid mock/real contract drift | Engineering | Sprint-03 | `S2-RISK-03-05` + Sprint-03 Backend tasks |

## Notes
- No Severity-1/Severity-2 blocker defects are currently open for Sprint-02 scope from automated validation.
- Carry-over items above are prerequisites/quality gates for formal Sprint-02 closeout and clean Sprint-03 execution.
