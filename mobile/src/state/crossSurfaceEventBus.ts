import { NotificationRecord, SafetyEnforcementEvent } from '../contracts';
import { ChatStoreState, chatStoreReducer } from './chatStore';
import { DiscoveryFeedStoreState, discoveryFeedStoreReducer } from './discoveryFeedStore';
import { NotificationStoreState, notificationStoreReducer } from './notificationStore';
import { SafetyStoreState, safetyStoreReducer } from './safetyStore';

export type CrossSurfaceStores = {
  chat: ChatStoreState;
  safety: SafetyStoreState;
  discovery: DiscoveryFeedStoreState;
  notifications: NotificationStoreState;
};

export type SafetyEnforcementCrossSurfacePayload = {
  enforcementEvent: SafetyEnforcementEvent;
  chatContext?: {
    chatId: string;
    requiredVenueId: string;
    matchStatus?: 'matched' | 'expired' | 'blocked';
    chatStatus?: 'active' | 'expired' | 'blocked';
    viewerSessionVenueId?: string | null;
    counterpartSessionVenueId?: string | null;
    hasModerationAction?: boolean;
  };
};

export type MatchStatusChangedCrossSurfacePayload = {
  chatId: string;
  requiredVenueId: string;
  matchStatus: 'matched' | 'expired' | 'blocked';
  chatStatus: 'active' | 'expired' | 'blocked';
  viewerSessionVenueId?: string | null;
  counterpartSessionVenueId?: string | null;
  hasActiveBlock: boolean;
  hasModerationAction: boolean;
};

export type NotificationEmittedCrossSurfacePayload = {
  notification: NotificationRecord;
};

export type CrossSurfaceEvent =
  | {
      eventId: string;
      occurredAt: string;
      type: 'SAFETY_ENFORCEMENT';
      payload: SafetyEnforcementCrossSurfacePayload;
    }
  | {
      eventId: string;
      occurredAt: string;
      type: 'MATCH_STATUS_CHANGED';
      payload: MatchStatusChangedCrossSurfacePayload;
    }
  | {
      eventId: string;
      occurredAt: string;
      type: 'NOTIFICATION_EMITTED';
      payload: NotificationEmittedCrossSurfacePayload;
    };

export type CrossSurfaceEventBusState = {
  events: CrossSurfaceEvent[];
  lastProcessedAt: string | null;
};

export type CrossSurfaceEventBusAction =
  | {
      type: 'PUBLISH_EVENT';
      event: CrossSurfaceEvent;
    }
  | {
      type: 'REPLAY_EVENTS';
      events: CrossSurfaceEvent[];
    }
  | {
      type: 'RESET_EVENT_BUS';
    };

function toMillis(instant?: string | null) {
  if (!instant) {
    return Number.NaN;
  }

  return new Date(instant).getTime();
}

function mergeEventLog(events: CrossSurfaceEvent[], event: CrossSurfaceEvent): CrossSurfaceEvent[] {
  const existingIndex = events.findIndex((candidate) => candidate.eventId === event.eventId);
  const nextEvents = [...events];

  if (existingIndex >= 0) {
    nextEvents[existingIndex] = event;
  } else {
    nextEvents.push(event);
  }

  return nextEvents.sort((left, right) => {
    const leftTime = toMillis(left.occurredAt);
    const rightTime = toMillis(right.occurredAt);

    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }

    return left.eventId.localeCompare(right.eventId);
  });
}

function appendExcludedUser(discovery: DiscoveryFeedStoreState, userId: string) {
  const nextExcludedUserIds = discovery.filters.excludedUserIds.includes(userId)
    ? discovery.filters.excludedUserIds
    : [...discovery.filters.excludedUserIds, userId];

  return discoveryFeedStoreReducer(discovery, {
    type: 'SET_FILTERS',
    filters: {
      excludedUserIds: nextExcludedUserIds,
    },
  });
}

function toSafetyNotification(event: SafetyEnforcementEvent): NotificationRecord {
  return {
    notificationId: `notification-${event.eventId}`,
    userId: event.actorUserId,
    type: 'safety_notification',
    title: event.action === 'block_applied' ? 'User blocked' : 'Safety report submitted',
    body:
      event.action === 'block_applied'
        ? 'Chat and discovery visibility were updated immediately.'
        : 'Your report was submitted and is pending moderation review.',
    eventId: event.eventId,
    eventType: event.action,
    dedupKey: `${event.actorUserId}+${event.action}+${event.targetUserId}`,
    read: false,
    createdAt: event.occurredAt,
    updatedAt: event.occurredAt,
  };
}

