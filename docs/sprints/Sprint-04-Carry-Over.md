# Sprint-04 Known Limitations and Carry-Over Risks

## Date
- 2026-03-15

## Purpose
Capture Sprint-04 known limitations and explicit carry-over risks for Sprint-05 planning, QA, and handoff readiness.

## Inputs
- `docs/sprints/Sprint-04-PRD.md`
- `docs/sprints/Sprint-04-Todo.md`
- `docs/sprints/Sprint-04-TestPlan.md`
- `docs/product/Night Vibe - Phases and Sprints Delivery Plan.md`
- `docs/architecture/system-architecture.md`
- `docs/sprints/Sprint-03-Carry-Over.md`

## Known Limitations (Sprint-04 Scope)

| Limitation ID | Limitation | Impact | Mitigation in Sprint-04 | Carry-Over Target |
|---|---|---|---|---|
| S4-LIM-001 | Discovery/interactions/matches are mock-mode only (no backend persistence or Cloud Functions authority in Phase 1). | Behavior is deterministic for UX validation but does not represent production concurrency/security guarantees. | Contract-first adapters and API/error-envelope parity are preserved for future swap. | Sprint-11 (real presence/discovery/interactions/matching conversion) |
| S4-LIM-002 | Match lifecycle expiration is simulated from fixture/session state rather than authoritative backend presence events. | Expiration timing and edge-trigger ordering may differ from production event flow. | Deterministic transition scenarios (`matched`, `expired`, `blocked`) and replay hooks are implemented for QA consistency. | Sprint-11 / Sprint-12 integration hardening |
| S4-LIM-003 | Error scenarios (`NOT_CHECKED_IN`, `DUPLICATE_INTERACTION`, `ACCESS_DENIED`, `VALIDATION_ERROR`, `INTERNAL_ERROR`) are mocked outcomes. | UX states are validated, but backend transport/failure-path realism is partial. | Error model and envelope mapping remain aligned with `docs/architecture/api-specification.md`. | Sprint-07+ conversion hardening |
| S4-LIM-004 | Device-level manual validations (Android/iOS/portrait) are still tracked as readiness checks from prior sprint closeout discipline. | Cross-device UX confidence for discovery/match edge states is reduced until manual pass evidence is attached. | Automated lint/typecheck/tests provide baseline stability; manual checks remain explicit gate items in test reporting. | Sprint-04 closeout / Sprint-05 kickoff gate |

## Sprint-05 Carry-Over Risk Register

| Carry-Over ID | Risk | Why It Matters for Sprint-05 (Chat/Safety/Notifications) | Owner | Target Sprint | Tracking Reference |
|---|---|---|---|---|---|
| S4-CO-001 | Discovery eligibility drift between feed and profile preview contexts under rapid state changes (block/skip/session change). | Sprint-05 chat eligibility depends on consistent shared visibility/eligibility policy. | Engineering + QA | Sprint-05 | Sprint-04 PRD edge cases + Sprint-05 PRD dependency on Sprint-04 match states |
| S4-CO-002 | Mock reciprocal-like timing may mask race behavior expected in real event-driven pipelines. | Chat session creation and notification dedup in Sprint-05 depend on exactly-once match semantics. | Engineering | Sprint-05 (design guardrails), Sprint-11 (real implementation) | `docs/features/match-event-emission.md` and `docs/features/chat-session-creation.md` |
| S4-CO-003 | Match expiration and blocked-state propagation are simulated, not yet unified with cross-system safety enforcement buses. | Sprint-05 requires immediate block effects across discovery/chat and accurate chat disablement states. | Engineering + QA | Sprint-05 | `docs/features/chat-eligibility-enforcement.md`, `docs/features/block-enforcement-in-chat.md` |
| S4-CO-004 | Scenario matrix evidence package (happy/edge/negative) is not yet published as a Sprint-04 QA execution report artifact. | Sprint-05 kickoff risk if baseline behaviors are not traceably verified before layering chat/notifications. | QA | Sprint-04 closeout / Sprint-05 kickoff gate | Sprint-04 TestPlan `Exit Reporting` section |

## Recommended Sprint-05 Readiness Gates
- Complete and attach Sprint-04 QA execution report with pass/fail matrix and open issues.
- Re-run regression checks for Sprint-03 presence gating and Sprint-04 discovery/match invariants before Sprint-05 integration.
- Validate manual Android/iOS/portrait flows for Sprint-04 in-scope screens.
- Keep deny-by-default behavior for ambiguous eligibility states (`NOT_CHECKED_IN` / visibility conflicts).

## Notes
- This document does not change Sprint-04 implemented feature scope; it records residual risk and handoff controls.
- No new product requirements are introduced here; all references map to existing PRD/TestPlan/architecture contracts.
