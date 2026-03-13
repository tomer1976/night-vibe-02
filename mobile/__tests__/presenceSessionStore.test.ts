import { PresenceCheckInResult } from '../src/contracts';
import {
  createInitialPresenceSessionStoreState,
  presenceSessionStoreReducer,
} from '../src/state/presenceSessionStore';

function createCheckInResult(overrides?: Partial<PresenceCheckInResult>): PresenceCheckInResult {
  return {
    status: 'SUCCESS',
    venueId: 'v-luna-lounge',
    sessionId: 's-user-1',
    checkinTimestamp: '2026-03-12T22:00:00.000Z',
    previousVenueCheckout: false,
    ...overrides,
  };
}

describe('presenceSessionStore', () => {
  it('starts with empty active session and no transitions', () => {
    const initialState = createInitialPresenceSessionStoreState();

    expect(initialState.activeSession).toBeNull();
    expect(initialState.transitions).toEqual([]);
    expect(initialState.lastSyncedAt).toBeNull();
  });

  it('applies check-in result and opens active session', () => {
    const initialState = createInitialPresenceSessionStoreState();

    const nextState = presenceSessionStoreReducer(initialState, {
      type: 'APPLY_CHECKIN_RESULT',
      result: createCheckInResult(),
      userId: 'u-test',
    });

    expect(nextState.activeSession).toEqual({
      sessionId: 's-user-1',
      userId: 'u-test',
      venueId: 'v-luna-lounge',
      status: 'active',
      checkinAt: '2026-03-12T22:00:00.000Z',
      checkoutAt: null,
    });
    expect(nextState.transitions).toEqual([]);
    expect(nextState.lastSyncedAt).toBe('2026-03-12T22:00:00.000Z');
  });

  it('tracks auto-replaced transition when check-in replaces active session', () => {
    const initialState = presenceSessionStoreReducer(createInitialPresenceSessionStoreState(), {
      type: 'SET_SESSION_SNAPSHOT',
      session: {
        sessionId: 's-old',
        userId: 'u-test',
        venueId: 'v-old',
        status: 'active',
        checkinAt: '2026-03-12T21:00:00.000Z',
        checkoutAt: null,
      },
      syncedAt: '2026-03-12T21:30:00.000Z',
    });

    const replacedState = presenceSessionStoreReducer(initialState, {
      type: 'APPLY_CHECKIN_RESULT',
      result: createCheckInResult({
        venueId: 'v-new',
        sessionId: 's-new',
        checkinTimestamp: '2026-03-12T22:15:00.000Z',
        previousVenueCheckout: true,
      }),
      userId: 'u-test',
    });

    expect(replacedState.activeSession?.sessionId).toBe('s-new');
    expect(replacedState.activeSession?.venueId).toBe('v-new');
    expect(replacedState.transitions).toHaveLength(1);
    expect(replacedState.transitions[0]).toEqual({
      sessionId: 's-old',
      userId: 'u-test',
      venueId: 'v-old',
      fromStatus: 'active',
      toStatus: 'closed',
      reason: 'auto_replaced',
      transitionedAt: '2026-03-12T22:15:00.000Z',
    });
  });

  it('applies manual checkout by clearing active session and appending transition', () => {
    const initialState = presenceSessionStoreReducer(createInitialPresenceSessionStoreState(), {
      type: 'SET_SESSION_SNAPSHOT',
      session: {
        sessionId: 's-active',
        userId: 'u-test',
        venueId: 'v-luna',
        status: 'active',
        checkinAt: '2026-03-12T21:50:00.000Z',
        checkoutAt: null,
      },
    });

    const checkedOutState = presenceSessionStoreReducer(initialState, {
      type: 'APPLY_CHECKOUT',
      checkoutTime: '2026-03-12T22:30:00.000Z',
    });

    expect(checkedOutState.activeSession).toBeNull();
    expect(checkedOutState.transitions).toHaveLength(1);
    expect(checkedOutState.transitions[0].reason).toBe('manual_checkout');
    expect(checkedOutState.transitions[0].toStatus).toBe('closed');
    expect(checkedOutState.lastSyncedAt).toBe('2026-03-12T22:30:00.000Z');
  });

  it('applies timeout by clearing active session and appending expired transition', () => {
    const initialState = presenceSessionStoreReducer(createInitialPresenceSessionStoreState(), {
      type: 'SET_SESSION_SNAPSHOT',
      session: {
        sessionId: 's-active',
        userId: 'u-test',
        venueId: 'v-luna',
        status: 'active',
        checkinAt: '2026-03-12T21:50:00.000Z',
        checkoutAt: null,
      },
    });

    const expiredState = presenceSessionStoreReducer(initialState, {
      type: 'APPLY_TIMEOUT',
      expiredAt: '2026-03-13T01:50:00.000Z',
    });

    expect(expiredState.activeSession).toBeNull();
    expect(expiredState.transitions).toHaveLength(1);
    expect(expiredState.transitions[0].reason).toBe('timeout');
    expect(expiredState.transitions[0].toStatus).toBe('expired');
    expect(expiredState.lastSyncedAt).toBe('2026-03-13T01:50:00.000Z');
  });

  it('ignores stale check-in result that arrives after a newer checkout update', () => {
    const checkedOutState = presenceSessionStoreReducer(
      presenceSessionStoreReducer(createInitialPresenceSessionStoreState(), {
        type: 'SET_SESSION_SNAPSHOT',
        session: {
          sessionId: 's-active',
          userId: 'u-test',
          venueId: 'v-halo',
          status: 'active',
          checkinAt: '2026-03-12T22:10:00.000Z',
          checkoutAt: null,
        },
        syncedAt: '2026-03-12T22:10:00.000Z',
      }),
      {
        type: 'APPLY_CHECKOUT',
        checkoutTime: '2026-03-12T22:20:00.000Z',
      },
    );

    const outOfOrderState = presenceSessionStoreReducer(checkedOutState, {
      type: 'APPLY_CHECKIN_RESULT',
      result: createCheckInResult({
        venueId: 'v-luna-lounge',
        sessionId: 's-late-response',
        checkinTimestamp: '2026-03-12T22:15:00.000Z',
      }),
      userId: 'u-test',
    });

    expect(outOfOrderState.activeSession).toBeNull();
    expect(outOfOrderState.transitions).toHaveLength(1);
    expect(outOfOrderState.transitions[0].reason).toBe('manual_checkout');
    expect(outOfOrderState.lastSyncedAt).toBe('2026-03-12T22:20:00.000Z');
  });

  it('ignores stale checkout event that arrives after a newer check-in update', () => {
    const checkedInState = presenceSessionStoreReducer(createInitialPresenceSessionStoreState(), {
      type: 'APPLY_CHECKIN_RESULT',
      result: createCheckInResult({
        venueId: 'v-luna-lounge',
        sessionId: 's-new',
        checkinTimestamp: '2026-03-12T22:40:00.000Z',
      }),
      userId: 'u-test',
    });

    const outOfOrderState = presenceSessionStoreReducer(checkedInState, {
      type: 'APPLY_CHECKOUT',
      checkoutTime: '2026-03-12T22:35:00.000Z',
    });

    expect(outOfOrderState.activeSession?.sessionId).toBe('s-new');
    expect(outOfOrderState.activeSession?.status).toBe('active');
    expect(outOfOrderState.transitions).toEqual([]);
    expect(outOfOrderState.lastSyncedAt).toBe('2026-03-12T22:40:00.000Z');
  });
});