# Sprint 11 PRD - Real Presence, Nearby Discovery, Interactions, and Matching Conversion

## Sprint Objective
Convert core venue-gated social engine modules from mock to real implementations: nearby venue discovery eligibility, check-in/check-out/session enforcement, discovery candidate generation, like/pass interaction persistence, reciprocal match creation, and match expiration.

## Business Context
Night Vibe’s core product invariants are operational only when presence, discovery, and matching are server-authoritative. Sprint 11 is the critical conversion wave that turns the app from a role/data shell into a real venue-based social system.

## User Stories
- As a user, I can check in only when physically close enough to an eligible active venue.
- As a user, I can have only one active venue session at a time.
- As a checked-in user, I can discover candidates only from the same venue.
- As a user, my like/pass actions are persisted safely and duplicates are prevented.
- As a user, a match is created only on reciprocal likes while co-located.
- As a stakeholder, I can trust deterministic and auditable state transitions for sessions/interactions/matches.

## UX Scope
- Nearby Venues Screen (real source + eligibility status)
- Venue Details Screen (real check-in eligibility)
- Venue Check-In Confirmation Screen (real outcomes)
- Active Venue Session Screen (real session state)
- Venue Checkout Confirmation Screen (real closure)
- Venue Presence Screen (real active session-derived visibility)
- User Discovery Feed Screen (real candidate source)
- Discovery Profile Preview Screen (real filtered projection)
- Match Confirmation Screen (real event-triggered)
- Error/Retry/Empty-state handling for all converted flows

## Functional Requirements
1. Convert nearby venue retrieval to real backend data:
   - Only internal first-party venues.
   - Eligible active-venue filtering.
2. Convert check-in flow to real server-authoritative processing:
   - Proximity validation (radius policy).
   - Out-of-range handling.
   - Session creation with server timestamp authority.
3. Enforce single active session per user:
   - Auto-close prior session on new check-in.
   - Transaction-safe conflict handling.
4. Convert checkout and timeout behavior:
   - Manual checkout state transition.
   - Expiration handling by session policy.
5. Convert discovery feed generation:
   - Candidate source limited to same active venue.
   - Apply preference and visibility filters.
   - Apply block/skip filtering and deterministic pagination.
6. Convert interaction handling:
   - Persist like/pass with idempotency key support.
   - Duplicate interaction prevention.
7. Convert match creation/lifecycle:
   - Reciprocal-like detection.
   - Deterministic pair identity.
   - Match expiration when co-location/session validity ends.
8. Emit domain events required for downstream chat conversion (Sprint 12).

## Non-Functional Requirements
- Server-authoritative validation for all privileged state changes.
- Deterministic conflict resolution using server timestamps.
- Idempotency for retriable writes (check-in, interactions).
- Performance targets aligned with architecture baselines where feasible.
- Observability for session/discovery/interaction/match metrics and errors.

## Edge Cases
- Concurrent check-in attempts from multiple devices for same user.
- User leaves venue between discovery fetch and interaction attempt.
- Duplicate like/pass submissions from retries.
- Candidate blocked after appearing in current feed page.
- Session timeout and manual checkout race condition.
- Match creation request collides with expiring session.

## Mocked vs Real Behavior Expectations
- Real in Sprint 11:
  - Presence and session lifecycle.
  - Discovery candidate generation and filtering source.
  - Interaction persistence with duplicate prevention.
  - Match creation and expiration mechanics.
- Still mocked in Sprint 11:
  - Full real chat/message delivery and safety enforcement conversion (Sprint 12).
  - Full production analytics and hardening scope (Sprint 13).

## API/Data Contract Expectations (if relevant)
- Align with canonical error and status conventions for converted flows.
- Relevant codes include:
  - `NOT_CHECKED_IN`
  - `OUT_OF_RANGE`
  - `DUPLICATE_INTERACTION`
  - `ACCESS_DENIED`
  - `VALIDATION_ERROR`
  - `CONFLICT`
  - `INTERNAL_ERROR`
- Maintain compatibility with profile preview contract (non-sensitive fields only).
- Preserve deterministic IDs and server-timestamp precedence rules.

## Screen-Level Behavior
- Check-in outcomes reflect real server validation and venue eligibility.
- Active Session screen shows real session state and closure reasons.
- Discovery feed shows only same-venue eligible candidates.
- Interaction actions reflect real duplicate/eligibility outcomes.
- Match confirmation appears only on real reciprocal match event.

## Role/Permission Impact
- Primary end-user flow is `RegularUser`.
- Account status restrictions from Sprint 08 remain mandatory on all converted actions.
- Role-based administrative controls remain from prior conversion sprints where applicable.

## Analytics/Events to Track (if relevant)
- `checkin_attempt`
- `checkin_success`
- `checkin_out_of_range`
- `session_replaced`
- `session_closed`
- `discovery_feed_requested`
- `interaction_like_recorded`
- `interaction_pass_recorded`
- `duplicate_interaction_rejected`
- `match_created`
- `match_expired`

## QA Acceptance Criteria
- Check-in/check-out/session flows execute with real data and policy enforcement.
- One-active-session invariant holds under concurrent scenarios.
- Discovery feed enforces same-venue and filter constraints.
- Duplicate interaction prevention and reciprocal match creation are reliable.
- Match expiration updates downstream eligibility signals correctly.
- Mixed-mode compatibility remains stable for non-converted modules.

## Dependencies
- Sprint 07 adapter/configuration foundation.
- Sprint 08 real auth/account enforcement.
- Sprint 09 real profile and RBAC foundation.
- Sprint 10 real active venue governance/lifecycle.

## Exclusions
- Real chat transport and chat eligibility send-path enforcement (Sprint 12).
- Full safety/moderation queue conversion (Sprint 12).
- Full analytics hardening and security optimization (Sprint 13).

## Definition of Done
- Presence/discovery/interactions/matching modules are real-backed and production-structured.
- Core invariants (same-venue discovery, one active session, reciprocal co-located match) are enforced server-side.
- Event outputs for downstream chat/safety modules are available.
- Sprint-11 TestPlan executed with no blocker defects.
