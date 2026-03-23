import {
  createInitialChatStoreState,
  createInitialCrossSurfaceEventBusState,
  createInitialDiscoveryFeedStoreState,
  createInitialNotificationStoreState,
  createInitialSafetyStoreState,
  crossSurfaceEventBusReducer,
  projectCrossSurfaceEvent,
  replayCrossSurfaceEvents,
  selectChatEligibilityByChatId,
  selectIsUserBlocked,
  selectNotificationById,
} from '../src/state';

describe('crossSurfaceEventBus', () => {
  it('publishes and deduplicates event log entries deterministically', () => {
    const initial = createInitialCrossSurfaceEventBusState();

    const first = crossSurfaceEventBusReducer(initial, {
      type: 'PUBLISH_EVENT',
      event: {
        eventId: 'evt-1',
        occurredAt: '2026-03-23T22:00:00.000Z',
        type: 'NOTIFICATION_EMITTED',
        payload: {
          notification: {
            notificationId: 'notification-1',
            userId: 'u-1',
            type: 'system_notification',
            title: 'System',
            body: 'Event one',
            read: false,
            createdAt: '2026-03-23T22:00:00.000Z',
            updatedAt: '2026-03-23T22:00:00.000Z',
          },
        },
      },
    });

    const deduped = crossSurfaceEventBusReducer(first, {
      type: 'PUBLISH_EVENT',
      event: {
        eventId: 'evt-1',
        occurredAt: '2026-03-23T22:00:30.000Z',
        type: 'NOTIFICATION_EMITTED',
        payload: {
          notification: {
            notificationId: 'notification-1',
            userId: 'u-1',
            type: 'system_notification',
            title: 'System Updated',
            body: 'Event one update',
            read: false,
            createdAt: '2026-03-23T22:00:30.000Z',
            updatedAt: '2026-03-23T22:00:30.000Z',
          },
        },
      },
    });

    expect(deduped.events).toHaveLength(1);
    expect(deduped.events[0].occurredAt).toBe('2026-03-23T22:00:30.000Z');
    expect(deduped.lastProcessedAt).toBe('2026-03-23T22:00:30.000Z');
  });

  it('projects safety enforcement events across safety, discovery, chat, and notifications', () => {
    const stores = {
      chat: createInitialChatStoreState(),
      safety: createInitialSafetyStoreState(),
      discovery: createInitialDiscoveryFeedStoreState(),
      notifications: createInitialNotificationStoreState('2026-03-23T22:01:00.000Z'),
    };

    const projected = projectCrossSurfaceEvent(stores, {
      eventId: 'evt-safety-1',
      occurredAt: '2026-03-23T22:01:00.000Z',
      type: 'SAFETY_ENFORCEMENT',
      payload: {
        enforcementEvent: {
          eventId: 'enf-1',
          action: 'block_applied',
          actorUserId: 'u-1',
          targetUserId: 'u-2',
          occurredAt: '2026-03-23T22:01:00.000Z',
          chatAccessRevoked: true,
          discoveryVisibilityRevoked: true,
        },
        chatContext: {
          chatId: 'chat-u-1-u-2',
          requiredVenueId: 'v-halo-club',
          matchStatus: 'matched',
          chatStatus: 'active',
          viewerSessionVenueId: 'v-halo-club',
          counterpartSessionVenueId: 'v-halo-club',
        },
      },
    });

    expect(selectIsUserBlocked(projected.safety, 'u-2')).toBe(true);
    expect(projected.discovery.filters.excludedUserIds).toContain('u-2');
    expect(selectChatEligibilityByChatId(projected.chat, 'chat-u-1-u-2')?.reason).toBe('blocked');
    expect(selectNotificationById(projected.notifications, 'notification-enf-1')?.type).toBe('safety_notification');
  });

  it('projects match status changes to chat eligibility transitions', () => {
    const stores = {
      chat: createInitialChatStoreState(),
      safety: createInitialSafetyStoreState(),
      discovery: createInitialDiscoveryFeedStoreState(),
      notifications: createInitialNotificationStoreState('2026-03-23T22:02:00.000Z'),
    };

    const projected = projectCrossSurfaceEvent(stores, {
      eventId: 'evt-match-1',
      occurredAt: '2026-03-23T22:02:00.000Z',
      type: 'MATCH_STATUS_CHANGED',
      payload: {
        chatId: 'chat-u-1-u-3',
        requiredVenueId: 'v-halo-club',
        matchStatus: 'expired',
        chatStatus: 'expired',
        viewerSessionVenueId: 'v-halo-club',
        counterpartSessionVenueId: 'v-halo-club',
        hasActiveBlock: false,
        hasModerationAction: false,
      },
    });

    expect(selectChatEligibilityByChatId(projected.chat, 'chat-u-1-u-3')?.reason).toBe('match_expired');
  });

  it('replays event sequence to propagate notification and safety outcomes', () => {
    const stores = {
      chat: createInitialChatStoreState(),
      safety: createInitialSafetyStoreState(),
      discovery: createInitialDiscoveryFeedStoreState(),
      notifications: createInitialNotificationStoreState('2026-03-23T22:03:00.000Z'),
    };

    const replayed = replayCrossSurfaceEvents(stores, [
      {
        eventId: 'evt-notification-1',
        occurredAt: '2026-03-23T22:03:00.000Z',
        type: 'NOTIFICATION_EMITTED',
        payload: {
          notification: {
            notificationId: 'notification-custom-1',
            userId: 'u-1',
            type: 'message_notification',
            title: 'Message',
            body: 'A new message arrived',
            read: false,
            createdAt: '2026-03-23T22:03:00.000Z',
            updatedAt: '2026-03-23T22:03:00.000Z',
          },
        },
      },
      {
        eventId: 'evt-safety-2',
        occurredAt: '2026-03-23T22:03:30.000Z',
        type: 'SAFETY_ENFORCEMENT',
        payload: {
          enforcementEvent: {
            eventId: 'enf-2',
            action: 'report_submitted',
            actorUserId: 'u-1',
            targetUserId: 'u-9',
            occurredAt: '2026-03-23T22:03:30.000Z',
            chatAccessRevoked: true,
            discoveryVisibilityRevoked: true,
            relatedReportId: 'report-2',
          },
        },
      },
    ]);

    expect(selectNotificationById(replayed.notifications, 'notification-custom-1')).toBeTruthy();
    expect(selectNotificationById(replayed.notifications, 'notification-enf-2')).toBeTruthy();
    expect(replayed.discovery.filters.excludedUserIds).toContain('u-9');
    expect(selectIsUserBlocked(replayed.safety, 'u-9')).toBe(false);
    expect(replayed.safety.reportsById['report-2']).toBeTruthy();
  });
});
