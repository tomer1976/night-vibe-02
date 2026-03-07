# Multi-Role Account Support

## Feature Name
Multi-Role Account Support

## Status
Draft

## Description
Implements the 'Multi-Role Account Support' capability according to Section 4 – Authentication, Identity, and Account Lifecycle, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Multi-Role Account Support'.
- Out of scope: unrelated domain workflows outside Section 4 – Authentication, Identity, and Account Lifecycle.

## Functional Requirements
- Maintain centralized role/permission registry and server-side enforcement.
- Support role assignment/revocation with admin authorization checks.
- Support multi-role context switching where target context must exist in `roles[]`.


## Non-Functional Requirements
- Performance target: Authentication response time < 500 ms.
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
- Required metrics/logs include: login_attempt, login_success_rate, failed_logins, account_deletion_requested.

## Dependencies
- Modules: auth, identity, session, account.
- Data/services: Firebase Authentication, users collection, RBAC checks.

## Open Decisions
- Final thresholds and defaults follow unresolved DEC items in the master specification.
- Any domain-specific trade-offs must be captured in ADRs before production rollout.

## Source Mapping
- Primary source: Section 4 – Authentication, Identity, and Account Lifecycle
- FR references: FR-3.5
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
