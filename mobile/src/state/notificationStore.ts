import { NotificationPreferences, NotificationRecord } from '../contracts';

export type NotificationStoreState = {
  notificationsById: Record<string, NotificationRecord>;
  notificationOrder: string[];
  preferences: NotificationPreferences;
  lastSyncedAt: string | null;
};

export type NotificationStoreAction =
  | {
      type: 'SET_NOTIFICATION_SNAPSHOT';
      notifications: NotificationRecord[];
      syncedAt?: string;
    }
  | {
      type: 'UPSERT_NOTIFICATION';
      notification: NotificationRecord;
      syncedAt?: string;
    }
  | {
      type: 'MARK_NOTIFICATION_READ';
      notificationId: string;
      readAt?: string;
    }
  | {
      type: 'SET_PREFERENCES';
      preferences: NotificationPreferences;
      syncedAt?: string;
    }
  | {
      type: 'UPDATE_PREFERENCES';
      preferences: Partial<Omit<NotificationPreferences, 'updatedAt'>>;
      updatedAt?: string;
    }
  | {
      type: 'RESET_NOTIFICATION_STORE';
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

function buildNotificationById(notifications: NotificationRecord[]) {
  return notifications.reduce<Record<string, NotificationRecord>>((accumulator, notification) => {
    accumulator[notification.notificationId] = notification;
    return accumulator;
  }, {});
}

function toNotificationOrder(notificationsById: Record<string, NotificationRecord>) {
  return Object.values(notificationsById)
    .sort((left, right) => {
      const rightTime = toMillis(right.createdAt);
      const leftTime = toMillis(left.createdAt);

      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }

      return right.notificationId.localeCompare(left.notificationId);
    })
    .map((notification) => notification.notificationId);
}

function toDefaultPreferences(now?: string): NotificationPreferences {
  return {
    matchNotifications: true,
    messageNotifications: true,
    venueNotifications: true,
    safetyNotifications: true,
    systemNotifications: true,
    updatedAt: toIsoNow(now),
  };
}

function isNotificationTypeEnabled(preferences: NotificationPreferences, type: NotificationRecord['type']) {
  const preferenceByType: Record<NotificationRecord['type'], keyof NotificationPreferences> = {
    match_notification: 'matchNotifications',
    message_notification: 'messageNotifications',
    venue_activity_notification: 'venueNotifications',
    safety_notification: 'safetyNotifications',
    system_notification: 'systemNotifications',
  };

  return preferences[preferenceByType[type]];
}

export function createInitialNotificationStoreState(now?: string): NotificationStoreState {
  return {
    notificationsById: {},
    notificationOrder: [],
    preferences: toDefaultPreferences(now),
    lastSyncedAt: null,
  };
}

export function selectNotifications(state: NotificationStoreState): NotificationRecord[] {
  return state.notificationOrder
    .map((notificationId) => state.notificationsById[notificationId])
    .filter((notification): notification is NotificationRecord => Boolean(notification));
}

export function selectVisibleNotificationsByPreferences(
  state: NotificationStoreState,
  options?: {
    unreadOnly?: boolean;
  }
): NotificationRecord[] {
  return selectNotifications(state).filter((notification) => {
    if (!isNotificationTypeEnabled(state.preferences, notification.type)) {
      return false;
    }

    if (options?.unreadOnly && notification.read) {
      return false;
    }

    return true;
  });
}

export function selectNotificationById(state: NotificationStoreState, notificationId: string): NotificationRecord | undefined {
  return state.notificationsById[notificationId];
}

export function selectUnreadCount(state: NotificationStoreState): number {
  return selectNotifications(state).filter((notification) => !notification.read).length;
}

export function notificationStoreReducer(
  state: NotificationStoreState,
  action: NotificationStoreAction
): NotificationStoreState {
  switch (action.type) {
    case 'SET_NOTIFICATION_SNAPSHOT': {
      const notificationsById = buildNotificationById(action.notifications);

      return {
        ...state,
        notificationsById,
        notificationOrder: toNotificationOrder(notificationsById),
        lastSyncedAt: toIsoNow(action.syncedAt),
      };
    }

    case 'UPSERT_NOTIFICATION': {
      const notificationsById = {
        ...state.notificationsById,
        [action.notification.notificationId]: action.notification,
      };

      return {
        ...state,
        notificationsById,
        notificationOrder: toNotificationOrder(notificationsById),
        lastSyncedAt: toIsoNow(action.syncedAt),
      };
    }

    case 'MARK_NOTIFICATION_READ': {
      const notification = state.notificationsById[action.notificationId];
      if (!notification) {
        return state;
      }

      const readAt = toIsoNow(action.readAt);
      const updatedNotification: NotificationRecord = {
        ...notification,
        read: true,
        readAt,
        updatedAt: readAt,
      };

      return {
        ...state,
        notificationsById: {
          ...state.notificationsById,
          [action.notificationId]: updatedNotification,
        },
        lastSyncedAt: readAt,
      };
    }

    case 'SET_PREFERENCES': {
      return {
        ...state,
        preferences: action.preferences,
        lastSyncedAt: toIsoNow(action.syncedAt),
      };
    }

    case 'UPDATE_PREFERENCES': {
      const updatedAt = toIsoNow(action.updatedAt);
      return {
        ...state,
        preferences: {
          ...state.preferences,
          ...action.preferences,
          updatedAt,
        },
        lastSyncedAt: updatedAt,
      };
    }

    case 'RESET_NOTIFICATION_STORE': {
      return createInitialNotificationStoreState();
    }

    default:
      return state;
  }
}
