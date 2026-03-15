import { MatchRecord } from '../contracts';

export type MatchLifecycleEventType = 'MATCH_CREATED' | 'MATCH_EXPIRED' | 'MATCH_BLOCKED' | 'MATCH_UNMATCHED';

export type MatchLifecycleEvent = {
  eventId: string;
  type: MatchLifecycleEventType;
  matchId: string;
  venueId: string;
  occurredAt: string;
  payload?: {
    users?: [string, string];
    counterpart?: MatchRecord['counterpart'];
    status?: MatchRecord['status'];
  };
};

export type MatchStoreState = {
  matchesById: Record<string, MatchRecord>;
  eventReplayLog: MatchLifecycleEvent[];
  lastSyncedAt: string | null;
};

export type MatchStoreAction =
  | {
      type: 'SET_MATCH_SNAPSHOT';
      matches: MatchRecord[];
      syncedAt?: string;
    }
  | {
      type: 'APPLY_MATCH_EVENT';
      event: MatchLifecycleEvent;
    }
  | {
      type: 'REPLAY_MATCH_EVENTS';
      events: MatchLifecycleEvent[];
    }
  | {
      type: 'RESET_MATCH_STORE';
    };

function toIsoNow(instant?: string) {
  return instant ?? new Date().toISOString();
}

function toMillis(instant?: string | null) {
  if (!instant) {
    return Number.NaN;
  }

  return new Date(instant).getTime();
}

function buildMatchesById(matches: MatchRecord[]): Record<string, MatchRecord> {
  return matches.reduce<Record<string, MatchRecord>>((accumulator, match) => {
    accumulator[match.matchId] = match;
    return accumulator;
  }, {});
}

function mergeReplayEvent(log: MatchLifecycleEvent[], event: MatchLifecycleEvent) {
  const existingIndex = log.findIndex((candidate) => candidate.eventId === event.eventId);

  if (existingIndex >= 0) {
    const next = [...log];
    next[existingIndex] = event;
    return next.sort((left, right) => toMillis(left.occurredAt) - toMillis(right.occurredAt));
  }

  return [...log, event].sort((left, right) => toMillis(left.occurredAt) - toMillis(right.occurredAt));
}

function buildCreatedMatchFromEvent(event: MatchLifecycleEvent): MatchRecord | null {
  if (event.type !== 'MATCH_CREATED') {
    return null;
  }

  const users = event.payload?.users;
  const counterpart = event.payload?.counterpart;

  if (!users || !counterpart) {
    return null;
  }

  return {
    matchId: event.matchId,
    users,
    venueId: event.venueId,
    counterpart,
    status: 'matched',
  };
}

function shouldIgnoreStaleMatchEvent(state: MatchStoreState, event: MatchLifecycleEvent) {
  const currentMatch = state.matchesById[event.matchId];
  const baselineInstant = state.lastSyncedAt;

  const currentTime = toMillis(baselineInstant);
  const eventTime = toMillis(event.occurredAt);

  if (Number.isFinite(eventTime) && Number.isFinite(currentTime) && eventTime < currentTime) {
    return true;
  }

  if (!currentMatch) {
    return false;
  }

  const latestKnownMatchInstant = toMillis(state.lastSyncedAt);
  return Number.isFinite(eventTime) && Number.isFinite(latestKnownMatchInstant) && eventTime < latestKnownMatchInstant;
}

function applyEventToMatches(matchesById: Record<string, MatchRecord>, event: MatchLifecycleEvent) {
  const existing = matchesById[event.matchId];
  const nextMatchesById = {
    ...matchesById,
  };

  if (event.type === 'MATCH_UNMATCHED') {
    delete nextMatchesById[event.matchId];
    return nextMatchesById;
  }

  if (event.type === 'MATCH_CREATED') {
    const created = buildCreatedMatchFromEvent(event);
    if (created) {
      nextMatchesById[event.matchId] = created;
    }
    return nextMatchesById;
  }

  if (!existing) {
    return nextMatchesById;
  }

  if (event.type === 'MATCH_EXPIRED') {
    nextMatchesById[event.matchId] = {
      ...existing,
      status: 'expired',
    };
    return nextMatchesById;
  }

  if (event.type === 'MATCH_BLOCKED') {
    nextMatchesById[event.matchId] = {
      ...existing,
      status: 'blocked',
    };
    return nextMatchesById;
  }

  return nextMatchesById;
}

export function createInitialMatchStoreState(): MatchStoreState {
  return {
    matchesById: {},
    eventReplayLog: [],
    lastSyncedAt: null,
  };
}

export function selectMatchesByVenue(state: MatchStoreState, venueId: string): MatchRecord[] {
  return Object.values(state.matchesById)
    .filter((match) => match.venueId === venueId)
    .sort((left, right) => left.matchId.localeCompare(right.matchId));
}

export function selectMatchReplayEventsByVenue(state: MatchStoreState, venueId: string): MatchLifecycleEvent[] {
  return state.eventReplayLog.filter((event) => event.venueId === venueId);
}

export function matchStoreReducer(state: MatchStoreState, action: MatchStoreAction): MatchStoreState {
  switch (action.type) {
    case 'SET_MATCH_SNAPSHOT': {
      return {
        ...state,
        matchesById: buildMatchesById(action.matches),
        lastSyncedAt: toIsoNow(action.syncedAt),
      };
    }

    case 'APPLY_MATCH_EVENT': {
      if (shouldIgnoreStaleMatchEvent(state, action.event)) {
        return state;
      }

      return {
        ...state,
        matchesById: applyEventToMatches(state.matchesById, action.event),
        eventReplayLog: mergeReplayEvent(state.eventReplayLog, action.event),
        lastSyncedAt: action.event.occurredAt,
      };
    }

    case 'REPLAY_MATCH_EVENTS': {
      let nextState = state;

      for (const event of action.events) {
        nextState = matchStoreReducer(nextState, {
          type: 'APPLY_MATCH_EVENT',
          event,
        });
      }

      return nextState;
    }

    case 'RESET_MATCH_STORE': {
      return createInitialMatchStoreState();
    }

    default:
      return state;
  }
}