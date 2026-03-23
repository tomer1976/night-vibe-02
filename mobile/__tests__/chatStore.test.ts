import {
  chatStoreReducer,
  computeChatEligibilityResult,
  createInitialChatStoreState,
  selectChatEligibilityByChatId,
  selectChatMessagesByChatId,
  selectOrderedChatThreads,
} from '../src/state';

const threadAlpha = {
  chatId: 'chat-alpha',
  matchId: 'match-alpha',
  participants: ['u-1', 'u-2'] as [string, string],
  counterpart: {
    userId: 'u-2',
    displayName: 'Riley',
    age: 29,
    gender: 'non_binary' as const,
  },
  latestMessage: {
    messageId: 'msg-a-1',
    text: 'See you soon',
    sentAt: '2026-03-22T22:00:00.000Z',
    deliveryStatus: 'sent' as const,
  },
  unreadCount: 1,
  status: 'active' as const,
};

const threadBeta = {
  chatId: 'chat-beta',
  matchId: 'match-beta',
  participants: ['u-1', 'u-3'] as [string, string],
  counterpart: {
    userId: 'u-3',
    displayName: 'Sky',
    age: 27,
    gender: 'female' as const,
  },
  latestMessage: {
    messageId: 'msg-b-1',
    text: 'Heading to the bar',
    sentAt: '2026-03-22T22:05:00.000Z',
    deliveryStatus: 'delivered' as const,
  },
  unreadCount: 0,
  status: 'active' as const,
};

