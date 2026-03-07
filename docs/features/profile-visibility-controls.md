# Profile Visibility Controls

## Feature Name
Profile Visibility Controls

## Status
Draft

## Description
Implements the 'Profile Visibility Controls' capability according to Section 5 – User Profile Model and Onboarding Flow, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'Profile Visibility Controls'.
- Out of scope: unrelated domain workflows outside Section 5 – User Profile Model and Onboarding Flow.

## Functional Requirements
- Restrict profile exposure to users in same active venue session.
- Exclude blocked/banned users from visibility results.
- Return preview-safe fields only (no sensitive internals).


## Non-Functional Requirements
- Performance target: Profile load < 200 ms; photo upload response < 3 s.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- Viewer session state, target session state, block relations.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- Visibility decision and profile preview payload.


## Acceptance Criteria
- Users outside venue co-location cannot view profile previews.
- Blocked users are excluded from visibility responses.


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
- FR references: FR-5.7, FR-5.8
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
