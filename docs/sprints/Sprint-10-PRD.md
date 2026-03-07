# Sprint 10 PRD - Real Venues, Owner Submission, Approval, and Ownership Conversion

## Sprint Objective
Convert mocked venue-domain and owner/moderation governance flows into real Firebase-backed implementations, including venue submission, duplicate detection, moderation approval/rejection, ownership management, lifecycle transitions, and owner plan-state integration.

## Business Context
Night Vibe’s venue model is core to all downstream social logic. Before converting presence/discovery/matching in Sprint 11, venue records and governance workflows must be real, authoritative, and policy-compliant.

## User Stories
- As a venue owner, I can submit venues and track real moderation status.
- As a moderator, I can review and approve/reject venue submissions in real workflow.
- As an admin, I can govern venue lifecycle and ownership rules.
- As a user, I only see eligible active venues in discovery sources.
- As QA/security stakeholders, we can verify authorization and lifecycle correctness.

## UX Scope
- Venue Submission Screen (real submission)
- Venue Submission Review Status Screen (real state)
- Venue Owner Dashboard Screen (real venue data)
- Venue Owner Venue Management Screen (real ownership checks)
- Venue Edit Screen (real permissions and field constraints)
- Moderator Venue Review Queue Screen (real queue source)
- Moderator Venue Review Details Screen (real review actions)
- Admin Venue Governance Screen (real governance controls)
- Venue Plan and Subscription Screen (integration-ready real plan state)
- Error/Retry/Permission Denied states across venue flows

## Functional Requirements
1. Replace mock venues repository with real persistence and retrieval.
2. Implement real venue submission flow:
   - Persist new venue as `pending`.
   - Enforce required fields and validation.
3. Implement duplicate detection rules for submissions:
   - Proximity threshold + normalized name similarity strategy.
4. Implement real moderation venue review workflow:
   - Approve/reject transitions with moderation notes.
5. Implement ownership and edit permission controls:
   - Owner-only editable fields where policy allows.
   - Immutable fields (e.g., coordinates) enforcement after creation.
6. Implement venue lifecycle management:
   - `pending`, `active`, `rejected`, `suspended`, `expired` transitions.
7. Ensure only `active` venues are exposed to discoverable/eligible downstream flows.
8. Implement plan/subscription state integration boundary for owner capabilities.

## Non-Functional Requirements
- Authorization and lifecycle checks must be server-authoritative.
- Venue writes must be idempotent/retry-safe where applicable.
- Venue retrieval and update paths must support expected mobile latency budgets.
- Mixed-mode stability with not-yet-converted domains maintained.
- Structured logging/audit for moderation and governance actions.

## Edge Cases
- Duplicate venue submitted by another owner during moderation window.
- Owner attempts to edit immutable location fields.
- Moderator action conflicts with admin override.
- Venue status changes while owner is editing.
- Plan expires while venue is active.
- Submission payload valid syntactically but violates policy constraints.

## Mocked vs Real Behavior Expectations
- Real in Sprint 10:
  - Venue submission/retrieval/lifecycle persistence.
  - Venue moderation approval/rejection.
  - Ownership and edit authorization checks.
  - Venue discoverability eligibility by status.
- Still mocked in Sprint 10:
  - Presence/discovery engine conversion.
  - Matching/chat conversion.
  - Full payment transaction processing (integration boundary may remain controlled/stubbed).

## API/Data Contract Expectations (if relevant)
- Validate against canonical venue schema and status enums.
- Apply canonical error model with relevant codes:
  - `VALIDATION_ERROR`
  - `PERMISSION_DENIED`
  - `ACCESS_DENIED`
  - `CONFLICT`
  - `NOT_FOUND`
  - `INTERNAL_ERROR`
- Maintain compatibility with downstream venue discovery data contract expectations.

## Screen-Level Behavior
- Venue submission reflects real backend validation outcomes.
- Owner status screen shows real current lifecycle state.
- Moderator queue/details show real pending submissions and actions.
- Admin governance actions apply real lifecycle overrides.
- Edit forms enforce field-level permission and immutability rules.

## Role/Permission Impact
- `VenueOwner` gains real submission/edit flow authority within policy bounds.
- `Moderator` gains real venue review authority.
- `Administrator` can apply governance-level controls/overrides.
- Unauthorized role actions return permission-denied outcomes.

## Analytics/Events to Track (if relevant)
- `venue_submission_created`
- `venue_submission_duplicate_detected`
- `venue_review_approved`
- `venue_review_rejected`
- `venue_status_changed`
- `venue_edit_attempt_denied`
- `venue_owner_assignment_changed`
- `venue_plan_state_changed`

## QA Acceptance Criteria
- Real submission and review lifecycle works end-to-end.
- Duplicate detection triggers expected behavior.
- Ownership/edit permissions are enforced correctly.
- Only active venues are eligible for downstream usage.
- Mixed-mode operation remains stable for non-converted modules.

## Dependencies
- Sprint 07 conversion foundation.
- Sprint 08 real auth/account status enforcement.
- Sprint 09 real profile/roles/RBAC conversion.
- Firebase Firestore rules/indexes and storage readiness.

## Exclusions
- Presence/check-in real conversion (Sprint 11).
- Real discovery/matching conversion (Sprint 11).
- Real chat/safety/notifications conversion (Sprint 12).

## Definition of Done
- Mock venue and governance modules replaced by real implementations.
- Venue lifecycle, moderation, and ownership checks are server-authoritative.
- Eligibility rule for active venues enforced for downstream integrations.
- Sprint-10 TestPlan executed with no blocker defects.
