import { ChatEligibilityFailureReason, ChatEligibilityResult, ChatMessageRecord, ChatThread, MatchRecord } from '../contracts';

export type ChatStoreState = {
  threadsById: Record<string, ChatThread>;
  threadOrder: string[];
  messagesByChatId: Record<string, ChatMessageRecord[]>;
  eligibilityByChatId: Record<string, ChatEligibilityResult>;
  lastSyncedAt: string | null;
};

export type ChatEligibilityComputationInput = {
  chatId: string;
  requiredVenueId: string;
  matchStatus: MatchRecord['status'];
  chatStatus: ChatThread['status'];
  viewerSessionVenueId?: string | null;
  counterpartSessionVenueId?: string | null;
  hasActiveBlock: boolean;
  hasModerationAction: boolean;
  evaluatedAt?: string;
};

export type ChatStoreAction =
  | {
      type: 'SET_THREADS_SNAPSHOT';
      threads: ChatThread[];
      syncedAt?: string;
    }
  | {
      type: 'SET_MESSAGES_SNAPSHOT';
      chatId: string;
      messages: ChatMessageRecord[];
      syncedAt?: string;
    }
  | {
      type: 'UPSERT_MESSAGE';
      message: ChatMessageRecord;
      syncedAt?: string;
    }
  | {
      type: 'SET_ELIGIBILITY_RESULT';
      result: ChatEligibilityResult;
      syncedAt?: string;
    }
  | {
      type: 'RECOMPUTE_ELIGIBILITY';
      input: ChatEligibilityComputationInput;
      syncedAt?: string;
    }
  | {
      type: 'RESET_CHAT_STORE';
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

function toUniqueOrderedThreadIds(threads: ChatThread[]) {
  const byId = threads.reduce<Record<string, ChatThread>>((accumulator, thread) => {
    accumulator[thread.chatId] = thread;
    return accumulator;
  }, {});

  return Object.values(byId)
    .sort((left, right) => {
      const rightTime = toMillis(right.latestMessage.sentAt);
      const leftTime = toMillis(left.latestMessage.sentAt);

      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }

      return right.latestMessage.messageId.localeCompare(left.latestMessage.messageId);
    })
    .map((thread) => thread.chatId);
}

function toOrderedUniqueMessages(messages: ChatMessageRecord[]) {
  const byMessageId = messages.reduce<Record<string, ChatMessageRecord>>((accumulator, message) => {
    accumulator[message.messageId] = message;
    return accumulator;
  }, {});

  return Object.values(byMessageId).sort((left, right) => {
    const leftTime = toMillis(left.sentAt);
    const rightTime = toMillis(right.sentAt);

    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    return left.messageId.localeCompare(right.messageId);
  });
}

function buildThreadLookup(threads: ChatThread[]) {
  return threads.reduce<Record<string, ChatThread>>((accumulator, thread) => {
    accumulator[thread.chatId] = thread;
    return accumulator;
  }, {});
}

function resolveEligibilityReason(input: ChatEligibilityComputationInput): ChatEligibilityFailureReason | undefined {
  if (input.hasModerationAction) {
    return 'moderation_action';
  }

  if (input.hasActiveBlock || input.matchStatus === 'blocked' || input.chatStatus === 'blocked') {
    return 'blocked';
  }

  if (input.matchStatus !== 'matched' || input.chatStatus === 'expired') {
    return 'match_expired';
  }

  if (!input.viewerSessionVenueId || !input.counterpartSessionVenueId) {
    return 'not_checked_in';
  }

  if (
    input.viewerSessionVenueId !== input.requiredVenueId ||
    input.counterpartSessionVenueId !== input.requiredVenueId ||
    input.viewerSessionVenueId !== input.counterpartSessionVenueId
  ) {
    return 'left_venue';
  }

  return undefined;
}

