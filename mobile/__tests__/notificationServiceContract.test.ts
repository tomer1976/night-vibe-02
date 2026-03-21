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
});
