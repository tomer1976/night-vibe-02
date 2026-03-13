import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render } from '@testing-library/react-native';

import { BackendServiceContracts } from '../src/contracts';
import { VenueDetailsScreen } from '../src/screens';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';

const Stack = createNativeStackNavigator();

function VenueDetailsTestNavigator({ servicesOverride }: { servicesOverride?: BackendServiceContracts } = {}) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="VenueDetails" screenOptions={{ headerShown: false }}>
              <Stack.Screen component={VenueDetailsScreen} initialParams={{ venueId: 'v-halo-club' }} name="VenueDetails" />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('venue details screen', () => {
  it('renders list bars first and opens profile card only after selecting a person', async () => {
    const { findByText, getByText, queryByText } = render(<VenueDetailsTestNavigator />);

    expect(await findByText('Venue Details Screen')).toBeTruthy();
    expect(await findByText('Address: 12 Harbor Street, Tel Aviv')).toBeTruthy();
    expect(await findByText(/High-energy dance floor with live DJs/i)).toBeTruthy();
    expect(await findByText('Status: Active')).toBeTruthy();
    expect(await findByText('Potential Matches')).toBeTruthy();
    expect(await findByText('Matches')).toBeTruthy();
    expect(await findByText('Riley Active • 29 • non binary')).toBeTruthy();
    expect(queryByText('Profile')).toBeNull();

    fireEvent.press(getByText('Riley Active • 29 • non binary'));

    expect(await findByText('Profile')).toBeTruthy();
    expect(await findByText('Like')).toBeTruthy();
    expect(await findByText('Pass')).toBeTruthy();
    expect(await findByText('Unlike')).toBeTruthy();
    expect(await findByText('Unmatch')).toBeTruthy();

    if (queryByText('Checkout')) {
      fireEvent.press(getByText('Checkout'));

      expect(await findByText('Checkout completed. You are no longer checked into this venue.')).toBeTruthy();
      expect(await findByText('Check in to this venue to see people here.')).toBeTruthy();
      return;
    }

    expect(await findByText('Check in to this venue to see people here.')).toBeTruthy();
    fireEvent.press(getByText('Check-In'));
    expect(await findByText('Check-in completed. You are now checked into this venue.')).toBeTruthy();
    expect(await findByText('Riley Active')).toBeTruthy();
    fireEvent.press(getByText('Checkout'));

    expect(await findByText('Checkout completed. You are no longer checked into this venue.')).toBeTruthy();
    expect(await findByText('Check in to this venue to see people here.')).toBeTruthy();
  });

  it('switches between potential matches and matches tabs on venue page', async () => {
    const { findByText, getByText, queryByText } = render(<VenueDetailsTestNavigator />);

    expect(await findByText('Venue Details Screen')).toBeTruthy();

    if (queryByText('Checkout')) {
      fireEvent.press(getByText('Checkout'));
      expect(await findByText('Checkout completed. You are no longer checked into this venue.')).toBeTruthy();
    }

    fireEvent.press(getByText('Check-In'));

    expect(await findByText('Check-in completed. You are now checked into this venue.')).toBeTruthy();
    fireEvent.press(getByText('Matches'));

    expect(await findByText('Jordan • 27 • female')).toBeTruthy();

    fireEvent.press(getByText('Jordan • 27 • female'));
    expect(await findByText('Profile')).toBeTruthy();
  });

  it('supports like pass unlike and unmatch actions from selected profile', async () => {
    const mockLocator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...mockLocator.services,
      discovery: {
        ...mockLocator.services.discovery,
        getCandidates: async () => ({
          status: 'SUCCESS',
          data: {
            items: [
              {
                userId: 'u-discovery-inline-1',
                displayName: 'Riley Active',
                age: 29,
                gender: 'non_binary',
                profilePhotoUrl: 'mock://user-photo/riley',
                venueId: 'v-halo-club',
              },
            ],
          },
          request_id: 'req-venue-details-candidates',
        }),
      },
      interactions: {
        ...mockLocator.services.interactions,
        likeUser: async () => ({
          status: 'SUCCESS',
          data: {
            status: 'SUCCESS',
            interaction: 'LIKE',
            interactionId: 'i-venue-details-like-1',
            targetUserId: 'u-discovery-inline-1',
            venueId: 'v-halo-club',
            decision: 'created',
            duplicateScope: 'actor_target_venue_session',
            matchCreated: false,
          },
          request_id: 'req-venue-details-like',
        }),
      },
    };

    const { findByText, getByText } = render(<VenueDetailsTestNavigator servicesOverride={servicesOverride} />);

    expect(await findByText('Venue Details Screen')).toBeTruthy();
    fireEvent.press(getByText('Riley Active • 29 • non binary'));
    expect(await findByText('Profile')).toBeTruthy();

    fireEvent.press(getByText('Like'));

    expect(await findByText('Liked Riley Active.')).toBeTruthy();

    fireEvent.press(getByText('Unlike'));
    expect(await findByText('Removed like for Riley Active.')).toBeTruthy();

    fireEvent.press(getByText('Pass'));
    expect(await findByText('Passed on Riley Active.')).toBeTruthy();

    fireEvent.press(getByText('Matches'));
    fireEvent.press(getByText('Jordan • 27 • female'));
    fireEvent.press(getByText('Unmatch'));
    expect(await findByText('Unmatched Jordan.')).toBeTruthy();
  });
});