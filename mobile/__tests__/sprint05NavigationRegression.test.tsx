import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { act, fireEvent, render } from '@testing-library/react-native';
import { PropsWithChildren, useEffect } from 'react';
import { Text } from 'react-native';

import { BackendServiceContracts } from '../src/contracts';
import { ROUTE_NAMES } from '../src/navigation';
import {
  AccountSettingsScreen,
  ChatConversationScreen,
  ChatThreadsScreen,
  NearbyVenuesScreen,
  ProfileCompletionRequiredScreen,
  SplashScreen,
  UserEntryScreen,
  UserProfileScreen,
  VenueDetailsScreen,
} from '../src/screens';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider, useOnboardingState } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function TestProviders({ children, servicesOverride }: PropsWithChildren<{ servicesOverride?: BackendServiceContracts }>) {
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

function SplashStateSeededScreen({ profileCompleted }: { profileCompleted: boolean }) {
  const { setProfileCompleted } = useOnboardingState();

  useEffect(() => {
    setProfileCompleted(profileCompleted);
  }, [profileCompleted, setProfileCompleted]);

  return <SplashScreen />;
}

describe('sprint-05 navigation regressions', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('routes splash startup to nearby venues for authenticated profile-complete users', async () => {
    const screen = render(
      <TestProviders>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={ROUTE_NAMES.Splash} screenOptions={{ headerShown: false }}>
            <Stack.Screen name={ROUTE_NAMES.Splash}>{() => <SplashStateSeededScreen profileCompleted />}</Stack.Screen>
            <Stack.Screen component={NearbyVenuesScreen} name={ROUTE_NAMES.NearbyVenues} />
            <Stack.Screen component={ProfileCompletionRequiredScreen} name={ROUTE_NAMES.ProfileCompletionRequired} />
            <Stack.Screen name={ROUTE_NAMES.Welcome}>{() => <Text>Welcome Screen Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.AccessDenied}>{() => <Text>Access Denied Screen Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.SessionRecovery}>{() => <Text>Session Recovery Screen Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.OnboardingName}>{() => <Text>Onboarding Name Screen Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.UserGroup}>{() => <Text>User Group Stub</Text>}</Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </TestProviders>
    );

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(await screen.findByText('Nearby Venues Screen')).toBeTruthy();
  });

  it('routes splash startup to profile completion required when profile is incomplete', async () => {
    const screen = render(
      <TestProviders>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={ROUTE_NAMES.Splash} screenOptions={{ headerShown: false }}>
            <Stack.Screen name={ROUTE_NAMES.Splash}>{() => <SplashStateSeededScreen profileCompleted={false} />}</Stack.Screen>
            <Stack.Screen component={NearbyVenuesScreen} name={ROUTE_NAMES.NearbyVenues} />
            <Stack.Screen component={ProfileCompletionRequiredScreen} name={ROUTE_NAMES.ProfileCompletionRequired} />
            <Stack.Screen name={ROUTE_NAMES.Welcome}>{() => <Text>Welcome Screen Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.AccessDenied}>{() => <Text>Access Denied Screen Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.SessionRecovery}>{() => <Text>Session Recovery Screen Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.OnboardingName}>{() => <Text>Onboarding Name Screen Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.UserGroup}>{() => <Text>User Group Stub</Text>}</Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </TestProviders>
    );

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(await screen.findByText('Profile Completion Required Screen')).toBeTruthy();
  });

  it('preserves persistent bottom tabs while switching across main-tab screens', async () => {
    const servicesOverride = createMockBackendServiceLocator().services;
    const screen = render(
      <TestProviders servicesOverride={servicesOverride}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={ROUTE_NAMES.NearbyVenues} screenOptions={{ headerShown: false }}>
            <Stack.Screen component={NearbyVenuesScreen} name={ROUTE_NAMES.NearbyVenues} />
            <Stack.Screen component={ChatThreadsScreen} name={ROUTE_NAMES.ChatThreads} />
            <Stack.Screen component={AccountSettingsScreen} name={ROUTE_NAMES.AccountSettings} />
            <Stack.Screen component={UserProfileScreen} name={ROUTE_NAMES.UserProfile} />
            <Stack.Screen component={VenueDetailsScreen} name={ROUTE_NAMES.VenueDetails} />
            <Stack.Screen name={ROUTE_NAMES.CheckInConfirmation}>{() => <Text>Check-in Confirmation Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.ChatConversation}>{() => <Text>Chat Conversation Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.EditProfile}>{() => <Text>Edit Profile Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.ProfilePhotosManagement}>{() => <Text>Profile Photos Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.LinkedAccounts}>{() => <Text>Linked Accounts Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.DeleteAccount}>{() => <Text>Delete Account Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.AccountDeletionRecovery}>{() => <Text>Account Deletion Recovery Stub</Text>}</Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </TestProviders>
    );

    expect(await screen.findByText('Nearby Venues Screen')).toBeTruthy();
    expect(screen.getByTestId('bottom-nav-venues').props.accessibilityState?.selected).toBe(true);

    fireEvent.press(screen.getByTestId('bottom-nav-chats'));
    expect(await screen.findByText('Chat Threads Screen')).toBeTruthy();
    expect(screen.getByTestId('bottom-nav-chats').props.accessibilityState?.selected).toBe(true);

    fireEvent.press(screen.getByTestId('bottom-nav-settings'));
    expect(await screen.findByText('Account Settings Screen')).toBeTruthy();
    expect(screen.getByTestId('bottom-nav-settings').props.accessibilityState?.selected).toBe(true);

    fireEvent.press(screen.getByTestId('bottom-nav-profile'));
    expect(await screen.findByText('User Profile Screen')).toBeTruthy();
    expect(screen.getByTestId('bottom-nav-profile').props.accessibilityState?.selected).toBe(true);
  });

  it('renders top banner variant on all main-tab pages without back arrow', async () => {
    const servicesOverride = createMockBackendServiceLocator().services;
    const screen = render(
      <TestProviders servicesOverride={servicesOverride}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={ROUTE_NAMES.NearbyVenues} screenOptions={{ headerShown: false }}>
            <Stack.Screen component={NearbyVenuesScreen} name={ROUTE_NAMES.NearbyVenues} />
            <Stack.Screen component={ChatThreadsScreen} name={ROUTE_NAMES.ChatThreads} />
            <Stack.Screen component={AccountSettingsScreen} name={ROUTE_NAMES.AccountSettings} />
            <Stack.Screen component={UserProfileScreen} name={ROUTE_NAMES.UserProfile} />
            <Stack.Screen component={VenueDetailsScreen} name={ROUTE_NAMES.VenueDetails} />
            <Stack.Screen name={ROUTE_NAMES.CheckInConfirmation}>{() => <Text>Check-in Confirmation Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.ChatConversation}>{() => <Text>Chat Conversation Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.EditProfile}>{() => <Text>Edit Profile Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.ProfilePhotosManagement}>{() => <Text>Profile Photos Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.LinkedAccounts}>{() => <Text>Linked Accounts Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.DeleteAccount}>{() => <Text>Delete Account Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.AccountDeletionRecovery}>{() => <Text>Account Deletion Recovery Stub</Text>}</Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </TestProviders>
    );

    expect(await screen.findByText('Nearby Venues Screen')).toBeTruthy();
    expect(screen.getByTestId('top-bar-main-tab-logo')).toBeTruthy();
    expect(screen.queryByTestId('top-bar-back-button')).toBeNull();

    fireEvent.press(screen.getByTestId('bottom-nav-chats'));
    expect(await screen.findByText('Chat Threads Screen')).toBeTruthy();
    expect(screen.getByTestId('top-bar-main-tab-logo')).toBeTruthy();
    expect(screen.queryByTestId('top-bar-back-button')).toBeNull();

    fireEvent.press(screen.getByTestId('bottom-nav-settings'));
    expect(await screen.findByText('Account Settings Screen')).toBeTruthy();
    expect(screen.getByTestId('top-bar-main-tab-logo')).toBeTruthy();
    expect(screen.queryByTestId('top-bar-back-button')).toBeNull();

    fireEvent.press(screen.getByTestId('bottom-nav-profile'));
    expect(await screen.findByText('User Profile Screen')).toBeTruthy();
    expect(screen.getByTestId('top-bar-main-tab-logo')).toBeTruthy();
    expect(screen.queryByTestId('top-bar-back-button')).toBeNull();
  });

  it('keeps matches placement venue-scoped and not as standalone user entry', async () => {
    const servicesOverride = createMockBackendServiceLocator().services;
    const screen = render(
      <TestProviders servicesOverride={servicesOverride}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={ROUTE_NAMES.UserGroup} screenOptions={{ headerShown: false }}>
            <Stack.Screen component={UserEntryScreen} name={ROUTE_NAMES.UserGroup} />
            <Stack.Screen component={NearbyVenuesScreen} name={ROUTE_NAMES.NearbyVenues} />
            <Stack.Screen component={VenueDetailsScreen} name={ROUTE_NAMES.VenueDetails} />
            <Stack.Screen name={ROUTE_NAMES.CheckInConfirmation}>{() => <Text>Check-in Confirmation Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.DiscoveryProfilePreview}>{() => <Text>Discovery Profile Preview Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.MatchConfirmation}>{() => <Text>Match Confirmation Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.ChatThreads}>{() => <Text>Chat Threads Stub</Text>}</Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </TestProviders>
    );

    expect(await screen.findByText('User Shell')).toBeTruthy();
    expect(screen.queryByText('Matches List Screen')).toBeNull();

    fireEvent.press(screen.getByText('Nearby Venues Screen'));
    expect(await screen.findByText('Nearby Venues Screen')).toBeTruthy();
    fireEvent.press(screen.getByText('Halo Club'));
    expect(await screen.findByText('Venue Details Screen')).toBeTruthy();
    expect(await screen.findByLabelText('Potential Matches tab')).toBeTruthy();
    expect(await screen.findByLabelText('Matches tab')).toBeTruthy();
  });

  it('shows back arrow for conversation and returns to threads when pressed', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      chat: {
        ...locator.services.chat,
        getThreads: async () => ({
          status: 'SUCCESS',
          data: [
            {
              chatId: 'chat-back-arrow-1',
              matchId: 'match-back-arrow-1',
              participants: ['u-regular-1', 'u-discovery-1'],
              counterpart: {
                userId: 'u-discovery-1',
                displayName: 'Riley',
                age: 29,
                gender: 'non_binary',
              },
              latestMessage: {
                messageId: 'msg-back-arrow-1',
                text: 'Meet by the DJ booth?',
                sentAt: '2026-03-21T12:00:00.000Z',
                deliveryStatus: 'delivered',
              },
              unreadCount: 1,
              status: 'active',
            },
          ],
          request_id: 'req-chat-back-arrow-1',
        }),
      },
    };

    const screen = render(
      <TestProviders servicesOverride={servicesOverride}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={ROUTE_NAMES.ChatThreads} screenOptions={{ headerShown: false }}>
            <Stack.Screen component={ChatThreadsScreen} name={ROUTE_NAMES.ChatThreads} />
            <Stack.Screen component={ChatConversationScreen} name={ROUTE_NAMES.ChatConversation} />
            <Stack.Screen name={ROUTE_NAMES.NearbyVenues}>{() => <Text>Nearby Venues Stub</Text>}</Stack.Screen>
            <Stack.Screen name={ROUTE_NAMES.VenueDetails}>{() => <Text>Venue Details Stub</Text>}</Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </TestProviders>
    );

    expect(await screen.findByText('Chat Threads Screen')).toBeTruthy();
    expect(screen.queryByTestId('top-bar-back-button')).toBeNull();

    fireEvent.press(await screen.findByLabelText('Riley • 29 • non binary, Meet by the DJ booth? (delivered)'));
    expect(await screen.findByText('Riley Conversation')).toBeTruthy();
    expect(screen.getByTestId('top-bar-back-button')).toBeTruthy();

    fireEvent.press(screen.getByTestId('top-bar-back-button'));
    expect(await screen.findByText('Chat Threads Screen')).toBeTruthy();
  });
});
