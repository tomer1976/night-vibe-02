# Account Deletion and Recovery

## Feature Name
Account Deletion and Recovery

## Status
Draft

## Description
Implements the 'Account Deletion and Recovery' capability according to Section 4 – Authentication, Identity, and Account Lifecycle, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Account Deletion and Recovery'.
- Out of scope: unrelated domain workflows outside Section 4 – Authentication, Identity, and Account Lifecycle.

## Functional Requirements
- Support in-app deletion request with confirmation token.
- Mark account as `pending_deletion` and start 30-day recovery window.
- Execute final deletion after window if not canceled.


## Non-Functional Requirements
- Performance target: Authentication response time < 500 ms.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- `uid`, `confirmation_token`.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- Account status transition: `pending_deletion` -> `deleted`.


## Acceptance Criteria
- Deletion request updates account status immediately.
- Recovery window allows cancellation before final purge.
- Post-window purge removes profile/photos/chats/preferences per policy.


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
- FR references: FR-4.6
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
