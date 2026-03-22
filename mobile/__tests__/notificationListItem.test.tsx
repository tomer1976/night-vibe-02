import { fireEvent, render } from '@testing-library/react-native';

import { NotificationRecord } from '../src/contracts';
import { NotificationListItem } from '../src/components';
import { ThemeProvider } from '../src/theme';

function renderItem(notification: NotificationRecord, onMarkRead?: (notificationId: string) => void, isMarkingRead?: boolean) {
  return render(
    <ThemeProvider>
      <NotificationListItem isMarkingRead={isMarkingRead} notification={notification} onMarkRead={onMarkRead} />
    </ThemeProvider>
  );
}

describe('NotificationListItem', () => {
  it('renders type and unread variants with fallback copy and mark-read action', () => {
    const markReadSpy = jest.fn();

    const notification: NotificationRecord = {
      notificationId: 'notification-1',
      userId: 'u-regular-1',
      type: 'message_notification',
      read: false,
    };

    const screen = renderItem(notification, markReadSpy);

    expect(screen.getByText('Message')).toBeTruthy();
    expect(screen.getByText('Unread')).toBeTruthy();
    expect(screen.getByText('New message')).toBeTruthy();
    expect(screen.getByText('You received a new message in a current chat thread.')).toBeTruthy();

    fireEvent.press(screen.getByText('Mark read'));
    expect(markReadSpy).toHaveBeenCalledWith('notification-1');
  });

  it('renders read state variant and explicit notification content', () => {
    const notification: NotificationRecord = {
      notificationId: 'notification-2',
      userId: 'u-regular-1',
      type: 'safety_notification',
      title: 'Report status update',
      body: 'Your report has been reviewed.',
      read: true,
    };

    const screen = renderItem(notification, jest.fn());

    expect(screen.getByText('Safety')).toBeTruthy();
    expect(screen.getAllByText('Read').length).toBeGreaterThan(0);
    expect(screen.getByText('Report status update')).toBeTruthy();
    expect(screen.getByText('Your report has been reviewed.')).toBeTruthy();
  });

  it('shows marking state label while read transition is in progress', () => {
    const notification: NotificationRecord = {
      notificationId: 'notification-3',
      userId: 'u-regular-1',
      type: 'system_notification',
      read: false,
    };

    const screen = renderItem(notification, jest.fn(), true);

    expect(screen.getByText('System')).toBeTruthy();
    expect(screen.getByText('Unread')).toBeTruthy();
    expect(screen.getByText('Marking...')).toBeTruthy();
  });
});
