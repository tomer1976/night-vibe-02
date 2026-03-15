import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import {
  DiscoveryFallbackScreen,
  DiscoveryProfilePreviewScreen,
  MatchConfirmationScreen,
  NearbyVenuesScreen,
  VenueDetailsScreen,
} from '../src/screens';
import { createMockBackendServiceLocator, ServiceLocatorProvider } from '../src/services';
import { BackendServiceContracts } from '../src/contracts';
import { AppStateProvider } from '../src/state';
import { ThemeProvider } from '../src/theme';
import { resetVenuePeopleInteractionState } from '../src/screens/venuePeopleInteractionState';

const Stack = createNativeStackNavigator();

function VenueDetailsTestNavigator({ servicesOverride }: { servicesOverride: BackendServiceContracts }) {
  return (
    <ThemeProvider>
      <AppStateProvider>
        <ServiceLocatorProvider isMockModeEnabled servicesOverride={servicesOverride}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="NearbyVenues" screenOptions={{ headerShown: false }}>
              <Stack.Screen component={NearbyVenuesScreen} name="NearbyVenues" />
              <Stack.Screen component={VenueDetailsScreen} name="VenueDetails" />
              <Stack.Screen component={DiscoveryFallbackScreen} name="DiscoveryFallback" />
              <Stack.Screen component={DiscoveryProfilePreviewScreen} name="DiscoveryProfilePreview" />
              <Stack.Screen component={MatchConfirmationScreen} name="MatchConfirmation" />
            </Stack.Navigator>
          </NavigationContainer>
        </ServiceLocatorProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}

describe('venue details screen', () => {
  const renderNavigator = (servicesOverride: BackendServiceContracts = createMockBackendServiceLocator().services) => {
    return render(<VenueDetailsTestNavigator servicesOverride={servicesOverride} />);
  };

  const enterFirstVenueDetailsViaCheckIn = async (screen: ReturnType<typeof renderNavigator>) => {
    const { findByText, getAllByText, queryByText } = screen;

    expect(await findByText('Nearby Venues Screen')).toBeTruthy();

    const checkoutButton = queryByText('Checkout');
    if (checkoutButton) {
      fireEvent.press(checkoutButton);
    }

    await waitFor(() => {
      expect(getAllByText('Check-In').length).toBeGreaterThan(0);
    });

    fireEvent.press(getAllByText('Check-In')[0]);
  };

  beforeEach(() => {
    resetVenuePeopleInteractionState();
  });

  it('opens dedicated discovery profile page when tapping a potential match bar', async () => {
    const screen = renderNavigator();
    const { findByLabelText, findByText, getByText, queryByText, getAllByText } = screen;

    await enterFirstVenueDetailsViaCheckIn(screen);
    expect(await findByText('Venue Details Screen')).toBeTruthy();
    expect(await findByText('Address: 12 Harbor Street, Tel Aviv')).toBeTruthy();
    expect(await findByText(/High-energy dance floor with live DJs/i)).toBeTruthy();
    expect(await findByText('Status: Active')).toBeTruthy();
    expect(await findByText('Potential Matches')).toBeTruthy();
    expect(await findByText('Matches')).toBeTruthy();
    expect(await findByLabelText('Potential Matches tab')).toBeTruthy();
    expect(await findByLabelText('Matches tab')).toBeTruthy();
    expect(await findByText('Riley Active • 29 • non binary')).toBeTruthy();
    expect(getAllByText('View profile').length).toBeGreaterThan(0);
    expect(await findByLabelText('Riley Active • 29 • non binary. View profile')).toBeTruthy();
    expect(queryByText('Discovery Profile Preview Screen')).toBeNull();

    fireEvent.press(getByText('Riley Active • 29 • non binary'));

    expect(await findByText('Discovery Profile Preview Screen')).toBeTruthy();
    expect(await findByText('Like')).toBeTruthy();
    expect(queryByText('Pass')).toBeNull();
    expect(queryByText('Unmatch')).toBeNull();

    fireEvent.press(getByText('Back to Venue'));
    expect(await findByText('Venue Details Screen')).toBeTruthy();
  });

  it('shows like for potential profile and toggles like to unlike', async () => {
    const screen = renderNavigator();
    const { findByText, getByText, queryByText } = screen;

    await enterFirstVenueDetailsViaCheckIn(screen);
    expect(await findByText('Venue Details Screen')).toBeTruthy();
    fireEvent.press(await findByText('Riley Active • 29 • non binary'));

    expect(await findByText('Like')).toBeTruthy();
    expect(queryByText('Pass')).toBeNull();
    expect(queryByText('Unmatch')).toBeNull();

    fireEvent.press(getByText('Like'));
    expect(await findByText('Liked Riley Active.')).toBeTruthy();
    expect(await findByText('Unlike')).toBeTruthy();

    fireEvent.press(getByText('Unlike'));
    expect(await findByText('Removed like for Riley Active.')).toBeTruthy();
    expect(await findByText('Like')).toBeTruthy();
  });

  it('unmatch removes from matches and returns profile to potential list as unliked', async () => {
    const screen = renderNavigator();
    const { findByText, getByText, queryByText, getAllByText } = screen;

    await enterFirstVenueDetailsViaCheckIn(screen);
    expect(await findByText('Matches')).toBeTruthy();
    fireEvent.press(getByText('Matches'));
    expect(getAllByText('View profile').length).toBeGreaterThan(0);
    fireEvent.press(await findByText('Jordan • 27 • female'));

    expect(await findByText('Unmatch')).toBeTruthy();
    expect(queryByText('Like')).toBeNull();
    expect(queryByText('Pass')).toBeNull();

    fireEvent.press(getByText('Unmatch'));

    expect(await findByText('Venue Details Screen')).toBeTruthy();
    fireEvent.press(getByText('Potential Matches'));
    expect(await findByText('Jordan • 27 • female')).toBeTruthy();

    fireEvent.press(getByText('Jordan • 27 • female'));
    expect(await findByText('Like')).toBeTruthy();
    expect(queryByText('Unlike')).toBeNull();
  });

  it('renders discovery error state and retries successfully', async () => {
    const locator = createMockBackendServiceLocator();
    let getFeedAttempt = 0;

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      discovery: {
        ...locator.services.discovery,
        getFeed: async () => {
          getFeedAttempt += 1;

          if (getFeedAttempt === 1) {
            return {
              status: 'FAIL',
              error: {
                code: 'INTERNAL_ERROR',
                message: 'Simulated discovery failure for retry validation.',
                details: { scenario: 'retry' },
              },
              request_id: 'req-discovery-retry-1',
            };
          }

          return locator.services.discovery.getFeed();
        },
      },
    };

    const screen = renderNavigator(servicesOverride);
    const { findByText, getByText } = screen;

    await enterFirstVenueDetailsViaCheckIn(screen);
    expect(await findByText('Potential Matches Failed')).toBeTruthy();
    expect(await findByText('Simulated discovery failure for retry validation.')).toBeTruthy();

    fireEvent.press(getByText('Retry'));

    expect(await findByText('Riley Active • 29 • non binary')).toBeTruthy();
  });

  it('renders explicit empty discovery states for potential matches and matches', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      discovery: {
        ...locator.services.discovery,
        getFeed: async () => ({
          status: 'SUCCESS',
          data: {
            candidates: [],
            nextCursor: undefined,
          },
          request_id: 'req-discovery-empty-1',
        }),
      },
      match: {
        ...locator.services.match,
        getMatches: async () => ({
          status: 'SUCCESS',
          data: [],
          request_id: 'req-matches-empty-1',
        }),
      },
    };

    const screen = renderNavigator(servicesOverride);
    const { findByText, getByText } = screen;

    await enterFirstVenueDetailsViaCheckIn(screen);
    expect(await findByText('No Potential Matches')).toBeTruthy();

    fireEvent.press(getByText('Matches'));
    expect(await findByText('No Matches')).toBeTruthy();
  });

  it('renders exhausted fallback affordance and ineligible fallback route content', async () => {
    const locator = createMockBackendServiceLocator();

    const exhaustedServices: BackendServiceContracts = {
      ...locator.services,
      discovery: {
        ...locator.services.discovery,
        getFeed: async () => ({
          status: 'SUCCESS',
          data: {
            candidates: [],
            nextCursor: undefined,
          },
          request_id: 'req-discovery-empty-fallback-1',
        }),
      },
      match: {
        ...locator.services.match,
        getMatches: async () => ({
          status: 'SUCCESS',
          data: [],
          request_id: 'req-matches-empty-fallback-1',
        }),
      },
    };

    const exhaustedScreen = renderNavigator(exhaustedServices);

    await enterFirstVenueDetailsViaCheckIn(exhaustedScreen);
    expect(await exhaustedScreen.findByText('Open Discovery Fallback')).toBeTruthy();

    const ineligibleServices: BackendServiceContracts = {
      ...locator.services,
      presence: {
        ...locator.services.presence,
        getMyActiveSession: async () => ({
          status: 'SUCCESS',
          data: null,
          request_id: 'req-no-session-fallback-1',
        }),
      },
    };

    const ineligibleScreen = render(
      <ThemeProvider>
        <AppStateProvider>
          <ServiceLocatorProvider isMockModeEnabled servicesOverride={ineligibleServices}>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="DiscoveryFallback" screenOptions={{ headerShown: false }}>
                <Stack.Screen component={NearbyVenuesScreen} name="NearbyVenues" />
                <Stack.Screen component={VenueDetailsScreen} initialParams={{ venueId: 'v-halo-club' }} name="VenueDetails" />
                <Stack.Screen component={DiscoveryFallbackScreen} initialParams={{ reason: 'ineligible_state', venueId: 'v-halo-club' }} name="DiscoveryFallback" />
              </Stack.Navigator>
            </NavigationContainer>
          </ServiceLocatorProvider>
        </AppStateProvider>
      </ThemeProvider>
    );

    expect(await ineligibleScreen.findByText('Discovery Fallback Screen')).toBeTruthy();
    expect(await ineligibleScreen.findByText('Discovery Ineligible')).toBeTruthy();
  });

  it('covers happy path: feed load -> like -> reciprocal match -> feed return', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      interactions: {
        ...locator.services.interactions,
        likeUser: async (request) => ({
          status: 'SUCCESS',
          data: {
            status: 'SUCCESS',
            interaction: 'LIKE',
            interactionId: 'interaction-route-flow-1',
            targetUserId: request.targetUserId,
            venueId: request.venueId,
            idempotencyKey: request.idempotencyKey,
            decision: 'created',
            duplicateScope: 'actor_target_venue_session',
            matchCreated: true,
            matchId: 'match-u-regular-1-u-persona-active-1',
          },
          request_id: 'req-route-flow-1',
        }),
      },
    };

    const screen = renderNavigator(servicesOverride);
    const { findByText, getByText } = screen;

    await enterFirstVenueDetailsViaCheckIn(screen);
    expect(await findByText('Venue Details Screen')).toBeTruthy();
    expect(await findByText('Riley Active • 29 • non binary')).toBeTruthy();

    fireEvent.press(await findByText('Riley Active • 29 • non binary'));
    expect(await findByText('Discovery Profile Preview Screen')).toBeTruthy();

    fireEvent.press(getByText('Like'));
    expect(await findByText('Match Confirmation Screen')).toBeTruthy();
    expect(await findByText('Match State: Created')).toBeTruthy();

    fireEvent.press(getByText('Back to Venue'));
    expect(await findByText('Venue Details Screen')).toBeTruthy();
    expect(await findByText('Potential Matches')).toBeTruthy();
    expect(await findByText('Liked')).toBeTruthy();
  });

  it('renders visual expired-state treatment for expired matches', async () => {
    const locator = createMockBackendServiceLocator();

    const servicesOverride: BackendServiceContracts = {
      ...locator.services,
      match: {
        ...locator.services.match,
        getMatches: async () => ({
          status: 'SUCCESS',
          data: [
            {
              matchId: 'match-expired-1',
              users: ['u-regular-1', 'u-discovery-3'],
              venueId: 'v-halo-club',
              counterpart: {
                userId: 'u-discovery-3',
                displayName: 'Sky',
                age: 27,
                gender: 'female',
                profilePhotoUrl: 'mock://user-photo/sky',
              },
              status: 'expired',
            },
          ],
          request_id: 'req-expired-match-1',
        }),
      },
    };

    const screen = renderNavigator(servicesOverride);

    await enterFirstVenueDetailsViaCheckIn(screen);
    fireEvent.press(await screen.findByText('Matches'));

    expect(await screen.findByText('Sky • 27 • female')).toBeTruthy();
    expect(await screen.findByText('Match Status: expired')).toBeTruthy();
  });
});