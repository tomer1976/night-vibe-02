# Sprint-10 Todo - Real Venues, Owner Submission, Approval, and Ownership Conversion

## Frontend Tasks
- [ ] Replace mock venue data adapter usage with real adapter in owner/moderator/admin screens.
- [ ] Integrate venue submission form with real validation and submit responses.
- [ ] Integrate owner status/management screens with real lifecycle states.
- [ ] Integrate moderator venue queue/detail screens with real backend data.
- [ ] Integrate admin governance venue controls with real action handlers.

## Backend Tasks (if applicable)
- [ ] Implement venue submission handlers with validation and status initialization.
- [ ] Implement duplicate venue detection logic in submission workflow.
- [ ] Implement moderation approve/reject handlers.
- [ ] Implement ownership assignment/edit permission enforcement.
- [ ] Implement venue lifecycle state transition handlers.
- [ ] Add audit logging for moderation/admin venue actions.

## Firebase Tasks (if applicable)
- [ ] Define/validate Firestore paths and indexes for venue queries and queues.
- [ ] Update Firestore rules for owner/moderator/admin venue permissions.
- [ ] Validate immutable field protections and status-based constraints.
- [ ] Ensure staging deployment checklist is applied for rules/index changes.

## Mock-Data Tasks
- [ ] Keep mixed-mode fixtures for non-converted modules.
- [ ] Add fallback fixture scenarios for temporary backend unavailability.

## Navigation Tasks
- [ ] Validate role-based route guards for owner/moderator/admin venue surfaces.
- [ ] Ensure proper routing on status/permission failures.

## UI Tasks
- [ ] Add lifecycle status badges and moderation-note displays.
- [ ] Add explicit denied-state messaging for unauthorized edits.
- [ ] Refine queue and detail UI for mobile readability.

## State-Management Tasks
- [ ] Replace venue store actions with real async handlers.
- [ ] Implement optimistic/pessimistic update strategy for moderation actions.
- [ ] Ensure state invalidation/refresh after status transitions.

## Testing Tasks
- [ ] Add integration tests for venue submission success/failure paths.
- [ ] Add duplicate detection behavior tests.
- [ ] Add moderation approval/rejection workflow tests.
- [ ] Add owner edit permission and immutable-field tests.
- [ ] Add active-venue eligibility tests for downstream consumers.
- [ ] Add mixed-mode regression tests for non-converted modules.

## Bugfix/Stabilization Tasks
- [ ] Fix race conditions between review queue updates and detail views.
- [ ] Resolve stale lifecycle status in owner dashboards.
- [ ] Resolve permission error mapping inconsistencies.

## Documentation Tasks
- [ ] Document real venue lifecycle and transition rules.
- [ ] Document moderation queue/review action behavior.
- [ ] Document ownership authorization and immutable field policy.
- [ ] Update conversion tracker and Sprint 11 prerequisites.

## Release/Readiness Tasks (if applicable)
- [ ] Prepare Sprint 10 demo for owner/moderator/admin venue lifecycle scenarios.
- [ ] Publish QA/security validation summary.
- [ ] Confirm readiness for Sprint 11 presence/discovery conversion.

## Sprint Exit Checklist
- [ ] Sprint-10 PRD scope delivered or formally deferred.
- [ ] Sprint-10 TestPlan executed with evidence.
- [ ] No blocker defects in venue/ownership/moderation scope.
- [ ] Real venue conversion sign-off completed.
