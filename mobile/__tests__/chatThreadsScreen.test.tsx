import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { BackendServiceContracts, ChatThread } from '../src/contracts';
import { ROUTE_NAMES } from '../src/navigation';
import { ChatConversationScreen, ChatThreadsScreen, UserEntryScreen } from '../src/screens';
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

function ChatThreadsTestNavigator({
  servicesOverride,
  initialThreadParams,
}: {
  servicesOverride: BackendServiceContracts;
  initialThreadParams?: { venueId?: string; matchId?: string; openConversation?: boolean };
}) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={ROUTE_NAMES.ChatThreads} screenOptions={{ headerShown: false }}>
              <Stack.Screen component={ChatThreadsScreen} initialParams={initialThreadParams} name={ROUTE_NAMES.ChatThreads} />
              <Stack.Screen component={ChatConversationScreen} name={ROUTE_NAMES.ChatConversation} />
              <Stack.Screen component={UserEntryScreen} name={ROUTE_NAMES.UserGroup} />
              <Stack.Screen component={() => <Text>Nearby Venues Screen Stub</Text>} name={ROUTE_NAMES.NearbyVenues} />
              <Stack.Screen component={() => <Text>Venue Details Screen Stub</Text>} name={ROUTE_NAMES.VenueDetails} />
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
    expect(screen.getByTestId('top-bar-main-tab-logo')).toBeTruthy();
    expect(screen.getByTestId('bottom-nav-venues')).toBeTruthy();
    expect(screen.getByTestId('bottom-nav-chats')).toBeTruthy();
    expect(screen.getByTestId('bottom-nav-settings')).toBeTruthy();
    expect(screen.getByTestId('bottom-nav-profile')).toBeTruthy();
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

  it('opens chat conversation when a thread row is pressed', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getThreads: async () => ({
          status: 'SUCCESS',
          data: [
            buildThread({
              chatId: 'chat-open',
              matchId: 'match-open',
              counterpart: {
                userId: 'u-99',
                displayName: 'Casey',
                age: 28,
                gender: 'female',
              },
            }),
          ],
          request_id: 'req-chat-open-1',
        }),
      },
    };

    const screen = render(<ChatThreadsTestNavigator servicesOverride={servicesOverride} />);

    const row = await screen.findByLabelText('Casey • 28 • female, See you near the dance floor. (delivered)');
    fireEvent.press(row);

    expect(await screen.findByText('Casey Conversation')).toBeTruthy();
    expect(await screen.findByText('Match: match-open')).toBeTruthy();
  });

  it('auto-opens conversation for a venue-scoped match handoff', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getThreads: async () => ({
          status: 'SUCCESS',
          data: [
            buildThread({
              chatId: 'chat-focused',
              matchId: 'match-focused',
              counterpart: {
                userId: 'u-55',
                displayName: 'Taylor',
                age: 30,
                gender: 'male',
              },
            }),
          ],
          request_id: 'req-chat-open-focused',
        }),
      },
    };

    const screen = render(
      <ChatThreadsTestNavigator
        initialThreadParams={{
          venueId: 'venue-abc',
          matchId: 'match-focused',
          openConversation: true,
        }}
        servicesOverride={servicesOverride}
      />
    );

    expect(await screen.findByText('Taylor Conversation')).toBeTruthy();
    expect(await screen.findByText('Venue: venue-abc')).toBeTruthy();
  });

  it('redirects to nearby venues when threads fail with NOT_CHECKED_IN', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getThreads: async () => ({
          status: 'FAIL',
          error: {
            code: 'NOT_CHECKED_IN',
            message: 'No active venue session.',
          },
          request_id: 'req-chat-threads-not-checked-in',
        }),
      },
    };

    const screen = render(<ChatThreadsTestNavigator servicesOverride={servicesOverride} />);

    expect(await screen.findByText('Nearby Venues Screen Stub')).toBeTruthy();
  });

  it('redirects to venue details when threads fail with CHAT_EXPIRED and venue context exists', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getThreads: async () => ({
          status: 'FAIL',
          error: {
            code: 'CHAT_EXPIRED',
            message: 'Chat eligibility no longer active.',
          },
          request_id: 'req-chat-threads-chat-expired',
        }),
      },
    };

    const screen = render(
      <ChatThreadsTestNavigator
        initialThreadParams={{
          venueId: 'v-halo-club',
        }}
        servicesOverride={servicesOverride}
      />
    );

    expect(await screen.findByText('Venue Details Screen Stub')).toBeTruthy();
  });

  it('redirects to venue details when send fails with CHAT_EXPIRED and venue context exists', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getThreads: async () => ({
          status: 'SUCCESS',
          data: [
            buildThread({
              chatId: 'chat-eligibility',
              matchId: 'match-eligibility',
              counterpart: {
                userId: 'u-100',
                displayName: 'Devon',
                age: 32,
                gender: 'female',
              },
            }),
          ],
          request_id: 'req-chat-threads-eligibility',
        }),
        sendMessage: async () => ({
          status: 'FAIL',
          error: {
            code: 'CHAT_EXPIRED',
            message: 'Chat is no longer active.',
          },
          request_id: 'req-chat-send-expired',
        }),
      },
    };

    const screen = render(
      <ChatThreadsTestNavigator
        initialThreadParams={{
          venueId: 'v-halo-club',
        }}
        servicesOverride={servicesOverride}
      />
    );

    const row = await screen.findByLabelText('Devon • 32 • female, See you near the dance floor. (delivered)');
    fireEvent.press(row);

    expect(await screen.findByText('Devon Conversation')).toBeTruthy();

    fireEvent.changeText(screen.getByLabelText('Message'), 'Still there?');
    fireEvent.press(screen.getByText('Send'));

    expect(await screen.findByText('Venue Details Screen Stub')).toBeTruthy();
  });

  it('returns to chat threads when pressing the top-bar back button in conversation', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getThreads: async () => ({
          status: 'SUCCESS',
          data: [
            buildThread({
              chatId: 'chat-back',
              matchId: 'match-back',
              counterpart: {
                userId: 'u-201',
                displayName: 'Morgan',
                age: 27,
                gender: 'female',
              },
            }),
          ],
          request_id: 'req-chat-threads-back',
        }),
      },
    };

    const screen = render(<ChatThreadsTestNavigator servicesOverride={servicesOverride} />);

    const row = await screen.findByLabelText('Morgan • 27 • female, See you near the dance floor. (delivered)');
    fireEvent.press(row);

    expect(await screen.findByText('Morgan Conversation')).toBeTruthy();
    fireEvent.press(screen.getByTestId('top-bar-back-button'));

    expect(await screen.findByText('Chat Threads Screen')).toBeTruthy();
    expect(screen.getByTestId('bottom-nav-chats')).toBeTruthy();
  });
});