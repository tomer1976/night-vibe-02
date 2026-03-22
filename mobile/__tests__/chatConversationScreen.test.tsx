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
    counterpartUserId?: string;
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
              <Stack.Screen component={() => <Text>Nearby Venues Screen Stub</Text>} name={ROUTE_NAMES.NearbyVenues} />
              <Stack.Screen component={() => <Text>Venue Details Screen Stub</Text>} name={ROUTE_NAMES.VenueDetails} />
              <Stack.Screen
                name={ROUTE_NAMES.ReportUser}
              >
                {(props) => <Text>{`Report User Stub:${JSON.stringify(props.route.params)}`}</Text>}
              </Stack.Screen>
              <Stack.Screen
                name={ROUTE_NAMES.BlockUserConfirmation}
              >
                {(props) => <Text>{`Block User Stub:${JSON.stringify(props.route.params)}`}</Text>}
              </Stack.Screen>
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

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getEligibility: async (chatId) => ({
          status: 'SUCCESS',
          data: {
            chatId,
            eligible: false,
            reason: 'blocked',
            evaluatedAt: '2026-03-22T10:00:00.000Z',
          },
          request_id: 'req-chat-eligibility-blocked',
        }),
      },
    };

    const screen = render(
      <ChatConversationTestNavigator
        initialParams={{
          chatId: 'chat-blocked',
          counterpartName: 'Parker',
          matchId: 'match-blocked',
          threadStatus: 'blocked',
          venueId: 'v-midtown',
        }}
        servicesOverride={servicesOverride}
      />
    );

    expect(await screen.findByText('Parker Conversation')).toBeTruthy();
    expect(await screen.findByText('Status: blocked')).toBeTruthy();
    expect(
      await screen.findByText('Chat is disabled because a safety block is active.')
    ).toBeTruthy();
    expect(screen.getByPlaceholderText('Chat is disabled.')).toBeTruthy();
  });

  it('shows not checked-in disabled reason when eligibility returns not_checked_in', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getEligibility: async (chatId) => ({
          status: 'SUCCESS',
          data: {
            chatId,
            eligible: false,
            reason: 'not_checked_in',
            evaluatedAt: '2026-03-22T10:00:00.000Z',
          },
          request_id: 'req-chat-eligibility-not-checked-in',
        }),
      },
    };

    const screen = render(
      <ChatConversationTestNavigator
        initialParams={{
          chatId: 'chat-no-session',
          counterpartName: 'Parker',
          matchId: 'match-no-session',
          threadStatus: 'active',
          venueId: 'v-midtown',
        }}
        servicesOverride={servicesOverride}
      />
    );

    expect(await screen.findByText('Parker Conversation')).toBeTruthy();
    expect(
      await screen.findByText('Chat is disabled because no active venue session was found.')
    ).toBeTruthy();
    expect(screen.getByPlaceholderText('Chat is disabled.')).toBeTruthy();
  });

  it('shows moderation-action disabled reason when eligibility returns moderation_action', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getEligibility: async (chatId) => ({
          status: 'SUCCESS',
          data: {
            chatId,
            eligible: false,
            reason: 'moderation_action',
            evaluatedAt: '2026-03-22T10:00:00.000Z',
          },
          request_id: 'req-chat-eligibility-moderation-action',
        }),
      },
    };

    const screen = render(
      <ChatConversationTestNavigator
        initialParams={{
          chatId: 'chat-moderation',
          counterpartName: 'Parker',
          matchId: 'match-moderation',
          threadStatus: 'active',
          venueId: 'v-midtown',
        }}
        servicesOverride={servicesOverride}
      />
    );

    expect(await screen.findByText('Parker Conversation')).toBeTruthy();
    expect(
      await screen.findByText('Chat is disabled due to a moderation action on this conversation.')
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

  it('opens report and block flows from conversation with target context', async () => {
    const locator = createMockBackendServiceLocator();

    const screen = render(
      <ChatConversationTestNavigator
        initialParams={{
          chatId: 'chat-safety-entry',
          counterpartName: 'Sky',
          counterpartUserId: 'u-discovery-3',
          matchId: 'match-safety-entry',
          threadStatus: 'active',
          venueId: 'v-halo-club',
        }}
        servicesOverride={locator.services}
      />
    );

    fireEvent.press(await screen.findByText('Report User'));

    expect(
      await screen.findByText(
        'Report User Stub:{"sourceRouteName":"ChatConversation","targetDisplayName":"Sky","targetUserId":"u-discovery-3","matchId":"match-safety-entry","venueId":"v-halo-club","chatId":"chat-safety-entry"}'
      )
    ).toBeTruthy();

    const secondScreen = render(
      <ChatConversationTestNavigator
        initialParams={{
          chatId: 'chat-safety-entry',
          counterpartName: 'Sky',
          counterpartUserId: 'u-discovery-3',
          matchId: 'match-safety-entry',
          threadStatus: 'active',
          venueId: 'v-halo-club',
        }}
        servicesOverride={locator.services}
      />
    );

    fireEvent.press(await secondScreen.findByText('Block User'));

    expect(
      await secondScreen.findByText(
        'Block User Stub:{"sourceRouteName":"ChatConversation","targetDisplayName":"Sky","targetUserId":"u-discovery-3","matchId":"match-safety-entry","venueId":"v-halo-club","chatId":"chat-safety-entry"}'
      )
    ).toBeTruthy();
  });

  it('redirects to venue details when entry eligibility fails with ACCESS_DENIED in venue context', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getEligibility: async () => ({
          status: 'FAIL',
          error: {
            code: 'ACCESS_DENIED',
            message: 'Chat access denied for this session.',
          },
          request_id: 'req-chat-entry-access-denied',
        }),
      },
    };

    const screen = render(
      <ChatConversationTestNavigator
        initialParams={{
          chatId: 'chat-guard',
          matchId: 'match-guard',
          counterpartName: 'Rae',
          threadStatus: 'active',
          venueId: 'v-halo-club',
        }}
        servicesOverride={servicesOverride}
      />
    );

    expect(await screen.findByText('Venue Details Screen Stub')).toBeTruthy();
  });

  it('redirects to nearby venues when entry eligibility fails with NOT_CHECKED_IN', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getEligibility: async () => ({
          status: 'FAIL',
          error: {
            code: 'NOT_CHECKED_IN',
            message: 'No active session.',
          },
          request_id: 'req-chat-entry-not-checked-in',
        }),
      },
    };

    const screen = render(
      <ChatConversationTestNavigator
        initialParams={{
          chatId: 'chat-guard-no-session',
          matchId: 'match-guard-no-session',
          counterpartName: 'Rae',
          threadStatus: 'active',
        }}
        servicesOverride={servicesOverride}
      />
    );

    expect(await screen.findByText('Nearby Venues Screen Stub')).toBeTruthy();
  });
});
