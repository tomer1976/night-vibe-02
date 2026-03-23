import { createMockBackendServiceLocator } from '../src/services';

describe('notification service contract', () => {
  it('supports notification preferences and read-state transitions', async () => {
    const locator = createMockBackendServiceLocator();

    const publishResponse = await locator.services.notifications.publishInAppNotification({
      type: 'message_notification',
      title: 'New message',
      body: 'You received a new message.',
      eventId: 'evt-1',
      eventType: 'MESSAGE_SENT',
    });

    expect(publishResponse.status).toBe('SUCCESS');
    if (publishResponse.status !== 'SUCCESS') {
      throw new Error('Expected successful publish response.');
    }

    expect(publishResponse.data.outcome).toBe('created');
    expect(publishResponse.data.notificationId).toBeTruthy();

    const listResponse = await locator.services.notifications.listNotifications({ pageSize: 10 });
    expect(listResponse.status).toBe('SUCCESS');
    if (listResponse.status !== 'SUCCESS') {
      throw new Error('Expected successful list response.');
    }

    expect(listResponse.data.items).toHaveLength(1);

    const [notification] = listResponse.data.items;
    const readResponse = await locator.services.notifications.markNotificationRead(notification.notificationId);
    expect(readResponse.status).toBe('SUCCESS');
    if (readResponse.status !== 'SUCCESS') {
      throw new Error('Expected successful mark-read response.');
    }

    expect(readResponse.data.read).toBe(true);
    expect(readResponse.data.readAt).toBeTruthy();

    const getPreferencesResponse = await locator.services.notifications.getNotificationPreferences();
    expect(getPreferencesResponse.status).toBe('SUCCESS');

    const updatePreferencesResponse = await locator.services.notifications.updateNotificationPreferences({
      messageNotifications: false,
    });
    expect(updatePreferencesResponse.status).toBe('SUCCESS');
    if (updatePreferencesResponse.status !== 'SUCCESS') {
      throw new Error('Expected successful update preferences response.');
    }

    expect(updatePreferencesResponse.data.messageNotifications).toBe(false);
  });

  it('suppresses duplicate events in dedup window and enforces per-minute rate cap', async () => {
    const locator = createMockBackendServiceLocator();

    const firstPublish = await locator.services.notifications.publishInAppNotification({
      type: 'message_notification',
      title: 'New message',
      body: 'You received a new message.',
      eventId: 'evt-dedup',
      eventType: 'MESSAGE_SENT',
    });

    expect(firstPublish.status).toBe('SUCCESS');
    if (firstPublish.status !== 'SUCCESS') {
      throw new Error('Expected successful publish response.');
    }

    expect(firstPublish.data.outcome).toBe('created');

    const duplicatePublish = await locator.services.notifications.publishInAppNotification({
      type: 'message_notification',
      title: 'New message',
      body: 'You received a new message.',
      eventId: 'evt-dedup',
      eventType: 'MESSAGE_SENT',
    });

    expect(duplicatePublish.status).toBe('SUCCESS');
    if (duplicatePublish.status !== 'SUCCESS') {
      throw new Error('Expected successful duplicate publish response.');
    }

    expect(duplicatePublish.data.outcome).toBe('suppressed_deduplicated');

    for (let index = 0; index < 19; index += 1) {
      const publish = await locator.services.notifications.publishInAppNotification({
        type: 'message_notification',
        title: `Message ${index}`,
        body: 'rate limit fill',
        eventId: `evt-fill-${index}`,
        eventType: 'MESSAGE_SENT',
      });

      expect(publish.status).toBe('SUCCESS');
      if (publish.status !== 'SUCCESS') {
        throw new Error('Expected successful publish while filling rate limit bucket.');
      }
    }

    const rateLimitedPublish = await locator.services.notifications.publishInAppNotification({
      type: 'message_notification',
      title: 'Rate-limited message',
      body: 'should be suppressed',
      eventId: 'evt-rate-limited',
      eventType: 'MESSAGE_SENT',
    });

    expect(rateLimitedPublish.status).toBe('SUCCESS');
    if (rateLimitedPublish.status !== 'SUCCESS') {
      throw new Error('Expected successful response even when rate-limited.');
    }

    expect(rateLimitedPublish.data.outcome).toBe('suppressed_rate_limited');
  });

  it('suppresses message notifications when message preference is disabled and keeps other categories enabled', async () => {
    const locator = createMockBackendServiceLocator();

    const updatePreferencesResponse = await locator.services.notifications.updateNotificationPreferences({
      messageNotifications: false,
    });

    expect(updatePreferencesResponse.status).toBe('SUCCESS');
    if (updatePreferencesResponse.status !== 'SUCCESS') {
      throw new Error('Expected successful update preferences response.');
    }

    expect(updatePreferencesResponse.data.messageNotifications).toBe(false);
    expect(updatePreferencesResponse.data.safetyNotifications).toBe(true);

    const suppressedMessagePublish = await locator.services.notifications.publishInAppNotification({
      type: 'message_notification',
      title: 'Message should be filtered',
      body: 'This should not be created.',
      eventId: 'evt-pref-filter-message',
      eventType: 'MESSAGE_SENT',
    });

    expect(suppressedMessagePublish.status).toBe('SUCCESS');
    if (suppressedMessagePublish.status !== 'SUCCESS') {
      throw new Error('Expected successful preference-filtered message publish response.');
    }

    expect(suppressedMessagePublish.data.outcome).toBe('suppressed_preference_filtered');

    const allowedSafetyPublish = await locator.services.notifications.publishInAppNotification({
      type: 'safety_notification',
      title: 'Safety update',
      body: 'This should still be delivered.',
      eventId: 'evt-pref-filter-safety',
      eventType: 'SAFETY_REPORT',
    });

    expect(allowedSafetyPublish.status).toBe('SUCCESS');
    if (allowedSafetyPublish.status !== 'SUCCESS') {
      throw new Error('Expected successful safety publish response.');
    }

    expect(allowedSafetyPublish.data.outcome).toBe('created');

    const listResponse = await locator.services.notifications.listNotifications({ pageSize: 10 });
    expect(listResponse.status).toBe('SUCCESS');
    if (listResponse.status !== 'SUCCESS') {
      throw new Error('Expected successful list response.');
    }

    expect(listResponse.data.items).toHaveLength(1);
    expect(listResponse.data.items[0].type).toBe('safety_notification');
  });

  it('allows same event publication again after dedup window elapses', async () => {
    const locator = createMockBackendServiceLocator();

    const dedupConfigResponse = await locator.services.notifications.getDedupWindowConfig();
    expect(dedupConfigResponse.status).toBe('SUCCESS');
    if (dedupConfigResponse.status !== 'SUCCESS') {
      throw new Error('Expected successful dedup config response.');
    }

    expect(dedupConfigResponse.data.dedupWindowSeconds).toBeGreaterThan(0);
    expect(dedupConfigResponse.data.maxNotificationsPerMinute).toBeGreaterThan(0);

    const firstPublish = await locator.services.notifications.publishInAppNotification({
      type: 'message_notification',
      title: 'First publish',
      body: 'Created before dedup timeout.',
      eventId: 'evt-dedup-expiry',
      eventType: 'MESSAGE_SENT',
    });

    expect(firstPublish.status).toBe('SUCCESS');
    if (firstPublish.status !== 'SUCCESS') {
      throw new Error('Expected first publish to succeed.');
    }

    expect(firstPublish.data.outcome).toBe('created');

    const duplicateWithinWindow = await locator.services.notifications.publishInAppNotification({
      type: 'message_notification',
      title: 'Duplicate publish',
      body: 'Suppressed in dedup window.',
      eventId: 'evt-dedup-expiry',
      eventType: 'MESSAGE_SENT',
    });

    expect(duplicateWithinWindow.status).toBe('SUCCESS');
    if (duplicateWithinWindow.status !== 'SUCCESS') {
      throw new Error('Expected duplicate publish response to succeed.');
    }

    expect(duplicateWithinWindow.data.outcome).toBe('suppressed_deduplicated');

    locator.clock.advanceBy(dedupConfigResponse.data.dedupWindowSeconds * 1000 + 1_000);

    const publishAfterWindow = await locator.services.notifications.publishInAppNotification({
      type: 'message_notification',
      title: 'Post-window publish',
      body: 'Should be created after dedup window.',
      eventId: 'evt-dedup-expiry',
      eventType: 'MESSAGE_SENT',
    });

    expect(publishAfterWindow.status).toBe('SUCCESS');
    if (publishAfterWindow.status !== 'SUCCESS') {
      throw new Error('Expected post-window publish response to succeed.');
    }

    expect(publishAfterWindow.data.outcome).toBe('created');
  });
});
