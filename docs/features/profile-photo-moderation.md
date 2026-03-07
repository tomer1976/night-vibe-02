# Profile Photo Moderation

## Feature Name
Profile Photo Moderation

## Status
Draft

## Description
Implements the 'Profile Photo Moderation' capability according to Section 5 – User Profile Model and Onboarding Flow, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Profile Photo Moderation'.
- Out of scope: unrelated domain workflows outside Section 5 – User Profile Model and Onboarding Flow.

## Functional Requirements
- Route uploaded photos to moderation state machine.
- Allow visibility only for photos with `approved` status.
- Persist reviewer actions and timestamps for auditability.


## Non-Functional Requirements
- Performance target: Profile load < 200 ms; photo upload response < 3 s.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- `photo_id`, `uid`, moderation decision.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- Photo moderation status update (`pending|approved|rejected`).


## Acceptance Criteria
- Pending/rejected photos are hidden from discovery/profile preview.
- Approved photos become visible without client-side bypass.


## Edge Cases
- Network retries and duplicate requests.
- Concurrent updates to the same user/venue/session state.
- Mid-operation state changes (checkout, suspension, ban, or role change).

## Telemetry
- Required metrics/logs include: profile_created, onboarding_completed, photo_uploads, profile_updates.

## Dependencies
- Modules: profile, onboarding, photos, moderation.
- Data/services: users/{uid}/profile, Firebase Storage, moderation queue.

## Open Decisions
- Final thresholds and defaults follow unresolved DEC items in the master specification.
- Any domain-specific trade-offs must be captured in ADRs before production rollout.

## Source Mapping
- Primary source: Section 5 – User Profile Model and Onboarding Flow
- FR references: FR-5.5
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
