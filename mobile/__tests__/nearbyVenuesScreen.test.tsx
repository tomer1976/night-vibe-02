import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { BackendServiceContracts } from '../src/contracts';
import {
  AccountSettingsScreen,
  ChatThreadsScreen,
  CheckInConfirmationScreen,
  NearbyVenuesScreen,
  UserEntryScreen,
  UserProfileScreen,
  VenueDetailsScreen,
} from '../src/screens';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function NearbyVenuesTestNavigator({ servicesOverride }: { servicesOverride?: BackendServiceContracts }) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="UserGroup" screenOptions={{ headerShown: false }}>
              <Stack.Screen component={UserEntryScreen} name="UserGroup" />
              <Stack.Screen component={NearbyVenuesScreen} name="NearbyVenues" />
              <Stack.Screen component={CheckInConfirmationScreen} name="CheckInConfirmation" />
              <Stack.Screen component={VenueDetailsScreen} name="VenueDetails" />
              <Stack.Screen component={ChatThreadsScreen} name="ChatThreads" />
              <Stack.Screen component={AccountSettingsScreen} name="AccountSettings" />
              <Stack.Screen component={UserProfileScreen} name="UserProfile" />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('nearby venues screen', () => {
  const createServicesWithActiveSession = (venueId: string | null): BackendServiceContracts => {
    const mockLocator = createMockBackendServiceLocator();

    return {
      ...mockLocator.services,
      presence: {
        ...mockLocator.services.presence,
        getMyActiveSession: async () => ({
          status: 'SUCCESS',
          request_id: 'req-test-active-session',
          data: venueId
            ? {
                sessionId: 'session-test-active',
                userId: 'u-regular-001',
                venueId,
                status: 'active',
                checkinAt: '2026-03-08T20:00:00.000Z',
                checkoutAt: null,
              }
            : null,
        }),
      },
    };
  };

  it('renders venue list with category/status/activity metadata from mock discovery', async () => {
    const servicesOverride = createServicesWithActiveSession(null);
    const { getByText, getByTestId, findAllByText, findByText, queryByText } = render(
      <NearbyVenuesTestNavigator servicesOverride={servicesOverride} />
    );

    fireEvent.press(getByText('Nearby Venues Screen'));

    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
    expect(getByTestId('top-bar-main-tab-logo')).toBeTruthy();
    expect(getByTestId('bottom-nav-venues')).toBeTruthy();
    expect(getByTestId('bottom-nav-chats')).toBeTruthy();
    expect(getByTestId('bottom-nav-settings')).toBeTruthy();
    expect(getByTestId('bottom-nav-profile')).toBeTruthy();
    expect(await findByText('Halo Club')).toBeTruthy();
    expect(await findByText('Luna Lounge')).toBeTruthy();
    expect(await findByText('Category: club')).toBeTruthy();
    expect(await findByText('Category: lounge')).toBeTruthy();
    expect(await findByText('Distance: 1.06 km')).toBeTruthy();
    expect(await findByText('Distance: 1.35 km')).toBeTruthy();
    expect(await findByText('Activity: 2 active attendees')).toBeTruthy();
    expect(await findByText('Activity: 0 active attendees')).toBeTruthy();
    const activeStatusBadges = await findAllByText('Status: Active');
    expect(activeStatusBadges).toHaveLength(2);
    expect(await findByText('Live: Busy now')).toBeTruthy();
    expect(await findByText('Live: Calm now')).toBeTruthy();
    expect(queryByText('Checkout')).toBeNull();
    expect((await findAllByText('Check-In')).length).toBeGreaterThan(0);

    fireEvent.press(getByText('Halo Club'));

    expect(queryByText('Venue Details Screen')).toBeNull();
  });

  it('renders nearby venues empty state when no active venues are returned', async () => {
    const mockLocator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...mockLocator.services,
      venues: {
        ...mockLocator.services.venues,
        getNearbyVenues: async () => ({
          status: 'SUCCESS',
          data: [],
          request_id: 'req-empty-nearby',
        }),
      },
    };

    const { findByText, getByText } = render(<NearbyVenuesTestNavigator servicesOverride={servicesOverride} />);

    fireEvent.press(getByText('Nearby Venues Screen'));

    expect(await findByText('No Nearby Venues')).toBeTruthy();
    expect(await findByText('Try refreshing to rerun deterministic mock discovery.')).toBeTruthy();
    expect(await findByText('Refresh')).toBeTruthy();
  });

  it('renders retry state and recovers to list after retry', async () => {
    const mockLocator = createMockBackendServiceLocator();

    const getNearbyVenues = jest
      .fn()
      .mockResolvedValueOnce({
        status: 'FAIL',
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Simulated venue discovery failure.',
        },
        request_id: 'req-nearby-fail',
      })
      .mockResolvedValueOnce({
        status: 'SUCCESS',
        data: [
          {
            venueId: 'v-halo-club',
            name: 'Halo Club',
            distanceKm: 1.06,
            category: 'club',
            status: 'active',
            activitySnapshot: {
              checkinCount: 2,
              liveStatus: 'busy',
            },
          },
        ],
        request_id: 'req-nearby-recovered',
      });

    const servicesOverride: BackendServiceContracts = {
      ...mockLocator.services,
      venues: {
        ...mockLocator.services.venues,
        getNearbyVenues,
      },
    };

    const { findByText, getByText } = render(<NearbyVenuesTestNavigator servicesOverride={servicesOverride} />);

    fireEvent.press(getByText('Nearby Venues Screen'));

    expect(await findByText('Venue Discovery Failed')).toBeTruthy();
    expect(await findByText('Simulated venue discovery failure.')).toBeTruthy();
    fireEvent.press(getByText('Retry'));
    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
    expect(await findByText('Halo Club')).toBeTruthy();
  });

  it('keeps user on nearby list when checking out from the list card action', async () => {
    const { findByText, getByText, queryByText } = render(<NearbyVenuesTestNavigator />);

    fireEvent.press(getByText('Nearby Venues Screen'));

    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
    fireEvent.press(getByText('Checkout'));

    await waitFor(() => {
      expect(queryByText('You are checked in')).toBeNull();
      expect(queryByText('Venue Details Screen')).toBeNull();
    });
  });

  it('opens venue details when tapping the card of the currently checked-in venue', async () => {
    const servicesOverride = createServicesWithActiveSession('v-luna-lounge');
    const { findByText, getByText } = render(<NearbyVenuesTestNavigator servicesOverride={servicesOverride} />);

    fireEvent.press(getByText('Nearby Venues Screen'));

    expect(await findByText('You are checked in')).toBeTruthy();
    fireEvent.press(getByText('Luna Lounge'));

    expect(await findByText('Venue Details Screen')).toBeTruthy();
    expect(await findByText('Luna Lounge')).toBeTruthy();
  });

  it('switches from venues to chats using the persistent main tabs', async () => {
    const { findByText, getByText, getByTestId } = render(<NearbyVenuesTestNavigator />);

    fireEvent.press(getByText('Nearby Venues Screen'));
    expect(await findByText('Nearby Venues Screen')).toBeTruthy();

    fireEvent.press(getByTestId('bottom-nav-chats'));

    expect(await findByText('Chat Threads Screen')).toBeTruthy();
  });

  it('routes check-in action through check-in confirmation before venue details', async () => {
    const servicesOverride = createServicesWithActiveSession(null);
    const { findByText, getAllByText, getByTestId } = render(<NearbyVenuesTestNavigator servicesOverride={servicesOverride} />);

    fireEvent.press(getAllByText('Nearby Venues Screen')[0]);
    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
    expect(getByTestId('bottom-nav-venues')).toBeTruthy();
    fireEvent.press(getAllByText('Check-In')[0]);

    expect(await findByText('Venue Check-In Confirmation Screen')).toBeTruthy();
  });
});
