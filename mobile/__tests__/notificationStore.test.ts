import {
  createInitialNotificationStoreState,
  notificationStoreReducer,
  selectNotificationById,
  selectNotifications,
  selectUnreadCount,
  selectVisibleNotificationsByPreferences,
} from '../src/state';

const notificationA = {
  notificationId: 'notification-a',
  userId: 'u-1',
  type: 'message_notification' as const,
  title: 'Message',
  body: 'You got a message',
  read: false,
  createdAt: '2026-03-23T21:00:00.000Z',
  updatedAt: '2026-03-23T21:00:00.000Z',
};

const notificationB = {
  notificationId: 'notification-b',
  userId: 'u-1',
  type: 'safety_notification' as const,
  title: 'Safety',
  body: 'A safety action occurred',
  read: false,
  createdAt: '2026-03-23T21:01:00.000Z',
  updatedAt: '2026-03-23T21:01:00.000Z',
};

describe('notificationStore', () => {
  it('stores snapshot and orders notifications by createdAt desc', () => {
    const state = notificationStoreReducer(createInitialNotificationStoreState(), {
      type: 'SET_NOTIFICATION_SNAPSHOT',
      notifications: [notificationA, notificationB],
      syncedAt: '2026-03-23T21:02:00.000Z',
    });

    expect(selectNotifications(state).map((notification) => notification.notificationId)).toEqual([
      'notification-b',
      'notification-a',
    ]);
    expect(state.lastSyncedAt).toBe('2026-03-23T21:02:00.000Z');
  });

  it('upserts notifications deterministically and keeps latest values', () => {
    const withSnapshot = notificationStoreReducer(createInitialNotificationStoreState(), {
      type: 'SET_NOTIFICATION_SNAPSHOT',
      notifications: [notificationA],
      syncedAt: '2026-03-23T21:03:00.000Z',
    });

    const withUpsert = notificationStoreReducer(withSnapshot, {
      type: 'UPSERT_NOTIFICATION',
      notification: {
        ...notificationA,
        title: 'Updated Message',
        updatedAt: '2026-03-23T21:03:30.000Z',
      },
      syncedAt: '2026-03-23T21:03:30.000Z',
    });

    expect(selectNotificationById(withUpsert, 'notification-a')?.title).toBe('Updated Message');
    expect(selectNotifications(withUpsert)).toHaveLength(1);
  });

  it('marks read state and updates unread count', () => {
    const withSnapshot = notificationStoreReducer(createInitialNotificationStoreState(), {
      type: 'SET_NOTIFICATION_SNAPSHOT',
      notifications: [notificationA, notificationB],
      syncedAt: '2026-03-23T21:04:00.000Z',
    });

    const markedRead = notificationStoreReducer(withSnapshot, {
      type: 'MARK_NOTIFICATION_READ',
      notificationId: 'notification-a',
      readAt: '2026-03-23T21:04:30.000Z',
    });

    expect(selectNotificationById(markedRead, 'notification-a')?.read).toBe(true);
    expect(selectNotificationById(markedRead, 'notification-a')?.readAt).toBe('2026-03-23T21:04:30.000Z');
    expect(selectUnreadCount(markedRead)).toBe(1);
  });

  it('filters visible notifications by category preferences and unread-only mode', () => {
    const withSnapshot = notificationStoreReducer(createInitialNotificationStoreState(), {
      type: 'SET_NOTIFICATION_SNAPSHOT',
      notifications: [
        notificationA,
        {
          ...notificationB,
          read: true,
          readAt: '2026-03-23T21:05:10.000Z',
          updatedAt: '2026-03-23T21:05:10.000Z',
        },
      ],
      syncedAt: '2026-03-23T21:05:00.000Z',
    });

    const withPreferenceUpdate = notificationStoreReducer(withSnapshot, {
      type: 'UPDATE_PREFERENCES',
      preferences: {
        safetyNotifications: false,
      },
      updatedAt: '2026-03-23T21:05:30.000Z',
    });

    expect(selectVisibleNotificationsByPreferences(withPreferenceUpdate).map((notification) => notification.notificationId)).toEqual([
      'notification-a',
    ]);

    expect(
      selectVisibleNotificationsByPreferences(withPreferenceUpdate, {
        unreadOnly: true,
      }).map((notification) => notification.notificationId)
    ).toEqual(['notification-a']);
  });

  it('sets preferences snapshot and resets store state', () => {
    const withPreferences = notificationStoreReducer(createInitialNotificationStoreState('2026-03-23T21:06:00.000Z'), {
      type: 'SET_PREFERENCES',
      preferences: {
        matchNotifications: false,
        messageNotifications: true,
        venueNotifications: false,
        safetyNotifications: true,
        systemNotifications: true,
        updatedAt: '2026-03-23T21:06:30.000Z',
      },
      syncedAt: '2026-03-23T21:06:30.000Z',
    });

    expect(withPreferences.preferences.matchNotifications).toBe(false);
    expect(withPreferences.preferences.venueNotifications).toBe(false);

    const reset = notificationStoreReducer(withPreferences, {
      type: 'RESET_NOTIFICATION_STORE',
    });

    expect(reset.notificationOrder).toEqual([]);
    expect(reset.preferences.matchNotifications).toBe(true);
    expect(reset.preferences.messageNotifications).toBe(true);
  });
});
