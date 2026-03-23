import {
  chatStoreReducer,
  createInitialChatStoreState,
  createInitialMatchStoreState,
  matchStoreReducer,
  selectChatEligibilityByChatId,
  selectSameVenueDiscoveryEligibility,
} from '../src/state';
import { VenueSession } from '../src/contracts';

describe('Sprint-03/04 integration regression', () => {
  const venueId = 'v-halo-club';
  const chatId = 'chat-u-1-u-2';
  const matchId = 'match-u-1-u-2';

  const matchedRecord = {
    matchId,
    users: ['u-1', 'u-2'] as [string, string],
    venueId,
    counterpart: {
      userId: 'u-2',
      displayName: 'Riley',
      age: 29,
      gender: 'non_binary' as const,
      profilePhotoUrl: 'mock://user-photo/riley',
    },
    status: 'matched' as const,
  };

  const activeSession: VenueSession = {
    sessionId: 'session-u-1-active',
    userId: 'u-1',
    venueId,
    status: 'active',
    checkinAt: '2026-03-23T22:00:00.000Z',
    checkoutAt: null,
  };

  it('keeps Sprint-03 presence gating aligned with Sprint-05 chat eligibility transitions', () => {
    const discoveryEligible = selectSameVenueDiscoveryEligibility(activeSession, venueId);
    expect(discoveryEligible.isEligible).toBe(true);
    expect(discoveryEligible.code).toBe('eligible_same_venue');

    const withEligibleChat = chatStoreReducer(createInitialChatStoreState(), {
      type: 'RECOMPUTE_ELIGIBILITY',
      input: {
        chatId,
        requiredVenueId: venueId,
        matchStatus: 'matched',
        chatStatus: 'active',
        viewerSessionVenueId: venueId,
        counterpartSessionVenueId: venueId,
        hasActiveBlock: false,
        hasModerationAction: false,
        evaluatedAt: '2026-03-23T22:01:00.000Z',
      },
    });

    expect(selectChatEligibilityByChatId(withEligibleChat, chatId)?.eligible).toBe(true);
    expect(selectChatEligibilityByChatId(withEligibleChat, chatId)?.reason).toBeUndefined();

    const timedOutSession: VenueSession = {
      ...activeSession,
      status: 'expired',
      checkoutAt: '2026-03-24T02:00:00.000Z',
    };

    const discoveryTimedOut = selectSameVenueDiscoveryEligibility(timedOutSession, venueId);
    expect(discoveryTimedOut.isEligible).toBe(false);
    expect(discoveryTimedOut.code).toBe('inactive_session');

    const withTimedOutChat = chatStoreReducer(withEligibleChat, {
      type: 'RECOMPUTE_ELIGIBILITY',
      input: {
        chatId,
        requiredVenueId: venueId,
        matchStatus: 'matched',
        chatStatus: 'active',
        viewerSessionVenueId: null,
        counterpartSessionVenueId: venueId,
        hasActiveBlock: false,
        hasModerationAction: false,
        evaluatedAt: '2026-03-24T02:00:00.000Z',
      },
    });

    expect(selectChatEligibilityByChatId(withTimedOutChat, chatId)?.eligible).toBe(false);
    expect(selectChatEligibilityByChatId(withTimedOutChat, chatId)?.reason).toBe('not_checked_in');
  });

  it('preserves Sprint-04 match lifecycle propagation into Sprint-05 chat disablement', () => {
    const withMatchSnapshot = matchStoreReducer(createInitialMatchStoreState(), {
      type: 'SET_MATCH_SNAPSHOT',
      matches: [matchedRecord],
      syncedAt: '2026-03-23T22:10:00.000Z',
    });

    const blockedMatchState = matchStoreReducer(withMatchSnapshot, {
      type: 'APPLY_MATCH_EVENT',
      event: {
        eventId: 'evt-block-regression-1',
        type: 'MATCH_BLOCKED',
        matchId,
        venueId,
        occurredAt: '2026-03-23T22:11:00.000Z',
      },
    });

    expect(blockedMatchState.matchesById[matchId].status).toBe('blocked');

    const chatState = chatStoreReducer(createInitialChatStoreState(), {
      type: 'RECOMPUTE_ELIGIBILITY',
      input: {
        chatId,
        requiredVenueId: venueId,
        matchStatus: blockedMatchState.matchesById[matchId].status,
        chatStatus: 'active',
        viewerSessionVenueId: venueId,
        counterpartSessionVenueId: venueId,
        hasActiveBlock: false,
        hasModerationAction: false,
        evaluatedAt: '2026-03-23T22:11:00.000Z',
      },
    });

    expect(selectChatEligibilityByChatId(chatState, chatId)?.eligible).toBe(false);
    expect(selectChatEligibilityByChatId(chatState, chatId)?.reason).toBe('blocked');
  });
});
