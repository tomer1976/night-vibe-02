# Mobile Authentication

## Feature Name
Mobile Authentication

## Status
Draft

## Description
Implements the 'Mobile Authentication' capability according to Section 4 – Authentication, Identity, and Account Lifecycle, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Mobile Authentication'.
- Out of scope: unrelated domain workflows outside Section 4 – Authentication, Identity, and Account Lifecycle.

## Functional Requirements
- Support mobile sign-in using Google provider via Firebase Authentication.
- Validate provider token and return canonical Firebase UID.
- Create identity record for first-time login and mark `is_new_user` accordingly.


## Non-Functional Requirements
- Performance target: Authentication response time < 500 ms.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- `provider`, `provider_token`, `device_id`, `client_version`.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- `uid`, `access_token`, `refresh_token`, `is_new_user`.


## Acceptance Criteria
- Google sign-in succeeds with valid token.
- Invalid/expired token returns authentication failure.
- Successful login returns UID and active session tokens.


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
- FR references: FR-4.1
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
