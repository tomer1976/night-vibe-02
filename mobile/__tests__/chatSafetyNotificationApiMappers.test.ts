import {
  API_V1_CHAT_ENDPOINTS,
  API_V1_NOTIFICATION_ENDPOINTS,
  API_V1_SAFETY_ENDPOINTS,
  mapChatEligibilityResponseFromApiV1,
  mapChatMessageLifecycleResponseFromApiV1,
  mapChatSendMessageRequestToApiV1,
  mapChatSendMessageResponseFromApiV1,
  mapNotificationListRequestToApiV1,
  mapNotificationListResponseFromApiV1,
  mapNotificationPreferencesFromApiV1,
  mapNotificationPreferencesUpdateToApiV1,
  mapNotificationPublishRequestToApiV1,
  mapNotificationPublishResponseFromApiV1,
  mapSafetyBlockRequestToApiV1,
  mapSafetyReportRequestToApiV1,
  mapSafetyReportResponseFromApiV1,
} from '../src/contracts';

describe('chat, safety, and notification api v1 placeholder mappers', () => {
  it('maps chat payloads between app and api contracts', () => {
    expect(
      mapChatSendMessageRequestToApiV1({
        chatId: 'chat_1',
        messageText: 'hello',
      })
    ).toEqual({
      chat_id: 'chat_1',
      message_text: 'hello',
    });

    expect(
      mapChatSendMessageResponseFromApiV1({
        chat_id: 'chat_1',
        message_id: 'msg_1',
        status: 'sent',
        sent_at: '2026-03-22T10:00:00.000Z',
      })
    ).toEqual({
      chatId: 'chat_1',
      messageId: 'msg_1',
      status: 'sent',
      sentAt: '2026-03-22T10:00:00.000Z',
    });

    expect(
      mapChatEligibilityResponseFromApiV1({
        chat_id: 'chat_1',
        eligible: false,
        reason: 'match_expired',
        evaluated_at: '2026-03-22T10:01:00.000Z',
      })
    ).toEqual({
      chatId: 'chat_1',
      eligible: false,
      reason: 'match_expired',
      evaluatedAt: '2026-03-22T10:01:00.000Z',
    });

    expect(
      mapChatMessageLifecycleResponseFromApiV1({
        chat_id: 'chat_1',
        message_id: 'msg_1',
        status: 'read',
        updated_at: '2026-03-22T10:02:00.000Z',
      })
    ).toEqual({
      chatId: 'chat_1',
      messageId: 'msg_1',
      status: 'read',
      updatedAt: '2026-03-22T10:02:00.000Z',
    });
  });

  it('maps safety block and report payloads between app and api contracts', () => {
    expect(mapSafetyBlockRequestToApiV1('u_7')).toEqual({
      target_user_id: 'u_7',
    });

    expect(mapSafetyReportRequestToApiV1('u_8', 'spam')).toEqual({
      target_user_id: 'u_8',
      reason: 'spam',
    });

    expect(
      mapSafetyReportResponseFromApiV1({
        report_id: 'r_1',
        reporter_user_id: 'u_me',
        reported_user_id: 'u_8',
        status: 'pending',
      })
    ).toEqual({
      reportId: 'r_1',
      reporterId: 'u_me',
      reportedUserId: 'u_8',
      status: 'pending',
    });
  });

  it('maps notification payloads between app and api contracts', () => {
    expect(mapNotificationListRequestToApiV1()).toEqual({});

    expect(
      mapNotificationListRequestToApiV1({
        cursor: 'cursor_1',
        pageSize: 25,
        unreadOnly: true,
      })
    ).toEqual({
      cursor: 'cursor_1',
      page_size: 25,
      unread_only: true,
    });

    expect(
      mapNotificationListResponseFromApiV1({
        items: [
          {
            notification_id: 'n_1',
            user_id: 'u_me',
            type: 'message_notification',
            title: 'New message',
            body: 'You got a message',
            event_id: 'event_1',
            event_type: 'message.sent',
            dedup_key: 'u_me+message.sent+event_1',
            read: false,
            created_at: '2026-03-22T10:03:00.000Z',
            updated_at: '2026-03-22T10:03:00.000Z',
          },
        ],
        next_cursor: 'cursor_2',
      })
    ).toEqual({
      items: [
        {
          notificationId: 'n_1',
          userId: 'u_me',
          type: 'message_notification',
          title: 'New message',
          body: 'You got a message',
          eventId: 'event_1',
          eventType: 'message.sent',
          dedupKey: 'u_me+message.sent+event_1',
          read: false,
          readAt: undefined,
          createdAt: '2026-03-22T10:03:00.000Z',
          updatedAt: '2026-03-22T10:03:00.000Z',
        },
      ],
      nextCursor: 'cursor_2',
    });

    expect(
      mapNotificationPreferencesFromApiV1({
        match_notifications: true,
        message_notifications: true,
        venue_notifications: false,
        safety_notifications: true,
        system_notifications: false,
        updated_at: '2026-03-22T10:05:00.000Z',
      })
    ).toEqual({
      matchNotifications: true,
      messageNotifications: true,
      venueNotifications: false,
      safetyNotifications: true,
      systemNotifications: false,
      updatedAt: '2026-03-22T10:05:00.000Z',
    });

    expect(
      mapNotificationPreferencesUpdateToApiV1({
        messageNotifications: false,
        safetyNotifications: true,
      })
    ).toEqual({
      message_notifications: false,
      safety_notifications: true,
    });

    expect(
      mapNotificationPublishRequestToApiV1({
        type: 'safety_notification',
        title: 'Safety update',
        body: 'A report was filed',
        eventId: 'event_2',
        eventType: 'safety.report',
      })
    ).toEqual({
      type: 'safety_notification',
      title: 'Safety update',
      body: 'A report was filed',
      event_id: 'event_2',
      event_type: 'safety.report',
    });

    expect(
      mapNotificationPublishResponseFromApiV1({
        outcome: 'created',
        notification_id: 'n_2',
        dedup_key: 'u_me+safety.report+event_2',
        occurred_at: '2026-03-22T10:06:00.000Z',
      })
    ).toEqual({
      outcome: 'created',
      notificationId: 'n_2',
      dedupKey: 'u_me+safety.report+event_2',
      occurredAt: '2026-03-22T10:06:00.000Z',
    });
  });

  it('exposes stable endpoint constants for future adapter wiring', () => {
    expect(API_V1_CHAT_ENDPOINTS).toEqual({
      threads: '/api/v1/chat/threads',
      eligibility: '/api/v1/chat/eligibility',
      messages: '/api/v1/chat/messages',
      send: '/api/v1/chat/send',
      markDelivered: '/api/v1/chat/messages/delivered',
      markRead: '/api/v1/chat/messages/read',
      typing: '/api/v1/chat/typing',
    });

    expect(API_V1_SAFETY_ENDPOINTS).toEqual({
      block: '/api/v1/safety/block',
      report: '/api/v1/safety/report',
    });

    expect(API_V1_NOTIFICATION_ENDPOINTS).toEqual({
      list: '/api/v1/notifications',
      markRead: '/api/v1/notifications/read',
      preferences: '/api/v1/notifications/preferences',
      dedupConfig: '/api/v1/notifications/dedup-config',
      publish: '/api/v1/notifications/publish',
    });
  });
});
