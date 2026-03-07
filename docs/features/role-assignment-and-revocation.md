# Role Assignment and Revocation

## Feature Name
Role Assignment and Revocation

## Status
Draft

## Description
Implements the 'Role Assignment and Revocation' capability according to Section 3 – Stakeholders and User Roles, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Role Assignment and Revocation'.
- Out of scope: unrelated domain workflows outside Section 3 – Stakeholders and User Roles.

## Functional Requirements
- Maintain centralized role/permission registry and server-side enforcement.
- Support role assignment/revocation with admin authorization checks.
- Support multi-role context switching where target context must exist in `roles[]`.


## Non-Functional Requirements
- Performance target: Role validation latency < 50 ms.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- `actor_id`, `target_user_id`, role operation payload.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- Updated `roles[]`, `permissions[]`, and audit log entries.


## Acceptance Criteria
- Unauthorized role operations return `PERMISSION_DENIED`.
- Role changes take effect immediately for subsequent requests.
- Multi-role users can switch only to assigned contexts.


## Edge Cases
- Network retries and duplicate requests.
- Concurrent updates to the same user/venue/session state.
- Mid-operation state changes (checkout, suspension, ban, or role change).

## Telemetry
- Required metrics/logs include: role_assignment, role_change_rate, permission_denied_events.

## Dependencies
- Modules: roles, permissions, audit.
- Data/services: users roles array, permission registry, admin governance.

## Open Decisions
- Final thresholds and defaults follow unresolved DEC items in the master specification.
- Any domain-specific trade-offs must be captured in ADRs before production rollout.

## Source Mapping
- Primary source: Section 3 – Stakeholders and User Roles
- FR references: FR-3.3, FR-3.4
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
