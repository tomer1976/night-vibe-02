import {
  createInitialMatchStoreState,
  matchStoreReducer,
  selectMatchReplayEventsByVenue,
  selectMatchesByVenue,
  MatchLifecycleEvent,
} from '../src/state';

const baseMatch = {
  matchId: 'match-u-1-u-2',
  users: ['u-1', 'u-2'] as [string, string],
  venueId: 'v-halo-club',
  counterpart: {
    userId: 'u-2',
    displayName: 'Riley',
    age: 29,
    gender: 'non_binary' as const,
    profilePhotoUrl: 'mock://user-photo/riley',
  },
  status: 'matched' as const,
};

describe('matchStore', () => {
  it('ingests snapshot and selects venue-scoped matches', () => {
    const state = matchStoreReducer(createInitialMatchStoreState(), {
      type: 'SET_MATCH_SNAPSHOT',
      matches: [
        baseMatch,
        {
          ...baseMatch,
          matchId: 'match-u-1-u-3',
          venueId: 'v-luna-lounge',
          counterpart: {
            ...baseMatch.counterpart,
            userId: 'u-3',
            displayName: 'Sky',
          },
          users: ['u-1', 'u-3'],
        },
      ],
      syncedAt: '2026-03-15T20:00:00.000Z',
    });

    const venueMatches = selectMatchesByVenue(state, 'v-halo-club');

    expect(venueMatches).toHaveLength(1);
    expect(venueMatches[0].matchId).toBe('match-u-1-u-2');
    expect(state.lastSyncedAt).toBe('2026-03-15T20:00:00.000Z');
  });

  it('applies expiration and block lifecycle events deterministically', () => {
    const withSnapshot = matchStoreReducer(createInitialMatchStoreState(), {
      type: 'SET_MATCH_SNAPSHOT',
      matches: [baseMatch],
      syncedAt: '2026-03-15T20:00:00.000Z',
    });

    const expired = matchStoreReducer(withSnapshot, {
      type: 'APPLY_MATCH_EVENT',
      event: {
        eventId: 'evt-expire-1',
        type: 'MATCH_EXPIRED',
        matchId: 'match-u-1-u-2',
        venueId: 'v-halo-club',
        occurredAt: '2026-03-15T20:05:00.000Z',
      },
    });

    const blocked = matchStoreReducer(expired, {
      type: 'APPLY_MATCH_EVENT',
      event: {
        eventId: 'evt-block-1',
        type: 'MATCH_BLOCKED',
        matchId: 'match-u-1-u-2',
        venueId: 'v-halo-club',
        occurredAt: '2026-03-15T20:06:00.000Z',
      },
    });

    expect(blocked.matchesById['match-u-1-u-2'].status).toBe('blocked');
    expect(selectMatchReplayEventsByVenue(blocked, 'v-halo-club').map((event) => event.eventId)).toEqual([
      'evt-expire-1',
      'evt-block-1',
    ]);
  });

  it('ignores stale lifecycle events older than last synced state', () => {
    const withSnapshot = matchStoreReducer(createInitialMatchStoreState(), {
      type: 'SET_MATCH_SNAPSHOT',
      matches: [baseMatch],
      syncedAt: '2026-03-15T20:10:00.000Z',
    });

    const staleApplied = matchStoreReducer(withSnapshot, {
      type: 'APPLY_MATCH_EVENT',
      event: {
        eventId: 'evt-expire-stale',
        type: 'MATCH_EXPIRED',
        matchId: baseMatch.matchId,
        venueId: baseMatch.venueId,
        occurredAt: '2026-03-15T20:09:59.000Z',
      },
    });

    expect(staleApplied).toBe(withSnapshot);
    expect(staleApplied.matchesById[baseMatch.matchId].status).toBe('matched');
  });

  it('replays created then unmatched events to rebuild lifecycle state', () => {
    const events: MatchLifecycleEvent[] = [
      {
        eventId: 'evt-create-1',
        type: 'MATCH_CREATED',
        matchId: 'match-u-1-u-9',
        venueId: 'v-halo-club',
        occurredAt: '2026-03-15T20:20:00.000Z',
        payload: {
          users: ['u-1', 'u-9'],
          counterpart: {
            userId: 'u-9',
            displayName: 'Nova',
            age: 28,
            gender: 'female',
            profilePhotoUrl: 'mock://user-photo/nova',
          },
        },
      },
      {
        eventId: 'evt-unmatch-1',
        type: 'MATCH_UNMATCHED',
        matchId: 'match-u-1-u-9',
        venueId: 'v-halo-club',
        occurredAt: '2026-03-15T20:21:00.000Z',
      },
    ];

    const replayed = matchStoreReducer(createInitialMatchStoreState(), {
      type: 'REPLAY_MATCH_EVENTS',
      events,
    });

    expect(replayed.matchesById['match-u-1-u-9']).toBeUndefined();
    expect(selectMatchReplayEventsByVenue(replayed, 'v-halo-club').map((event) => event.eventId)).toEqual([
      'evt-create-1',
      'evt-unmatch-1',
    ]);
  });

  it('transitions matched record to expired while preserving match identity fields', () => {
    const withSnapshot = matchStoreReducer(createInitialMatchStoreState(), {
      type: 'SET_MATCH_SNAPSHOT',
      matches: [baseMatch],
      syncedAt: '2026-03-15T20:30:00.000Z',
    });

    const expired = matchStoreReducer(withSnapshot, {
      type: 'APPLY_MATCH_EVENT',
      event: {
        eventId: 'evt-expire-contract-1',
        type: 'MATCH_EXPIRED',
        matchId: baseMatch.matchId,
        venueId: baseMatch.venueId,
        occurredAt: '2026-03-15T20:31:00.000Z',
      },
    });

    expect(expired.matchesById[baseMatch.matchId]).toEqual({
      ...baseMatch,
      status: 'expired',
    });
    expect(expired.lastSyncedAt).toBe('2026-03-15T20:31:00.000Z');
    expect(selectMatchReplayEventsByVenue(expired, 'v-halo-club').map((event) => event.eventId)).toEqual([
      'evt-expire-contract-1',
    ]);
  });

  it('replays create then expire events to produce an expired match state', () => {
    const replayed = matchStoreReducer(createInitialMatchStoreState(), {
      type: 'REPLAY_MATCH_EVENTS',
      events: [
        {
          eventId: 'evt-create-2',
          type: 'MATCH_CREATED',
          matchId: 'match-u-1-u-8',
          venueId: 'v-halo-club',
          occurredAt: '2026-03-15T20:40:00.000Z',
          payload: {
            users: ['u-1', 'u-8'],
            counterpart: {
              userId: 'u-8',
              displayName: 'Vale',
              age: 30,
              gender: 'female',
              profilePhotoUrl: 'mock://user-photo/vale',
            },
          },
        },
        {
          eventId: 'evt-expire-2',
          type: 'MATCH_EXPIRED',
          matchId: 'match-u-1-u-8',
          venueId: 'v-halo-club',
          occurredAt: '2026-03-15T20:41:00.000Z',
        },
      ],
    });

    expect(replayed.matchesById['match-u-1-u-8'].status).toBe('expired');
    expect(selectMatchReplayEventsByVenue(replayed, 'v-halo-club').map((event) => event.eventId)).toEqual([
      'evt-create-2',
      'evt-expire-2',
    ]);
  });
});