describe('chatStore', () => {
  it('stores thread snapshot and returns deterministic thread order by latest message timestamp', () => {
    const state = chatStoreReducer(createInitialChatStoreState(), {
      type: 'SET_THREADS_SNAPSHOT',
      threads: [threadAlpha, threadBeta],
      syncedAt: '2026-03-22T22:10:00.000Z',
    });

    const ordered = selectOrderedChatThreads(state);

    expect(ordered.map((thread) => thread.chatId)).toEqual(['chat-beta', 'chat-alpha']);
    expect(state.lastSyncedAt).toBe('2026-03-22T22:10:00.000Z');
  });

  it('deduplicates and sorts message snapshots by sentAt then messageId', () => {
    const state = chatStoreReducer(createInitialChatStoreState(), {
      type: 'SET_MESSAGES_SNAPSHOT',
      chatId: 'chat-alpha',
      messages: [
        {
          messageId: 'msg-2',
          chatId: 'chat-alpha',
          senderUserId: 'u-1',
          text: 'second',
          sentAt: '2026-03-22T22:00:05.000Z',
          deliveryStatus: 'sent',
        },
        {
          messageId: 'msg-1',
          chatId: 'chat-alpha',
          senderUserId: 'u-2',
          text: 'first',
          sentAt: '2026-03-22T22:00:01.000Z',
          deliveryStatus: 'read',
        },
        {
          messageId: 'msg-2',
          chatId: 'chat-alpha',
          senderUserId: 'u-1',
          text: 'second-update',
          sentAt: '2026-03-22T22:00:05.000Z',
          deliveryStatus: 'delivered',
        },
      ],
    });

    const messages = selectChatMessagesByChatId(state, 'chat-alpha');

    expect(messages).toHaveLength(2);
    expect(messages.map((message) => message.messageId)).toEqual(['msg-1', 'msg-2']);
    expect(messages[1].deliveryStatus).toBe('delivered');
    expect(messages[1].text).toBe('second-update');
  });

  it('upserts a newer message and refreshes thread preview ordering', () => {
    const withThreads = chatStoreReducer(createInitialChatStoreState(), {
      type: 'SET_THREADS_SNAPSHOT',
      threads: [threadAlpha, threadBeta],
      syncedAt: '2026-03-22T22:10:00.000Z',
    });

    const updated = chatStoreReducer(withThreads, {
      type: 'UPSERT_MESSAGE',
      message: {
        messageId: 'msg-a-2',
        chatId: 'chat-alpha',
        senderUserId: 'u-1',
        text: 'newest alpha message',
        sentAt: '2026-03-22T22:20:00.000Z',
        deliveryStatus: 'sent',
      },
      syncedAt: '2026-03-22T22:20:00.000Z',
    });

    const ordered = selectOrderedChatThreads(updated);
    expect(ordered.map((thread) => thread.chatId)).toEqual(['chat-alpha', 'chat-beta']);
    expect(ordered[0].latestMessage.messageId).toBe('msg-a-2');
    expect(ordered[0].latestMessage.text).toBe('newest alpha message');
  });

  it('computes blocked eligibility when block/moderation constraints are active', () => {
    const blocked = computeChatEligibilityResult({
      chatId: 'chat-alpha',
      requiredVenueId: 'v-halo-club',
      matchStatus: 'matched',
      chatStatus: 'active',
      viewerSessionVenueId: 'v-halo-club',
      counterpartSessionVenueId: 'v-halo-club',
      hasActiveBlock: true,
      hasModerationAction: false,
      evaluatedAt: '2026-03-22T22:30:00.000Z',
    });

    const moderation = computeChatEligibilityResult({
      chatId: 'chat-alpha',
      requiredVenueId: 'v-halo-club',
      matchStatus: 'matched',
      chatStatus: 'active',
      viewerSessionVenueId: 'v-halo-club',
      counterpartSessionVenueId: 'v-halo-club',
      hasActiveBlock: false,
      hasModerationAction: true,
      evaluatedAt: '2026-03-22T22:31:00.000Z',
    });

    expect(blocked.eligible).toBe(false);
    expect(blocked.reason).toBe('blocked');
    expect(moderation.eligible).toBe(false);
    expect(moderation.reason).toBe('moderation_action');
  });

  it('recomputes not_checked_in, left_venue, and match_expired outcomes deterministically', () => {
    const initial = createInitialChatStoreState();

    const notCheckedInState = chatStoreReducer(initial, {
      type: 'RECOMPUTE_ELIGIBILITY',
      input: {
        chatId: 'chat-alpha',
        requiredVenueId: 'v-halo-club',
        matchStatus: 'matched',
        chatStatus: 'active',
        viewerSessionVenueId: null,
        counterpartSessionVenueId: 'v-halo-club',
        hasActiveBlock: false,
        hasModerationAction: false,
        evaluatedAt: '2026-03-22T22:32:00.000Z',
      },
    });

    const leftVenueState = chatStoreReducer(notCheckedInState, {
      type: 'RECOMPUTE_ELIGIBILITY',
      input: {
        chatId: 'chat-alpha',
        requiredVenueId: 'v-halo-club',
        matchStatus: 'matched',
        chatStatus: 'active',
        viewerSessionVenueId: 'v-luna-lounge',
        counterpartSessionVenueId: 'v-halo-club',
        hasActiveBlock: false,
        hasModerationAction: false,
        evaluatedAt: '2026-03-22T22:33:00.000Z',
      },
    });

    const expiredState = chatStoreReducer(leftVenueState, {
      type: 'RECOMPUTE_ELIGIBILITY',
      input: {
        chatId: 'chat-alpha',
        requiredVenueId: 'v-halo-club',
        matchStatus: 'expired',
        chatStatus: 'expired',
        viewerSessionVenueId: 'v-halo-club',
        counterpartSessionVenueId: 'v-halo-club',
        hasActiveBlock: false,
        hasModerationAction: false,
        evaluatedAt: '2026-03-22T22:34:00.000Z',
      },
    });

    expect(selectChatEligibilityByChatId(notCheckedInState, 'chat-alpha')?.reason).toBe('not_checked_in');
    expect(selectChatEligibilityByChatId(leftVenueState, 'chat-alpha')?.reason).toBe('left_venue');
    expect(selectChatEligibilityByChatId(expiredState, 'chat-alpha')?.reason).toBe('match_expired');
  });

  it('computes eligible when match and co-location requirements are satisfied', () => {
    const result = computeChatEligibilityResult({
      chatId: 'chat-alpha',
      requiredVenueId: 'v-halo-club',
      matchStatus: 'matched',
      chatStatus: 'active',
      viewerSessionVenueId: 'v-halo-club',
      counterpartSessionVenueId: 'v-halo-club',
      hasActiveBlock: false,
      hasModerationAction: false,
      evaluatedAt: '2026-03-22T22:35:00.000Z',
    });

    expect(result).toEqual({
      chatId: 'chat-alpha',
      eligible: true,
      reason: undefined,
      evaluatedAt: '2026-03-22T22:35:00.000Z',
    });
  });

  it('enforces active-match plus same-venue as a combined eligibility gate', () => {
    const scenarios = [
      {
        name: 'eligible only when matched and both users are in required venue',
        input: {
          chatId: 'chat-alpha',
          requiredVenueId: 'v-halo-club',
          matchStatus: 'matched' as const,
          chatStatus: 'active' as const,
          viewerSessionVenueId: 'v-halo-club',
          counterpartSessionVenueId: 'v-halo-club',
          hasActiveBlock: false,
          hasModerationAction: false,
          evaluatedAt: '2026-03-22T22:36:00.000Z',
        },
        expected: {
          eligible: true,
          reason: undefined,
        },
      },
      {
        name: 'inactive match denies chat even when co-located',
        input: {
          chatId: 'chat-alpha',
          requiredVenueId: 'v-halo-club',
          matchStatus: 'expired' as const,
          chatStatus: 'active' as const,
          viewerSessionVenueId: 'v-halo-club',
          counterpartSessionVenueId: 'v-halo-club',
          hasActiveBlock: false,
          hasModerationAction: false,
          evaluatedAt: '2026-03-22T22:37:00.000Z',
        },
        expected: {
          eligible: false,
          reason: 'match_expired' as const,
        },
      },
      {
        name: 'different venue denies chat despite active match',
        input: {
          chatId: 'chat-alpha',
          requiredVenueId: 'v-halo-club',
          matchStatus: 'matched' as const,
          chatStatus: 'active' as const,
          viewerSessionVenueId: 'v-luna-lounge',
          counterpartSessionVenueId: 'v-halo-club',
          hasActiveBlock: false,
          hasModerationAction: false,
          evaluatedAt: '2026-03-22T22:38:00.000Z',
        },
        expected: {
          eligible: false,
          reason: 'left_venue' as const,
        },
      },
      {
        name: 'missing counterpart session denies chat',
        input: {
          chatId: 'chat-alpha',
          requiredVenueId: 'v-halo-club',
          matchStatus: 'matched' as const,
          chatStatus: 'active' as const,
          viewerSessionVenueId: 'v-halo-club',
          counterpartSessionVenueId: null,
          hasActiveBlock: false,
          hasModerationAction: false,
          evaluatedAt: '2026-03-22T22:39:00.000Z',
        },
        expected: {
          eligible: false,
          reason: 'not_checked_in' as const,
        },
      },
    ];

    for (const scenario of scenarios) {
      const result = computeChatEligibilityResult(scenario.input);

      expect(result.eligible).toBe(scenario.expected.eligible);
      expect(result.reason).toBe(scenario.expected.reason);
    }
  });
});