# Sprint-04 Mock Discovery Pipeline and Filtering Order

## Purpose
Document the implemented Sprint-04 mock discovery pipeline, including filtering order, pagination behavior, and contract alignment for Phase-2 conversion.

## Source Alignment
- Sprint scope: `docs/sprints/Sprint-04-PRD.md`
- Sprint checklist: `docs/sprints/Sprint-04-Todo.md`
- Architecture: `docs/architecture/system-architecture.md`
- API contract: `docs/architecture/api-specification.md`
- Service contracts: `mobile/src/contracts/services.ts`
- Mock implementation: `mobile/src/services/mockBackendServiceLocator.ts`
- Store selectors: `mobile/src/state/discoveryFeedStore.ts`

## Runtime Pipeline (Current Mock Implementation)

### 1) Entry precondition: active venue session
Discovery feed requests are served through `discovery.getFeed` in the mock service locator.

- If no active session exists for the actor, response is `NOT_CHECKED_IN`.
- If session exists, discovery proceeds in the actor's active venue context.

## 2) Candidate source selection
`buildDiscoveryCandidates(activeUserId)` resolves input participants from fixture partitions.

Selection logic:
- load actor active session
- resolve partition from `sprint04VenueSessionCandidateFixtures` by `venueId` and `sessionStatus`
- fallback to `sprint03VenuePresenceParticipants` if no partition is found

## 3) Server-side-style baseline filtering (mock service layer)
Applied in this order:
1. `participant.venueId === activeSession.venueId`
2. `participant.visibility === "visible"`
3. `participant.userId !== activeUserId`
4. participant is not already represented in matched counterparts for this venue

Result is projected to `DiscoveryCandidate` using preview-safe fields:
- `userId`
- `displayName`
- `age`
- `gender`
- `profilePhotoUrl`
- `venueId`

## 4) Deterministic pagination envelope
`discovery.getFeed` slices candidates deterministically using cursor-as-offset:

- `pageSize`: request value if `> 0`, else full candidate length
- `startOffset`: `parseInt(cursor)` with fallback to `0`
- page slice: `candidates.slice(startOffset, startOffset + pageSize)`
- `nextCursor`: next offset string when more items remain; otherwise `undefined`

The response envelope returns:
- `candidates[]`
- `nextCursor`

## 5) Client-side visibility refinement (store selectors)
`discoveryFeedStore` applies view filters and exposes reason codes.

Selector order in `selectDiscoveryCandidateVisibilityReason`:
1. `venue_mismatch`
2. `gender_filtered`
3. `below_min_age`
4. `above_max_age`
5. `excluded_user` (block/skip-style exclusions)
6. `visible`

`selectVisibleDiscoveryCandidates` returns only `visible` candidates.

## 6) Deterministic feed state transitions
The reducer enforces deterministic state progression:

- `APPEND_PAGE` deduplicates by `userId` in first-seen order
- `requestedCursors` tracks unique requested cursors
- `isExhausted` is `true` when `nextCursor` is `undefined`
- repeated end-of-feed requests keep stable exhausted state

## Filtering Ownership Model (Sprint-04)

### Mock service layer owns
- same-venue participant partitioning
- participant visibility flag enforcement
- active-session prerequisite
- exclusion of already-matched counterparts in venue
- deterministic cursor slicing

### Client store layer owns
- UI-level preference/age/gender/excluded-user refinement
- per-candidate visibility reason explanations
- feed cache merge/dedup and cursor history

## Error Model and Contract Notes
- Discovery precondition denial uses `NOT_CHECKED_IN`.
- Interaction-side duplicate semantics remain independent and use `DUPLICATE_INTERACTION`.
- Discovery responses conform to mobile contract envelope (`status`, `data|error`, `request_id`) through the response factory.

## Test Evidence
Relevant automated coverage:
- `mobile/__tests__/discoveryFilterCorrectness.test.ts`
- `mobile/__tests__/discoveryFeedStore.test.ts`
- `mobile/__tests__/discoveryEligibilitySelectors.test.ts`

These tests verify fixture-driven preference filtering, block/skip exclusion behavior, visibility reason codes, cursor progression, and exhausted-feed stability.

## Phase-2 Conversion Notes
For backend conversion parity, preserve this effective filter order contract:

1. active-session gate
2. same-venue candidate scope
3. baseline visibility + self exclusion + matched exclusion
4. deterministic pagination slice
5. preference and block/skip compatibility filtering
6. preview-safe projection only

Service-level filtering should become server-authoritative in Phase-2; client selectors should remain presentational and should not bypass backend eligibility decisions.