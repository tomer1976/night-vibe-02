# Sprint-04 Match Lifecycle State Machine and Transition Triggers

## Purpose
Document the implemented Sprint-04 mock match lifecycle state machine, event processing rules, and transition triggers to preserve deterministic behavior for Phase-2 conversion.

## Source Alignment
- Sprint scope: `docs/sprints/Sprint-04-PRD.md`
- Sprint checklist: `docs/sprints/Sprint-04-Todo.md`
- Architecture: `docs/architecture/system-architecture.md`
- Data schema: `docs/architecture/database-schema.md`
- Match state model: `mobile/src/state/matchStore.ts`
- UI lifecycle usage: `mobile/src/screens/VenueDetailsScreen.tsx`
- Test coverage: `mobile/__tests__/matchStore.test.ts`, `mobile/__tests__/venueDetailsScreen.test.tsx`

## Lifecycle Model (Implemented)

### Event types
- `MATCH_CREATED`
- `MATCH_EXPIRED`
- `MATCH_BLOCKED`
- `MATCH_UNMATCHED`

### Match statuses represented in store
- `matched`
- `expired`
- `blocked`

`MATCH_UNMATCHED` removes the record from `matchesById` instead of assigning a new status value.

## State Shape
`MatchStoreState` tracks:
- `matchesById`: current effective match snapshot
- `eventReplayLog`: ordered lifecycle event log for replay/debug
- `lastSyncedAt`: last accepted event/snapshot timestamp

## Transition Triggers

### Trigger: reciprocal-like match creation
- Event: `MATCH_CREATED`
- Preconditions:
  - event payload contains `users`
  - event payload contains `counterpart`
- Effect:
  - create/replace match record with `status = matched`
  - update `eventReplayLog`
  - set `lastSyncedAt = occurredAt`

### Trigger: co-location/session validity ends
- Event: `MATCH_EXPIRED`
- Typical upstream source in Sprint-04 simulation:
  - active venue session closure/timeout from presence transitions
- Effect:
  - if match exists, mutate status to `expired`
  - update `eventReplayLog`
  - set `lastSyncedAt = occurredAt`

### Trigger: safety enforcement (block)
- Event: `MATCH_BLOCKED`
- Effect:
  - if match exists, mutate status to `blocked`
  - update `eventReplayLog`
  - set `lastSyncedAt = occurredAt`

### Trigger: explicit unmatch user action
- Event: `MATCH_UNMATCHED`
- Effect:
  - delete match record from `matchesById`
  - update `eventReplayLog`
  - set `lastSyncedAt = occurredAt`

## Staleness and Determinism Guards

### Stale event rejection
`APPLY_MATCH_EVENT` ignores events older than `lastSyncedAt`.

Result:
- stale lifecycle events do not roll match state backward
- replay order remains deterministic by event timestamp

### Replay log merge behavior
- dedupe key: `eventId`
- existing event with same `eventId` is replaced
- final replay log is sorted by `occurredAt`

### Replay operation behavior
`REPLAY_MATCH_EVENTS` applies each event through the same reducer path (`APPLY_MATCH_EVENT`), preserving production-equivalent behavior for:
- ordering
- stale rejection
- state mutation rules

## Transition Table

| Current store state for `matchId` | Event | Next state |
|---|---|---|
| absent | `MATCH_CREATED` with valid payload | present, `status = matched` |
| absent | `MATCH_EXPIRED` | unchanged (ignored for missing record) |
| absent | `MATCH_BLOCKED` | unchanged (ignored for missing record) |
| absent | `MATCH_UNMATCHED` | unchanged (remains absent) |
| present, `matched` | `MATCH_EXPIRED` | present, `expired` |
| present, `matched` | `MATCH_BLOCKED` | present, `blocked` |
| present, any | `MATCH_UNMATCHED` | absent |
| present, any | stale event (`occurredAt < lastSyncedAt`) | unchanged |

## UI-Level Effects in Sprint-04
- Venue details screen renders match cards with status badges (`matched`, `expired`, `blocked` tones).
- Expired match visual treatment is explicitly covered in tests.
- Unmatch flow returns profile to potential list and removes from visible matches.

## Test Evidence
- `matchStore.test.ts` verifies:
  - snapshot ingestion
  - deterministic expire/block transitions
  - stale-event rejection
  - replay of create/unmatch and create/expire sequences
- `venueDetailsScreen.test.tsx` verifies:
  - expired-state rendering
  - unmatch behavior in user flow

## Phase-2 Conversion Requirements
1. Preserve lifecycle event names and semantics.
2. Preserve stale-event rejection using authoritative backend timestamps.
3. Preserve `MATCH_UNMATCHED` as record removal behavior for client state.
4. Preserve deterministic replay via stable event IDs and ordered event processing.
5. Ensure presence/session closure events can drive `MATCH_EXPIRED` transitions server-side.

## Known Sprint-04 Boundary
- Match lifecycle transitions are mock-driven and replayable locally.
- Server-authoritative event emission and persistence ordering are deferred to Phase-2 backend conversion.