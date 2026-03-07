# Suspended and Banned Account Enforcement

## Feature Name
Suspended and Banned Account Enforcement

## Status
Draft

## Description
Implements the 'Suspended and Banned Account Enforcement' capability according to Section 4 – Authentication, Identity, and Account Lifecycle, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Suspended and Banned Account Enforcement'.
- Out of scope: unrelated domain workflows outside Section 4 – Authentication, Identity, and Account Lifecycle.

## Functional Requirements
- Block login and protected operations for `suspended`/`banned` users.
- Re-check account status on each privileged request.
- Invalidate active sessions when status changes to denied states.


## Non-Functional Requirements
- Performance target: Authentication response time < 500 ms.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- `uid`, `account_status`, login request context.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- `ACCESS_DENIED` with reason `suspended` or `banned`.


## Acceptance Criteria
- Suspended users cannot access platform operations.
- Banned users are permanently denied.
- Status change during active session takes effect immediately.


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
- FR references: FR-4.7
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
