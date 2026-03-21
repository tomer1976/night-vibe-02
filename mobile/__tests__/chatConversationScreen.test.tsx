import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { BackendServiceContracts } from '../src/contracts';
import { ROUTE_NAMES } from '../src/navigation';
import { ChatConversationScreen } from '../src/screens';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function ChatConversationTestNavigator({
  initialParams,
  servicesOverride,
}: {
  initialParams?: {
    chatId?: string;
    matchId?: string;
    counterpartName?: string;
    threadStatus?: 'active' | 'expired' | 'blocked';
    venueId?: string;
  };
  servicesOverride: BackendServiceContracts;
}) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName={ROUTE_NAMES.ChatConversation} screenOptions={{ headerShown: false }}>
              <Stack.Screen component={ChatConversationScreen} initialParams={initialParams} name={ROUTE_NAMES.ChatConversation} />
              <Stack.Screen component={() => <Text>Chat Threads Screen Stub</Text>} name={ROUTE_NAMES.ChatThreads} />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('chat conversation screen', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows disabled composer reason when thread is blocked', async () => {
    const locator = createMockBackendServiceLocator();

    const screen = render(
      <ChatConversationTestNavigator
        initialParams={{
          chatId: 'chat-blocked',
          counterpartName: 'Parker',
          matchId: 'match-blocked',
          threadStatus: 'blocked',
          venueId: 'v-midtown',
        }}
        servicesOverride={locator.services}
      />
    );

    expect(await screen.findByText('Parker Conversation')).toBeTruthy();
    expect(await screen.findByText('Status: blocked')).toBeTruthy();
    expect(
      await screen.findByText('Chat is disabled because a safety block is active.')
    ).toBeTruthy();
    expect(screen.getByPlaceholderText('Chat is disabled.')).toBeTruthy();
  });

  it('advances message state from sent to delivered to read', async () => {
    jest.useFakeTimers();

    const locator = createMockBackendServiceLocator();
    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        sendMessage: async (chatId) => ({
          status: 'SUCCESS',
          data: { chatId, sent: true },
          request_id: 'req-chat-send-success',
        }),
      },
    };

    const screen = render(
      <ChatConversationTestNavigator
        initialParams={{
          chatId: 'chat-delivery',
          counterpartName: 'Sky',
          matchId: 'match-delivery',
          threadStatus: 'active',
        }}
        servicesOverride={servicesOverride}
      />
    );

    fireEvent.changeText(screen.getByLabelText('Message'), 'On my way');
    fireEvent.press(screen.getByText('Send'));

    expect(await screen.findByText('On my way')).toBeTruthy();
    expect(await screen.findByText('Sent')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(700);
    });

    expect(await screen.findByText('Delivered')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(800);
    });

    expect(await screen.findByText('Read')).toBeTruthy();
  });
});
