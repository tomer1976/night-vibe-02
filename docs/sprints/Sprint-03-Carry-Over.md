# Sprint-03 Carry-Over Items

## Date
- 2026-03-13

## Purpose
Capture Sprint-03 carry-over work with explicit owner and Sprint-04 dependency mapping.

## Inputs
- `docs/sprints/Sprint-03-Todo.md`
- `docs/sprints/Sprint-03-TestPlan.md`
- `docs/sprints/Sprint-03-TestReport.md`
- `docs/sprints/Sprint-03-Demo-Script.md`
- `docs/sprints/Sprint-04-PRD.md`
- `docs/sprints/Sprint-04-Todo.md`

## Carry-Over Register

| Carry-Over ID | Item | Reason Not Closed in Sprint-03 | Owner | Target Sprint | Tracking Reference |
|---|---|---|---|---|---|
| S3-CO-001 | Android emulator manual UX validation for Sprint-03 venue discovery and presence lifecycle | Automated suite passed; manual Android device/simulator execution still pending | QA | Sprint-03 closeout / Sprint-04 kickoff gate | `MANUAL-03-AND-01` in `Sprint-03-TestReport.md` |
| S3-CO-002 | iOS simulator manual UX validation for Sprint-03 venue discovery and presence lifecycle | Automated suite passed; manual iOS simulator execution still pending | QA | Sprint-03 closeout / Sprint-04 kickoff gate | `MANUAL-03-IOS-01` in `Sprint-03-TestReport.md` |
| S3-CO-003 | Portrait layout sweep for Sprint-03 in-scope venue/presence screens | Device-specific visual validation pending | QA | Sprint-03 closeout / Sprint-04 kickoff gate | `MANUAL-03-LAYOUT-01` in `Sprint-03-TestReport.md` |
| S3-CO-004 | Stakeholder Sprint-03 demo walkthrough sign-off | Demo script published, but completion/sign-off execution remains pending | Product + QA + Engineering | Sprint-03 closeout / Sprint-04 kickoff gate | `Demo Exit Criteria` in `Sprint-03-Demo-Script.md` |
| S3-CO-005 | Formal Sprint-03 exit checklist completion and sign-off record | Exit checklist items remain open pending manual validation + stakeholder review evidence | Product + QA + Engineering | Sprint-03 closeout / Sprint-04 kickoff gate | `Sprint Exit Checklist` in `Sprint-03-Todo.md` |

## Sprint-04 Dependency Notes
- Sprint-04 discovery and match lifecycle work depends on Sprint-03 active-session and venue-presence behavior being treated as stable baseline.
- Any defects found during manual Sprint-03 validation that affect session gating, timeout transitions, or presence visibility should be triaged before Sprint-04 discovery logic sign-off.

## Notes
- No Severity-1/Severity-2 blocker defects are currently open from Sprint-03 automated validation.
- Carry-over items above are closeout and readiness gates that should be tracked to avoid dependency risk during Sprint-04 execution.
