# Sprint 04 PRD - Mock Discovery, Interactions, and Match Lifecycle

## Sprint Objective
Implement a deterministic, fully mocked discovery-to-match experience that enforces same-venue visibility, preference compatibility, block/skip filtering, like/pass interaction handling, and reciprocal-like match creation/expiration behavior.

## Business Context
Night Vibe’s core user value begins when users discover and interact with people physically present in the same venue. Sprint 04 validates the product’s most critical engagement loop (discover -> like/pass -> match) in a backend-free mode while preserving architecture and policy constraints required for Phase 2 real implementation.

## User Stories
- As a checked-in user, I can see a discovery feed of relevant nearby people from my current venue only.
- As a user, I can open a profile preview and decide to like or pass.
- As a user, I receive a match when there is a reciprocal like.
- As a user, I do not see blocked/skipped/ineligible users in discovery.
- As a QA/product reviewer, I can replay deterministic scenarios for mutual like, no match, and match expiration.

## UX Scope
- User Discovery Feed Screen
- Discovery Profile Preview Screen
- Match Confirmation Screen
- Empty State Screen (no candidates / exhausted feed)
- Error and Retry Screen (mock failure scenarios)
- Basic handoff into Matches List placeholder state (full list behavior detailed in Sprint 05)

## Functional Requirements
1. Implement mocked discovery feed generation:
   - Source candidates only from active users in same mock venue session.
   - Apply preference and mutual visibility filtering.
   - Apply block and skip filtering.
   - Provide deterministic ordering and pagination behavior.
2. Implement profile preview behavior:
   - Show discovery-safe profile fields only (no sensitive/internal fields).
   - Support swipe/button-like actions for like/pass.
3. Implement interaction handling:
   - Persist mock like/pass records with idempotency semantics.
   - Prevent duplicate interactions for same actor-target in active session context.
4. Implement match creation logic:
   - Create match only on reciprocal likes.
   - Enforce same-venue co-location requirement at match creation time.
   - Emit mock match event and show Match Confirmation UX.
5. Implement match lifecycle simulation:
   - Transition match to expired when co-location/session validity ends.
   - Ensure expired/blocked match state can be surfaced to downstream modules.
6. Implement scenario tooling:
   - Deterministic scenario packs for no candidates, one-sided like, reciprocal like, already-interacted, blocked candidate, and expired match.

## Non-Functional Requirements
- Deterministic outcomes for identical fixture + action sequence.
- UI responsiveness maintained with realistic mock candidate volumes.
- Strict type-safe contracts for discovery/interactions/matches.
- No real backend or Firebase access from this sprint.
- Traceable event/log hooks for QA replay.

## Edge Cases
- User has no active venue session and requests discovery.
- Candidate leaves venue between feed load and interaction attempt.
- Duplicate like requests due to rapid taps.
- Block applied after candidate appeared in current feed.
- Preference updates reduce candidate pool to zero mid-session.
- Pagination cursor reaches end-of-feed boundary.

## Mocked vs Real Behavior Expectations
- Mocked in Sprint 04:
  - Candidate retrieval and filtering.
  - Like/pass persistence and duplicate detection.
  - Reciprocal-like matching and match events.
  - Match expiration triggers.
- Real in Phase 2 conversion:
  - Server-authoritative discovery generation from active sessions.
  - Firestore-backed interactions and idempotency keys.
  - Deterministic pair-hash match IDs and transactional writes.
  - Match expiration from presence/session events.
- Contract requirement:
  - UI/state layers must consume `DiscoveryService`, `InteractionService`, `MatchService` interfaces only.

## API/Data Contract Expectations (if relevant)
- Mock contracts should mirror expected API envelopes and error model.
- Simulated error codes for this sprint:
  - `NOT_CHECKED_IN`
  - `DUPLICATE_INTERACTION`
  - `ACCESS_DENIED`
  - `VALIDATION_ERROR`
  - `INTERNAL_ERROR`
- Support pagination envelope with deterministic `next_cursor` simulation.

## Screen-Level Behavior
- Discovery Feed shows only same-venue candidates passing filters.
- Profile Preview supports like/pass and updates feed progression state.
- Match Confirmation appears only on valid reciprocal match.
- Empty states display when no candidates are available.
- Error/retry states handle mock service failures gracefully.

## Role/Permission Impact
- Primary role: `RegularUser`.
- Account status restrictions from Sprint 02 remain enforced.
- Safety constraints (block effects) simulated for user-level interactions.
- Privileged moderation/admin interactions are out of scope in this sprint.

## Analytics/Events to Track (if relevant)
- `discovery_feed_requested_mock`
- `discovery_candidate_viewed_mock`
- `interaction_like_submitted_mock`
- `interaction_pass_submitted_mock`
- `interaction_duplicate_rejected_mock`
- `match_created_mock`
- `match_expired_mock`
- `discovery_empty_state_rendered_mock`

## QA Acceptance Criteria
- Discovery feed contains only same-venue eligible candidates.
- Preference/block/skip filtering behaves correctly under deterministic scenarios.
- Duplicate interactions are blocked and surfaced appropriately.
- Reciprocal like creates exactly one match event in mock store.
- Match expiration updates dependent UI states correctly.
- No backend dependency introduced.

## Dependencies
- Sprint 01 architecture/design system.
- Sprint 02 account/profile gating and status handling.
- Sprint 03 active venue session and presence simulation.
- Product rules for same-venue discovery and mutual matching.

## Exclusions
- Real-time chat implementation (Sprint 05 scope).
- Real backend interaction/match persistence.
- Real moderation queue workflows.
- Real analytics API integration.

## Definition of Done
- Discovery, interaction, and match mock flows are fully implemented and demoable.
- Deterministic scenario suite covers happy/edge/negative paths.
- Duplicate prevention and match lifecycle transitions verified via tests.
- Sprint-04 TestPlan executed with no blocker defects in scope.
