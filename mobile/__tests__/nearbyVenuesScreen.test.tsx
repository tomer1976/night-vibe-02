import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { BackendServiceContracts } from '../src/contracts';
import { NearbyVenuesScreen, UserEntryScreen, VenueDetailsScreen } from '../src/screens';
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
              <Stack.Screen component={VenueDetailsScreen} name="VenueDetails" />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('nearby venues screen', () => {
  it('renders venue list with category/status/activity metadata from mock discovery', async () => {
    const { getByText, findAllByText, findByText, queryByText } = render(<NearbyVenuesTestNavigator />);

    fireEvent.press(getByText('Nearby Venues Screen'));

    expect(await findByText('Nearby Venues Screen')).toBeTruthy();
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
    expect(await findByText('Checkout')).toBeTruthy();
    expect(await findByText('Check-In')).toBeTruthy();

    fireEvent.press(getByText('Halo Club'));

    expect(queryByText('Venue Details Screen')).toBeNull();

    fireEvent.press(getByText('Check-In'));

    expect(await findByText('Venue Details Screen')).toBeTruthy();
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
});
