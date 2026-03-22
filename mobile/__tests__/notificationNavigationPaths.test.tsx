import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';
import { ReactNode } from 'react';

import { BackendServiceContracts } from '../src/contracts';
import { ROUTE_NAMES } from '../src/navigation';
import {
  ChatThreadsScreen,
  NotificationCenterScreen,
  NotificationPreferencesScreen,
  SafetyCenterScreen,
} from '../src/screens';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function TestProviders({ children, servicesOverride }: { children: ReactNode; servicesOverride: BackendServiceContracts }) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          {children}
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('notification navigation entry points and return paths', () => {
  it('opens notification center from chat threads and returns to chat threads', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getThreads: async () => ({
          status: 'SUCCESS',
          data: [
            {
              chatId: 'chat-nav-1',
              matchId: 'match-nav-1',
              participants: ['u-regular-1', 'u-discovery-1'],
              counterpart: {
                userId: 'u-discovery-1',
                displayName: 'Riley',
                age: 29,
                gender: 'non_binary',
              },
              latestMessage: {
                messageId: 'msg-nav-1',
                text: 'Meet by the DJ booth?',
                sentAt: '2026-03-21T12:00:00.000Z',
                deliveryStatus: 'delivered',
              },
              unreadCount: 1,
              status: 'active',
            },
          ],
          request_id: 'req-chat-nav-threads',
        }),
      },
    };

    const screen = render(
      <TestProviders servicesOverride={servicesOverride}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={ROUTE_NAMES.ChatThreads} screenOptions={{ headerShown: false }}>
            <Stack.Screen component={ChatThreadsScreen} name={ROUTE_NAMES.ChatThreads} />
            <Stack.Screen component={NotificationCenterScreen} name={ROUTE_NAMES.NotificationCenter} />
            <Stack.Screen component={NotificationPreferencesScreen} name={ROUTE_NAMES.NotificationPreferences} />
            <Stack.Screen component={SafetyCenterScreen} name={ROUTE_NAMES.SafetyCenter} />
          </Stack.Navigator>
        </NavigationContainer>
      </TestProviders>
    );

    expect(await screen.findByText('Chat Threads Screen')).toBeTruthy();

    fireEvent.press(await screen.findByText('Notification Center'));
    expect(await screen.findByText('Notification Center Screen')).toBeTruthy();

    fireEvent.press(screen.getByText('Return to Chat Threads'));
    expect(await screen.findByText('Chat Threads Screen')).toBeTruthy();
  });

  it('keeps return context when navigating Notification Center -> Preferences -> Safety Center', async () => {
    const locator = createMockBackendServiceLocator();

    const screen = render(
      <TestProviders servicesOverride={locator.services}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={ROUTE_NAMES.SafetyCenter} screenOptions={{ headerShown: false }}>
            <Stack.Screen component={SafetyCenterScreen} name={ROUTE_NAMES.SafetyCenter} />
            <Stack.Screen component={NotificationCenterScreen} name={ROUTE_NAMES.NotificationCenter} />
            <Stack.Screen component={NotificationPreferencesScreen} name={ROUTE_NAMES.NotificationPreferences} />
            <Stack.Screen component={ChatThreadsScreen} name={ROUTE_NAMES.ChatThreads} />
          </Stack.Navigator>
        </NavigationContainer>
      </TestProviders>
    );

    expect(await screen.findByText('Safety Center Screen')).toBeTruthy();

    fireEvent.press(screen.getByText('Notification Center Screen'));
    expect(await screen.findByText('Notification Center Screen')).toBeTruthy();

    fireEvent.press(screen.getByText('Notification Preferences'));
    expect(await screen.findByText('Notification Preferences Screen')).toBeTruthy();

    fireEvent.press(screen.getByText('Return to Safety Center'));
    expect(await screen.findByText('Safety Center Screen')).toBeTruthy();
  });
});