export function computeChatEligibilityResult(input: ChatEligibilityComputationInput): ChatEligibilityResult {
  const reason = resolveEligibilityReason(input);

  return {
    chatId: input.chatId,
    eligible: !reason,
    reason,
    evaluatedAt: toIsoNow(input.evaluatedAt),
  };
}

export function createInitialChatStoreState(): ChatStoreState {
  return {
    threadsById: {},
    threadOrder: [],
    messagesByChatId: {},
    eligibilityByChatId: {},
    lastSyncedAt: null,
  };
}

export function selectOrderedChatThreads(state: ChatStoreState): ChatThread[] {
  return state.threadOrder
    .map((chatId) => state.threadsById[chatId])
    .filter((thread): thread is ChatThread => Boolean(thread));
}

export function selectChatThreadById(state: ChatStoreState, chatId: string): ChatThread | undefined {
  return state.threadsById[chatId];
}

export function selectChatMessagesByChatId(state: ChatStoreState, chatId: string): ChatMessageRecord[] {
  return state.messagesByChatId[chatId] ?? [];
}

export function selectChatEligibilityByChatId(state: ChatStoreState, chatId: string): ChatEligibilityResult | undefined {
  return state.eligibilityByChatId[chatId];
}

export function chatStoreReducer(state: ChatStoreState, action: ChatStoreAction): ChatStoreState {
  switch (action.type) {
    case 'SET_THREADS_SNAPSHOT': {
      const threadsById = buildThreadLookup(action.threads);
      const threadOrder = toUniqueOrderedThreadIds(action.threads);

      return {
        ...state,
        threadsById,
        threadOrder,
        lastSyncedAt: toIsoNow(action.syncedAt),
      };
    }

    case 'SET_MESSAGES_SNAPSHOT': {
      const nextMessages = toOrderedUniqueMessages(action.messages);

      return {
        ...state,
        messagesByChatId: {
          ...state.messagesByChatId,
          [action.chatId]: nextMessages,
        },
        lastSyncedAt: toIsoNow(action.syncedAt),
      };
    }

    case 'UPSERT_MESSAGE': {
      const existingMessages = state.messagesByChatId[action.message.chatId] ?? [];
      const nextMessages = toOrderedUniqueMessages([...existingMessages, action.message]);
      const latestMessage = nextMessages[nextMessages.length - 1];
      const existingThread = state.threadsById[action.message.chatId];

      let nextThreadsById = state.threadsById;
      let nextThreadOrder = state.threadOrder;

      if (existingThread && latestMessage) {
        nextThreadsById = {
          ...state.threadsById,
          [existingThread.chatId]: {
            ...existingThread,
            latestMessage: {
              messageId: latestMessage.messageId,
              text: latestMessage.text,
              sentAt: latestMessage.sentAt,
              deliveryStatus: latestMessage.deliveryStatus,
            },
          },
        };

        nextThreadOrder = toUniqueOrderedThreadIds(Object.values(nextThreadsById));
      }

      return {
        ...state,
        threadsById: nextThreadsById,
        threadOrder: nextThreadOrder,
        messagesByChatId: {
          ...state.messagesByChatId,
          [action.message.chatId]: nextMessages,
        },
        lastSyncedAt: toIsoNow(action.syncedAt),
      };
    }

    case 'SET_ELIGIBILITY_RESULT': {
      return {
        ...state,
        eligibilityByChatId: {
          ...state.eligibilityByChatId,
          [action.result.chatId]: action.result,
        },
        lastSyncedAt: toIsoNow(action.syncedAt),
      };
    }

    case 'RECOMPUTE_ELIGIBILITY': {
      const result = computeChatEligibilityResult(action.input);

      return {
        ...state,
        eligibilityByChatId: {
          ...state.eligibilityByChatId,
          [result.chatId]: result,
        },
        lastSyncedAt: toIsoNow(action.syncedAt ?? result.evaluatedAt),
      };
    }

    case 'RESET_CHAT_STORE': {
      return createInitialChatStoreState();
    }

    default:
      return state;
  }
}