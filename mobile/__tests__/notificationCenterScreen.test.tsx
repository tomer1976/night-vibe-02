import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { render } from '@testing-library/react-native';

import { BackendServiceContracts } from '../src/contracts';
import { ROUTE_NAMES } from '../src/navigation';
import { NotificationCenterScreen } from '../src/screens';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function NotificationCenterTestNavigator({ servicesOverride }: { servicesOverride: BackendServiceContracts }) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={ROUTE_NAMES.NotificationCenter} screenOptions={{ headerShown: false }}>
              <Stack.Screen component={NotificationCenterScreen} name={ROUTE_NAMES.NotificationCenter} />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('notification center screen', () => {
  it('deduplicates duplicate notification ids during rapid event snapshots', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      notifications: {
        ...locator.services.notifications,
        getNotifications: async () => ({
          status: 'SUCCESS',
          data: [
            {
              notificationId: 'notification-rapid-1',
              userId: 'u-1',
              type: 'message_notification',
              title: 'Rapid v1',
              body: 'First payload',
              read: false,
              createdAt: '2026-03-23T22:00:00.000Z',
              updatedAt: '2026-03-23T22:00:00.000Z',
            },
            {
              notificationId: 'notification-rapid-1',
              userId: 'u-1',
              type: 'message_notification',
              title: 'Rapid v2',
              body: 'Superseding payload',
              read: false,
              createdAt: '2026-03-23T22:00:01.000Z',
              updatedAt: '2026-03-23T22:00:01.000Z',
            },
            {
              notificationId: 'notification-rapid-2',
              userId: 'u-1',
              type: 'safety_notification',
              title: 'Safety Update',
              body: 'Second unique notification',
              read: false,
              createdAt: '2026-03-23T22:00:02.000Z',
              updatedAt: '2026-03-23T22:00:02.000Z',
            },
          ],
          request_id: 'req-notification-center-rapid-dedup',
        }),
      },
    };

    const screen = render(<NotificationCenterTestNavigator servicesOverride={servicesOverride} />);

    expect(await screen.findByText('Notification Center Screen')).toBeTruthy();
    expect(await screen.findByText('Total: 2')).toBeTruthy();
    expect(await screen.findByText('Unread: 2')).toBeTruthy();
    expect(await screen.findByText('Rapid v2')).toBeTruthy();
    expect(screen.queryByText('Rapid v1')).toBeNull();
  });
});