function applySafetyEnforcementEvent(stores: CrossSurfaceStores, event: CrossSurfaceEvent & { type: 'SAFETY_ENFORCEMENT' }): CrossSurfaceStores {
  const enforcementEvent = event.payload.enforcementEvent;

  let nextStores: CrossSurfaceStores = {
    ...stores,
    safety: safetyStoreReducer(stores.safety, {
      type: 'APPLY_ENFORCEMENT_EVENT',
      event: enforcementEvent,
    }),
    discovery: appendExcludedUser(stores.discovery, enforcementEvent.targetUserId),
    notifications: notificationStoreReducer(stores.notifications, {
      type: 'UPSERT_NOTIFICATION',
      notification: toSafetyNotification(enforcementEvent),
      syncedAt: event.occurredAt,
    }),
  };

  const chatContext = event.payload.chatContext;
  if (!chatContext) {
    return nextStores;
  }

  nextStores = {
    ...nextStores,
    chat: chatStoreReducer(nextStores.chat, {
      type: 'RECOMPUTE_ELIGIBILITY',
      input: {
        chatId: chatContext.chatId,
        requiredVenueId: chatContext.requiredVenueId,
        matchStatus: chatContext.matchStatus ?? 'blocked',
        chatStatus: chatContext.chatStatus ?? 'blocked',
        viewerSessionVenueId: chatContext.viewerSessionVenueId,
        counterpartSessionVenueId: chatContext.counterpartSessionVenueId,
        hasActiveBlock: enforcementEvent.action === 'block_applied',
        hasModerationAction: chatContext.hasModerationAction ?? false,
        evaluatedAt: event.occurredAt,
      },
      syncedAt: event.occurredAt,
    }),
  };

  return nextStores;
}

function applyMatchStatusChangedEvent(stores: CrossSurfaceStores, event: CrossSurfaceEvent & { type: 'MATCH_STATUS_CHANGED' }): CrossSurfaceStores {
  const input = event.payload;

  return {
    ...stores,
    chat: chatStoreReducer(stores.chat, {
      type: 'RECOMPUTE_ELIGIBILITY',
      input: {
        chatId: input.chatId,
        requiredVenueId: input.requiredVenueId,
        matchStatus: input.matchStatus,
        chatStatus: input.chatStatus,
        viewerSessionVenueId: input.viewerSessionVenueId,
        counterpartSessionVenueId: input.counterpartSessionVenueId,
        hasActiveBlock: input.hasActiveBlock,
        hasModerationAction: input.hasModerationAction,
        evaluatedAt: event.occurredAt,
      },
      syncedAt: event.occurredAt,
    }),
  };
}

function applyNotificationEmittedEvent(stores: CrossSurfaceStores, event: CrossSurfaceEvent & { type: 'NOTIFICATION_EMITTED' }): CrossSurfaceStores {
  return {
    ...stores,
    notifications: notificationStoreReducer(stores.notifications, {
      type: 'UPSERT_NOTIFICATION',
      notification: event.payload.notification,
      syncedAt: event.occurredAt,
    }),
  };
}

export function createInitialCrossSurfaceEventBusState(): CrossSurfaceEventBusState {
  return {
    events: [],
    lastProcessedAt: null,
  };
}

export function crossSurfaceEventBusReducer(
  state: CrossSurfaceEventBusState,
  action: CrossSurfaceEventBusAction
): CrossSurfaceEventBusState {
  switch (action.type) {
    case 'PUBLISH_EVENT': {
      return {
        events: mergeEventLog(state.events, action.event),
        lastProcessedAt: action.event.occurredAt,
      };
    }

    case 'REPLAY_EVENTS': {
      let nextState = state;

      for (const event of action.events) {
        nextState = crossSurfaceEventBusReducer(nextState, {
          type: 'PUBLISH_EVENT',
          event,
        });
      }

      return nextState;
    }

    case 'RESET_EVENT_BUS': {
      return createInitialCrossSurfaceEventBusState();
    }

    default:
      return state;
  }
}

export function projectCrossSurfaceEvent(stores: CrossSurfaceStores, event: CrossSurfaceEvent): CrossSurfaceStores {
  switch (event.type) {
    case 'SAFETY_ENFORCEMENT': {
      return applySafetyEnforcementEvent(stores, event);
    }

    case 'MATCH_STATUS_CHANGED': {
      return applyMatchStatusChangedEvent(stores, event);
    }

    case 'NOTIFICATION_EMITTED': {
      return applyNotificationEmittedEvent(stores, event);
    }

    default:
      return stores;
  }
}

export function replayCrossSurfaceEvents(stores: CrossSurfaceStores, events: CrossSurfaceEvent[]): CrossSurfaceStores {
  let nextStores = stores;

  for (const event of events) {
    nextStores = projectCrossSurfaceEvent(nextStores, event);
  }

  return nextStores;
}
