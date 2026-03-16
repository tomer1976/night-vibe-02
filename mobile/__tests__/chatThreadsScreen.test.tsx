import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { BackendServiceContracts, ChatThread } from '../src/contracts';
import { ROUTE_NAMES } from '../src/navigation';
import { ChatThreadsScreen, UserEntryScreen } from '../src/screens';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function buildThread(overrides: Partial<ChatThread>): ChatThread {
  return {
    chatId: 'chat-1',
    matchId: 'match-1',
    participants: ['u-1', 'u-2'],
    counterpart: {
      userId: 'u-2',
      displayName: 'Riley',
      age: 29,
      gender: 'non_binary',
    },
    latestMessage: {
      messageId: 'msg-1',
      text: 'See you near the dance floor.',
      sentAt: '2026-03-16T10:00:00.000Z',
      deliveryStatus: 'delivered',
    },
    unreadCount: 1,
    status: 'active',
    ...overrides,
  };
}

function ChatThreadsTestNavigator({ servicesOverride }: { servicesOverride: BackendServiceContracts }) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={ROUTE_NAMES.ChatThreads} screenOptions={{ headerShown: false }}>
              <Stack.Screen component={ChatThreadsScreen} name={ROUTE_NAMES.ChatThreads} />
              <Stack.Screen component={UserEntryScreen} name={ROUTE_NAMES.UserGroup} />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('chat threads screen', () => {
  it('renders latest message previews and status badges', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getThreads: async () => ({
          status: 'SUCCESS',
          data: [
            buildThread({
              chatId: 'chat-active',
              matchId: 'match-active',
              counterpart: {
                userId: 'u-10',
                displayName: 'Jordan',
                age: 27,
                gender: 'female',
              },
              latestMessage: {
                messageId: 'msg-active',
                text: 'Leaving soon, where are you?',
                sentAt: '2026-03-16T12:00:00.000Z',
                deliveryStatus: 'delivered',
              },
              unreadCount: 2,
              status: 'active',
            }),
            buildThread({
              chatId: 'chat-expired',
              matchId: 'match-expired',
              counterpart: {
                userId: 'u-11',
                displayName: 'Avery',
                age: 31,
                gender: 'male',
              },
              latestMessage: {
                messageId: 'msg-expired',
                text: 'Session ended, chat is now locked.',
                sentAt: '2026-03-16T11:00:00.000Z',
                deliveryStatus: 'read',
              },
              unreadCount: 0,
              status: 'expired',
            }),
          ],
          request_id: 'req-chat-threads-success-1',
        }),
      },
    };

    const screen = render(<ChatThreadsTestNavigator servicesOverride={servicesOverride} />);

    expect(await screen.findByText('Chat Threads Screen')).toBeTruthy();
    expect(await screen.findByText('Jordan • 27 • female')).toBeTruthy();
    expect(await screen.findByText('Avery • 31 • male')).toBeTruthy();
    expect(await screen.findByText('Leaving soon, where are you? (delivered)')).toBeTruthy();
    expect(await screen.findByText('Session ended, chat is now locked. (read)')).toBeTruthy();
    expect(await screen.findByText('Status: active')).toBeTruthy();
    expect(await screen.findByText('Status: expired')).toBeTruthy();
    expect(await screen.findByText('Threads: 2')).toBeTruthy();
    expect(await screen.findByText('Active: 1')).toBeTruthy();
  });

  it('renders empty state when no chat threads are available', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getThreads: async () => ({
          status: 'SUCCESS',
          data: [],
          request_id: 'req-chat-threads-empty-1',
        }),
      },
    };

    const screen = render(<ChatThreadsTestNavigator servicesOverride={servicesOverride} />);

    expect(await screen.findByText('No Chat Threads')).toBeTruthy();
    expect(await screen.findByText('No chat threads are available yet.')).toBeTruthy();
  });

  it('renders retry state on failure and recovers after retry', async () => {
    const locator = createMockBackendServiceLocator();
    let attempts = 0;

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getThreads: async () => {
          attempts += 1;

          if (attempts === 1) {
            return {
              status: 'FAIL',
              error: {
                code: 'INTERNAL_ERROR',
                message: 'Simulated chat threads failure.',
                details: {
                  scenario: 'retry',
                },
              },
              request_id: 'req-chat-threads-fail-1',
            };
          }

          return {
            status: 'SUCCESS',
            data: [
              buildThread({
                chatId: 'chat-after-retry',
                matchId: 'match-after-retry',
                counterpart: {
                  userId: 'u-12',
                  displayName: 'Quinn',
                  age: 26,
                  gender: 'female',
                },
                latestMessage: {
                  messageId: 'msg-after-retry',
                  text: 'Finally connected.',
                  sentAt: '2026-03-16T13:00:00.000Z',
                  deliveryStatus: 'sent',
                },
                unreadCount: 0,
                status: 'active',
              }),
            ],
            request_id: 'req-chat-threads-success-2',
          };
        },
      },
    };

    const screen = render(<ChatThreadsTestNavigator servicesOverride={servicesOverride} />);

    expect(await screen.findByText('Threads Failed')).toBeTruthy();
    expect(await screen.findByText('Simulated chat threads failure.')).toBeTruthy();

    fireEvent.press(screen.getByText('Retry'));

    expect(await screen.findByText('Quinn • 26 • female')).toBeTruthy();
    expect(await screen.findByText('Finally connected. (sent)')).toBeTruthy();
  });
});