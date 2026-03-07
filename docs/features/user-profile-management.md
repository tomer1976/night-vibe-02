# User Profile Management

## Feature Name
User Profile Management

## Status
Draft

## Description
Implements the 'User Profile Management' capability according to Section 5 – User Profile Model and Onboarding Flow, preserving Night Vibe core invariants (venue-gated interaction, server-side authority, and deterministic conflict handling).

## Scope
- In scope: domain behavior, validation rules, state transitions, and API/event handling required for 'User Profile Management'.
- Out of scope: unrelated domain workflows outside Section 5 – User Profile Model and Onboarding Flow.

## Functional Requirements
- Create and update profile fields according to schema constraints.
- Allow edits only on permitted fields; keep restricted fields immutable.
- Validate age/preferences and photo count constraints server-side.


## Non-Functional Requirements
- Performance target: Profile load < 200 ms; photo upload response < 3 s.
- Deterministic processing using server timestamp precedence where conflicts occur.
- Secure server-side validation; client input treated as untrusted.

## Inputs
- Profile fields: name, DOB, gender, bio, photos, preferences.


## Processing Logic
- Validate authentication, authorization, and feature preconditions.
- Execute domain rules in transactional/idempotent backend flow.
- Update canonical collections and derived views/events as required.

## Outputs
- `users/{uid}/profile/main` updated with validated fields.


## Acceptance Criteria
- Invalid profile updates return validation errors.
- Valid updates persist immediately.
- Date of birth remains immutable after onboarding.


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
- FR references: FR-5.1, FR-5.6
- Secondary source: docs/architecture/system-architecture.md
- Data source: docs/architecture/database-schema.md
- Security source: firestore.rules
