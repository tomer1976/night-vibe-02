import { InteractionRequest, InteractionResult } from '../contracts';

export type InteractionQueueActionType = 'LIKE' | 'PASS';

export type InteractionQueueOutcome = 'created' | 'idempotent_replay' | 'duplicate' | 'failure';

export type InteractionQueueEntry = {
  queueKey: string;
  targetUserId: string;
  venueId: string;
  action: InteractionQueueActionType;
  idempotencyKey?: string;
  status: 'in_flight' | 'completed';
  outcome?: InteractionQueueOutcome;
  errorCode?: string;
  updatedAt: string;
};

export type InteractionQueueStoreState = {
  entriesByQueueKey: Record<string, InteractionQueueEntry>;
};

export type InteractionQueueStoreAction =
  | {
      type: 'BEGIN_INTERACTION';
      request: InteractionRequest;
      action: InteractionQueueActionType;
      now?: string;
    }
  | {
      type: 'COMPLETE_INTERACTION';
      request: InteractionRequest;
      action: InteractionQueueActionType;
      outcome: InteractionQueueOutcome;
      result?: InteractionResult;
      errorCode?: string;
      now?: string;
    }
  | {
      type: 'RESET_QUEUE';
    };

function createNow(now?: string) {
  return now ?? new Date().toISOString();
}

export function createInteractionQueueKey(input: {
  targetUserId: string;
  venueId: string;
  action: InteractionQueueActionType;
}) {
  return `${input.action}:${input.venueId}:${input.targetUserId}`;
}

export function createInitialInteractionQueueStoreState(): InteractionQueueStoreState {
  return {
    entriesByQueueKey: {},
  };
}

export function selectInteractionQueueEntry(
  state: InteractionQueueStoreState,
  input: {
    targetUserId: string;
    venueId: string;
    action: InteractionQueueActionType;
  }
) {
  const queueKey = createInteractionQueueKey(input);
  return state.entriesByQueueKey[queueKey];
}

export function selectCanSubmitInteraction(
  state: InteractionQueueStoreState,
  request: InteractionRequest,
  action: InteractionQueueActionType
) {
  const entry = selectInteractionQueueEntry(state, {
    targetUserId: request.targetUserId,
    venueId: request.venueId,
    action,
  });

  if (!entry) {
    return true;
  }

  if (entry.status === 'in_flight') {
    return false;
  }

  return entry.outcome === 'failure';
}

export function interactionQueueStoreReducer(
  state: InteractionQueueStoreState,
  action: InteractionQueueStoreAction
): InteractionQueueStoreState {
  switch (action.type) {
    case 'BEGIN_INTERACTION': {
      const queueKey = createInteractionQueueKey({
        targetUserId: action.request.targetUserId,
        venueId: action.request.venueId,
        action: action.action,
      });

      const nextEntry: InteractionQueueEntry = {
        queueKey,
        targetUserId: action.request.targetUserId,
        venueId: action.request.venueId,
        action: action.action,
        idempotencyKey: action.request.idempotencyKey,
        status: 'in_flight',
        updatedAt: createNow(action.now),
      };

      return {
        ...state,
        entriesByQueueKey: {
          ...state.entriesByQueueKey,
          [queueKey]: nextEntry,
        },
      };
    }

    case 'COMPLETE_INTERACTION': {
      const queueKey = createInteractionQueueKey({
        targetUserId: action.request.targetUserId,
        venueId: action.request.venueId,
        action: action.action,
      });

      const previousEntry = state.entriesByQueueKey[queueKey];

      const nextEntry: InteractionQueueEntry = {
        queueKey,
        targetUserId: action.request.targetUserId,
        venueId: action.request.venueId,
        action: action.action,
        idempotencyKey: action.result?.idempotencyKey ?? action.request.idempotencyKey ?? previousEntry?.idempotencyKey,
        status: 'completed',
        outcome: action.outcome,
        errorCode: action.errorCode,
        updatedAt: createNow(action.now),
      };

      return {
        ...state,
        entriesByQueueKey: {
          ...state.entriesByQueueKey,
          [queueKey]: nextEntry,
        },
      };
    }

    case 'RESET_QUEUE': {
      if (Object.keys(state.entriesByQueueKey).length === 0) {
        return state;
      }

      return createInitialInteractionQueueStoreState();
    }

    default:
      return state;
  }
}