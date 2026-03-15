# Sprint-04 Interaction Idempotency Behavior (Phase-2 Conversion Notes)

## Purpose
Document the implemented Sprint-04 interaction idempotency behavior for `like`/`pass` and define conversion-safe requirements for backend implementation in Phase-2.

## Source Alignment
- Sprint scope: `docs/sprints/Sprint-04-PRD.md`
- Sprint checklist: `docs/sprints/Sprint-04-Todo.md`
- API contract: `docs/architecture/api-specification.md`
- Data schema: `docs/architecture/database-schema.md`
- Mobile contracts: `mobile/src/contracts/services.ts`
- Mock implementation: `mobile/src/services/mockBackendServiceLocator.ts`
- Test coverage: `mobile/__tests__/interactionDedupContract.test.ts`

## Contract Surface (Current)

Interaction request contract:
- `targetUserId`
- `venueId`
- `idempotencyKey?`

Interaction result contract:
- `interaction: LIKE | PASS`
- `interactionId`
- `decision: created | idempotent_replay`
- `duplicateScope: actor_target_venue_session`
- `matchCreated`
- `matchId?`

Published idempotency metadata (`getIdempotencyContract`):
- `duplicateScope = actor_target_venue_session`
- `duplicateErrorCode = DUPLICATE_INTERACTION`
- `idempotentReplayBehavior = return_original_success`
- `idempotencyKey.required = false`
- `idempotencyKey.maxLength = 128`

## Current Mock Decision Logic

### Preconditions
Before duplicate checks, interaction submission enforces:
1. actor has active session; else `NOT_CHECKED_IN`
2. request `venueId` matches active session venue; else `ACCESS_DENIED`

### Duplicate scope key
Uniqueness scope in mock runtime is:
- `actorUserId`
- `targetUserId`
- `venueId`
- `actorSessionId`

### Outcomes
For an existing scoped interaction:
- same `idempotencyKey` => success replay (`decision = idempotent_replay`, same `interactionId`)
- different or absent key => failure (`DUPLICATE_INTERACTION`)

For a new scoped interaction:
- create success (`decision = created`)

## Behavior Matrix

| Existing scoped record | Incoming idempotency key | Result | Envelope status |
|---|---|---|---|
| No | missing or present | create new interaction (`created`) | `SUCCESS` |
| Yes | same as existing | replay original interaction (`idempotent_replay`) | `SUCCESS` |
| Yes | different | duplicate rejection | `FAIL` + `DUPLICATE_INTERACTION` |
| Yes | missing | duplicate rejection | `FAIL` + `DUPLICATE_INTERACTION` |

## API and Error Model Alignment
- Error handling is aligned with canonical code `DUPLICATE_INTERACTION` from API specification.
- Optional idempotency key aligns with current API header guidance (`Idempotency-Key` optional).
- Client behavior can safely treat replay as no-op success while preserving deterministic UX feedback.

## Test Evidence
`mobile/__tests__/interactionDedupContract.test.ts` validates:
- contract metadata exposure
- first-write success
- same-key replay returns same interaction identity
- new-key duplicate rejection with `DUPLICATE_INTERACTION`
- parity for both `LIKE` and `PASS`
- `NOT_CHECKED_IN` denial when session prerequisite fails

## Phase-2 Backend Conversion Requirements

### Required parity guarantees
1. Preserve duplicate scope semantics: actor-target-venue-session.
2. Preserve replay semantics: same key returns original successful interaction.
3. Preserve duplicate error code for conflicting keys: `DUPLICATE_INTERACTION`.
4. Preserve deterministic interaction identity for replays.
5. Preserve precondition order: session validity and venue-match checks before write.

### Persistence model expectations
- Persist `idempotency_key` on `interactions` records.
- Enforce uniqueness using transactional checks or equivalent strongly consistent mechanism.
- Reject cross-session duplicate assumptions; scope must include actor session context.

### API mapping notes
- Mobile request mapper currently sends body fields `target_user_id` and `venue_id`.
- For Phase-2, send `Idempotency-Key` header (preferred) while keeping body contract stable.
- Response mapping should continue to populate `decision` and `duplicateScope` in mobile `InteractionResult`.

## Risks and Mitigations
- Risk: race writes may create duplicate records under concurrent requests.
  - Mitigation: server transaction + unique constraint strategy on scope + idempotency key.
- Risk: mismatched duplicate scope between mobile assumptions and backend implementation.
  - Mitigation: contract test coverage for replay and conflict behavior at adapter boundary.
- Risk: idempotency replay returns new interaction IDs.
  - Mitigation: enforce original write identity reuse and verify via integration tests.

## Out of Scope
- Match creation and lifecycle state transitions (covered in separate Sprint-04 docs/tasks).
- Chat eligibility and downstream messaging constraints (Sprint-05 scope).