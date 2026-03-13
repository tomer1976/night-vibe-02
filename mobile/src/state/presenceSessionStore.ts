import { PresenceCheckInResult, PresenceStateTransition } from '../contracts/services';
import { VenueSession } from '../contracts/models';

export type PresenceSessionStoreState = {
  activeSession: VenueSession | null;
  transitions: PresenceStateTransition[];
  lastSyncedAt: string | null;
};

export type PresenceSessionStoreAction =
  | {
      type: 'HYDRATE_STATE';
      state: PresenceSessionStoreState;
    }
  | {
      type: 'SET_SESSION_SNAPSHOT';
      session: VenueSession | null;
      transitions?: PresenceStateTransition[];
      syncedAt?: string;
    }
  | {
      type: 'APPLY_CHECKIN_RESULT';
      result: PresenceCheckInResult;
      userId?: string;
    }
  | {
      type: 'APPLY_CHECKOUT';
      checkoutTime: string;
    }
  | {
      type: 'APPLY_TIMEOUT';
      expiredAt: string;
    }
  | {
      type: 'RESET_STATE';
    };

export function createInitialPresenceSessionStoreState(): PresenceSessionStoreState {
  return {
    activeSession: null,
    transitions: [],
    lastSyncedAt: null,
  };
}

function getLatestPresenceEventTimestamp(state: PresenceSessionStoreState): string | null {
  const candidateInstants: string[] = [];

  if (state.activeSession?.checkinAt) {
    candidateInstants.push(state.activeSession.checkinAt);
  }

  for (const transition of state.transitions) {
    candidateInstants.push(transition.transitionedAt);
  }

  const sortedCandidates = candidateInstants
    .filter((instant) => Number.isFinite(new Date(instant).getTime()))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime());

  return sortedCandidates[0] ?? null;
}

function shouldIgnoreStalePresenceEvent(state: PresenceSessionStoreState, nextEventTimestamp: string): boolean {
  const latestEventTimestamp = getLatestPresenceEventTimestamp(state);

  if (!latestEventTimestamp) {
    return false;
  }

  const nextEventMs = new Date(nextEventTimestamp).getTime();
  const latestEventMs = new Date(latestEventTimestamp).getTime();

  if (!Number.isFinite(nextEventMs) || !Number.isFinite(latestEventMs)) {
    return false;
  }

  return nextEventMs < latestEventMs;
}

function toSessionFromCheckInResult(result: PresenceCheckInResult, existingUserId?: string): VenueSession {
  return {
    sessionId: result.sessionId,
    userId: existingUserId ?? 'mock-user',
    venueId: result.venueId,
    status: 'active',
    checkinAt: result.checkinTimestamp,
    checkoutAt: null,
  };
}

function closeActiveSession(
  activeSession: VenueSession,
  nextStatus: Extract<VenueSession['status'], 'closed' | 'expired'>,
  reason: PresenceStateTransition['reason'],
  transitionedAt: string,
): { closedSession: VenueSession; transition: PresenceStateTransition } {
  return {
    closedSession: {
      ...activeSession,
      status: nextStatus,
      checkoutAt: transitionedAt,
    },
    transition: {
      sessionId: activeSession.sessionId,
      userId: activeSession.userId,
      venueId: activeSession.venueId,
      fromStatus: 'active',
      toStatus: nextStatus,
      reason,
      transitionedAt,
    },
  };
}

export function presenceSessionStoreReducer(
  state: PresenceSessionStoreState,
  action: PresenceSessionStoreAction,
): PresenceSessionStoreState {
  switch (action.type) {
    case 'HYDRATE_STATE': {
      return action.state;
    }

    case 'SET_SESSION_SNAPSHOT': {
      return {
        ...state,
        activeSession: action.session,
        transitions: action.transitions ?? state.transitions,
        lastSyncedAt: action.syncedAt ?? new Date().toISOString(),
      };
    }

    case 'APPLY_CHECKIN_RESULT': {
      if (shouldIgnoreStalePresenceEvent(state, action.result.checkinTimestamp)) {
        return state;
      }

      const existingActiveSession = state.activeSession;
      const nextSession = toSessionFromCheckInResult(action.result, action.userId ?? existingActiveSession?.userId);

      if (!existingActiveSession) {
        return {
          ...state,
          activeSession: nextSession,
          lastSyncedAt: action.result.checkinTimestamp,
        };
      }

      if (existingActiveSession.sessionId === nextSession.sessionId) {
        return {
          ...state,
          activeSession: {
            ...existingActiveSession,
            venueId: nextSession.venueId,
            checkinAt: nextSession.checkinAt,
            status: 'active',
            checkoutAt: null,
          },
          lastSyncedAt: action.result.checkinTimestamp,
        };
      }

      if (!action.result.previousVenueCheckout) {
        return {
          ...state,
          activeSession: nextSession,
          lastSyncedAt: action.result.checkinTimestamp,
        };
      }

      const { transition } = closeActiveSession(
        existingActiveSession,
        'closed',
        'auto_replaced',
        action.result.checkinTimestamp,
      );

      return {
        ...state,
        activeSession: nextSession,
        transitions: [...state.transitions, transition],
        lastSyncedAt: action.result.checkinTimestamp,
      };
    }

    case 'APPLY_CHECKOUT': {
      if (shouldIgnoreStalePresenceEvent(state, action.checkoutTime)) {
        return state;
      }

      if (!state.activeSession || state.activeSession.status !== 'active') {
        return {
          ...state,
          lastSyncedAt: action.checkoutTime,
        };
      }

      const { transition } = closeActiveSession(state.activeSession, 'closed', 'manual_checkout', action.checkoutTime);

      return {
        ...state,
        activeSession: null,
        transitions: [...state.transitions, transition],
        lastSyncedAt: action.checkoutTime,
      };
    }

    case 'APPLY_TIMEOUT': {
      if (shouldIgnoreStalePresenceEvent(state, action.expiredAt)) {
        return state;
      }

      if (!state.activeSession || state.activeSession.status !== 'active') {
        return {
          ...state,
          lastSyncedAt: action.expiredAt,
        };
      }

      const { transition } = closeActiveSession(state.activeSession, 'expired', 'timeout', action.expiredAt);

      return {
        ...state,
        activeSession: null,
        transitions: [...state.transitions, transition],
        lastSyncedAt: action.expiredAt,
      };
    }

    case 'RESET_STATE': {
      return createInitialPresenceSessionStoreState();
    }

    default:
      return state;
  }
}